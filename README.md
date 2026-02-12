# CoinKing - 모의 코인 투자 대회

업비트 Open API 시세를 활용한 웹 기반 모의 코인 투자 게임

## 기술 스택

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, SWR
- **Backend**: Next.js Route Handlers, Prisma ORM, PostgreSQL (Neon)
- **Auth**: NextAuth.js v5 (Credentials)
- **Hosting**: Vercel

## 시작하기

### 1. 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 편집하여 다음 값을 설정하세요:

- `DATABASE_URL`: Neon PostgreSQL 연결 문자열
- `AUTH_SECRET`: NextAuth용 시크릿 (32자 이상)
- `AUTH_URL`: 앱 URL (개발: `http://localhost:3000`)

### 2. 데이터베이스 마이그레이션

**중요**: `DATABASE_URL`에 실제 PostgreSQL 연결 문자열이 설정되어 있어야 합니다.  
(예: Neon에서 발급한 `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

```bash
npx prisma migrate dev
```

또는 프로덕션/기존 DB에 마이그레이션만 적용:

```bash
npx prisma migrate deploy
```

스키마만 반영(마이그레이션 없이)하려면:

```bash
npx prisma db push
```

> **오류가 발생한다면**: `The table public.User does not exist` → DB에 테이블이 없습니다. 위 마이그레이션 명령을 실행하세요. `Can't reach database server` → `DATABASE_URL`의 host/user/password/database가 실제 값인지 확인하세요.

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

### 4. Neon PostgreSQL 설정 (선택)

1. [Neon](https://neon.tech) 에서 무료 프로젝트 생성
2. Connection string 복사 후 `DATABASE_URL`에 설정

## 주요 기능

- **회원가입/로그인**: 이메일 + 비밀번호 (가입 시 100만원 지급)
- **원화 마켓**: Upbit KRW 마켓 목록 (20개, 3초 폴링)
- **매수/매도**: 수수료 0.1% 적용 (매수 시 결제금액 +0.1%, 매도 시 수령금액 -0.1%)
- **포트폴리오**: 보유 현금, 총자산, 수익률, 보유 코인 + 매도
- **랭킹**: 순수익·수익률 둘 다 표시 (5초 폴링)

## API

| Method | Path | 설명 |
|--------|------|------|
| GET | /api/markets | KRW 마켓 목록 |
| GET | /api/ticker?markets=KRW-BTC | 현재가 조회 |
| POST | /api/trade/buy | 매수 (market, volume) |
| POST | /api/trade/sell | 매도 (market, volume) |
| GET | /api/portfolio | 포트폴리오 (인증 필요) |
| GET | /api/leaderboard | 랭킹 (순수익·수익률) |

## Vercel 배포

Vercel에 배포한 뒤 **반드시** 해야 할 것:

### 1. 환경 변수 설정 (Vercel 대시보드)

프로젝트 → Settings → Environment Variables에서 추가:

| 변수 | 값 | 설명 |
|------|---|------|
| `DATABASE_URL` | Neon 연결 문자열 | 로컬과 **동일한 DB** 사용 시 같은 값 |
| `AUTH_SECRET` | 32자 이상 랜덤 문자열 | `openssl rand -base64 32` 로 생성 |
| `AUTH_URL` | `https://your-app.vercel.app` | 배포된 도메인 URL |

### 2. DB 테이블 생성

- **로컬과 같은 Neon DB**를 쓰는 경우: 이미 `prisma db push` 했으면 **추가 작업 없음**
- **별도 프로덕션 DB**를 쓰는 경우: 해당 `DATABASE_URL`로 `npx prisma migrate deploy` 실행

### 3. Neon 연결 (Vercel용)

Neon 대시보드에서 **Pooled connection** 문자열 사용 권장 (서버리스에 적합).

---

## Phase 2 예정

- WebSocket 실시간 시세
