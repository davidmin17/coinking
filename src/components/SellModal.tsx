"use client";

import { useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const PERCENT_BTNS = [10, 30, 50, 100] as const;

export function SellModal({
  market,
  maxVolume,
  koreanName,
  onClose,
  onSuccess,
}: {
  market: string;
  maxVolume: number;
  koreanName?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [volume, setVolume] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: tickers = [] } = useSWR(
    `/api/ticker?markets=${market}`,
    fetcher,
    { refreshInterval: 2000 }
  );
  const ticker = tickers[0];
  const currentPrice = ticker?.trade_price ?? 0;
  const vol = parseFloat(volume) || 0;
  const orderAmount = vol * currentPrice;
  const fee = orderAmount * 0.01;
  const receiveAmount = orderAmount - fee;

  function setVolumeByPercent(pct: number) {
    const vol = Math.floor(maxVolume * (pct / 100) * 1e8) / 1e8;
    setVolume(String(vol));
  }

  async function handleSell(e: React.FormEvent) {
    e.preventDefault();
    if (!volume || vol <= 0) {
      setError("수량을 입력해주세요.");
      return;
    }
    if (vol > maxVolume) {
      setError(`보유 수량(${maxVolume}) 이하여야 합니다.`);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trade/sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market, volume: vol }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "매도에 실패했습니다.");
        return;
      }
      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#161b22] border border-[#30363d] rounded-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            {koreanName ? `${koreanName} 매도` : `${market} 매도`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#0d1117] rounded text-sm space-y-1">
          <div>
            <span className="text-gray-400">현재가 </span>
            <span className="text-white font-medium">
              {currentPrice.toLocaleString()}원
            </span>
          </div>
          <div>
            <span className="text-gray-400">보유수량 </span>
            <span className="text-white">{maxVolume}</span>
          </div>
        </div>

        <form onSubmit={handleSell}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">매도 수량</label>
            <div className="flex gap-2 mb-2">
              {PERCENT_BTNS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setVolumeByPercent(pct)}
                  disabled={maxVolume <= 0}
                  className="flex-1 py-1.5 text-xs border border-[#30363d] rounded text-gray-400 hover:bg-[#30363d] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="number"
              step="any"
              min="0"
              max={maxVolume}
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded text-white focus:outline-none focus:border-[#00c853]"
            />
          </div>
          {vol > 0 && (
            <div className="mb-4 text-sm text-gray-400 space-y-0.5">
              <div>
                예상 매도금액:{" "}
                <span className="text-white">{orderAmount.toLocaleString()}원</span>
              </div>
              <div>
                수수료 (1%):{" "}
                <span className="text-white">-{fee.toLocaleString()}원</span>
              </div>
              <div>
                예상 수령금액:{" "}
                <span className="text-[#00c853] font-medium">
                  {receiveAmount.toLocaleString()}원
                </span>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-4 p-2 bg-red-500/20 text-red-400 rounded text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded disabled:opacity-50"
          >
            {loading ? "매도 중..." : "매도"}
          </button>
        </form>
      </div>
    </div>
  );
}
