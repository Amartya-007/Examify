import { mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};


/** Devicon URL for a tech name, or null when we have no mapping (render a text chip instead). */
export const techIconUrl = (tech: string) => {
  const n = normalizeTechName(tech);
  return n ? `${techIconBaseURL}/${n}/${n}-original.svg` : null;
};

export const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export const scoreTone = (score: number) =>
  score >= 80 ? "success" : score >= 60 ? "brand" : score >= 40 ? "warning" : "destructive";

export const scoreLabel = (score: number) =>
  score >= 85 ? "Excellent" : score >= 70 ? "Strong" : score >= 55 ? "Developing" : "Needs work";
