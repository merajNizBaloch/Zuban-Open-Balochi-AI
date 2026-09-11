import { dictionaryEntries, type DictionaryEntry } from "@/lib/dictionary";

export type BalochiScript = "arabic" | "latin" | "mixed" | "unknown";
export type TransliterationTarget = "arabic" | "latin";

export type TransliterationResult = {
  input: string;
  output: string;
  sourceScript: BalochiScript;
  targetScript: TransliterationTarget;
  dictionaryMatches: number;
  ruleBasedSegments: number;
  warning: string;
};

const arabicCharMap: Record<string, string> = {
  "آ": "á",
  "ا": "a",
  "أ": "a",
  "إ": "e",
  "ب": "b",
  "پ": "p",
  "ت": "t",
  "ٹ": "ṭ",
  "ث": "th",
  "ج": "j",
  "چ": "c",
  "ح": "h",
  "خ": "x",
  "د": "d",
  "ڈ": "ḍ",
  "ذ": "dh",
  "ر": "r",
  "ڑ": "ř",
  "ز": "z",
  "ژ": "ž",
  "س": "s",
  "ش": "š",
  "ص": "s",
  "ض": "z",
  "ط": "t",
  "ظ": "z",
  "ع": "‘",
  "غ": "gh",
  "ف": "f",
  "ق": "q",
  "ک": "k",
  "ك": "k",
  "گ": "g",
  "ل": "l",
  "م": "m",
  "ن": "n",
  "ں": "n",
  "و": "w",
  "ۏ": "o",
  "ؤ": "w",
  "ه": "h",
  "ہ": "h",
  "ھ": "h",
  "ء": "’",
  "ئ": "y",
  "ی": "y",
  "ي": "y",
  "ى": "y",
  "ے": "e",
  "ݔ": "é",
  "َ": "a",
  "ِ": "e",
  "ُ": "o",
  "ٰ": "á",
  "ْ": "",
  "ّ": "",
};

const latinSequences: Array<[string, string]> = [
  ["gh", "غ"],
  ["kh", "خ"],
  ["sh", "ش"],
  ["ch", "چ"],
  ["zh", "ژ"],
  ["dh", "ذ"],
  ["th", "ث"],
  ["č", "چ"],
  ["š", "ش"],
  ["ž", "ژ"],
  ["ř", "ڑ"],
  ["ṭ", "ٹ"],
  ["ḍ", "ڈ"],
  ["á", "آ"],
  ["à", "آ"],
  ["é", "ݔ"],
  ["è", "ݔ"],
  ["ó", "ۏ"],
  ["ò", "ۏ"],
  ["í", "ی"],
  ["ú", "و"],
  ["b", "ب"],
  ["p", "پ"],
  ["t", "ت"],
  ["j", "ج"],
  ["c", "چ"],
  ["d", "د"],
  ["r", "ر"],
  ["z", "ز"],
  ["s", "س"],
  ["f", "ف"],
  ["q", "ق"],
  ["k", "ک"],
  ["g", "گ"],
  ["l", "ل"],
  ["m", "م"],
  ["n", "ن"],
  ["w", "و"],
  ["v", "و"],
  ["h", "ہ"],
  ["y", "ی"],
  ["a", "ا"],
  ["e", "ے"],
  ["i", "ی"],
  ["o", "ۏ"],
  ["u", "و"],
  ["‘", "ع"],
  ["'", "ء"],
  ["’", "ء"],
];

const lookupLatin = new Map<string, DictionaryEntry>();
const lookupArabic = new Map<string, DictionaryEntry>();

function stripLatinMarks(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘\x60]/g, "'")
    .trim();
}

export function normalizeArabicBalochi(value: string) {
  return value
    .normalize("NFKC")
    .replace(/ـ/g, "")
    .replace(/ك/g, "ک")
    .replace(/[يى]/g, "ی")
    .replace(/\u200c{2,}/g, "\u200c")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

export function normalizeLatinBalochi(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[‘’\x60]/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .trim();
}

export function detectBalochiScript(value: string): BalochiScript {
  const arabic = (value.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) ?? []).length;
  const latin = (value.match(/[A-Za-zÀ-žĀ-ž]/g) ?? []).length;

  if (!arabic && !latin) return "unknown";
  if (arabic && latin) return "mixed";
  return arabic ? "arabic" : "latin";
}

export function normalizeBalochi(value: string) {
  const script = detectBalochiScript(value);
  if (script === "arabic") return normalizeArabicBalochi(value);
  if (script === "latin") return normalizeLatinBalochi(value);
  return normalizeLatinBalochi(normalizeArabicBalochi(value));
}

export function normalizeForBalochiLookup(value: string) {
  const normalized = normalizeBalochi(value);
  return detectBalochiScript(normalized) === "arabic"
    ? normalized.toLocaleLowerCase()
    : stripLatinMarks(normalized);
}

function indexDictionary() {
  if (lookupLatin.size || lookupArabic.size) return;

  for (const entry of dictionaryEntries) {
    for (const form of [entry.word, ...(entry.aliases ?? [])]) {
      lookupArabic.set(normalizeArabicBalochi(form), entry);
    }

    for (const form of entry.latin ?? []) {
      lookupLatin.set(stripLatinMarks(form), entry);
    }
  }
}

function exactDictionaryToLatin(token: string) {
  indexDictionary();
  return lookupArabic.get(normalizeArabicBalochi(token))?.latin?.[0] ?? "";
}

function exactDictionaryToArabic(token: string) {
  indexDictionary();
  return lookupLatin.get(stripLatinMarks(token))?.word ?? "";
}

function arabicTokenToLatin(token: string) {
  let output = "";
  for (const char of normalizeArabicBalochi(token)) {
    output += arabicCharMap[char] ?? char;
  }
  return output;
}

function latinTokenToArabic(token: string) {
  const source = normalizeLatinBalochi(token).toLocaleLowerCase();
  let output = "";
  let index = 0;

  while (index < source.length) {
    let matched = false;

    for (const [latin, arabic] of latinSequences) {
      if (source.startsWith(latin, index)) {
        output += arabic;
        index += latin.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      output += source[index];
      index += 1;
    }
  }

  return output;
}

function isSeparatorToken(token: string) {
  if (!token) return true;
  if (/^\s+$/.test(token)) return true;
  return /^[.,!?؟،؛:;()[\]{}"“”]+$/u.test(token);
}

function transliterateWord(
  token: string,
  target: TransliterationTarget,
): { text: string; dictionary: boolean; rule: boolean } {
  if (isSeparatorToken(token)) {
    return { text: token, dictionary: false, rule: false };
  }

  const script = detectBalochiScript(token);

  if (target === "latin") {
    if (script === "latin") {
      return { text: normalizeLatinBalochi(token), dictionary: false, rule: false };
    }

    const exact = exactDictionaryToLatin(token);
    if (exact) return { text: exact, dictionary: true, rule: false };

    return { text: arabicTokenToLatin(token), dictionary: false, rule: true };
  }

  if (script === "arabic") {
    return { text: normalizeArabicBalochi(token), dictionary: false, rule: false };
  }

  const exact = exactDictionaryToArabic(token);
  if (exact) return { text: exact, dictionary: true, rule: false };

  return { text: latinTokenToArabic(token), dictionary: false, rule: true };
}

export function transliterateBalochi(
  input: string,
  target: TransliterationTarget,
): TransliterationResult {
  const sourceScript = detectBalochiScript(input);
  const parts = input.split(/(\s+|[.,!?؟،؛:;()[\]{}"“”])/u);

  let dictionaryMatches = 0;
  let ruleBasedSegments = 0;

  const output = parts
    .map((part) => {
      const result = transliterateWord(part, target);
      if (result.dictionary) dictionaryMatches += 1;
      if (result.rule) ruleBasedSegments += 1;
      return result.text;
    })
    .join("");

  const warning =
    ruleBasedSegments > 0
      ? "Some words used rule-based correspondence. Balochi Arabic script does not always encode short vowels, so unknown-word conversion can be approximate."
      : "Converted words were found in the sourced Zubán lexicon or already used the requested script.";

  return {
    input,
    output: target === "arabic"
      ? normalizeArabicBalochi(output)
      : normalizeLatinBalochi(output),
    sourceScript,
    targetScript: target,
    dictionaryMatches,
    ruleBasedSegments,
    warning,
  };
}
