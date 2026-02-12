"use client";

import { useState } from "react";
import useSWR from "swr";
import { SellModal } from "./SellModal";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function PortfolioContent() {
  const [sellTarget, setSellTarget] = useState<{
    market: string;
    volume: number;
  } | null>(null);
  const { data, error, isLoading, mutate } = useSWR("/api/portfolio", fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="text-gray-400">로딩 중...</div>;
  if (error || !data) return <div className="text-red-400">조회 실패</div>;

  const profitColor =
    data.profitRate > 0 ? "text-red-500" : data.profitRate < 0 ? "text-blue-500" : "text-gray-400";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-gray-400 text-sm">보유 현금</p>
          <p className="text-white text-xl font-semibold">
            {data.balance.toLocaleString()}원
          </p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-gray-400 text-sm">총 자산</p>
          <p className="text-white text-xl font-semibold">
            {data.totalAsset.toLocaleString()}원
          </p>
        </div>
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <p className="text-gray-400 text-sm">수익률</p>
          <p className={`text-xl font-semibold ${profitColor}`}>
            {data.profitRate >= 0 ? "+" : ""}
            {data.profitRate.toFixed(2)}%
          </p>
        </div>
      </div>

      {data.holdings?.length > 0 ? (
        <div>
          <h3 className="text-white font-medium mb-2">보유 코인</h3>
          <div className="overflow-x-auto rounded-lg border border-[#30363d]">
            <table className="w-full text-sm">
              <thead>
              <tr className="border-b border-[#30363d] bg-[#161b22]">
                <th className="text-left py-3 px-4 text-gray-400">종목</th>
                <th className="text-right py-3 px-4 text-gray-400">보유수량</th>
                <th className="text-right py-3 px-4 text-gray-400">평균단가</th>
                <th className="text-right py-3 px-4 text-gray-400">현재가</th>
                <th className="text-right py-3 px-4 text-gray-400">평가금액</th>
                <th className="py-3 px-4"></th>
              </tr>
              </thead>
              <tbody>
                {data.holdings.map((h: { market: string; volume: number; avgPrice: number; currentPrice: number; value: number }) => (
                  <tr key={h.market} className="border-b border-[#30363d]">
                    <td className="py-3 px-4 text-white">{h.market}</td>
                    <td className="py-3 px-4 text-right text-white">{h.volume}</td>
                    <td className="py-3 px-4 text-right text-gray-400">
                      {h.avgPrice.toLocaleString()}원
                    </td>
                    <td className="py-3 px-4 text-right text-white">
                      {h.currentPrice.toLocaleString()}원
                    </td>
                    <td className="py-3 px-4 text-right text-white">
                      {h.value.toLocaleString()}원
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          setSellTarget({ market: h.market, volume: h.volume })
                        }
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                      >
                        매도
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-gray-400">보유 코인이 없습니다.</p>
      )}

      {sellTarget && (
        <SellModal
          market={sellTarget.market}
          maxVolume={sellTarget.volume}
          onClose={() => setSellTarget(null)}
          onSuccess={() => {
            setSellTarget(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}
