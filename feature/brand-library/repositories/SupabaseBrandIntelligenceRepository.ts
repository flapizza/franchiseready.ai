import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../types/database.generated.ts";
import type { AuthenticatedWorkspaceContext } from "../../identity/models/WorkspaceIdentity.ts";
import type { BrandIntelligenceRepository, BrandIntelligencePage } from "./BrandIntelligenceRepository.ts";
import { brandIdentityDTO, publishedProfileDTO } from "../persistence/BrandIntelligenceDTO.ts";
import { BrandIntelligenceDataError, validateFactRegistry } from "../persistence/BrandFactRegistry.ts";
import { mapBrandIntelligence } from "../persistence/mapBrandIntelligence.ts";

export class BrandIntelligenceRepositoryError extends Error {
  constructor() { super("Brand Intelligence could not be loaded."); this.name = "BrandIntelligenceRepositoryError"; }
}
const catalogSelect = "*, org_access:organization_brands(organization_id,status), brand_profile_versions(*)";

async function readRows<T>(fetchPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown; count: number | null }>): Promise<T[]> {
  const rows: T[] = [];
  let total: number | null = null;
  do {
    const result = await fetchPage(rows.length, rows.length + 499);
    if (result.error || !result.data || result.count === null || result.count > 20000
      || (total !== null && total !== result.count)) throw new BrandIntelligenceRepositoryError();
    total = result.count;
    if (result.data.length === 0 && rows.length < total) throw new BrandIntelligenceRepositoryError();
    rows.push(...result.data);
  } while (rows.length < total);
  if (rows.length !== total) throw new BrandIntelligenceRepositoryError();
  return rows;
}

export class SupabaseBrandIntelligenceRepository implements BrandIntelligenceRepository {
  constructor(private readonly client: SupabaseClient<Database>, private readonly workspace: AuthenticatedWorkspaceContext) {}

  private async authorize(): Promise<void> {
    const { data, error } = await this.client.rpc("current_active_membership_id", { target_organization_id: this.workspace.organization.id });
    if (error || data !== this.workspace.membership.id) throw new BrandIntelligenceRepositoryError();
  }
  private catalog() {
    return this.client.from("brand_identities").select(catalogSelect, { count: "exact" })
      .eq("org_access.organization_id", this.workspace.organization.id).eq("org_access.status", "active")
      .or("visibility.eq.shared,org_access.not.is.null")
      .eq("brand_profile_versions.status", "published")
      .order("version_number", { referencedTable: "brand_profile_versions", ascending: false })
      .limit(1, { referencedTable: "brand_profile_versions" });
  }
  async list(options: { limit?: number; afterSlug?: string; includeInactive?: boolean } = {}): Promise<BrandIntelligencePage> {
    const limit = options.limit ?? 25;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError("Brand page size must be between 1 and 100.");
    if (options.afterSlug !== undefined && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(options.afterSlug)) throw new TypeError("Invalid brand cursor.");
    await this.authorize();
    let query = this.catalog().order("slug").limit(limit + 1);
    if (!options.includeInactive) query = query.neq("lifecycle", "inactive");
    if (options.afterSlug !== undefined) query = query.gt("slug", options.afterSlug);
    const { data, error, count } = await query;
    if (error || !data || count === null || (count > 0 && data.length === 0)) throw new BrandIntelligenceRepositoryError();
    const visible = data.slice(0, limit);
    const brands = await this.hydrate(visible);
    return { brands, nextCursor: count > brands.length ? brands.at(-1)!.slug : null };
  }
  async getById(publicId: string) {
    if (!/^brand_[a-z0-9]{16,64}$/.test(publicId)) return null;
    return this.get("public_id", publicId);
  }
  async getBySlug(slug: string) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
    return this.get("slug", slug);
  }
  private async get(column: "public_id" | "slug", value: string) {
    await this.authorize();
    const { data, error } = await this.catalog().eq(column, value).maybeSingle();
    if (error) throw new BrandIntelligenceRepositoryError();
    if (!data) return null;
    return (await this.hydrate([data]))[0].profile;
  }
  private async hydrate(rows: unknown[]): Promise<BrandIntelligencePage["brands"]> {
    const catalog = rows.map(row => {
      const identity = brandIdentityDTO.safeParse(row);
      const embedded = (row as { brand_profile_versions?: unknown }).brand_profile_versions;
      if (!identity.success || !Array.isArray(embedded) || embedded.length > 1) throw new BrandIntelligenceDataError("invalid catalog response");
      const profile = embedded.length ? publishedProfileDTO.safeParse(embedded[0]) : null;
      if (profile && !profile.success) throw new BrandIntelligenceDataError("invalid current publication");
      return { identity: identity.data, profile: profile?.data ?? null };
    });
    const ids = catalog.flatMap(row => row.profile ? [row.profile.id] : []);
    if (!ids.length) return catalog.map(({ identity }) => ({ id: identity.public_id, slug: identity.slug, name: identity.name, lifecycle: identity.lifecycle, profile: null }));
    // Embed immutable evidence with associations; facts/items are batched per page.
    const [definitions, facts, associations, items] = await Promise.all([
      readRows((from, to) => this.client.from("brand_fact_definitions").select("*", { count: "exact" }).order("fact_key").range(from, to)),
      readRows((from, to) => this.client.from("brand_profile_facts").select("*", { count: "exact" }).in("profile_id", ids).order("profile_id").order("fact_key").range(from, to)),
      readRows((from, to) => this.client.from("brand_fact_evidence").select("*, brand_evidence(*)", { count: "exact" }).in("profile_id", ids).order("profile_id").order("fact_key").order("evidence_id").range(from, to)),
      readRows((from, to) => this.client.from("brand_consultant_items").select("*", { count: "exact" }).in("profile_id", ids).order("profile_id").order("id").range(from, to)),
    ]);
    validateFactRegistry(definitions);
    return catalog.map(({ identity, profile }) => {
      const entry = { id: identity.public_id, slug: identity.slug, name: identity.name, lifecycle: identity.lifecycle };
      if (!profile) return { ...entry, profile: null };
      const links = associations.filter(row => row.profile_id === profile.id);
      const evidence = new Map(links.map(row => {
        if (!row.brand_evidence) throw new BrandIntelligenceDataError("missing associated evidence");
        return [row.brand_evidence.id, row.brand_evidence] as const;
      }));
      return { ...entry, profile: mapBrandIntelligence({ identity, profile,
        facts: facts.filter(row => row.profile_id === profile.id), links, evidence: [...evidence.values()],
        editorial: items.filter(row => row.profile_id === profile.id) }) };
    });
  }
}
