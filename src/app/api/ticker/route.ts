import { NextRequest, NextResponse } from "next/server";

const UPBIT_TICKER_URL = "https://api.upbit.com/v1/ticker";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const markets = searchParams.get("markets");

    if (!markets) {
      return NextResponse.json(
        { error: "markets 쿼리 파라미터가 필요합니다. (쉼표로 구분, 예: KRW-BTC,KRW-ETH)" },
        { status: 400 }
      );
    }

    const url = `${UPBIT_TICKER_URL}?markets=${encodeURIComponent(markets)}`;
    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Ticker fetch error:", error);
    return NextResponse.json(
      { error: "시세 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}
