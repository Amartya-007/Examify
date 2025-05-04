# 🎙️ ExamiFy – AI-Powered Interview Assistant

**ExamiFy** is a cutting-edge, AI-driven web application built with Next.js 14 that helps users prepare for technical and behavioral interviews. Leveraging **Google's Gemini AI**, **Firebase**, and **Vapi** voice technology, ExamiFy delivers a highly personalized, interactive mock interview experience—directly in the browser.

---

## 🚀 Features

- 🔐 **Secure Authentication** – Seamless login/signup using Firebase Auth.
- 🤖 **AI-Generated Interview Questions** – Powered by Google's Gemini models via `@ai-sdk/google`.
- 🧠 **Dynamic Question Sets** – Generate technical, behavioral, or mixed question sets tailored to your needs.
- 🎤 **Voice-Based Interaction** – Real-time voice assistant built with Vapi.
- ☁️ **Persistent Storage** – Store question history, user data, and feedback via Firestore.
- 📊 **Admin Panel** – Moderate content and manage interview data.
- 💬 **User Feedback System** – Improve question quality with active feedback collection.
- 📈 **Roadmap Ready** – Export to PDF and dark mode toggle coming soon.

---

## 🛠️ Tech Stack

| Layer          | Tech                                |
|----------------|-------------------------------------|
| **Frontend**   | Next.js 14, Tailwind CSS            |
| **AI Engine**  | Google Gemini API (`@ai-sdk/google`)|
| **Backend**    | Firebase Auth + Firestore           |
| **Voice AI**   | Vapi                                 |
| **Deployment** | Vercel (recommended)                |

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Amartya-007/ExamiFy.git
cd ExamiFy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root and populate it with:

```env
# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Vapi Web Token
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token

# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Firebase Admin Credentials (Backend Only)
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

### 4. Run the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to explore the app.

---

## 📁 Project Structure Overview

``` plaintext
app/               → App Router structure (auth, root, API routes)
components/        → UI components and core logic
firebase/          → Firebase client & admin setup
lib/               → Server actions and utility functions
public/            → Static assets (SVGs, images, icons)
types/             → TypeScript type definitions
```

---

## ✅ Roadmap

- [x] AI-generated interview question sets
- [x] Real-time voice assistant integration
- [x] User dashboard for review
- [x] Admin panel & moderation
- [x] Feedback mechanism
- [ ] Export interview session to PDF
- [ ] Dark mode toggle

---

## 🤝 Contributing

Contributions are welcome! If you'd like to suggest improvements, feel free to open an issue or submit a PR.

---

## 📄 License

© 2025 [Amartya Vishwakarma](https://github.com/Amartya-007)

---

## 🙌 Acknowledgements

- [Google AI SDK](https://www.npmjs.com/package/@ai-sdk/google)
- [Vapi Voice Assistant](https://vapi.ai/)
- [Firebase](https://firebase.google.com/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
