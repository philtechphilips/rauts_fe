"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RautsLogo } from "@/components/common/Logo";
import { useAuthStore } from "@/store/authStore";
import { SESSION_EXPIRED_EVENT } from "@/lib/api";

export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");
  const isAuthPage = pathname?.startsWith("/auth");
  const isDocsPage = pathname?.startsWith("/docs");
  const hideGlobalHeader = isDashboard || isAuthPage || isDocsPage;

  const { isLoggedIn, user, logout } = useAuthStore();
  const [sessionExpiredToast, setSessionExpiredToast] = useState(false);

  useEffect(() => {
    if (isLoggedIn && !user && !pathname.startsWith("/auth")) {
      logout();
    }
  }, [isLoggedIn, user, logout, pathname]);

  useEffect(() => {
    const onExpired = () => {
      setSessionExpiredToast(true);
      window.setTimeout(() => setSessionExpiredToast(false), 3000);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  return (
    <>
      {sessionExpiredToast && (
        <div
          className="fixed top-4 right-4 z-200 rounded-lg border px-4 py-2 text-[12px] font-medium shadow-xl"
          style={{
            background: "#2A2A2A",
            borderColor: "#FCA130",
            color: "rgba(255,255,255,0.88)",
          }}
        >
          Session expired. Please log in again.
        </div>
      )}
      {!hideGlobalHeader && (
        <header className="fixed top-0 left-0 w-full z-[100] border-b border-white/[0.06] bg-transparent backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-[#1A1A1A]/15">
          <div className="relative mx-auto flex max-w-[1440px] min-h-14 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 sm:py-0">
            <Link
              href="/"
              className="relative z-[2] flex shrink-0 items-center gap-2.5"
            >
              <RautsLogo className="w-6 h-6" />
              <span
                className="text-[14px] font-semibold tracking-tight"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                Rauts
              </span>
            </Link>

            <nav className="pointer-events-none absolute left-1/2 top-1/2 z-[1] hidden max-w-[calc(100vw-10rem)] -translate-x-1/2 -translate-y-1/2 sm:flex sm:items-center sm:justify-center sm:gap-0.5 sm:overflow-x-auto sm:overscroll-x-contain sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="pointer-events-auto flex items-center justify-center gap-0.5">
                {(
                  [
                    ["#problem", "Problem"],
                    ["#demo", "Demo"],
                    ["#workflow", "Workflow"],
                    ["#features", "Features"],
                    ["#roadmap", "Roadmap"],
                    ["/cli-docs", "Docs"],
                  ] as const
                ).map(([href, label]) => (
                  <Link
                    key={href}
                    href={href}
                    className="shrink-0 rounded px-2 py-1.5 text-[12px] font-medium transition-colors hover:bg-white/8 sm:px-2.5"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </nav>

            {isLoggedIn ? (
              <div className="relative z-[2] ml-auto flex shrink-0 items-center">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 rounded px-4 py-1.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#d4e820]"
                  style={{ background: "#CFFE26" }}
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="relative z-[2] ml-auto flex shrink-0 items-center gap-2">
                <Link
                  href="/auth/login"
                  className="rounded px-3 py-1.5 text-[13px] font-medium transition-colors hover:bg-white/8"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1.5 rounded px-4 py-1.5 text-[13px] font-semibold text-black transition-colors hover:bg-[#d4e820]"
                  style={{ background: "#CFFE26" }}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </header>
      )}
      <main
        className={
          !hideGlobalHeader
            ? "min-h-0 h-full overflow-y-auto pt-[4.5rem] sm:pt-14"
            : "min-h-0 h-full"
        }
      >
        {children}
      </main>
    </>
  );
}
