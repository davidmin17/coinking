# Web 기반 모의 코인 투자 대회 게임 개발 계획서

## 1. 프로젝트 개요

Next.js + Vercel + Neon(PostgreSQL) 기반으로 Upbit Open API 시세를
활용한 웹 기반 모의 코인 투자 대회 게임을 개발한다.

-   가입 시 가상머니 1,000,000원 지급
-   실시간 시세 기반 가상 매매
-   유저별 순수익 랭킹 시스템 제공
-   업비트 유사 UI

------------------------------------------------------------------------

# 2. 기술 스택

## Frontend

-   Next.js (App Router)
-   TypeScript
-   TailwindCSS
-   React Query or SWR

## Backend

-   Next.js Route Handlers
-   Prisma ORM
-   Neon PostgreSQL

## Infra

-   Vercel Hosting
-   Upbit Open API (REST + WebSocket)

------------------------------------------------------------------------

# 3. 전체 시스템 구조

User ↓ Next.js (Vercel) ↓ API Routes ↓ Neon PostgreSQL ↓ Upbit Open API

------------------------------------------------------------------------

# 4. DB 설계

## users

-   id (UUID)
-   email
-   password (bcrypt 해시)
-   nickname
-   created_at

## wallets

-   id
-   user_id
-   balance (default: 1_000_000)

## holdings

-   id
-   user_id
-   market (KRW-BTC)
-   volume
-   avg_price

## trades

-   id
-   user_id
-   market
-   side (buy/sell)
-   price
-   volume
-   total
-   created_at

## daily_snapshots (선택)

-   user_id
-   total_asset_value
-   recorded_at

------------------------------------------------------------------------

# 5. 핵심 로직

## 5.1 매수 로직

1.  현재가 조회 (Upbit API)
2.  잔액 확인
3.  balance 차감
4.  holdings 평균단가 재계산
5.  trades 기록
6.  Transaction commit

## 5.2 매도 로직

1.  보유 수량 확인
2.  holdings 감소
3.  balance 증가
4.  trades 기록
5.  Transaction commit

------------------------------------------------------------------------

# 6. 자산 계산 공식

총자산 = 현금 + (각 코인 보유량 × 현재가)

순수익률 = (총자산 - 1,000,000) / 1,000,000 × 100

수수료 = 매수·매도 각 1% (매수 시 결제금액 = 주문금액 × 1.01, 매도 시 수령금액 = 주문금액 × 0.99)

------------------------------------------------------------------------

# 7. API 설계

GET /api/markets\
GET /api/ticker\
POST /api/trade/buy\
POST /api/trade/sell\
GET /api/portfolio\
GET /api/leaderboard

------------------------------------------------------------------------

# 8. 개발 단계

## PHASE 1 - MVP

-   프로젝트 세팅
-   Auth 구현
-   DB 설계 및 마이그레이션
-   코인 리스트 표시
-   매수 기능 구현

## PHASE 2

-   매도 기능
-   포트폴리오 계산
-   수익률 계산
-   랭킹 시스템

## PHASE 3

-   WebSocket 실시간화
-   캐시 전략 도입
-   성능 개선

------------------------------------------------------------------------

# 9. 성능 전략

초기: - 3\~5초 polling 방식

확장: - WebSocket 전환 - Materialized View - Redis 캐싱

------------------------------------------------------------------------

# 10. 확장 아이디어

-   시즌제 대회
-   수수료 시스템
-   레버리지 기능
-   AI 코인 추천 시스템

------------------------------------------------------------------------

# 11. 향후 개선 포인트

-   실시간 체결 순서 시뮬레이션
-   대규모 트래픽 대응 아키텍처
-   배치 기반 랭킹 업데이트 시스템

------------------------------------------------------------------------

# 12. 개발 시 확정/질의 사항

## 확정 사항

-   **Upbit API**: 시세 조회(REST)는 인증 불필요. GET 요청만으로 호출 가능.
-   **users ↔ wallets**: 1:1 관계. 회원가입 시 wallet 자동 생성 (balance: 1,000,000).
-   **holdings**: (user_id, market) 조합으로 유니크. 동일 코인 추가 매수 시 volume 누적, avg_price 재계산.
-   **Auth**: NextAuth.js v5 + Credentials Provider (이메일 + 비밀번호). 닉네임은 회원가입 시 입력.
-   **Prisma**: v6 사용 (v7은 adapter/accelerate 필수).
-   **users 테이블**: password 필드 추가 (bcrypt 해시 저장).

## API 상세 파라미터

| API | Method | 파라미터 | 설명 |
|-----|--------|----------|------|
| /api/markets | GET | - | Upbit KRW 마켓 목록 (market, korean_name, english_name) |
| /api/ticker | GET | markets | 현재가 (market 쿼리로 복수 지정 가능) |
| /api/trade/buy | POST | market, volume | 매수 (body) |
| /api/trade/sell | POST | market, volume | 매도 (body) |
| /api/portfolio | GET | - | 내 잔고, 보유코인, 총자산 (인증 필요) |
| /api/leaderboard | GET | limit? | 랭킹 (순수익·수익률 모두 표시, 기본 10명) |

## 확정 사항 (추가)

-   **인증**: 소셜 로그인 미적용 (Credentials만 사용).
-   **랭킹**: 순수익(원) + 수익률(%) 둘 다 표시.
-   **수수료**: 매수·매도 모두 1% 적용.
