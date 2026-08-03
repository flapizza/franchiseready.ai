export default function PipelinePage() {
  const stages = [
    "Lead",
    "Assessment",
    "Discovery",
    "Brand Matching",
    "Validation",
    "FDD",
    "Funding",
    "Meet the Team",
    "Awarded",
  ];

  return (
    <main className="p-8">
      <h1 className="mb-8 text-4xl font-bold">
        Pipeline
      </h1>

      <div className="grid gap-6 lg:grid-cols-5">
        {stages.map((stage) => (
          <section
            key={stage}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <h2 className="font-semibold">
              {stage}
            </h2>

            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
              No Candidates
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}