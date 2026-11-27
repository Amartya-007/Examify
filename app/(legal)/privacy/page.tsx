import LegalDoc, { Fill } from "@/components/marketing/LegalDoc";
export const metadata = { title: "Privacy policy" };
export default function Page() {
  return (
    <LegalDoc title="Privacy policy" updated="27 November 2026">
      <p>
        This policy explains what Examify (<Fill>legal business name</Fill>) collects and why.
      </p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email, profile photo, target role and stack.</li>
        <li>Interview data: questions, the transcript of your answers, scores and feedback.</li>
        <li>Billing data: purchases, credit balance and history. Card and UPI details are handled by Razorpay; we don&apos;t store them.</li>
        <li>Basic usage and device information to keep the service working.</li>
      </ul>
      <h2>Audio and camera</h2>
      <p>During an interview your voice is streamed to our voice provider to run the conversation and produce a transcript. Your camera preview stays on your device and is never uploaded.</p>
      <h2>How we use it</h2>
      <ul>
        <li>To run interviews, score them and show your history.</li>
        <li>To process payments and prevent fraud.</li>
        <li>To support you and improve the service.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>
        Service providers that run Examify on our behalf: <Fill>list, e.g. Google Firebase (hosting, auth, database), Vapi (voice), Google Gemini (AI), Razorpay (payments), Vercel (hosting)</Fill>. We don&apos;t sell personal data.
      </p>
      <h2>Your choices</h2>
      <p>You can edit your profile, download receipts, and delete your account from Settings, which removes your interviews and reports.</p>
      <h2>Contact</h2>
      <p>
        Privacy questions: <Fill>privacy email</Fill>. Grievance officer: <Fill>name and email</Fill>.
      </p>
    </LegalDoc>
  );
}
