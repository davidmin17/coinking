import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPBIT_TICKER_URL = "https://api.upbit.com/v1/ticker";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const [wallet, holdings] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId: session.user.id },
      }),
      prisma.holding.findMany({
        where: { userId: session.user.id },
      }),
    ]);

    if (!wallet) {
      return NextResponse.json(
        { error: "지갑을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const balance = Number(wallet.balance);
    let coinValue = 0;

    if (holdings.length > 0) {
      const markets = holdings.map((h) => h.market).join(",");
      const tickerRes = await fetch(`${UPBIT_TICKER_URL}?markets=${markets}`);
      const tickers = await tickerRes.json();
      const priceMap = new Map(tickers.map((t: { market: string; trade_price: number }) => [t.market, t.trade_price]));

      for (const h of holdings) {
        const price = Number(priceMap.get(h.market) ?? 0);
        coinValue += Number(h.volume) * price;
      }
    }

    const totalAsset = balance + coinValue;
    const profitRate = ((totalAsset - 1_000_000) / 1_000_000) * 100;

    const holdingsWithPrice = await Promise.all(
      holdings.map(async (h) => {
        const tickerRes = await fetch(`${UPBIT_TICKER_URL}?markets=${h.market}`);
        const tickers = await tickerRes.json();
        const price = tickers[0]?.trade_price ?? 0;
        const value = Number(h.volume) * price;
        return {
          market: h.market,
          volume: Number(h.volume),
          avgPrice: Number(h.avgPrice),
          currentPrice: price,
          value,
        };
      })
    );

    return NextResponse.json({
      balance,
      coinValue,
      totalAsset,
      profitRate,
      holdings: holdingsWithPrice,
    });
  } catch (error) {
    console.error("Portfolio error:", error);
    return NextResponse.json(
      { error: "포트폴리오 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
