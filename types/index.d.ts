interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
  transcript?: { role: string; content: string }[];
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
}

interface CreateFeedbackParams {
  interviewId: string;
  userId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
  profileURL?: string;
  targetRole?: string;
  level?: string;
  techstack?: string[];
  onboarded?: boolean;
  /** "admin" can open /admin. Set it on the Firestore user doc by hand or from the admin tool. */
  role?: "user" | "admin";
  /** Current credit balance (server is the source of truth). */
  credits?: number;
  /** Active plan id from lib/billing/config.ts, or "free". */
  plan?: string;
  /** ISO date the paid plan renews or ends. */
  planRenewsAt?: string | null;
  planStatus?: "active" | "cancelled" | "past_due" | null;
  createdAt?: string;
  lastActiveAt?: string;
  status?: "active" | "suspended";
}

/** One row in a user's credit history (Firestore: users/{uid}/ledger or a top-level credit_ledger). */
interface CreditTxn {
  id: string;
  userId: string;
  /** Positive = credits added, negative = credits spent. */
  delta: number;
  reason: "signup_bonus" | "pack_purchase" | "plan_renewal" | "interview" | "admin_grant" | "refund" | "expiry";
  note?: string;
  balanceAfter: number;
  createdAt: string;
  interviewId?: string;
  paymentId?: string;
}

/** A Razorpay payment as recorded by the backend after verification or webhook. */
interface PaymentRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  kind: "pack" | "plan";
  productId: string;
  /** Minor units (paise / cents). */
  amount: number;
  currency: "INR" | "USD";
  credits: number;
  status: "captured" | "failed" | "refunded" | "pending";
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySubscriptionId?: string;
  method?: string;
  createdAt: string;
  receiptUrl?: string;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
}

interface AgentProps {
  userName: string;
  profileImage?: string;
  role?: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "interview";
  questions?: string[];
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}
