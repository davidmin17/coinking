"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

export function Header({ session }: { session: Session | null }) {
  return (
    <header className="border-b border-[#30363d] bg-[#161b22]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#00c853]">
          코이킹
        </Link>
        <nav className="flex items-center gap-4">
          {session ? (
            <>
              <span className="text-gray-400 text-sm">{session.user?.name}</span>
              <Link
                href="/portfolio"
                className="text-gray-400 hover:text-white text-sm"
              >
                포트폴리오
              </Link>
              <Link
                href="/leaderboard"
                className="text-gray-400 hover:text-white text-sm"
              >
                랭킹
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-gray-400 hover:text-red-400 text-sm"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/leaderboard"
                className="text-gray-400 hover:text-white text-sm"
              >
                랭킹
              </Link>
              <Link
                href="/login"
                className="text-gray-400 hover:text-white text-sm"
              >
                로그인
              </Link>
              <Link
                href="/register"
                className="px-3 py-1 bg-[#00c853] text-black rounded text-sm font-medium hover:bg-[#00a843]"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
