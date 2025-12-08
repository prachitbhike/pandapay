"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  Loader2,
  CheckCircle,
  Info,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CONTRACTS, EventFactoryABI, CurveType } from "@/lib/contracts";

export default function CreateEventPage() {
  const router = useRouter();
  const { login, authenticated } = usePrivy();
  const { isConnected } = useAccount();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [maxSupply, setMaxSupply] = useState("100");
  const [basePrice, setBasePrice] = useState("0.001");
  const [curveType, setCurveType] = useState<CurveType>(CurveType.LINEAR);
  const [curveParameter, setCurveParameter] = useState("0.0001");
  const [transfersEnabled, setTransfersEnabled] = useState(true);

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Generate preview curve data
  const curvePreview = useMemo(() => {
    const supply = parseInt(maxSupply) || 100;
    const base = parseFloat(basePrice) || 0.001;
    const param = parseFloat(curveParameter) || 0.0001;
    const points = Math.min(supply, 50);

    return Array.from({ length: points }, (_, i) => {
      const x = Math.floor((i / points) * supply);
      let price: number;

      if (curveType === CurveType.LINEAR) {
        // Linear: price = basePrice + (slope * supply)
        price = base + param * x;
      } else {
        // Exponential: price = basePrice * (1 + rate)^supply
        // param is in percentage (e.g., 5 = 5%)
        const rate = param / 100;
        price = base * Math.pow(1 + rate, x);
      }

      return { supply: x, price: Math.min(price, base * 100) }; // Cap at 100x base
    });
  }, [maxSupply, basePrice, curveType, curveParameter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) return;

    reset();

    const eventDateTimestamp = Math.floor(new Date(eventDate).getTime() / 1000);

    let curveParam: bigint;
    if (curveType === CurveType.LINEAR) {
      // For linear, curve parameter is slope in wei
      curveParam = parseEther(curveParameter);
    } else {
      // For exponential, curve parameter is rate in basis points
      curveParam = BigInt(Math.floor(parseFloat(curveParameter) * 100));
    }

    writeContract({
      address: CONTRACTS.FACTORY as `0x${string}`,
      abi: EventFactoryABI,
      functionName: "createEvent",
      args: [
        name,
        description,
        venue,
        BigInt(eventDateTimestamp),
        imageUrl,
        BigInt(maxSupply),
        parseEther(basePrice),
        curveType,
        curveParam,
        transfersEnabled,
      ],
    });
  };

  // Redirect after successful creation
  if (isSuccess && hash) {
    setTimeout(() => router.push("/"), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Event</h1>
        <p className="text-gray-400">
          Set up your event with bonding curve pricing
        </p>
      </div>

      {!authenticated ? (
        <div className="card text-center py-12">
          <span className="text-6xl mb-4 block">🔐</span>
          <h2 className="text-xl font-semibold mb-2">Connect to Create</h2>
          <p className="text-gray-400 mb-6">
            You need to connect your wallet to create an event
          </p>
          <button onClick={login} className="btn-primary">
            Connect Wallet
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-400" />
                Event Details
              </h2>

              <div>
                <label className="label">Event Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ETH Denver 2025"
                  className="input w-full"
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your event..."
                  className="input w-full h-24 resize-none"
                />
              </div>

              <div>
                <label className="label">Venue *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Denver Convention Center"
                    className="input w-full pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Event Date *</label>
                <input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="input w-full"
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="label">Image URL (optional)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="input w-full"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-400" />
                Pricing Configuration
              </h2>

              <div>
                <label className="label">Max Tickets *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={maxSupply}
                    onChange={(e) => setMaxSupply(e.target.value)}
                    placeholder="100"
                    className="input w-full pl-10"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Base Price (ETH) *</label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="0.001"
                  className="input w-full"
                  step="0.0001"
                  min="0.0001"
                  required
                />
              </div>

              <div>
                <label className="label">Curve Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCurveType(CurveType.LINEAR);
                      setCurveParameter("0.0001");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      curveType === CurveType.LINEAR
                        ? "border-primary-500 bg-primary-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="font-medium">Linear</div>
                    <div className="text-xs text-gray-400">
                      Steady price increase
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurveType(CurveType.EXPONENTIAL);
                      setCurveParameter("5");
                    }}
                    className={`p-3 rounded-xl border transition-all ${
                      curveType === CurveType.EXPONENTIAL
                        ? "border-accent-500 bg-accent-500/10"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="font-medium">Exponential</div>
                    <div className="text-xs text-gray-400">
                      Accelerating increase
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="label">
                  {curveType === CurveType.LINEAR
                    ? "Price Increase per Ticket (ETH)"
                    : "Price Increase Rate (%)"}
                </label>
                <input
                  type="number"
                  value={curveParameter}
                  onChange={(e) => setCurveParameter(e.target.value)}
                  placeholder={curveType === CurveType.LINEAR ? "0.0001" : "5"}
                  className="input w-full"
                  step={curveType === CurveType.LINEAR ? "0.0001" : "0.5"}
                  min="0"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {curveType === CurveType.LINEAR
                    ? "Each ticket increases the price by this amount"
                    : "Each ticket increases the price by this percentage"}
                </p>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <input
                  type="checkbox"
                  id="transfers"
                  checked={transfersEnabled}
                  onChange={(e) => setTransfersEnabled(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="transfers" className="text-sm">
                  Allow ticket transfers (resales)
                </label>
              </div>
            </div>
          </div>

          {/* Curve Preview */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Price Curve Preview</h2>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Info className="w-4 h-4" />
                Preview of how prices will change
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={curvePreview}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="previewGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={
                          curveType === CurveType.LINEAR ? "#22c55e" : "#06b6d4"
                        }
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={
                          curveType === CurveType.LINEAR ? "#22c55e" : "#06b6d4"
                        }
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="supply"
                    stroke="#666"
                    tick={{ fill: "#888", fontSize: 12 }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fill: "#888", fontSize: 12 }}
                    tickFormatter={(value) => `${value.toFixed(3)}`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(0, 0, 0, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                    }}
                    formatter={(value: number) => [
                      `${value.toFixed(4)} ETH`,
                      "Price",
                    ]}
                    labelFormatter={(label) => `Ticket #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={
                      curveType === CurveType.LINEAR ? "#22c55e" : "#06b6d4"
                    }
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#previewGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-center text-sm">
              <div>
                <div className="text-gray-400">Starting Price</div>
                <div className="font-medium">{basePrice} ETH</div>
              </div>
              <div>
                <div className="text-gray-400">Final Price (est.)</div>
                <div className="font-medium">
                  {curvePreview[curvePreview.length - 1]?.price.toFixed(4)} ETH
                </div>
              </div>
              <div>
                <div className="text-gray-400">Price Multiplier</div>
                <div className="font-medium">
                  {(
                    curvePreview[curvePreview.length - 1]?.price /
                    (parseFloat(basePrice) || 0.001)
                  ).toFixed(1)}
                  x
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="submit"
              disabled={isPending || isConfirming || !isConnected}
              className="btn-primary w-full md:w-auto md:px-12 flex items-center justify-center gap-2"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isPending ? "Confirm in wallet..." : "Creating event..."}
                </>
              ) : (
                "Create Event"
              )}
            </button>

            {isSuccess && (
              <div className="flex items-center gap-2 text-primary-400">
                <CheckCircle className="w-5 h-5" />
                Event created! Redirecting...
              </div>
            )}

            {writeError && (
              <div className="text-red-400 text-sm">
                {writeError.message.includes("User rejected")
                  ? "Transaction cancelled"
                  : "Failed to create event. Please try again."}
              </div>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
