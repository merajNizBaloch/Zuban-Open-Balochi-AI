# Zubán Balochi normalization and script conversion

Zubán treats Balochi script conversion as a language-engineering layer, not as a cosmetic character replacement.

## Scripts

Balochi is written in both Perso-Arabic-derived and Latin-derived orthographies. Zubán currently uses the terms:

- **Arabic script** — Balochi written in Perso-Arabic-derived characters.
- **Latin script** — Balochi written with Latin letters and the diacritics/forms present in sourced Balochi lexical data.

Dialect and orthography are separate metadata. Script conversion must not imply that one regional variety is the universal form of Balochi.

## Current conversion strategy

The public Language Lab uses two stages.

### 1. Dictionary-backed conversion

For a word found in the sourced Zubán lexicon, the stored Arabic and Latin spellings are used directly.

This is the preferred path because it preserves attested lexical forms rather than guessing vowels from an abjad spelling.

### 2. Rule-based fallback

Unknown words use conservative character correspondences.

The fallback is explicitly marked as approximate. Arabic-script Balochi does not always encode short vowels, so arbitrary Arabic → Latin conversion cannot reliably reconstruct every vowel. Latin → Arabic conversion can also over-specify vowels when it is performed without lexical or morphological context.

## Normalization

The normalizer currently performs conservative Unicode and whitespace cleanup:

- Unicode NFKC normalization.
- Arabic Kaf `ك` → Persian/Balochi Kaf `ک`.
- Arabic Yeh variants `ي / ى` → `ی`.
- Tatweel removal.
- Duplicate zero-width non-joiner cleanup.
- Consistent whitespace.
- Curly Latin apostrophe normalization.

The normalizer deliberately avoids aggressive spelling correction. Orthographic variation can represent dialect, publisher convention, or legitimate historical usage.

## Sources consulted for the design

- Baluchi-English Wiktionary dictionary used by the Zubán lexicon:
  https://github.com/Vuizur/Wiktionary-Dictionaries/blob/master/Baluchi-English%20Wiktionary%20dictionary.tsv
- BGN/PCGN 2008 Baluchi romanization system, available through Interscript:
  https://interscript.org/systems/bgnpcgn-bal-Arab-Latn-2008/
- Research describing Balochi Arabic and Latin alphabets:
  https://www.diva-portal.org/smash/get/diva2%3A1372275/FULLTEXT01.pdf

## Next research steps

1. Audit the rule table with Balochi linguists and speakers from multiple dialect regions.
2. Build a human-reviewed Arabic ↔ Latin evaluation set.
3. Record ambiguous-vowel cases rather than hiding them.
4. Add dialect-aware normalization profiles only when there is evidence for them.
5. Benchmark dictionary-backed, rule-based, and learned transliteration separately.

## Evaluation principle

Zubán should report separately:

- exact dictionary matches,
- rule-based segments,
- human-corrected output,
- future learned-model output.

A script converter should never be described as "accurate" without a held-out, human-reviewed evaluation set.
