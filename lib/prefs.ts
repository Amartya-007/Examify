"use client";

export type Prefs = { micId?: string; camId?: string; speakerId?: string; captions: boolean; joinWithCamera: boolean };
const KEY = "examify:prefs";
const DEFAULTS: Prefs = { captions: true, joinWithCamera: true };

export function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}
export function writePrefs(patch: Partial<Prefs>) {
  const next = { ...readPrefs(), ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  return next;
}
