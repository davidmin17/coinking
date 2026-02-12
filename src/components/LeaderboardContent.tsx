"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function LeaderboardContent() {
  const { data, error, isLoading } = useSWR("/api/leaderboard", fetcher, {
    refreshInterval: 5000,
  });

  if (isLoading) return <div className="text-gray-400">로딩 중...</div>;
  if (error || !data)
    return <div className="text-red-400">랭킹을 불러오는데 실패했습니다.</div>;

  const ranking = data.ranking ?? [];

  return (
    <div className="overflow-x-auto rounded-lg border border-[#30363d]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#30363d] bg-[#161b22]">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">순위</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">닉네임</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">총자산</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">순수익</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">수익률</th>
          </tr>
        </thead>
        <tbody>
          {ranking.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-400">
                참여자가 없습니다.
              </td>
            </tr>
          ) : (
            ranking.map(
              (r: {
                rank: number;
                userId: string;
                nickname: string;
                totalAsset: number;
                netProfit: number;
                profitRate: number;
              }) => {
                const profitColor =
                  r.netProfit > 0
                    ? "text-red-500"
                    : r.netProfit < 0
                      ? "text-blue-500"
                      : "text-gray-400";
                return (
                  <tr
                    key={r.userId}
                    className="border-b border-[#30363d] hover:bg-[#161b22]/50"
                  >
                    <td className="py-3 px-4 text-white font-medium">{r.rank}</td>
                    <td className="py-3 px-4 text-white">{r.nickname}</td>
                    <td className="py-3 px-4 text-right text-white">
                      {r.totalAsset.toLocaleString()}원
                    </td>
                    <td className={`py-3 px-4 text-right ${profitColor}`}>
                      {r.netProfit >= 0 ? "+" : ""}
                      {r.netProfit.toLocaleString()}원
                    </td>
                    <td className={`py-3 px-4 text-right ${profitColor}`}>
                      {r.profitRate >= 0 ? "+" : ""}
                      {r.profitRate.toFixed(2)}%
                    </td>
                  </tr>
                );
              }
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
