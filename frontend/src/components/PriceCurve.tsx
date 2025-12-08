"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { usePriceRange } from "@/hooks/useEvents";
import { CurveType } from "@/lib/contracts";
import { formatEther } from "viem";

interface PriceCurveProps {
  eventAddress: string;
  maxSupply: bigint;
  ticketsSold: bigint;
  curveType: CurveType;
}

export function PriceCurve({
  eventAddress,
  maxSupply,
  ticketsSold,
  curveType,
}: PriceCurveProps) {
  const count = Number(maxSupply) > 100 ? 100 : Number(maxSupply);
  const { data: prices } = usePriceRange(eventAddress, 0n, BigInt(count));

  const chartData = useMemo(() => {
    if (!prices) return [];

    const step = Number(maxSupply) > 100 ? Number(maxSupply) / 100 : 1;

    return prices.map((price, index) => ({
      supply: Math.round(index * step),
      price: parseFloat(formatEther(price)),
      isSold: index * step <= Number(ticketsSold),
    }));
  }, [prices, maxSupply, ticketsSold]);

  const currentIndex = Math.min(
    Math.floor((Number(ticketsSold) / Number(maxSupply)) * chartData.length),
    chartData.length - 1
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Price Curve</h3>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            curveType === CurveType.EXPONENTIAL
              ? "bg-accent-500/20 text-accent-400"
              : "bg-primary-500/20 text-primary-400"
          }`}
        >
          {curveType === CurveType.EXPONENTIAL ? "Exponential" : "Linear"}
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="supply"
              stroke="#666"
              tick={{ fill: "#888", fontSize: 12 }}
              tickLine={{ stroke: "#444" }}
            />
            <YAxis
              stroke="#666"
              tick={{ fill: "#888", fontSize: 12 }}
              tickLine={{ stroke: "#444" }}
              tickFormatter={(value) => `${value.toFixed(3)}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "12px",
              }}
              labelStyle={{ color: "#888" }}
              formatter={(value: number) => [`${value.toFixed(4)} ETH`, "Price"]}
              labelFormatter={(label) => `Ticket #${label}`}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#22c55e"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
            />
            {currentIndex > 0 && (
              <ReferenceLine
                x={chartData[currentIndex]?.supply}
                stroke="#06b6d4"
                strokeDasharray="5 5"
                label={{
                  value: "Current",
                  fill: "#06b6d4",
                  fontSize: 12,
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <span>Tickets Sold</span>
        <span>
          {ticketsSold.toString()} / {maxSupply.toString()}
        </span>
      </div>
    </div>
  );
}
