export type BenchmarkRecord = {
  task: string;
  system: string;
  sourceUrl?: string;
  upstreamClaim: string;
  zubanResult: string;
  metric: string;
  status: "planned" | "audit" | "reproduce";
  note: string;
};

export const benchmarkRecords: BenchmarkRecord[] = [
  {
    task: "Speech to text",
    system: "Aynkader/Balochi_STT",
    sourceUrl: "https://huggingface.co/Aynkader/Balochi_STT",
    upstreamClaim: "~4.5% evaluation WER reported in the model card",
    zubanResult: "Not reproduced",
    metric: "WER",
    status: "reproduce",
    note: "Latin-script Balochi output. Zubán needs an independent held-out speech set with speaker and dialect metadata.",
  },
  {
    task: "POS tagging",
    system: "shah-bakhsh/BalPOS",
    sourceUrl: "https://huggingface.co/shah-bakhsh/BalPOS",
    upstreamClaim: "Model-card/custom-corpus results available upstream",
    zubanResult: "Not reproduced",
    metric: "F1 / accuracy",
    status: "reproduce",
    note: "Evaluation data and label mapping must be audited before a Zubán score is published.",
  },
  {
    task: "Translation",
    system: "Bakhteyar/Balochi-Model",
    sourceUrl: "https://huggingface.co/Bakhteyar/Balochi-Model",
    upstreamClaim: "Open translation model; evaluation documentation is limited",
    zubanResult: "Not reproduced",
    metric: "BLEU / COMET + human review",
    status: "audit",
    note: "Training-data provenance and directionality require audit before production comparison.",
  },
  {
    task: "Arabic ↔ Latin script",
    system: "Zubán Script Lab",
    upstreamClaim: "Dictionary-first + rule-based beta",
    zubanResult: "Benchmark set not created yet",
    metric: "Word accuracy + human review",
    status: "planned",
    note: "Dictionary hits and rule-based unknown words must be evaluated separately.",
  },
  {
    task: "OCR",
    system: "Browser Tesseract fallback",
    upstreamClaim: "Urdu + Persian + Arabic OCR models, not Balochi-specific",
    zubanResult: "No Balochi benchmark yet",
    metric: "CER / WER",
    status: "planned",
    note: "Zubán should build printed Balochi image/text pairs before claiming OCR quality.",
  },
];
