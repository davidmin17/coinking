"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#00c853]">코이킹</h1>
          <p className="text-gray-400 mt-1">모의 코인 투자 대회</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-[#161b22] rounded-lg border border-[#30363d] p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">로그인</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#00c853]"
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#00c853]"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-2 bg-[#00c853] hover:bg-[#00a843] text-black font-semibold rounded disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <p className="mt-4 text-center text-gray-400 text-sm">
            계정이 없으신가요?{" "}
            <Link href="/register" className="text-[#00c853] hover:underline">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-gray-400">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}
