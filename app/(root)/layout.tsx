import Link from "next/link";
import { ReactNode } from "react";
import { Grand_Hotel } from "next/font/google";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const grandHotel = Grand_Hotel({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();

  if (!isUserAuthenticated) {
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <nav className="flex items-center gap-2 py-4 overflow-visible">
        <Link href="/" className="flex items-center gap-4">
          {/* Animated SVG Icon with shared gradient */}
          <svg
            width="50"
            height="50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#glowGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <defs>
              <linearGradient
                id="glowGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#00f6ff">
                  <animate
                    attributeName="stop-color"
                    values="#00f6ff;#8a2be2;#ff0080;#00f6ff"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="#ff0080">
                  <animate
                    attributeName="stop-color"
                    values="#ff0080;#00f6ff;#8a2be2;#ff0080"
                    dur="8s"
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>
            </defs>
            <g stroke="url(#glowGradient)">
              <path d="M12 5a3 3 0 1 0-5.997.125A4 4 0 0 0 3.477 10.896a4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
              <path d="M12 5a3 3 0 1 1 5.997.125A4 4 0 0 1 20.523 10.896a4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
              <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
              <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
              <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
              <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
              <path d="M6 18a4 4 0 0 1-1.967-.516" />
              <path d="M19.967 17.484A4 4 0 0 1 18 18" />
            </g>
          </svg>

          {/* Animated Brand Text */}
          <h2
            className={`glow-gradient glow-text text-5xl leading-[4rem] ${grandHotel.className}`}
          >
            ExamiFy
          </h2>
        </Link>
      </nav>

      {children}
    </div>
  );
};

export default RootLayout;
