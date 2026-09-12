#!/usr/bin/env python3
"""Refresh the bundled English ↔ Balochi parallel corpus for production builds."""

from __future__ import annotations

import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "src" / "lib" / "balochi-parallel.generated.ts"
URL = (
    "https://huggingface.co/datasets/shayak111/"
    "Balochi-Multilingual-dataset/resolve/main/Extras/"
    "Balochi_english-translation_corpus.json"
)


def clean(value: object) -> str:
    return " ".join(str(value or "").strip().split())


def main() -> None:
    request = urllib.request.Request(
        URL,
        headers={"User-Agent": "Zuban-Open-Balochi-AI/1.0"},
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.load(response)

    rows: list[list[str]] = []
    seen: set[tuple[str, str]] = set()

    for group in payload.get("translation_samples", []):
        for row in group.get("translations", []):
            english = clean(row.get("english"))
            balochi = clean(row.get("balochi"))
            if not english or not balochi:
                continue

            key = (english.casefold(), balochi)
            if key in seen:
                continue

            seen.add(key)
            rows.append([english, balochi])

    metadata = payload.get("dataset_metadata", {})
    license_name = clean(metadata.get("license")) or "CC-BY-SA 4.0"

    source = (
        "/**\n"
        " * AUTO-GENERATED during deployment.\n"
        " * Source: shayak111/Balochi-Multilingual-dataset\n"
        " * File: Extras/Balochi_english-translation_corpus.json\n"
        f" * License: {license_name}\n"
        f" * Pairs: {len(rows)}\n"
        " */\n"
        "export const balochiParallelPairs: "
        "ReadonlyArray<readonly [string, string]> = "
        + json.dumps(rows, ensure_ascii=False, separators=(",", ":"))
        + " as const;\n"
    )

    OUTPUT.write_text(source, encoding="utf-8")
    print(f"Updated {OUTPUT.relative_to(ROOT)} with {len(rows)} pairs.")


if __name__ == "__main__":
    main()
