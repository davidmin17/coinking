"use client";

import useSWR from "swr";
import { useState } from "react";
import type { Session } from "next-auth";
import { BuyModal } from "./BuyModal";

type Market = {
  market: string;
  koreanName: string;
  englishName: string;
};

type Ticker = {
  market: string;
  trade_price: number;
  signed_change_rate: number;
  acc_trade_price_24h: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function CoinList({ session }: { session: Session | null }) {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const { data: markets = [] } = useSWR<Market[]>("/api/markets", fetcher, {
    refreshInterval: 60000,
  });

  const marketCodes = markets.slice(0, 20).map((m) => m.market).join(",");
  const { data: tickers = [] } = useSWR<Ticker[]>(
    marketCodes ? `/api/ticker?markets=${marketCodes}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const tickerMap = new Map(tickers.map((t) => [t.market, t]));

  function formatPrice(n: number) {
    return n >= 1000 ? n.toLocaleString() : n.toFixed(2);
  }

  function formatChange(rate: number) {
    const p = (rate * 100).toFixed(2);
    return rate >= 0 ? `+${p}%` : `${p}%`;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-[#30363d]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#30363d] bg-[#161b22]">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">한글명</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">현재가</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">전일대비</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">거래대금</th>
              <th className="py-3 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {markets.slice(0, 20).map((m) => {
              const ticker = tickerMap.get(m.market);
              const changeRate = ticker?.signed_change_rate ?? 0;
              const isUp = changeRate > 0;
              const isDown = changeRate < 0;
              return (
                <tr
                  key={m.market}
                  className="border-b border-[#30363d] hover:bg-[#161b22]/50"
                >
                  <td className="py-3 px-4">
                    <span className="text-white font-medium">{m.koreanName}</span>
                    <span className="text-gray-500 ml-1">{m.market}</span>
                  </td>
                  <td className="py-3 px-4 text-white">
                    {ticker ? formatPrice(ticker.trade_price) : "-"}
                  </td>
                  <td
                    className={`py-3 px-4 ${
                      isUp ? "text-red-500" : isDown ? "text-blue-500" : "text-gray-400"
                    }`}
                  >
                    {ticker ? formatChange(changeRate) : "-"}
                  </td>
                  <td className="py-3 px-4 text-gray-400">
                    {ticker
                      ? `${(ticker.acc_trade_price_24h / 1_000_000).toFixed(0)}백만`
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedMarket(m)}
                      className="px-3 py-1 bg-[#00c853] hover:bg-[#00a843] text-black rounded text-xs font-medium disabled:opacity-50"
                    >
                      매수
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedMarket && (
        <BuyModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
          isLoggedIn={!!session}
        />
      )}
    </>
  );
}
