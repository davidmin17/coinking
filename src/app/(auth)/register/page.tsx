"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, nickname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }
      router.push("/login?registered=true");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-gray-400">
        이동 중...
      </div>
    );
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
          <h2 className="text-lg font-semibold text-white mb-4">회원가입</h2>
          <p className="text-sm text-gray-400 mb-4">
            가입 시 가상머니 1,000,000원이 지급됩니다.
          </p>
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
              <label className="block text-sm text-gray-400 mb-1">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#00c853]"
                placeholder="닉네임"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#00c853]"
                placeholder="6자 이상"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full py-2 bg-[#00c853] hover:bg-[#00a843] text-black font-semibold rounded disabled:opacity-50"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
          <p className="mt-4 text-center text-gray-400 text-sm">
            이미 계정이 있으신가요?{" "}
            <Link href="/login" className="text-[#00c853] hover:underline">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
