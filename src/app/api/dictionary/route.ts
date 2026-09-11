import { NextResponse } from "next/server";
import { dictionaryEntries, dictionarySource } from "@/lib/dictionary";
import { normalizeForBalochiLookup } from "@/lib/balochi-language";

function normalize(value: string) {
  return normalizeForBalochiLookup(value)
    .replace(/[“”"'.,!?؟،؛:;()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20),
  );

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
