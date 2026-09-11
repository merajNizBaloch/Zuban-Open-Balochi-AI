import { NextResponse } from "next/server";

type GithubIssue = {
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  comments: number;
  pull_request?: unknown;
  user?: { login?: string };
  labels?: Array<string | { name?: string }>;
};

const contributionPrefixes = [
  "[Community]",
  "[Language]",
  "[Data]",
  "[Translation correction]",
  "[Dictionary word]",
  "[Data source]",
  "[Speech / voice]",
  "[Pronunciation / voice]",
  "[OCR correction]",
  "[Research]",
];

function labelNames(issue: GithubIssue) {
  return (issue.labels ?? [])
    .map((label) => (typeof label === "string" ? label : label.name ?? ""))
    .filter(Boolean)
    .map((label) => label.toLocaleLowerCase());
}

function contributionType(title: string) {
  const match = title.match(/^\[([^\]]+)\]/);
  return match?.[1] ?? "Community";
}

function reviewState(issue: GithubIssue) {
  const labels = labelNames(issue);

  if (labels.includes("verified") || labels.includes("approved")) return "verified";
  if (labels.includes("rejected") || labels.includes("invalid")) return "rejected";
  if (issue.state === "closed") return "reviewed";
  return "needs-review";
}

export async function GET() {
  const token = process.env.ZUBAN_GITHUB_TOKEN;
  const response = await fetch(
    "https://api.github.com/repos/merajNizBaloch/Zuban-Open-Balochi-AI/issues?state=all&per_page=100&sort=updated&direction=desc",
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: "Bearer " + token } : {}),
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 120 },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "The public review queue could not be loaded." },
      { status: 502 },
    );
  }

  const issues = (await response.json()) as GithubIssue[];

  const contributions = issues
    .filter((issue) => !issue.pull_request)
    .filter((issue) =>
      contributionPrefixes.some((prefix) => issue.title.startsWith(prefix)),
    )
    .map((issue) => ({
      number: issue.number,
      title: issue.title.replace(/^\[[^\]]+\]\s*:?[\s]*/, ""),
      type: contributionType(issue.title),
      url: issue.html_url,
      state: reviewState(issue),
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      comments: issue.comments,
      contributor: issue.user?.login ?? "community",
    }));

  const stats = {
    total: contributions.length,
    needsReview: contributions.filter((item) => item.state === "needs-review").length,
    reviewed: contributions.filter((item) => item.state === "reviewed").length,
    verified: contributions.filter((item) => item.state === "verified").length,
  };

  return NextResponse.json(
    { contributions, stats },
    { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } },
  );
}
