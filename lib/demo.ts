/**
 * Demo mode: renders the app with sample data, for design review and screenshots
 * without Firebase, Vapi or Gemini credentials. Off unless EXAMIFY_DEMO=1, and
 * always off in production builds. Never set this on Vercel.
 */
export const DEMO =
  process.env.NODE_ENV !== "production" &&
  (process.env.EXAMIFY_DEMO === "1" || process.env.NEXT_PUBLIC_EXAMIFY_DEMO === "1");

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 864e5).toISOString();

export const demoUser: User = {
  id: "demo-user",
  name: "Aarav Mehta",
  email: "aarav@example.com",
  targetRole: "Frontend Developer",
  level: "Junior",
  techstack: ["React", "TypeScript", "Next.js"],
  onboarded: true,
  role: "admin",
  credits: 14,
  plan: "free",
  planStatus: null,
  planRenewsAt: null,
  createdAt: new Date(Date.now() - 21 * 864e5).toISOString(),
};

export const demoInterviews: Interview[] = [
  { id: "i1", role: "Frontend Developer", level: "Junior", type: "Technical", techstack: ["react", "typescript", "nextjs"], questions: ["Explain the virtual DOM.", "What are React Server Components?", "How do you type a custom hook?", "How would you debug a slow page?", "Tell me about a bug you fixed."], createdAt: iso(1), userId: "demo-user", finalized: true },
  { id: "i2", role: "Full Stack Engineer", level: "Mid", type: "Mixed", techstack: ["nodejs", "postgresql", "react"], questions: ["Design a URL shortener.", "Tell me about a conflict in your team.", "How do you index a slow query?"], createdAt: iso(4), userId: "demo-user", finalized: true },
  { id: "i4", role: "React Native Developer", level: "Mid", type: "Technical", techstack: ["react", "typescript", "firebase"], questions: ["a", "b", "c", "d", "e"], createdAt: iso(14), userId: "demo-user", finalized: true },
  { id: "i5", role: "Frontend Developer", level: "Junior", type: "Behavioral", techstack: ["react", "javascript"], questions: ["a", "b", "c", "d"], createdAt: iso(7), userId: "demo-user", finalized: true },
  { id: "i3", role: "Product Designer", level: "Junior", type: "Behavioral", techstack: ["figma"], questions: ["Walk me through a project.", "How do you handle feedback?"], createdAt: iso(9), userId: "demo-user", finalized: true },
];

export const demoCommunity: Interview[] = [
  { id: "c1", role: "Backend Engineer", level: "Senior", type: "Technical", techstack: ["go", "docker", "kubernetes"], questions: ["a", "b", "c", "d", "e", "f"], createdAt: iso(2), userId: "u2", finalized: true },
  { id: "c2", role: "Data Analyst", level: "Junior", type: "Mixed", techstack: ["python", "mysql"], questions: ["a", "b", "c", "d"], createdAt: iso(3), userId: "u3", finalized: true },
  { id: "c3", role: "Android Developer", level: "Mid", type: "Technical", techstack: ["kotlin", "firebase"], questions: ["a", "b", "c", "d", "e"], createdAt: iso(5), userId: "u4", finalized: true },
  { id: "c4", role: "Engineering Manager", level: "Senior", type: "Behavioral", techstack: [], questions: ["a", "b", "c"], createdAt: iso(6), userId: "u5", finalized: true },
];

export const demoFeedback: Record<string, Feedback> = {
  i1: {
    id: "f1", interviewId: "i1", totalScore: 78, createdAt: iso(1),
    categoryScores: [
      { name: "Communication Skills", score: 82, comment: "Clear, structured answers. You signposted your points well, though two answers ran long before reaching the conclusion." },
      { name: "Technical Knowledge", score: 74, comment: "Solid on React fundamentals and hooks. The explanation of Server Components mixed up hydration and streaming." },
      { name: "Problem Solving", score: 80, comment: "Good debugging approach: you measured first, then narrowed down. Mention trade-offs earlier." },
      { name: "Cultural Fit", score: 79, comment: "Showed ownership and curiosity. Connect examples to the team's product more directly." },
      { name: "Confidence and Clarity", score: 75, comment: "Calm delivery. A few filler words at the start of answers; pause instead." },
    ],
    strengths: ["Structured answers with a clear beginning and end", "Strong grasp of hooks and component composition", "Measured, step-by-step debugging story"],
    areasForImprovement: ["Separate hydration from streaming when explaining Server Components", "Lead with the answer, then the detail", "Quantify impact in the bug story (time saved, users affected)"],
    finalAssessment: "A confident junior frontend candidate with strong React fundamentals and a clear communication style. Tightening the explanation of server rendering and leading with conclusions would move this into a strong hire.",
    transcript: [
      { role: "assistant", content: "Hello! Thanks for joining. Let's start: can you explain what the virtual DOM is and why React uses it?" },
      { role: "user", content: "Sure. The virtual DOM is a lightweight copy of the real DOM that React keeps in memory. When state changes, React builds a new tree, diffs it against the previous one and applies only the changes to the real DOM, which keeps updates fast." },
      { role: "assistant", content: "Good. What are React Server Components, and how do they differ from server-side rendering?" },
      { role: "user", content: "Server Components run only on the server and send a serialized result, so their code never ships to the browser. SSR renders HTML for the first load, but the components still hydrate on the client." },
      { role: "assistant", content: "How would you type a custom hook that fetches data in TypeScript?" },
    ],
  },
  i4: {
    id: "f4", interviewId: "i4", totalScore: 58, createdAt: iso(13),
    categoryScores: [
      { name: "Communication Skills", score: 63, comment: "" }, { name: "Technical Knowledge", score: 55, comment: "" },
      { name: "Problem Solving", score: 60, comment: "" }, { name: "Cultural Fit", score: 58, comment: "" }, { name: "Confidence and Clarity", score: 52, comment: "" },
    ],
    strengths: [], areasForImprovement: [], finalAssessment: "Knows the basics of React Native; navigation and state answers stayed shallow.",
  },
  i5: {
    id: "f5", interviewId: "i5", totalScore: 69, createdAt: iso(7),
    categoryScores: [
      { name: "Communication Skills", score: 76, comment: "" }, { name: "Technical Knowledge", score: 62, comment: "" },
      { name: "Problem Solving", score: 68, comment: "" }, { name: "Cultural Fit", score: 74, comment: "" }, { name: "Confidence and Clarity", score: 65, comment: "" },
    ],
    strengths: [], areasForImprovement: [], finalAssessment: "Clear teamwork stories; conflict example lacked an outcome.",
  },
  i2: {
    id: "f2", interviewId: "i2", totalScore: 64, createdAt: iso(4),
    categoryScores: [
      { name: "Communication Skills", score: 70, comment: "" }, { name: "Technical Knowledge", score: 62, comment: "" },
      { name: "Problem Solving", score: 66, comment: "" }, { name: "Cultural Fit", score: 63, comment: "" }, { name: "Confidence and Clarity", score: 60, comment: "" },
    ],
    strengths: [], areasForImprovement: [], finalAssessment: "Good system design instincts; the database indexing answer needed more depth.",
  },
};
