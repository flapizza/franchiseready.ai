import type { TranscriptEntry } from "../models/TranscriptEntry";

type Props = {
  transcript: TranscriptEntry[];
};

export function LiveTranscriptPanel({
  transcript,
}: Props) {
  return (
    <section className="rounded-3xl border bg-white p-8 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold">
          Live Transcript
        </h2>

        <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase text-red-700">
          Live
        </div>

      </div>

      <div className="mt-8 space-y-6">

        {transcript.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl bg-slate-50 p-5"
          >
            <div className="flex justify-between">

              <div className="font-semibold capitalize">
                {entry.speaker}
              </div>

              <div className="text-sm text-slate-400">
                {entry.timestamp}
              </div>

            </div>

            <p className="mt-3 leading-7 text-slate-700">
              {entry.text}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}