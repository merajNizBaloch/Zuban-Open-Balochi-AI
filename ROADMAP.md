# Zubán Roadmap

Zubán separates **Live**, **Building**, and **Research** work. Experimental models or upstream scores are not presented as finished Zubán capabilities.

## Live

- Searchable Wiktionary-derived Balochi dictionary with source attribution.
- Public Dictionary API.
- Language Lab:
  - Unicode/character normalization.
  - Script detection.
  - Dictionary-first Arabic ↔ Latin conversion.
  - Rule-based fallback clearly marked as approximate.
- Community:
  - Structured GitHub contribution forms.
  - Public review queue.
  - Dictionary, OCR, STT and translation correction flows.
- Chat product:
  - Conversation history.
  - Streaming response transport.
  - Stop generation.
  - Dialect preference.
  - Arabic/Latin script preference.
  - Dictionary grounding.
  - No-key dictionary fallback.
- Translate workspace.
- Browser OCR fallback.
- Developer API documentation.
- Deployment/service health and setup pages.
- Zubán Bench registry with upstream-vs-reproduced separation.

## Building

### Hosted text intelligence

- Configure an open hosted text model for the public deployment.
- Evaluate Balochi response quality rather than relying on multilingual-model reputation.
- Add human-reviewed Chat/Translate evaluation cases.

### Balochi speech

- Deploy `Aynkader/Balochi_STT` behind the shared model server.
- Deploy `Aynkader/Balochi-TTS-Three-Speakers`.
- Reproduce STT evaluation on an independent test set.
- Audit TTS quality by speaker and text length.

### Translation data

- Audit the 33,216-pair English–Balochi Latin corpus.
- Confirm reuse licensing before importing data.
- Create train/dev/test splits only after provenance review.
- Build a human-reviewed translation test set.

### Community data

The current GitHub review workflow is intentionally simple and public. Move to a dedicated database/reviewer portal only when volume justifies it.

Future structured fields:

```json
{
  "text": "...",
  "script": "arabic|latin|other",
  "dialect": "western|southern|eastern|unknown",
  "source": "...",
  "license": "...",
  "verification_count": 0,
  "review_state": "pending|verified|rejected"
}
```

## Research

### Zubán Bench

- Translation: BLEU / COMET + human review.
- Speech: WER.
- OCR: CER / WER.
- POS / NER: F1.
- Script conversion: word accuracy + human review.
- Retrieval: task-specific evaluation.

All published scores must identify whether they are:

1. upstream reported,
2. independently reproduced by Zubán,
3. human-reviewed.

### Balochi OCR

- Collect permitted printed Balochi image/text pairs.
- Use OCR corrections as candidate training/evaluation material only when permission allows.
- Train or fine-tune a Balochi-specific OCR system.

### Script conversion

- Build a human-reviewed Arabic ↔ Latin evaluation set.
- Measure dictionary-backed and rule-based segments separately.
- Audit rules across dialects and orthographic traditions.

### Corpus Explorer

- Build only from data whose reuse rights and provenance are known.
- Support script, dialect, source, license and verification filters.
- Never treat scraped text as automatically open data.

## v1.0 target

A stable, free and open Balochi language platform with:

- reliable source-aware dictionary,
- evaluated script conversion,
- useful Chat and Translate,
- deployable STT/TTS,
- Balochi-specific OCR progress,
- reproducible benchmarks,
- public contribution/review workflows,
- documented APIs,
- clear licensing and provenance.
