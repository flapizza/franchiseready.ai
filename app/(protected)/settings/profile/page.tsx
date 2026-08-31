import { ConsultantProfileEditor } from "@/feature/consultant-profile/components/ConsultantProfileEditor";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { ProductionConsultantProfileEditor } from "@/feature/consultant-profile/components/ProductionConsultantProfileEditor";
import { saveProfileSettings } from "@/feature/consultant-profile/actions/profile-settings";

export default async function ConsultantProfilePage() {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved") return <WorkspaceFeatureUnavailable title="Professional Identity" detail="An active workspace is required." />;
  const session = resolution.session;
  const isDemo = session.kind === "demo";
  const productionData = "consultantProfile" in resolution.composition.dependencies ? await Promise.all([resolution.composition.dependencies.consultantProfile.getOwn(), resolution.composition.dependencies.organizationSettings.get()]) : null;
  return (
    <main className="mx-auto max-w-6xl p-10">

      <div className="mb-10">

        <h1 className="text-4xl font-black">
          Professional Identity
        </h1>

        <p className="mt-3 text-slate-600">
          Everything your candidates and franchisors see is
          branded from this profile.
        </p>

      </div>

      {isDemo ? <ConsultantProfileEditor /> : <ProductionConsultantProfileEditor profile={productionData![0]} settings={productionData![1]} canManageOrganization={session.kind === "production" && ["owner", "admin"].includes(session.membership.role)} action={saveProfileSettings} />}

    </main>
  );
}
