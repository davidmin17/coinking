"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type PortfolioData = {
  nickname: string;
  balance: number;
  coinValue: number;
  totalAsset: number;
  profitRate: number;
  holdings: {
    market: string;
    volume: number;
    avgPrice: number;
    currentPrice: number;
    value: number;
  }[];
};

export function UserPortfolioModal({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const { data, error, isLoading } = useSWR<PortfolioData>(
    userId ? `/api/users/${userId}/portfolio` : null,
    fetcher
  );

  if (isLoading)
    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-gray-400">로딩 중...</div>
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg mx-4 p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-red-400">조회에 실패했습니다.</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#30363d] rounded text-white text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    );

  const profitColor =
    data.profitRate > 0
      ? "text-red-500"
      : data.profitRate < 0
        ? "text-blue-500"
        : "text-gray-400";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#161b22] border-b border-[#30363d] p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {data.nickname} 포트폴리오
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0d1117] rounded-lg p-3">
              <p className="text-gray-400 text-xs">보유 현금</p>
              <p className="text-white font-medium">
                {data.balance.toLocaleString()}원
              </p>
            </div>
            <div className="bg-[#0d1117] rounded-lg p-3">
              <p className="text-gray-400 text-xs">총 자산</p>
              <p className="text-white font-medium">
                {data.totalAsset.toLocaleString()}원
              </p>
            </div>
            <div className="bg-[#0d1117] rounded-lg p-3">
              <p className="text-gray-400 text-xs">코인 평가액</p>
              <p className="text-white font-medium">
                {data.coinValue.toLocaleString()}원
              </p>
            </div>
            <div className="bg-[#0d1117] rounded-lg p-3">
              <p className="text-gray-400 text-xs">수익률</p>
              <p className={`font-medium ${profitColor}`}>
                {data.profitRate >= 0 ? "+" : ""}
                {data.profitRate.toFixed(2)}%
              </p>
            </div>
          </div>

          {data.holdings?.length > 0 ? (
            <div>
              <h4 className="text-sm text-gray-400 mb-2">보유 코인</h4>
              <div className="overflow-x-auto rounded-lg border border-[#30363d]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#30363d] bg-[#0d1117]">
                      <th className="text-left py-2 px-3 text-gray-400">
                        종목
                      </th>
                      <th className="text-right py-2 px-3 text-gray-400">
                        수량
                      </th>
                      <th className="text-right py-2 px-3 text-gray-400">
                        평균단가
                      </th>
                      <th className="text-right py-2 px-3 text-gray-400">
                        현재가
                      </th>
                      <th className="text-right py-2 px-3 text-gray-400">
                        평가금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.holdings.map((h) => (
                      <tr
                        key={h.market}
                        className="border-b border-[#30363d]"
                      >
                        <td className="py-2 px-3 text-white">{h.market}</td>
                        <td className="py-2 px-3 text-right text-white">
                          {h.volume}
                        </td>
                        <td className="py-2 px-3 text-right text-gray-400">
                          {h.avgPrice.toLocaleString()}원
                        </td>
                        <td className="py-2 px-3 text-right text-white">
                          {h.currentPrice.toLocaleString()}원
                        </td>
                        <td className="py-2 px-3 text-right text-white">
                          {h.value.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">보유 코인이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
