/**
 * Technology logos (official SVGs from Devicon, served by jsDelivr). Keys are normalized
 * names; aliases map common spellings. Every path here was checked to exist.
 */
const BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const ICONS: Record<string, string> = {
  react: "react/react-original.svg",
  nextjs: "nextjs/nextjs-original.svg",
  typescript: "typescript/typescript-original.svg",
  javascript: "javascript/javascript-original.svg",
  nodejs: "nodejs/nodejs-original.svg",
  express: "express/express-original.svg",
  python: "python/python-original.svg",
  django: "django/django-plain.svg",
  flask: "flask/flask-original.svg",
  java: "java/java-original.svg",
  spring: "spring/spring-original.svg",
  go: "go/go-original-wordmark.svg",
  kotlin: "kotlin/kotlin-original.svg",
  swift: "swift/swift-original.svg",
  dart: "dart/dart-original.svg",
  flutter: "flutter/flutter-original.svg",
  rust: "rust/rust-original.svg",
  cplusplus: "cplusplus/cplusplus-original.svg",
  csharp: "csharp/csharp-original.svg",
  php: "php/php-original.svg",
  ruby: "ruby/ruby-original.svg",
  vuejs: "vuejs/vuejs-original.svg",
  angular: "angular/angular-original.svg",
  svelte: "svelte/svelte-original.svg",
  redux: "redux/redux-original.svg",
  graphql: "graphql/graphql-plain.svg",
  html5: "html5/html5-original.svg",
  css3: "css3/css3-original.svg",
  tailwindcss: "tailwindcss/tailwindcss-original.svg",
  sass: "sass/sass-original.svg",
  postgresql: "postgresql/postgresql-original.svg",
  mysql: "mysql/mysql-original.svg",
  mongodb: "mongodb/mongodb-original.svg",
  redis: "redis/redis-original.svg",
  firebase: "firebase/firebase-original.svg",
  docker: "docker/docker-original.svg",
  kubernetes: "kubernetes/kubernetes-original.svg",
  amazonwebservices: "amazonwebservices/amazonwebservices-original.svg",
  googlecloud: "googlecloud/googlecloud-original.svg",
  azure: "azure/azure-original.svg",
  git: "git/git-original.svg",
  linux: "linux/linux-original.svg",
  figma: "figma/figma-original.svg",
  jest: "jest/jest-plain.svg",
  numpy: "numpy/numpy-original.svg",
  pandas: "pandas/pandas-original.svg",
  tensorflow: "tensorflow/tensorflow-original.svg",
  pytorch: "pytorch/pytorch-original.svg",
};

const ALIASES: Record<string, string> = {
  next: "nextjs", ts: "typescript", js: "javascript", node: "nodejs", golang: "go",
  "c++": "cplusplus", cpp: "cplusplus", "c#": "csharp", vue: "vuejs", html: "html5", css: "css3",
  tailwind: "tailwindcss", postgres: "postgresql", mongo: "mongodb", aws: "amazonwebservices",
  gcp: "googlecloud", k8s: "kubernetes", reactnative: "react", springboot: "spring", rubyonrails: "ruby",
  rails: "ruby", scss: "sass", expressjs: "express",
};

export function techIcon(tech: string): string | null {
  const key = tech.toLowerCase().replace(/\.js$/, "js").replace(/[\s.-]+/g, "");
  const k = ICONS[key] ? key : ALIASES[key] || ALIASES[key.replace(/js$/, "")] || (ICONS[key.replace(/js$/, "")] ? key.replace(/js$/, "") : "");
  return k && ICONS[k] ? `${BASE}/${ICONS[k]}` : null;
}

/** Logos drawn in black that need inverting on dark backgrounds. */
const MONO = new Set(["express", "flask", "rust", "nextjs"]);
export function techIconIsMono(tech: string) {
  const url = techIcon(tech) || "";
  return [...MONO].some((m) => url.includes(`/${m}/`));
}

/** For verification scripts. */
export const ALL_TECH_ICON_URLS = Object.values(ICONS).map((p) => `${BASE}/${p}`);
