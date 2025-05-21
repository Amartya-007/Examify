# ExamiFy - Comprehensive Project Documentation

## 1. Introduction

**ExamiFy** is a cutting-edge, AI-driven web application designed to help users prepare for technical and behavioral interviews. Built with Next.js 14, it leverages Google's Gemini AI for intelligent question generation, Firebase for backend services (authentication and database), and Vapi for real-time voice interaction. The goal is to provide a personalized and interactive mock interview experience directly within the browser, helping users practice and receive constructive feedback.

## 2. Core Features

ExamiFy offers a range of features to enhance the interview preparation process:

*🔐 **Secure Authentication**:
    *   Utilizes Firebase Authentication for seamless and secure user sign-up and sign-in.
    *Session management is handled using HTTP-only cookies for enhanced security.
    *   Relevant files: [`app/(auth)/sign-in/page.tsx`](app/(auth)/sign-in/page.tsx), [`app/(auth)/sign-up/page.tsx`](app/(auth)/sign-up/page.tsx), [`components/AuthForm.tsx`](components/AuthForm.tsx), [`lib/actions/auth.action.ts`](lib/actions/auth.action.ts).
*🤖 **AI-Generated Interview Questions**:
    *   Powered by Google's Gemini AI models (via `@ai-sdk/google`) to create relevant and challenging interview questions.
    *Questions are tailored based on job role, experience level, tech stack, and interview type (technical, behavioral, mixed).
    *   Relevant files: [`app/api/vapi/generate/route.ts`](app/api/vapi/generate/route.ts).
*🧠 **Dynamic Question Sets**:
    *   Users can request specific types of question sets (technical, behavioral, or a mix) to focus their preparation.
    *   The number of questions can also be specified.

* 🎤 **Voice-Based Interaction**:
  * Integrates Vapi for a real-time, voice-based interview experience.
  * The AI interviewer asks questions, and the user responds verbally.
  * Includes features like speech-to-text transcription.
  * Relevant files: [`components/Agent.tsx`](components/Agent.tsx), [`lib/vapi.sdk.ts`](lib/vapi.sdk.ts), [`constants/index.ts`](constants/index.ts) (for Vapi agent configuration).
* ☁️ **Persistent Storage with Firestore**:
  * User data, interview history (questions, roles, tech stacks), and generated feedback are stored securely in Firebase Firestore.
  * Relevant files: [`firebase/admin.ts`](firebase/admin.ts), [`firebase/client.ts`](firebase/client.ts), [`lib/actions/general.action.ts`](lib/actions/general.action.ts).
* 📊 **User Dashboard & Interview Review**:
  * Users can view their past interviews and the feedback received.
  * The main page ([`app/(root)/page.tsx`](app/(root)/page.tsx)) displays user-specific interviews and other available interviews.
* 💬 **AI-Powered Feedback System**:
  * After an interview, the AI analyzes the transcript of the conversation.
  * Provides detailed feedback including a total score, category-wise scores (e.g., Communication, Technical Knowledge), strengths, and areas for improvement.
  * Relevant files: [`lib/actions/general.action.ts`](lib/actions/general.action.ts) (specifically `createFeedback` function), [`app/(root)/interview/[id]/feedback/page.tsx`](app/(root)/interview/[id]/feedback/page.tsx).
* 📈 **Roadmap Features (Planned)**:
  * Export interview sessions to PDF.
  * Dark mode toggle (currently defaults to dark).

## 3. Tech Stack

| Layer          | Technology                                     | Description                                                                 |
| :------------- | :--------------------------------------------- | :-------------------------------------------------------------------------- |
| **Framework**  | Next.js 14                                     | React framework for server-side rendering, static site generation, and more. |
| **Language**   | TypeScript                                     | Superset of JavaScript adding static typing.                                |
| **Styling**    | Tailwind CSS                                   | Utility-first CSS framework for rapid UI development.                       |
|                | Shadcn/ui                                      | Re-usable UI components.                                                    |
| **AI Engine**  | Google Gemini API (`@ai-sdk/google`)           | For generating interview questions and processing feedback.                 |
| **Backend**    | Firebase                                       |                                                                             |
|                |   Firebase Authentication                    | Handles user sign-up, sign-in, and session management.                      |
|                |   Firebase Firestore                         | NoSQL database for storing user data, interviews, and feedback.             |
| **Voice AI**   | Vapi                                           | For real-time voice interaction and transcription.                          |
| **State Mgt.** | React Context / Server Actions                 | Primarily uses Next.js Server Actions for mutations and data fetching.      |
| **Deployment** | Vercel (recommended)                           | Platform for deploying Next.js applications.                                |
| **Linting**    | ESLint                                         | For code quality and consistency.                                           |
| **UI Libs**    | `lucide-react` (icons), `sonner` (toasts)      |                                                                             |
| **Forms**      | `react-hook-form`, `zod` (validation)          | For handling forms and data validation.                                     |

## 4. Project Structure

ExamiFy/
├── app/ # Next.js App Router
│ ├── (auth)/ # Authentication-related pages (sign-in, sign-up)
│ │ ├── layout.tsx # Layout for auth pages
│ │ └── sign-in/page.tsx
│ │ └── sign-up/page.tsx
│ ├── (root)/ # Core application pages (dashboard, interview, feedback)
│ │ ├── layout.tsx # Layout for main app (includes navbar)
│ │ ├── page.tsx # Main dashboard/home page
│ │ └── interview/
│ │ ├── [id]/ # Dynamic route for a specific interview
│ │ │ ├── feedback/page.tsx # Page to display feedback for an interview
│ │ │ └── page.tsx # Page for conducting an interview
│ │ └── page.tsx # Page to start/generate a new interview
│ ├── api/ # API routes
│ │ └── vapi/
│ │ └── generate/route.ts # API endpoint for generating interview questions
│ ├── globals.css # Global styles and Tailwind CSS setup
│ └── layout.tsx # Root layout for the entire application
├── components/ # Reusable React components
│ ├── ui/ # UI components (often from Shadcn/ui or custom styled)
│ │ ├── button.tsx
│ │ ├── form.tsx
│ │ ├── input.tsx
│ │ ├── label.tsx
│ │ └── sonner.tsx # Toast notifications
│ ├── Agent.tsx # Core component for handling Vapi voice agent interaction
│ ├── AuthForm.tsx # Form for user sign-in and sign-up
│ ├── DisplayTechIcons.tsx # Component to display tech stack icons
│ ├── FormField.tsx # Reusable form field component with react-hook-form
│ └── InterviewCard.tsx # Card component to display interview summaries
├── constants/ # Constant values and configurations
│ └── index.ts # Exports mappings, Vapi agent config, schemas, etc.
├── firebase/ # Firebase configuration and setup
│ ├── admin.ts # Firebase Admin SDK setup (for backend operations)
│ └── client.ts # Firebase Client SDK setup (for frontend operations)
├── lib/ # Utility functions and server actions
│ ├── actions/ # Next.js Server Actions
│ │ ├── auth.action.ts # Authentication related server actions
│ │ └── general.action.ts # General server actions (feedback, interviews)
│ ├── utils.ts # General utility functions (cn, icon fetching, etc.)
│ └── vapi.sdk.ts # Vapi SDK initialization
├── public/ # Static assets (images, fonts, SVGs)
├── types/ # TypeScript type definitions
│ ├── index.d.ts # Custom type definitions for the project
│ └── vapi.d.ts # Type definitions related to Vapi messages
├── .env.local # Local environment variables (Gitignored)
├── next.config.ts # Next.js configuration file
├── package.json # Project dependencies and scripts
├── README.md # Project overview and setup guide
└── tsconfig.json # TypeScript compiler configuration

## 5. Core Components Deep Dive

* **[`components/Agent.tsx`](components/Agent.tsx)**:
  * Manages the Vapi voice agent lifecycle (`callStatus`: INACTIVE, CONNECTING, ACTIVE, FINISHED).
  * Handles starting and stopping Vapi calls for both interview generation (`type="generate"`) and actual interviews (`type="interview"`).
  * Listens to Vapi events: `call-start`, `call-end`, `message` (for transcripts), `speech-start`, `speech-end`, `error`.
  * Collects transcript messages (`messages` state).
  * Triggers feedback generation (`createFeedback`) when an interview call ends.
  * Displays the AI interviewer and user avatars, and the latest transcript message.
  * Provides "Call" / "End" button functionality.

* **[`components/AuthForm.tsx`](components/AuthForm.tsx)**:
  * Handles both sign-in and sign-up logic based on the `type` prop.
  * Uses `react-hook-form` for form management and `zod` for validation ([`authFormSchema`](components/AuthForm.tsx)).
  * Interacts with Firebase client SDK for `createUserWithEmailAndPassword` and `signInWithEmailAndPassword`.
  * Calls server actions [`signIn`](lib/actions/auth.action.ts) and [`signUp`](lib/actions/auth.action.ts) to complete the authentication process (e.g., setting session cookies, saving user to DB).
  * Uses `sonner` for toast notifications.

* **[`components/DisplayTechIcons.tsx`](components/DisplayTechIcons.tsx)**:
  * Takes a `techStack` array of strings.
  * Uses the [`getTechLogos`](lib/utils.ts) utility function to fetch corresponding SVG icon URLs.
  * Renders the icons, typically for display on [`InterviewCard`](components/InterviewCard.tsx).

* **[`components/FormField.tsx`](components/FormField.tsx)**:
  * A wrapper around `react-hook-form`'s `Controller` and Shadcn's `FormItem`, `FormLabel`, `FormControl`, `FormMessage`.
  * Simplifies creating controlled input fields within forms.

* **[`components/InterviewCard.tsx`](components/InterviewCard.tsx)**:
  * Displays a summary of an interview.
  * Fetches feedback using [`getFeedbackByInterviewId`](lib/actions/general.action.ts) to show score and assessment if available.
  * Shows role, type, tech stack (using [`DisplayTechIcons`](components/DisplayTechIcons.tsx)), and creation date.
  * Links to either start the interview or view feedback.
  * Uses [`getRandomInterviewCover`](lib/utils.ts) for a decorative image.

## 6. Key Functionalities / Modules

### 6.1. Authentication

* **Sign-up**:
    1. User fills the form in [`AuthForm.tsx`](components/AuthForm.tsx) (`type="sign-up"`).
    2. Client-side: `createUserWithEmailAndPassword` (Firebase client SDK) creates the Firebase user.
    3. Server-side: [`signUp`](lib/actions/auth.action.ts) action is called with UID, name, email.
        * Checks if user already exists in Firestore.
        * Saves new user details to the `users` collection in Firestore.
* **Sign-in**:
    1. User fills the form in [`AuthForm.tsx`](components/AuthForm.tsx) (`type="sign-in"`).
    2. Client-side: `signInWithEmailAndPassword` (Firebase client SDK) authenticates the user.
    3. Client-side: `getIdToken()` retrieves the ID token.
    4. Server-side: [`signIn`](lib/actions/auth.action.ts) action is called with email and ID token.
        * Verifies user existence via `auth.getUserByEmail` (Firebase Admin SDK).
        * Calls [`setSessionCookie`](lib/actions/auth.action.ts) to create a session cookie using `auth.createSessionCookie`.
* **Session Management**:
  * [`setSessionCookie`](lib/actions/auth.action.ts): Creates an HTTP-only session cookie.
  * [`getCurrentUser`](lib/actions/auth.action.ts): Verifies the session cookie on the server and retrieves user data from Firestore.
  * [`isAuthenticated`](lib/actions/auth.action.ts): Checks if a valid session cookie exists.
  * [`signOut`](lib/actions/auth.action.ts): Clears the session cookie.
* **Layouts**:
  * [`app/(auth)/layout.tsx`](app/(auth)/layout.tsx): Redirects authenticated users away from auth pages.
  * [`app/(root)/layout.tsx`](app/(root)/layout.tsx): Redirects unauthenticated users to the sign-in page.

### 6.2. Interview Generation

* **Trigger**: User navigates to [`app/(root)/interview/page.tsx`](app/(root)/interview/page.tsx) which renders the [`Agent`](components/Agent.tsx) component with `type="generate"`.
* **Vapi Workflow**:
    1. User clicks "Call" in the [`Agent`](components/Agent.tsx) component.
    2. `vapi.start()` is called with a Vapi Workflow ID (from `NEXT_PUBLIC_VAPI_WORKFLOW_ID` env var).
    3. This workflow on the Vapi side is expected to prompt the user for interview details (role, level, tech stack, type, amount) via voice.
    4. The Vapi workflow then makes a POST request to `/api/vapi/generate`.
* **API Endpoint (`app/api/vapi/generate/route.ts`)**:
    1. Receives `type`, `role`, `level`, `techstack`, `amount`, `userid` from the Vapi workflow.
    2. Uses `generateText` from `@ai-sdk/google` (Gemini AI) to generate interview questions based on the provided parameters.
        * The prompt instructs the AI to return questions in a JSON array format and avoid special characters that might break voice assistants.
    3. Parses the generated questions.
    4. Constructs an `interview` object with all details, including a random cover image via [`getRandomInterviewCover`](lib/utils.ts).
    5. Saves the new interview document to the `interviews` collection in Firestore using `db.collection("interviews").add(interview)`.
    6. Returns a success response.
* **Outcome**: A new interview is created in Firestore, and the user is typically redirected or the UI updates to reflect the new interview.

### 6.3. Conducting an Interview (Voice Interaction)

* **Trigger**: User navigates to a specific interview page, e.g., `app/(root)/interview/[id]/page.tsx`.
* **Setup**:
    1. The page fetches interview details using [`getInterviewById`](lib/actions/general.action.ts).
    2. It renders the [`Agent`](components/Agent.tsx) component with `type="interview"` and passes the `questions` for that interview.
* **Vapi Interaction**:
    1. User clicks "Call" in the [`Agent`](components/Agent.tsx) component.
    2. `vapi.start()` is called with the [`interviewer`](constants/index.ts) assistant configuration.
        * The `interviewer` configuration includes:
            * `firstMessage`: Initial greeting.
            * `transcriber`: Deepgram for speech-to-text.
            * `voice`: 11labs for text-to-speech.
            * `model`: OpenAI GPT-4 with a system prompt that includes the `{{questions}}` placeholder. This placeholder is filled with the actual interview questions.
            * The system prompt guides the AI on how to conduct the interview, ask questions sequentially, engage naturally, and conclude professionally.
    3. The Vapi agent asks questions one by one. User responds verbally.
    4. [`Agent`](components/Agent.tsx) component listens for `message` events of type `transcript` and `final` to collect the conversation.
    5. The `isSpeaking` state in [`Agent`](components/Agent.tsx) controls a visual indicator when the AI is speaking.
* **Ending the Interview**:
    1. User clicks "End" or the interview naturally concludes.
    2. `vapi.stop()` is called.
    3. The `callStatus` in [`Agent`](components/Agent.tsx) becomes `FINISHED`.

### 6.4. Feedback System

* **Trigger**: After an interview call ends (`callStatus === CallStatus.FINISHED` in [`Agent.tsx`](components/Agent.tsx) and `type === "interview"`).
* **Process**:
    1. The `useEffect` hook in [`Agent.tsx`](components/Agent.tsx) calls `handleGenerateFeedback`.
    2. `handleGenerateFeedback` calls the [`createFeedback`](lib/actions/general.action.ts) server action.
* **[`createFeedback`](lib/actions/general.action.ts) Server Action**:
    1. Takes `interviewId`, `userId`, `transcript` (array of messages), and optional `feedbackId` (for re-generating).
    2. Formats the transcript into a single string.
    3. Uses `generateObject` from `ai` SDK with Google's Gemini model.
        * The prompt instructs the AI to act as an interviewer analyzing a mock interview, score the candidate (0-100) in predefined categories (Communication, Technical Knowledge, Problem Solving, Cultural Fit, Confidence & Clarity), and provide strengths, areas for improvement, and a final assessment.
        * The output is structured according to [`feedbackSchema`](constants/index.ts) (a Zod schema).
    4. Saves the generated feedback object to the `feedback` collection in Firestore. If `feedbackId` is provided, it updates the existing document; otherwise, it creates a new one.
    5. Returns a success status and the `feedbackId`.
* **Displaying Feedback**:
    1. User is redirected to `app/(root)/interview/[id]/feedback/page.tsx`.
    2. This page fetches the feedback using [`getFeedbackByInterviewId`](lib/actions/general.action.ts) and interview details using [`getInterviewById`](lib/actions/general.action.ts).
    3. Renders the detailed feedback, including scores, comments, strengths, and areas for improvement.

### 6.5. Data Management (Firestore)

* **Collections**:
  * `users`: Stores user profiles (name, email). UID from Firebase Auth is used as document ID.
    * Managed by: [`signUp`](lib/actions/auth.action.ts), [`getCurrentUser`](lib/actions/auth.action.ts).
  * `interviews`: Stores details of each interview (role, type, level, techstack, questions, userId, finalized status, coverImage, createdAt).
    * Managed by: [`POST /api/vapi/generate/route.ts`](app/api/vapi/generate/route.ts) (creation), [`getInterviewById`](lib/actions/general.action.ts), [`getLatestInterviews`](lib/actions/general.action.ts), [`getInterviewsByUserId`](lib/actions/general.action.ts).
  * `feedback`: Stores feedback for completed interviews (interviewId, userId, totalScore, categoryScores, strengths, areasForImprovement, finalAssessment, createdAt).
    * Managed by: [`createFeedback`](lib/actions/general.action.ts), [`getFeedbackByInterviewId`](lib/actions/general.action.ts).
* **Firebase Setup**:
  * [`firebase/client.ts`](firebase/client.ts): Initializes Firebase for client-side usage (Auth, Firestore).
  * [`firebase/admin.ts`](firebase/admin.ts): Initializes Firebase Admin SDK for server-side usage (Auth, Firestore) using service account credentials from environment variables.

## 7. API Endpoints

* **`POST /api/vapi/generate`**:
  * **Purpose**: Called by the Vapi workflow to generate interview questions and create an interview record.
  * **Request Body**: JSON object with `type`, `role`, `level`, `techstack`, `amount`, `userid`.
  * **Response**:
    * `200 OK`: `{ success: true }`
    * `500 Internal Server Error`: `{ success: false, error: ... }`
  * **Implementation**: [`app/api/vapi/generate/route.ts`](app/api/vapi/generate/route.ts)

## 8. Type Definitions

* **[`types/index.d.ts`](types/index.d.ts)**: Defines core interfaces for the application:
  * `Feedback`: Structure for interview feedback.
  * `Interview`: Structure for interview details.
  * `CreateFeedbackParams`: Parameters for the `createFeedback` action.
  * `User`: Structure for user data.
  * `InterviewCardProps`: Props for the `InterviewCard` component.
  * `AgentProps`: Props for the `Agent` component.
  * And others for various function parameters and component props.
* **[`types/vapi.d.ts`](types/vapi.d.ts)**: Defines enums and interfaces for messages received from the Vapi service, such as `MessageTypeEnum`, `MessageRoleEnum`, `TranscriptMessage`, etc.

## 9. Environment Variables

Create a `.env.local` file in the root of the project and populate it with the following:

```env
# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Vapi Web Token (for client-side Vapi SDK)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token

# Vapi Workflow ID (for interview generation workflow)
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id

# Firebase Config (for client-side Firebase SDK)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id # Optional

# Firebase Admin Credentials (for server-side Firebase Admin SDK)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY="your_firebase_admin_private_key" # Use \n for newlines or wrap in double quotes

```

## 10. Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Amartya-007/ExamiFy.git
cd ExamiFy
{data-source-line="713"}

```

### 2. Install Dependencies

```bash
npm install
# or {#or  data-source-line="718"}
# yarn install {#yarn-install  data-source-line="719"}
# or {#or-1  data-source-line="720"}
# pnpm install {#pnpm-install  data-source-line="721"}

```

### 3. Set Up Environment Variables

Copy the contents from section 9 into a `.env.local` file in the project root and fill in your actual API keys and credentials.

### 4. Run the Development Server

```bash
npm run dev
# or {#or-2  data-source-line="730"}
# yarn dev {#yarn-dev  data-source-line="731"}
# or {#or-3  data-source-line="732"}
# pnpm dev {#pnpm-dev  data-source-line="733"}
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 11. Styling

* **Tailwind CSS**: The primary styling engine. Configuration is in `tailwind.config.js` (or `tailwind.config.ts`) and base styles/utilities are in [`app/globals.css`](app/globals.css).
* **Shadcn/ui**: Used for pre-built, accessible, and customizable UI components like `Button`, `Input`, `Label`, `Form`. These are typically added via the Shadcn CLI and can be customized.
* **Custom CSS**: [`app/globals.css`](app/globals.css) contains:
  * Tailwind CSS `@import` and `@plugin` directives.
  * Custom font definitions (e.g., `Bukhari Script`).
  * Custom utility classes (e.g., `.glow-gradient`, `.glow-text`).
  * Theme variable definitions for light/dark mode and color palettes (`:root`, `.dark`).
  * Base styles for HTML elements (`@layer base`).
  * Custom component styles (`@layer components`) for things like `.btn-call`, `.card-border`, `.form`, etc.
  * Custom utility directives like `@utility dark-gradient`.
* **`clsx` and `tailwind-merge`**: Used via the [`cn`](lib/utils.ts) utility function to conditionally apply and merge Tailwind CSS classes.

## 12. State Management and Data Flow

* **Local Component State**: React's `useState` and `useEffect` are used for managing component-level state (e.g., `callStatus`, `messages` in [`Agent.tsx`](components/Agent.tsx)).
* **Forms**: `react-hook-form` is used for managing form state, validation (with `zod`), and submission (e.g., in [`AuthForm.tsx`](components/AuthForm.tsx)).
* **Server State & Mutations**:
  * Next.js Server Actions are heavily used for data fetching and mutations (e.g., [`lib/actions/auth.action.ts`](lib/actions/auth.action.ts), [`lib/actions/general.action.ts`](lib/actions/general.action.ts)). These functions run on the server and can be called directly from client components (RSC or Client Components marked with "use server").
  * Data fetching for Server Components is done by directly `await`-ing these server actions or other async functions within the component.
* **URL State**: Next.js router (`useRouter`, `redirect`, dynamic routes) is used for navigation and passing state via URL parameters (e.g., interview ID).
* **React Context**: Not extensively used for global state in the provided structure, but `FormContext` from `react-hook-form` and custom contexts like `FormFieldContext` are used internally by Shadcn's form components.

## 13. Deployment

* **Vercel**: Recommended for deploying Next.js applications. Vercel provides seamless integration with Next.js features.
* **Environment Variables**: Ensure all necessary environment variables (see section 9) are configured in the Vercel project settings.
* **Build Process**: `npm run build` creates an optimized production build. Vercel typically handles this automatically.

## 14. Roadmap

* [x] AI-generated interview question sets
* [x] Real-time voice assistant integration
* [x] User dashboard for review
* [x] Admin panel & moderation (Basic structure for data management exists, full admin panel might be more involved)
* [x] Feedback mechanism
* [ ] Export interview session to PDF
* [ ] Dark mode toggle (Currently defaults to dark theme, a toggle would allow user choice)

## 15. Contributing

Contributions are welcome! If you'd like to suggest improvements, fix bugs, or add new features:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature` or `bugfix/YourBugfix`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/YourFeature`).
6. Open a Pull Request.

Please ensure your code follows the existing style and includes tests if applicable.

## 16. License

© 2025 [Amartya Vishwakarma](https://github.com/Amartya-007)

## 17. Acknowledgements

* [Google AI SDK (`@ai-sdk/google`)](https://www.npmjs.com/package/@ai-sdk/google)
* [Vapi Voice Assistant](https://vapi.ai/)
* [Firebase](https://firebase.google.com/)
* [Next.js](https://nextjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [Shadcn/ui](https://ui.shadcn.com/)
* [Lucide Icons](https://lucide.dev/)
* [Sonner (Toasts)](https://sonner.emilkowal.ski/)
* [React Hook Form](https://react-hook-form.com/)
* [Zod (Validation)](https://zod.dev/)
* [Deepgram (Speech-to-Text)](https://deepgram.com/)
* [11 Labs (Text-to-Speech)](https://11labs.io/)
* [ESLint](https://eslint.org/)
* [Prettier](https://prettier.io/)
