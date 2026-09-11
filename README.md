# Zubán — Open Balochi AI

**Free, open-source, community-built AI infrastructure for the Balochi language.**

Zubán is an open initiative to build useful Balochi language technology while creating high-quality, traceable datasets and reproducible research for a low-resource language.

## First release

- **Zubán Chat** — conversational Balochi AI interface
- **Zubán Translate** — Balochi ↔ English / Urdu / Persian workspace
- **Zubán Dictionary** — community-reviewed machine-readable lexicon
- **Zubán Speech** — speech-to-text and voice contribution tools
- **Zubán Voice** — text-to-speech interface
- **Zubán OCR** — printed Balochi image-to-text workspace
- **Zubán Research** — models, experiments, benchmarks and papers
- **Zubán Datasets** — corpus, speech, lexicon and benchmark releases
- **Zubán Contribute** — text, voice, translations, words, code and research

## Principles

1. Free to use.
2. Open source.
3. Dialect-aware.
4. Script-aware.
5. Provenance-first datasets.
6. Community review over blind scraping.
7. Reproducible research.
8. No fake AI outputs — experimental capabilities are labelled clearly.

## Local development

Copy `.env.example` to `.env.local`, then:

```bash
npm install
npm run dev
```

The text tools accept any OpenAI-compatible or self-hosted chat-completions endpoint through environment variables. No proprietary provider is hard-coded.

## Project status

**Alpha / foundation stage.** The interface, open-source workflow and text-provider adapter are present. Balochi datasets and model adapters will be audited and integrated incrementally.

## Contributing

Contributions from Balochi speakers, linguists, researchers, developers, writers, students and institutions are welcome. See `CONTRIBUTING.md`.

## Licensing

- Software: **Apache-2.0**
- Datasets: licensed per dataset/source. Zubán preserves source and license provenance rather than applying one blanket license to third-party material.

---

Built for the Balochi language and its communities.
