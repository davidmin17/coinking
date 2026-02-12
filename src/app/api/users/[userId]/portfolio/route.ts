import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const UPBIT_TICKER_URL = "https://api.upbit.com/v1/ticker";
const INITIAL_BALANCE = 1_000_000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: true,
        holdings: true,
      },
    });

    if (!user || !user.wallet) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const balance = Number(user.wallet.balance);
    let coinValue = 0;

    if (user.holdings.length > 0) {
      const markets = user.holdings.map((h) => h.market).join(",");
      const tickerRes = await fetch(`${UPBIT_TICKER_URL}?markets=${markets}`);
      const tickers = await tickerRes.json();
      const priceMap = new Map(
        tickers.map((t: { market: string; trade_price: number }) => [
          t.market,
          t.trade_price,
        ])
      );

      for (const h of user.holdings) {
        const price = Number(priceMap.get(h.market) ?? 0);
        coinValue += Number(h.volume) * price;
      }
    }

    const totalAsset = balance + coinValue;
    const profitRate = ((totalAsset - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;

    const holdingsWithPrice = await Promise.all(
      user.holdings.map(async (h) => {
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
      nickname: user.nickname,
      balance,
      coinValue,
      totalAsset,
      profitRate,
      holdings: holdingsWithPrice,
    });
  } catch (error) {
    console.error("User portfolio error:", error);
    return NextResponse.json(
      { error: "포트폴리오 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
