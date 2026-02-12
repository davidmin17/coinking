import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { PortfolioContent } from "@/components/PortfolioContent";

export default async function PortfolioPage() {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/portfolio");

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header session={session} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">내 포트폴리오</h2>
        <PortfolioContent />
      </main>
    </div>
  );
}
