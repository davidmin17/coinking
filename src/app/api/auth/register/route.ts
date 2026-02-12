import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const INITIAL_BALANCE = 1_000_000;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nickname } = body;

    if (!email || !password || !nickname) {
      return NextResponse.json(
        { error: "이메일, 비밀번호, 닉네임을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          nickname,
        },
      });
      await tx.wallet.create({
        data: {
          userId: newUser.id,
          balance: INITIAL_BALANCE,
        },
      });
      return newUser;
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
