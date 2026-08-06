import type { ReferralPackage } from "../models/ReferralPackage";

type Props = {
  referral: ReferralPackage;
};

export function ReferralPackagePreview({
  referral,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <div className="border-b pb-6">

        <p className="text-sm uppercase tracking-widest text-slate-500">
          Referral Package
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          {referral.candidate.fullName}
        </h1>

        <p className="mt-2 text-slate-600">
          Prepared for {referral.brand.name}
        </p>

      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">

        <Info
          label="Consultant"
          value={referral.consultant.consultantName}
        />

        <Info
          label="Company"
          value={referral.consultant.companyName}
        />

        <Info
          label="Readiness"
          value={`${referral.candidate.readiness}`}
        />

        <Info
          label="AI Confidence"
          value={`${referral.candidate.confidence}%`}
        />

        <Info
          label="Brand Fit"
          value={`${referral.brand.overallFit}%`}
        />

      </div>

      <section className="mt-8">

        <h2 className="font-bold">
          Executive Summary
        </h2>

        <p className="mt-3 text-slate-700 leading-7">
          {referral.executiveSummary}
        </p>

      </section>

      <section className="mt-8">

        <h2 className="font-bold">
          Consultant Recommendation
        </h2>

        <p className="mt-3 text-slate-700 leading-7">
          {referral.consultantRecommendation}
        </p>

      </section>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <p className="text-xs uppercase text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value}
      </p>

    </div>
  );
}