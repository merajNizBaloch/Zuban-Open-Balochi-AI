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

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem("zuban-ui-language");
    const storedTheme = window.localStorage.getItem("zuban-theme");

    if (storedLanguage === "bal" || storedLanguage === "en") {
      setLanguageState(storedLanguage);
    }

    if (storedTheme === "makran" || storedTheme === "light") {
      setThemeState(storedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.language = language;
    root.lang = language === "bal" ? "bal" : "en";
    root.dir = language === "bal" ? "rtl" : "ltr";
    root.style.colorScheme = theme === "makran" ? "dark" : "light";

    window.localStorage.setItem("zuban-theme", theme);
    window.localStorage.setItem("zuban-ui-language", language);
  }, [language, theme]);

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
