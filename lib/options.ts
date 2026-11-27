export const GOALS = [
  { id: "job", label: "Land my first job", hint: "Fundamentals and confidence" },
  { id: "switch", label: "Switch roles or companies", hint: "Sharpen for a specific role" },
  { id: "promo", label: "Prepare for a senior loop", hint: "Depth, design and leadership" },
  { id: "practice", label: "Just keep sharp", hint: "Regular low-stakes practice" },
] as const;

export const LEVELS = ["Student", "Junior", "Mid", "Senior"] as const;
export const TYPES = [
  { id: "Technical", hint: "Concepts, code and design" },
  { id: "Behavioral", hint: "Stories, teamwork, judgment" },
  { id: "Mixed", hint: "A bit of both" },
] as const;

export const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Engineer",
  "Mobile Developer",
  "Data Analyst",
  "Data Scientist",
  "DevOps Engineer",
  "Product Designer",
  "Product Manager",
  "QA Engineer",
] as const;

export const STACK = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "Go", "Kotlin", "Swift",
  "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Firebase", "Figma", "Tailwind", "Django",
] as const;
