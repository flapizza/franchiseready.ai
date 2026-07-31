import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AssessmentResultsPage({
  params,
}: Props) {
  const { id } = await params;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 p-8">
      <header>
        <p className="text-sm font-medium text-blue-600">
          Assessment Complete
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          Your Franchise Readiness Results
        </h1>

        <p className="mt-3 text-gray-600">
          Assessment ID: {id}
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Overall Readiness
          </p>

          <p className="mt-3 text-5xl font-bold">
            82
          </p>

          <p className="mt-2 text-green-600">
            Strong Candidate
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Top Category
          </p>

          <p className="mt-3 text-2xl font-semibold">
            B2B Services
          </p>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Best Match
          </p>

          <p className="mt-3 text-2xl font-semibold">
            ERA Group
          </p>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">
          Top Franchise Matches
        </h2>

        <div className="mt-6 space-y-4">
          {[
            ["ERA Group", 96],
            ["Schooley Mitchell", 94],
            ["ActionCOACH", 91],
          ].map(([name, score]) => (
            <div
              key={String(name)}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div>
                <p className="font-semibold">
                  {name}
                </p>

                <p className="text-sm text-gray-500">
                  Excellent profile alignment
                </p>
              </div>

              <div className="text-2xl font-bold">
                {score}%
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          Return Home
        </Link>
      </div>
    </main>
  );
}