import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CoinList } from "@/components/CoinList";
import { Header } from "@/components/Header";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Header session={session} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-white mb-4">원화 마켓</h2>
        <CoinList session={session} />
      </main>
    </div>
  );
}
