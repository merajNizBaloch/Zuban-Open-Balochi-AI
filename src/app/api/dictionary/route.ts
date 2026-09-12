import { NextResponse } from "next/server";
import { dictionaryEntries, dictionarySource } from "@/lib/dictionary";
import { normalizeForBalochiLookup } from "@/lib/balochi-language";

function normalize(value: string) {
  return normalizeForBalochiLookup(value)
    .replace(/[“”"'.,!?؟،؛:;()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


function editDistance(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, () =>
    Array<number>(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i += 1) rows[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + cost,
      );
    }
  }

  return rows[a.length][b.length];
}

function entryForms(entry: (typeof dictionaryEntries)[number]) {
  return [
    entry.word,
    ...(entry.aliases ?? []),
    ...(entry.latin ?? []),
  ].map(normalize).filter(Boolean);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const check = (url.searchParams.get("check") ?? "").trim();
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20),
  );


  if (check) {
    const words = check
      .split("|")
      .map((word) => word.trim())
      .filter(Boolean)
      .slice(0, 80);

    const checked = words.map((word) => {
      const q = normalize(word);
      const exact = dictionaryEntries.some((entry) =>
        entryForms(entry).some((form) => form === q),
      );

      if (exact || !q) {
        return { word, known: true, suggestions: [] as string[] };
      }

      const ranked = dictionaryEntries
        .map((entry) => {
          const forms = entryForms(entry);
          const score = forms.reduce(
            (best, form) => Math.min(best, editDistance(q, form)),
            Number.POSITIVE_INFINITY,
          );
          return { entry, score };
        })
        .filter((item) => item.score <= Math.max(2, Math.ceil(q.length * 0.34)))
        .sort((a, b) => a.score - b.score)
        .slice(0, 4)
        .map((item) => item.entry.word);

      return { word, known: false, suggestions: ranked };
    });

    return NextResponse.json(
      {
        checked,
        unknown: checked.filter((item) => !item.known),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
        },
      },
    );
  }

  if (!query) {
    return NextResponse.json({
      query: "",
      count: 0,
      entries: [],
      source: dictionarySource,
    });
  }

  const q = normalize(query);

  const entries = dictionaryEntries
    .map((entry) => {
      const word = normalize(entry.word);
      const aliases = normalize((entry.aliases ?? []).join(" "));
      const latin = normalize((entry.latin ?? []).join(" "));
      const meanings = normalize(entry.meanings.join(" "));

      let score = 99;
      if (word === q || aliases === q || latin === q) score = 0;
      else if (word.startsWith(q) || aliases.startsWith(q) || latin.startsWith(q)) score = 1;
      else if (word.includes(q) || aliases.includes(q) || latin.includes(q)) score = 2;
      else if (meanings.split(/[,\s]+/).includes(q)) score = 3;
      else if (meanings.includes(q)) score = 4;

      return { entry, score };
    })
    .filter((item) => item.score < 99)
    .sort((a, b) => a.score - b.score || a.entry.word.localeCompare(b.entry.word))
    .slice(0, limit)
    .map(({ entry }) => entry);

  return NextResponse.json(
    {
      query,
      count: entries.length,
      entries,
      source: {
        name: dictionarySource.name,
        license: dictionarySource.license,
        url: dictionarySource.url,
      },
    },
    {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900" },
    },
  );
}
