import { benchmarkRecords } from "@/lib/benchmarks";
import { UiText } from "@/components/ui-text";

export default function BenchPage() {
  return (
    <section className="section bench-page">
      <div className="shell">
        <div className="page-intro-center">
          <p className="eyebrow"><UiText id="page.bench.eyebrow" fallback="ZUBÁN BENCH" /></p>
          <h1 className="page-title"><UiText id="page.bench.title" fallback="Reproduce before we claim." /></h1>
          <p className="lead wide"><UiText id="bench.lead" fallback="Upstream model-card numbers are useful context, but they do not become Zubán results until the model is evaluated on an independent, versioned test set." /></p>
        </div>

        <div className="bench-table">
          <div className="bench-row bench-head">
            <span><UiText id="bench.task" fallback="Task" /></span>
            <span><UiText id="bench.system" fallback="System" /></span>
            <span><UiText id="bench.upstream" fallback="Upstream" /></span>
            <span>Zubán</span>
            <span><UiText id="bench.metric" fallback="Metric" /></span>
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
            <strong><UiText id="bench.separate" fallback="Separate train / dev / test" /></strong>
            <p><UiText id="bench.separate.desc" fallback="Benchmark examples must not silently leak into model training." /></p>
          </article>
          <article>
            <strong><UiText id="bench.dialect" fallback="Keep dialect metadata" /></strong>
            <p><UiText id="bench.dialect.desc" fallback="One aggregate score should not hide regional performance differences." /></p>
          </article>
          <article>
            <strong><UiText id="bench.human" fallback="Human review matters" /></strong>
            <p><UiText id="bench.human.desc" fallback="Automatic metrics are not enough for low-resource translation and script quality." /></p>
          </article>
        </div>
      </div>
    </section>
  );
}
