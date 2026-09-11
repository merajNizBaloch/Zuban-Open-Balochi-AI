"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type UiLanguage = "en" | "bal";
export type UiTheme = "light" | "makran";

const balochiCopy: Record<string, string> = {
  "nav.chat": "گپ",
  "nav.translate": "ترجمه",
  "nav.dictionary": "لبزنامگ",
  "nav.language": "زبان",
  "nav.community": "کمیونٹی",
  "nav.research": "تحقیق",
  "nav.github": "GitHub",

  "home.brand": "زُبان",
  "home.title": "بلوچی زبانءَ آجو ٹیکنالوجی",
  "home.intro": "گپ، ترجمه، خوانگ، گُشدارگ، گُشگ و بلوچی ٹیکنالوجی.",
  "home.open": "زُبان پچ کن",
  "home.contribute": "همکاری کن",
  "home.ask": "بلوچیءَ چے چیزے بپرس…",
  "home.tools": "ابزار",
  "home.tools.desc": "بلوچی زبان ءِ کاراں زُبان ءِ ابزار بکار مرز.",
  "home.about.title": "بلوچی ءِ واستہ. همگاں ءِ واستہ آجو.",
  "home.about.body": "زُبان، بلوچی زبان ءِ ابزار، لبزنامگ، گُشدار، OCR، ڈیٹا و تحقیق یکجاہ کنت.",
  "home.research": "تحقیق",
  "home.datasets": "ڈیٹا",
  "home.technology": "ٹیکنالوجی",
  "home.tool.01.title": "گپ",
  "home.tool.01.desc": "بلوچیءَ بنویس و بپرس.",
  "home.tool.02.title": "ترجمه",
  "home.tool.02.desc": "بلوچی، انگریزی، اردو و فارسی.",
  "home.tool.03.title": "لبزنامگ",
  "home.tool.03.desc": "لبز، نوشتگ و مانا درگیج کن.",
  "home.tool.04.title": "رسم الخط لیب",
  "home.tool.04.desc": "متن صاف کن و عربی ↔ لاطینی بدل کن.",
  "home.tool.05.title": "گُشدار + آواز",
  "home.tool.05.desc": "آوازءَ متن کن و متنءَ آواز.",
  "home.tool.06.title": "OCR",
  "home.tool.06.desc": "عکس و چاپی صفحہءَ بلوچی متن بخوان.",
  "home.tool.open": "پچ کن",

  "tool.chat.title": "زُبان چوں کمگ کنت؟",
  "tool.chat.subtitle": "بلوچی، انگریزی، اردو یا فارسیءَ بپرس.",
  "tool.chat.new": "نوکیں گپ",
  "tool.chat.placeholder": "زُبانءَ پیام بدئے",
  "tool.chat.copy": "کاپی",
  "tool.chat.dialect": "لهجہ",
  "tool.chat.script": "رسم الخط",
  "tool.chat.auto": "خودکار",
  "tool.chat.western": "مغربی",
  "tool.chat.southern": "جنوبی",
  "tool.chat.eastern": "مشرقی",
  "tool.chat.arabic": "عربی",
  "tool.chat.latin": "لاطینی",
  "tool.chat.disclaimer": "زُبان اشتباه کنگ بہ کنت. مهمیں زبانی و لهجہی معلومات را دوبارہ بچار.",

  "translate.from": "چه",
  "translate.to": "په",
  "translate.clear": "پاک کن",
  "translate.copy": "کاپی",
  "translate.action": "ترجمه کن",
  "translate.loading": "ترجمه بوتگ…",
  "translate.placeholder": "ترجمه اِدا پیداک بیت.",
  "translate.review": "بهتر ترجمه پیشنهاد کن →",
  "translate.note": "لهجہ ءِ سببءَ ترجمه بدل بوہت. مهمیں ترجمه روانی گپ‌زن ءَ بچار.",
  "page.translate.eyebrow": "ترجمه",
  "page.translate.title": "بلوچی ترجمه.",
  "page.translate.lead": "بلوچی، انگریزی، اردو و فارسی یکجاہ.",

  "page.dictionary.eyebrow": "لبزنامگ",
  "page.dictionary.title": "بلوچی لبزنامگ.",
  "page.dictionary.lead": "بلوچی رسم الخط، لاطینی نوشتگ یا انگریزی مانا ءَ درگیج کن.",
  "page.language.eyebrow": "زبان لیب",
  "page.language.title": "بلوچیءَ دو رسم الخطاں بنویس.",
  "page.language.lead": "بلوچی متن صاف کن و عربی و لاطینی رسم الخطاں بدل کن.",
  "page.speech.eyebrow": "گُشدار",
  "page.speech.title": "گُشدار و آواز.",
  "page.speech.lead": "بلوچی آڈیوءَ متن کن یا متنءَ آواز کن.",
  "page.ocr.eyebrow": "OCR",
  "page.ocr.title": "عکسءَ بلوچی متن بخوان.",
  "page.ocr.lead": "صاف عکس اپلوڈ کن و چاپی بلوچیءَ قابلِ ترمیم متن کن.",
  "page.community.eyebrow": "کمیونٹی",
  "page.community.title": "زبان ءِ تہہ را یکجاہ بسازیت.",
  "page.research.eyebrow": "تحقیق",
  "page.research.title": "بلوچی ءِ آجو تحقیق.",
  "page.datasets.eyebrow": "ڈیٹا",
  "page.datasets.title": "سرچشمگءَ گوں یاد داروکیں آجو ڈیٹا.",
  "page.technology.eyebrow": "ٹیکنالوجی",
  "page.technology.title": "حصہ وار و بدل بوہگ ءِ قابل.",
  "page.developers.eyebrow": "ڈیولپرز",
  "page.developers.title": "زُبان ءِ گوں بساز.",
  "page.roadmap.eyebrow": "راهدار",
  "page.roadmap.title": "زُبان چے چیزاں سازگ انت.",
  "page.setup.title": "زُبان سیٹ اپ.",
  "page.bench.eyebrow": "زُبان بینچ",
  "page.bench.title": "دعویٰ ءَ پیش، دوبارہ آزمایش.",

  "dictionary.search": "بلوچی، لاطینی نوشتگ یا انگریزی مانا درگیج کن",
  "dictionary.entries": "درج",
  "dictionary.meta": "عربی رسم الخط · لاطینی نوشتگ · انگریزی مانا",
  "dictionary.copy": "کاپی",
  "dictionary.copyLink": "لنک کاپی",
  "dictionary.correct": "اصلاح پیشنهاد کن →",
  "dictionary.empty": "درج نہ لوٹ.",
  "dictionary.try": "دگر نوشتگ یا انگریزی مانا آزما.",
  "dictionary.more": "گیشتر پیش بدار",
  "dictionary.source": "سرچشمگ",
  "dictionary.viewSource": "سرچشمگ بچار ↗",

  "script.convert": "رسم الخط بدل کن",
  "script.normalize": "متن صاف کن",
  "script.detected": "پجارگ",
  "script.convertTo": "بدل کن پہ",
  "script.latin": "لاطینی بلوچی",
  "script.arabic": "عربی رسم الخط بلوچی",
  "script.input": "ورد",
  "script.clear": "پاک کن",
  "script.output": "نتیجہ",
  "script.copy": "کاپی",
  "script.processing": "کار روان اِنت…",
  "script.result": "نتیجہ اِدا پیداک بیت.",
  "script.working": "کار روان اِنت…",
  "script.normalizeAction": "صاف کن",
  "script.convertAction": "رسم الخط بدل کن",

  "community.lead": "لبز، جملہ، اصلاح، تلفظ، ڈیٹا و تحقیق شریک کن. ہر پیشکش ءِ سرچشمگ و بررسی ءِ تاریخ محفوظ بیت.",
  "community.context": "پس منظر",
  "community.context.desc": "اگر لهجہ، علاقہ یا سرچشمگ معلوم اِنت، گوں پیشکش بنویس.",
  "community.permission": "اجازت",
  "community.permission.desc": "فقط اے متن، آڈیو یا عکس شریک کن کہ قانونی طورءَ دوبارہ کارمرز بوہگ ءِ اجازت بہ بیت.",
  "community.review": "بررسی",
  "community.review.desc": "اصلاحاں آشکار رہنت تا گپ‌زن و محقق گپ و بررسی بکنت.",
  "community.queue.eyebrow": "بررسی ءِ قطار",
  "community.queue.title": "بچار کمیونٹی چے چیزاں بررسی کنگ اِنت.",
  "community.queue.desc": "پیشکشاں GitHub issue انت، چہ اے سبب دلیل، بحث و فیصله آشکار رہنت.",
  "community.contribute.eyebrow": "همکاری",
  "community.contribute.title": "سودمند چیزے شریک کن.",
  "community.contribute.desc": "زُبان ساختاری GitHub issue پچ کنت؛ ارسال ءَ پیش بچار و فایل ببند.",
  "community.stats.total": "پیشکش",
  "community.stats.review": "بررسی لازم",
  "community.stats.verified": "تصدیق بوتگ",
  "community.filter.all": "همہ",
  "community.filter.review": "بررسی لازم",
  "community.filter.verified": "تصدیق بوتگ",
  "community.filter.reviewed": "بررسی بوتگ",
  "community.refresh": "نوک کن",
  "community.loading": "آشکار بررسی ءِ قطار لوٹگ بیت…",
  "community.empty": "هنوز اے دیدگءَ پیشکشے نِست. اولی اصلاح یا زبانی مثال قطار شروع کنگ بہ کنت.",
  "community.note": "بررسی GitHub ءَ آشکار بوتگ. بند بوتگ issue بررسی بوتگ حساب بیت؛ verified یا rejected لیبل فیصله روشن کنت.",
  "community.state.review": "بررسی لازم",
  "community.state.verified": "تصدیق بوتگ",
  "community.state.rejected": "رد بوتگ",
  "community.state.reviewed": "بررسی بوتگ",
  "community.contribution": "کمیونٹی پیشکش",

  "contribute.eyebrow": "همکاری",
  "contribute.title": "زُبان ءَ بسازگءَ کمک کن.",
  "contribute.lead": "گپ‌زن، نویسگَر، محقق و ڈیولپر همگی زُبان بهتر کنگ بہ کنت. روشن پس منظر و معتبر سرچشمگ مقدارءَ گیشتر مهم انت.",
  "contribute.send": "پیشکش روان دئے.",
  "contribute.send.desc": "اِدا پُر کن، پد GitHub issue ءَ ارسال ءَ پیش بچار.",
  "contribute.code": "کوڈ شریک کنگ لوٹئے؟",
  "contribute.code.desc": "repo fork کن، روشن تبدیلی کن و pull request پچ کن.",
  "contribute.repo": "repo بچار ↗",
  "form.contribution": "پیشکش",
  "form.title": "کوتاه عنوان",
  "form.title.placeholder": "چے چیزے شریک کنگ اِئے؟",
  "form.details": "تفصیل",
  "form.details.placeholder": "لبز، اصلاح، ترجمه، تحقیقی خیال، ڈیٹا یا دگر سودمند پس منظر بنویس.",
  "form.dialect": "لهجہ / علاقہ",
  "form.optional": "اختیاری",
  "form.script": "رسم الخط",
  "form.source": "سرچشمگ",
  "form.source.placeholder": "کتاب، URL، گپ‌زن، ڈیٹا…",
  "form.license": "لائسنس / اجازت",
  "form.license.placeholder": "اگر بیرونی مواد اِنت",
  "form.note": "اے پیش پُر بوتگ GitHub issue پچ کنت. ارسال ءَ پیش بچار و فایل ببند. بی اجازت شخصی ریکارڈنگ یا کاپی‌رائٹ مواد اپلوڈ مکن.",
  "form.continue": "GitHub ءَ برو ↗",
  "form.type.community": "کمیونٹی جملہ",
  "form.type.dictionary": "لبزنامگ ءِ لبز",
  "form.type.translation": "ترجمه اصلاح",
  "form.type.voice": "تلفظ / آواز",
  "form.type.ocr": "OCR اصلاح",
  "form.type.data": "ڈیٹا سرچشمگ",
  "form.type.research": "تحقیق",
  "form.type.code": "کوڈ / پروڈکٹ خیال",
  "form.script.arabic": "عربی",
  "form.script.latin": "لاطینی",
  "form.script.both": "هر دو",
  "form.script.na": "لاگو نہ انت",

  "research.lead": "کم‌منبع زبان ءِ واستہ روش، ڈیٹا، محدودیت و دوبارہ آزمایش کنگ ءِ قابل ارزیابی.",
  "research.reuse": "دوبارہ کارمرزی / بررسی",
  "research.reuse.title": "پیشتر بوتگ کار ءِ سرا بساز.",
  "research.reuse.desc": "بیرونی سرچشمگ زُبانءَ شامل بوہگ ءَ پیش لائسنس، سرچشمگ و دوبارہ آزمایش ءِ حسابءَ بررسی بنت.",
  "research.metrics": "مارکیٹنگ ءَ پیش، معیار.",
  "research.openbench": "بینچمارک رجسٹری پچ کن →",

  "datasets.lead": "ہر سودمند ریکارڈ ءَ رسم الخط، لهجہ، سرچشمگ، لائسنس و تصدیق ءِ حالت محفوظ بوہگ لوٹیت.",
  "datasets.available": "دستیاب سرچشمگ.",
  "datasets.available.desc": "بیرونی کار کہ بررسی، آزمایش یا دوبارہ کارمرزی ءِ واستہ بچارگ بہ بیت.",
  "datasets.open": "سرچشمگ پچ کن ↗",
  "datasets.own": "زُبان ڈیٹا.",
  "datasets.own.desc": "زُبان پروجیکٹ ءِ زیرءَ جوڑ بوہگیں ڈیٹا و بینچمارک.",
  "datasets.name": "نام",
  "datasets.type": "قسم",
  "datasets.status": "حالت",
  "datasets.purpose": "مقصد",
  "datasets.meta": "کمینه ریکارڈ میٹاڈیٹا",

  "technology.lead": "زُبان انٹرفیسءَ ماڈلاں چہ جدا دارت تا بهتر آجو ماڈل بی‌دوبارہ‌سازی بدل بوہنت.",
  "technology.setup": "ڈیپلائمنٹ سیٹ اپ بچار →",
  "technology.status": "سروس ءِ حالت.",
  "technology.status.desc": "اے ڈیپلائمنٹءَ کنفیگر بوتگ ماڈل اڈاپٹر ءِ زندگ حالت.",
  "technology.text": "متن ماڈل",
  "technology.text.desc": "Chat و Translate کنفیگر بوتگ Hugging Face، OpenAI-compatible endpoint یا Ollama ءَ ترجیح دنت. بی اے، چھوٹک ماڈل WebGPU ءَ بی لاگن مقامی طورءَ چلگ بہ کنت.",
  "technology.media": "میڈیا ماڈل",
  "technology.media.desc": "Speech و Voice مشترک بلوچی ماڈل سرور کارمرز کنت؛ OCR سرور یا براوزر fallback کارمرز کنت.",

  "developers.lead": "ویب سائٹ ءِ همے آجو زبانی سروس HTTP endpoint ءِ شکلءَ آزمایش، تعلیم و بلوچی پروڈکٹاں ءِ واستہ دستیاب انت.",
  "developers.script": "رسم الخط تبدیلی",
  "developers.chat": "Streaming Chat",
  "developers.open": "آجو، بلے بے‌پرواہ نہ.",
  "developers.open.desc": "Dictionary و Language endpoint بی ماڈل credential کار کنت. مہنگ inference ءِ آشکار ڈیپلائمنٹءَ rate limiting لازم انت.",

  "roadmap.lead": "Production ابزار، deployment کار و تحقیق جدا رہنت تا تجربی کار مکمل ٹیکنالوجی ءِ شکلءَ پیش نہ بیت.",
  "roadmap.live": "زندگ",
  "roadmap.building": "سازگءَ",
  "roadmap.research": "تحقیق",

  "setup.lead": "بچار اے ڈیپلائمنٹءَ چے چیز واقعی جڑ بوتگ. fallback سروس مکمل ماڈل سروس چہ جدا پیش دارگ بنت.",
  "setup.technology": "ٹیکنالوجی →",
  "setup.repository": "repo ↗",
  "setup.ready": "تیار",
  "setup.fallback": "fallback",
  "setup.needs": "سیٹ اپ لازم",
  "setup.checking": "بررسی",
  "setup.environment": "محیط",
  "setup.recommended": "Production ءِ پیشنهاد بوتگ سیٹ اپ",

  "bench.lead": "بیرونی model-card نمبر سودمند پس منظر انت، بلے تا مستقل و versioned test set ءَ آزمایش نہ بنت زُبان ءِ نتیجہ نہ بنت.",
  "bench.task": "کار",
  "bench.system": "سسٹم",
  "bench.upstream": "بیرونی",
  "bench.metric": "معیار",
  "bench.separate": "train / dev / test جدا بدار",
  "bench.separate.desc": "بینچمارک مثال خاموشیءَ training ءَ شامل نہ بوہنت.",
  "bench.dialect": "لهجہ میٹاڈیٹا بدار",
  "bench.dialect.desc": "یک مجموعی نمبر علاقائی فرق پنهان مکنیت.",
  "bench.human": "انسانی بررسی مهم اِنت",
  "bench.human.desc": "کم‌منبع ترجمه و رسم الخط ءِ واستہ خودکار معیار کافی نہ انت.",

  "media.choose.audio": "بلوچی آڈیو انتخاب کن",
  "media.choose.image": "چاپی بلوچی عکس انتخاب کن",
  "media.audio.desc": "آڈیو اپلوڈ کن یا مائکروفون چہ سیدھا ریکارڈ کن.",
  "media.image.desc": "صاف و روشن عکس کارمرز کن. OCR براوزرءَ هم چلگ بہ کنت.",
  "media.record": "مائکروفون ریکارڈ کن",
  "media.reset": "دوبارہ",
  "media.reading": "خوانگ…",
  "media.processing": "کار روان اِنت…",
  "media.transcribe": "متن کن",
  "media.extract": "متن درکشان",
  "media.result": "نتیجہ",
  "media.status": "حالت",
  "media.copy": "کاپی",
  "media.ocr.correct": "OCR اصلاح پیشنهاد کن →",
  "media.stt.correct": "transcription اصلاح کن →",

  "voice.voice": "آواز",
  "voice.note": "کنونی آجو بلوچی TTS ماڈل لاطینی بلوچی و کوتاه پیراگرافاں ءَ بهتر کار کنت.",
  "voice.text": "بلوچی متن",
  "voice.placeholder": "گُشگ ءِ واستہ لاطینی بلوچی متن بنویس…",
  "voice.generate": "آواز بساز",
  "voice.generating": "سازگ بوتگ…",
  "voice.download": "آڈیو ڈاؤنلوڈ",
  "voice.meta": "SpeechT5 · سه آجو بلوچی گپ‌زن ءِ آواز",

  "status.text": "متن ماڈل",
  "status.chat": "Chat + Translate",
  "status.stt": "گُشدار چہ متن",
  "status.tts": "متن چہ آواز",
  "status.vision": "دید",
  "status.ocr": "OCR",
  "status.checking": "بررسی…",

  "footer.tagline": "آجو بلوچی زبان ٹیکنالوجی.",
  "footer.language": "زبان لیب",
  "footer.community": "کمیونٹی",
  "footer.datasets": "ڈیٹا",
  "footer.developers": "ڈیولپرز",
  "footer.roadmap": "راهدار",
};

type ExperienceContextValue = {
  language: UiLanguage;
  theme: UiTheme;
  setLanguage: (value: UiLanguage) => void;
  setTheme: (value: UiTheme) => void;
  toggleTheme: () => void;
  t: (key: string, fallback: string) => string;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>("en");
  const [theme, setThemeState] = useState<UiTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const storedLanguage = window.localStorage.getItem("zuban-ui-language");
      const storedTheme = window.localStorage.getItem("zuban-theme");

      if (storedLanguage === "bal" || storedLanguage === "en") {
        setLanguageState(storedLanguage);
      }

      if (storedTheme === "makran" || storedTheme === "light") {
        setThemeState(storedTheme);
      }

      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;

    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.language = language;
    root.lang = language === "bal" ? "bal" : "en";
    root.dir = language === "bal" ? "rtl" : "ltr";
    root.style.colorScheme = theme === "makran" ? "dark" : "light";

    window.localStorage.setItem("zuban-theme", theme);
    window.localStorage.setItem("zuban-ui-language", language);
  }, [language, theme, ready]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      language,
      theme,
      setLanguage: setLanguageState,
      setTheme: setThemeState,
      toggleTheme: () =>
        setThemeState((current) => (current === "light" ? "makran" : "light")),
      t: (key, fallback) =>
        language === "bal" ? balochiCopy[key] ?? fallback : fallback,
    }),
    [language, theme],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) {
    throw new Error("useExperience must be used inside ExperienceProvider.");
  }
  return value;
}
