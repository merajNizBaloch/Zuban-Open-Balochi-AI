"use client";

import { useEffect, useMemo, useState } from "react";

type Contribution = {
  number: number;
  title: string;
  type: string;
  url: string;
  state: "needs-review" | "reviewed" | "verified" | "rejected";
  createdAt: string;
  updatedAt: string;
  comments: number;
  contributor: string;
};

type QueueResponse = {
  contributions?: Contribution[];
  stats?: {
    total: number;
    needsReview: number;
    reviewed: number;
    verified: number;
  };
  error?: string;
};

const filters = [
  ["all", "All"],
  ["needs-review", "Needs review"],
  ["verified", "Verified"],
  ["reviewed", "Reviewed"],
] as const;

export function CommunityQueue() {
  const [data, setData] = useState<QueueResponse | null>(null);
  const [filter, setFilter] = useState<(typeof filters)[number][0]>("all");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/community", { cache: "no-store" });
      const body = (await response.json()) as QueueResponse;
      setData(body);
    } catch {
      setData({ error: "The review queue could not be loaded." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (!cancelled) void load();
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const contributions = data?.contributions ?? [];
    if (filter === "all") return contributions;
    return contributions.filter((item) => item.state === filter);
  }, [data, filter]);

  return (
    <div className="community-queue">
      <div className="community-stats">
        <div><strong>{data?.stats?.total ?? "—"}</strong><span>Contributions</span></div>
        <div><strong>{data?.stats?.needsReview ?? "—"}</strong><span>Needs review</span></div>
        <div><strong>{data?.stats?.verified ?? "—"}</strong><span>Verified</span></div>
      </div>

      <div className="community-queue-bar">
        <div className="community-filters">
          {filters.map(([value, label]) => (
            <button
              className={filter === value ? "active" : ""}
              type="button"
              key={value}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="community-refresh" type="button" onClick={() => void load()}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="community-empty">Loading the public review queue…</div>
      ) : data?.error ? (
        <div className="community-empty">{data.error}</div>
      ) : visible.length ? (
        <div className="community-list">
          {visible.map((item) => (
            <a href={item.url} target="_blank" rel="noreferrer" className="community-row" key={item.number}>
              <div className="community-row-main">
                <div className="community-row-top">
                  <span className="community-type">{item.type}</span>
                  <span className={"community-state " + item.state}>
                    {item.state === "needs-review"
                      ? "Needs review"
                      : item.state === "verified"
                        ? "Verified"
                        : item.state === "rejected"
                          ? "Rejected"
                          : "Reviewed"}
                  </span>
                </div>
                <h3>{item.title || "Community contribution"}</h3>
                <p>
                  #{item.number} · @{item.contributor} · {item.comments} discussion {item.comments === 1 ? "reply" : "replies"}
                </p>
              </div>
              <span className="community-open">↗</span>
            </a>
          ))}
        </div>
      ) : (
        <div className="community-empty">
          No contributions in this view yet. The first useful correction or language example can start the queue.
        </div>
      )}

      <p className="community-review-note">
        Review happens in public on GitHub. Closing an issue marks it reviewed; maintainers can use
        <strong> verified </strong> or <strong> rejected </strong> labels for clearer outcomes.
      </p>
    </div>
  );
}
