import { ConsultantProfileEditor } from "@/feature/consultant-profile/components/ConsultantProfileEditor";

export default function ConsultantProfilePage() {
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

      <ConsultantProfileEditor />

    </main>
  );
}