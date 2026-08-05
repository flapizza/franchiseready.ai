type Props = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export function TwoColumn({
  left,
  right,
}: Props) {
  return (
    <section className="grid grid-cols-12 gap-8">

      <div className="col-span-12 xl:col-span-7">
        {left}
      </div>

      <div className="col-span-12 xl:col-span-5">
        {right}
      </div>

    </section>
  );
}