import { Header } from "@/components/Header";
import { auth } from "@/lib/auth";
import { LeaderboardContent } from "@/components/LeaderboardContent";

export default async function LeaderboardPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header session={session} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">랭킹</h2>
        <LeaderboardContent />
      </main>
    </div>
  );
}
