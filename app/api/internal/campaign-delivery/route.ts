import { z } from "zod";
import { getCampaignDeliveryWorkerEnvironment, getPublicEnvironment } from "@/lib/env";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { SupabaseMarketingDeliveryRepository } from "@/feature/marketing/delivery/SupabaseMarketingDeliveryRepository";
import { isAuthorizedCampaignDeliveryWorker } from "@/feature/marketing/delivery/worker-authorization";
import { createProductionMarketingDeliveryProvider } from "@/feature/marketing/delivery/resend/provider-factory";

export const runtime = "nodejs";
const requestSchema = z.object({ sendRunId: z.string().regex(/^send_[a-f0-9]{32}$/) }).strict();

export async function POST(request: Request) {
  const worker = getCampaignDeliveryWorkerEnvironment();
  if (!worker || !isAuthorizedCampaignDeliveryWorker(request, worker.CAMPAIGN_DELIVERY_WORKER_SECRET)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  let input: z.infer<typeof requestSchema>;
  try { input = requestSchema.parse(await request.json()); }
  catch { return Response.json({ error: "Invalid request." }, { status: 400 }); }
  const provider = createProductionMarketingDeliveryProvider();
  if (provider.mode !== "external") return Response.json({ error: "Delivery provider unavailable." }, { status: 503 });
  try {
    const repository = new SupabaseMarketingDeliveryRepository(createAdminSupabaseClient(), null);
    const result = await repository.processBatch(input.sendRunId, provider, getPublicEnvironment().APP_URL, 10);
    return Response.json({ sendRunId: result.run.id, status: result.run.status, claimed: result.claimed });
  } catch {
    return Response.json({ error: "Campaign delivery unavailable." }, { status: 500 });
  }
}
