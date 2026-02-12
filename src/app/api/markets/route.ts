import { NextResponse } from "next/server";

const UPBIT_MARKETS_URL = "https://api.upbit.com/v1/market/all?isDetails=false";

export async function GET() {
  try {
    const res = await fetch(UPBIT_MARKETS_URL);
    const data = await res.json();

    const krwMarkets = data
      .filter((m: { market: string }) => m.market.startsWith("KRW-"))
      .map((m: { market: string; korean_name: string; english_name: string }) => ({
        market: m.market,
        koreanName: m.korean_name,
        englishName: m.english_name,
      }));

    return NextResponse.json(krwMarkets);
  } catch (error) {
    console.error("Markets fetch error:", error);
    return NextResponse.json(
      { error: "마켓 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}
