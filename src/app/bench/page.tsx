import { benchmarkRecords } from "@/lib/benchmarks";

export default function BenchPage() {
  return (
    <section className="section bench-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow">ZUBÁN BENCH</p>
          <h1 className="page-title">Reproduce before we claim.</h1>
          <p className="lead wide">
            Upstream model-card numbers are useful context, but they do not become Zubán results until the model is evaluated on an independent, versioned test set.
          </p>
        </div>

        <div className="bench-table">
          <div className="bench-row bench-head">
            <span>Task</span>
            <span>System</span>
            <span>Upstream</span>
            <span>Zubán</span>
            <span>Metric</span>
          </div>

          {benchmarkRecords.map((record) => (
            <article className="bench-row" key={record.task + record.system}>
              <div>
                <span className={"bench-status " + record.status}>{record.status}</span>
                <strong>{record.task}</strong>
              </div>
              <div>
                {record.sourceUrl ? (
                  <a href={record.sourceUrl} target="_blank" rel="noreferrer">{record.system} ↗</a>
                ) : (
                  <strong>{record.system}</strong>
                )}
              </div>
              <p>{record.upstreamClaim}</p>
              <p>{record.zubanResult}</p>
              <span>{record.metric}</span>
              <small>{record.note}</small>
            </article>
          ))}
        </div>

        <div className="bench-principles">
          <article>
            <strong>Separate train / dev / test</strong>
            <p>Benchmark examples must not silently leak into model training.</p>
          </article>
          <article>
            <strong>Keep dialect metadata</strong>
            <p>One aggregate score should not hide regional performance differences.</p>
          </article>
          <article>
            <strong>Human review matters</strong>
            <p>Automatic metrics are not enough for low-resource translation and script quality.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
