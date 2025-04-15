# 🎙️ ExamiFy – AI-Powered Interview Generator

**ExamiFy** is a Next.js 14 web app that generates tailored interview questions using **Google Generative AI**, stores them in **Firebase**, and integrates with **Vapi** for voice interaction. Ideal for developers prepping for interviews or practicing with AI-based question delivery.

---

## 🚀 Features

- 🔐 **User Authentication** (Firebase Auth)
- 🤖 **AI-Generated Interview Questions** (Gemini API via Google Generative AI)
- 🧠 **Behavioral, Technical & Mixed Question Sets**
- 🎤 **Voice Assistant Integration** with Vapi
- ☁️ **Firestore Database** for storing user data & generated interviews
- 🌐 **Next.js App Router + Server Actions**

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Backend**: Firebase (Auth + Firestore)
- **AI Integration**: `@ai-sdk/google` (Gemini models)
- **Voice AI**: Vapi
- **Styling**: Tailwind CSS

---

## 📦 Installation

```bash
# Clone the project
git clone https://github.com/your-username/examify.git
cd examify

# Install dependencies
npm install

# Create .env.local and add your credentials
cp .env.example .env.local
```

---

## 🔐 Environment Variables

Make sure to add these to your `.env.local` file:

```env
# .env.local

# Google Generative AI API Key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# VAPI Token (for VAPI Web integration)
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Firebase Service Account (for backend usage, not on the frontend)
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

```

---

## 🧑‍💻 Development

```bash
# Run the development server
npm run dev
```

App will be running at: [http://localhost:3000](http://localhost:3000)

---

## ✅ TODO / Coming Soon

- ✅ User dashboard for reviewing previous interviews
- ✅ Real-time voice interaction with Vapi
- [ ] Export to PDF & share links
- ✅ Admin panel to moderate content
- ✅ User feedback system for improving question quality

## 🙌 Credits

Built with ❤️ by Amartya Vishwakarma  
Powered by Google Gemini, Firebase & Vapi
