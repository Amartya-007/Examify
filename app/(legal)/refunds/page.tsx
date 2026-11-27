import LegalDoc, { Fill } from "@/components/marketing/LegalDoc";
export const metadata = { title: "Refunds and cancellations" };
export default function Page() {
  return (
    <LegalDoc title="Refunds and cancellations" updated="27 November 2026">
      <h2>Cancelling Pro</h2>
      <p>Cancel any time from Billing. Pro stays active until the end of the period you&apos;ve paid for and won&apos;t renew. Credits already added stay in your account.</p>
      <h2>Credit packs</h2>
      <p>
        Unused pack credits can be refunded within <Fill>7</Fill> days of purchase. Packs where credits have been used aren&apos;t refundable.
      </p>
      <h2>Failed or interrupted interviews</h2>
      <p>If an interview can&apos;t connect or ends before you answer a question, its credits are returned to your balance automatically.</p>
      <h2>Payment problems</h2>
      <p>
        If money left your account but credits didn&apos;t arrive within 30 minutes, contact us with the Razorpay payment ID. Approved refunds reach your original payment method in <Fill>5 to 7</Fill> working days.
      </p>
      <h2>How to ask</h2>
      <p>
        Email <Fill>support email</Fill> with your account email and payment ID.
      </p>
    </LegalDoc>
  );
}
