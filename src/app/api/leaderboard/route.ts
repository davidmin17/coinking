import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UPBIT_TICKER_URL = "https://api.upbit.com/v1/ticker";
const INITIAL_BALANCE = 1_000_000;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 100);

    const usersWithWallet = await prisma.user.findMany({
      where: { wallet: { isNot: null } },
      include: {
        wallet: true,
        holdings: true,
      },
    });

    const allMarkets = [
      ...new Set(usersWithWallet.flatMap((u) => u.holdings.map((h) => h.market))),
    ];

    let priceMap = new Map<string, number>();
    if (allMarkets.length > 0) {
      const marketsStr = allMarkets.join(",");
      const tickerRes = await fetch(`${UPBIT_TICKER_URL}?markets=${marketsStr}`);
      const tickers = await tickerRes.json();
      priceMap = new Map(
        tickers.map((t: { market: string; trade_price: number }) => [
          t.market,
          t.trade_price,
        ])
      );
    }

    const ranking = usersWithWallet.map((u) => {
      const balance = Number(u.wallet!.balance);
      let coinValue = 0;
      for (const h of u.holdings) {
        const price = priceMap.get(h.market) ?? 0;
        coinValue += Number(h.volume) * price;
      }
      const totalAsset = balance + coinValue;
      const netProfit = totalAsset - INITIAL_BALANCE;
      const profitRate = (netProfit / INITIAL_BALANCE) * 100;
      return {
        userId: u.id,
        nickname: u.nickname,
        totalAsset,
        netProfit,
        profitRate,
      };
    });

    ranking.sort((a, b) => b.netProfit - a.netProfit);

    return NextResponse.json({
      ranking: ranking.slice(0, limit).map((r, i) => ({
        rank: i + 1,
        ...r,
      })),
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "랭킹 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
