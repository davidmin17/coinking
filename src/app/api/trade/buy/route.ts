import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const UPBIT_TICKER_URL = "https://api.upbit.com/v1/ticker";
const FEE_RATE = 0.01; // 1%

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { market, volume } = body;

    if (!market || !volume || volume <= 0) {
      return NextResponse.json(
        { error: "market과 volume(수량)을 올바르게 입력해주세요." },
        { status: 400 }
      );
    }

    const tickerRes = await fetch(`${UPBIT_TICKER_URL}?markets=${market}`);
    const tickerData = await tickerRes.json();
    const currentPrice = tickerData[0]?.trade_price;

    if (!currentPrice) {
      return NextResponse.json(
        { error: "현재가를 조회할 수 없습니다." },
        { status: 400 }
      );
    }

    const orderAmount = Number(volume) * currentPrice;
    const fee = orderAmount * FEE_RATE;
    const totalAmount = orderAmount + fee; // 수수료 포함 결제 금액
    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("지갑을 찾을 수 없습니다.");
      }

      const balance = Number(wallet.balance);
      if (balance < totalAmount) {
        throw new Error("잔액이 부족합니다.");
      }

      await tx.wallet.update({
        where: { userId },
        data: { balance: balance - totalAmount },
      });

      const existing = await tx.holding.findUnique({
        where: {
          userId_market: { userId, market },
        },
      });

      const vol = Number(volume);

      if (existing) {
        const prevTotal = Number(existing.avgPrice) * Number(existing.volume);
        const newVol = Number(existing.volume) + vol;
        const newAvg = (prevTotal + orderAmount) / newVol;
        await tx.holding.update({
          where: { id: existing.id },
          data: { volume: newVol, avgPrice: newAvg },
        });
      } else {
        await tx.holding.create({
          data: {
            userId,
            market,
            volume: vol,
            avgPrice: currentPrice,
          },
        });
      }

      await tx.trade.create({
        data: {
          userId,
          market,
          side: "buy",
          price: currentPrice,
          volume: vol,
          total: totalAmount, // 주문금액 + 수수료
        },
      });

      return {
        market,
        side: "buy",
        price: currentPrice,
        volume: vol,
        orderAmount,
        fee,
        total: totalAmount,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "매수 처리 중 오류가 발생했습니다.";
    const status = message.includes("잔액") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
