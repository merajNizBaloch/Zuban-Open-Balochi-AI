"use client";

import { ReactNode } from "react";
import { useExperience } from "@/components/experience-provider";

export function UiText({
  id,
  fallback,
}: {
  id: string;
  fallback: string;
}) {
  const { t } = useExperience();
  return <>{t(id, fallback) as ReactNode}</>;
}
