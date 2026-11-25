"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { DEMO, demoCommunity, demoFeedback, demoInterviews } from "@/lib/demo";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;
  if (DEMO) return { success: true, feedbackId: "f1" };
  if (!transcript?.some((t) => t.role === "user")) {
    return { success: false, error: "empty" as const };
  }

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      transcript: transcript.map(({ role, content }) => ({ role, content })),
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  if (DEMO) return [...demoInterviews, ...demoCommunity].find((i) => i.id === id) || null;
  if (!id || id.length > 64) return null;
  const interview = await db.collection("interviews").doc(id).get();
  if (!interview.exists) return null;
  return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;
  if (DEMO) return demoFeedback[interviewId] || null;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;
  if (DEMO) return demoCommunity;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  if (DEMO) return demoInterviews;
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

/** All feedback for a user, newest first, for dashboard stats. */
export async function getFeedbacksByUserId(userId: string): Promise<Feedback[]> {
  if (DEMO) return Object.values(demoFeedback);
  const snap = await db.collection("feedback").where("userId", "==", userId).get();
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Feedback)
    .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

const LEVELS = ["Student", "Junior", "Mid", "Senior"] as const;
const TYPES = ["Technical", "Behavioral", "Mixed"] as const;

/** Form-based interview builder: generates questions with Gemini and saves the interview. */
export async function createInterview(params: {
  userId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}): Promise<{ success: true; id: string } | { success: false; message: string }> {
  const role = params.role?.trim().slice(0, 80);
  const level = LEVELS.includes(params.level as (typeof LEVELS)[number]) ? params.level : "Junior";
  const type = TYPES.includes(params.type as (typeof TYPES)[number]) ? params.type : "Mixed";
  const amount = Math.min(10, Math.max(3, Math.round(Number(params.amount) || 5)));
  const techstack = (params.techstack || []).map((t) => t.trim()).filter(Boolean).slice(0, 8);
  if (!role || role.length < 2) return { success: false, message: "Enter the role you're preparing for." };
  if (DEMO) return { success: true, id: "i1" };

  try {
    const { text } = await generateQuestions({ role, level, type, techstack, amount });
    const questions = parseQuestions(text, amount);
    if (!questions.length) return { success: false, message: "We couldn't generate questions. Try again." };
    const ref = await db.collection("interviews").add({
      role,
      type,
      level,
      techstack,
      questions,
      userId: params.userId,
      finalized: true,
      createdAt: new Date().toISOString(),
    });
    return { success: true, id: ref.id };
  } catch (error) {
    console.error("createInterview failed:", error);
    return { success: false, message: "We couldn't generate questions right now. Try again in a minute." };
  }
}

async function generateQuestions(p: { role: string; level: string; type: string; techstack: string[]; amount: number }) {
  const { generateText } = await import("ai");
  return generateText({
    model: google("gemini-2.0-flash-001"),
    prompt: `Prepare questions for a job interview.
The job role is ${p.role}.
The job experience level is ${p.level}.
The tech stack used in the job is: ${p.techstack.join(", ") || "not specified"}.
The focus between behavioural and technical questions should lean towards: ${p.type}.
The amount of questions required is: ${p.amount}.
Return only the questions, without any additional text.
The questions are read aloud by a voice assistant, so do not use "/" or "*" or other special characters.
Return them as a JSON array of strings, like: ["Question 1", "Question 2"]`,
  });
}

function parseQuestions(text: string, amount: number): string[] {
  const match = text.match(/\[[\s\S]*\]/);
  try {
    const arr = JSON.parse(match ? match[0] : text);
    return Array.isArray(arr) ? arr.map(String).filter(Boolean).slice(0, amount) : [];
  } catch {
    return text.split("\n").map((l) => l.replace(/^[-\d.)\s"]+|[",\s]+$/g, "")).filter((l) => l.length > 8).slice(0, amount);
  }
}

/** Resolves a join code or pasted link to an interview id, or null. */
export async function resolveJoinCode(input: string): Promise<{ id: string; role: string } | null> {
  const raw = (input || "").trim();
  const id = (raw.match(/interview\/([A-Za-z0-9_-]{2,64})/)?.[1] || raw).replace(/[^A-Za-z0-9_-]/g, "");
  if (!id) return null;
  const interview = await getInterviewById(id);
  return interview && interview.finalized !== false ? { id: interview.id, role: interview.role } : null;
}
