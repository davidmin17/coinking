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
    const receiveAmount = orderAmount - fee; // 수수료 차감 후 수령 금액
    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const holding = await tx.holding.findUnique({
        where: { userId_market: { userId, market } },
      });

      if (!holding) {
        throw new Error("보유 중인 코인이 없습니다.");
      }

      const holdVol = Number(holding.volume);
      if (holdVol < Number(volume)) {
        throw new Error(`보유 수량(${holdVol})이 부족합니다.`);
      }

      const wallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!wallet) {
        throw new Error("지갑을 찾을 수 없습니다.");
      }

      const newVol = holdVol - Number(volume);
      const balance = Number(wallet.balance);

      await tx.wallet.update({
        where: { userId },
        data: { balance: balance + receiveAmount },
      });

      if (newVol <= 0) {
        await tx.holding.delete({
          where: { id: holding.id },
        });
      } else {
        await tx.holding.update({
          where: { id: holding.id },
          data: { volume: newVol },
        });
      }

      await tx.trade.create({
        data: {
          userId,
          market,
          side: "sell",
          price: currentPrice,
          volume: Number(volume),
          total: receiveAmount,
        },
      });

      return {
        market,
        side: "sell",
        price: currentPrice,
        volume: Number(volume),
        orderAmount,
        fee,
        total: receiveAmount,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "매도 처리 중 오류가 발생했습니다.";
    const status = message.includes("보유") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
