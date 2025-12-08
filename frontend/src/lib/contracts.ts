// Contract addresses - update these after deployment
export const CONTRACTS = {
  // Base Sepolia testnet addresses (update after deployment)
  FACTORY: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000",
  TICKET_NFT: process.env.NEXT_PUBLIC_TICKET_NFT_ADDRESS || "0x0000000000000000000000000000000000000000",
} as const;

// Chain configuration
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532; // Base Sepolia

// EventFactory ABI
export const EventFactoryABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "eventAddress", type: "address" },
      { indexed: true, internalType: "address", name: "manager", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "uint256", name: "eventDate", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "maxSupply", type: "uint256" },
      { indexed: false, internalType: "enum Event.CurveType", name: "curveType", type: "uint8" },
    ],
    name: "EventCreated",
    type: "event",
  },
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_venue", type: "string" },
      { internalType: "uint256", name: "_eventDate", type: "uint256" },
      { internalType: "string", name: "_imageUrl", type: "string" },
      { internalType: "uint256", name: "_maxSupply", type: "uint256" },
      { internalType: "uint256", name: "_basePrice", type: "uint256" },
      { internalType: "enum Event.CurveType", name: "_curveType", type: "uint8" },
      { internalType: "uint256", name: "_curveParameter", type: "uint256" },
      { internalType: "bool", name: "_transfersEnabled", type: "bool" },
    ],
    name: "createEvent",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    name: "events",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllEvents",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getEventCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "manager", type: "address" }],
    name: "getEventsByManager",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "offset", type: "uint256" },
      { internalType: "uint256", name: "limit", type: "uint256" },
    ],
    name: "getEventsPaginated",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTicketNFT",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "limit", type: "uint256" }],
    name: "getUpcomingEvents",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "isEvent",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolFeeBps",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketNFT",
    outputs: [{ internalType: "contract TicketNFT", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Event ABI
export const EventABI = [
  {
    inputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_venue", type: "string" },
      { internalType: "uint256", name: "_eventDate", type: "uint256" },
      { internalType: "string", name: "_imageUrl", type: "string" },
      { internalType: "uint256", name: "_maxSupply", type: "uint256" },
      { internalType: "uint256", name: "_basePrice", type: "uint256" },
      { internalType: "enum Event.CurveType", name: "_curveType", type: "uint8" },
      { internalType: "uint256", name: "_curveParameter", type: "uint256" },
      { internalType: "bool", name: "_transfersEnabled", type: "bool" },
      { internalType: "address", name: "_manager", type: "address" },
      { internalType: "address", name: "_ticketNFT", type: "address" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "buyer", type: "address" },
      { indexed: true, internalType: "uint256", name: "ticketNumber", type: "uint256" },
      { indexed: true, internalType: "uint256", name: "tokenId", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "price", type: "uint256" },
    ],
    name: "TicketPurchased",
    type: "event",
  },
  {
    inputs: [],
    name: "basePrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "buyTicket",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    name: "buyTickets",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "curveParameter",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "curveType",
    outputs: [{ internalType: "enum Event.CurveType", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eventDate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
    name: "getBulkPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentPrice",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getEventInfo",
    outputs: [
      { internalType: "string", name: "_name", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string", name: "_venue", type: "string" },
      { internalType: "uint256", name: "_eventDate", type: "uint256" },
      { internalType: "string", name: "_imageUrl", type: "string" },
      { internalType: "uint256", name: "_maxSupply", type: "uint256" },
      { internalType: "uint256", name: "_ticketsSold", type: "uint256" },
      { internalType: "uint256", name: "_currentPrice", type: "uint256" },
      { internalType: "uint256", name: "_basePrice", type: "uint256" },
      { internalType: "enum Event.CurveType", name: "_curveType", type: "uint8" },
      { internalType: "uint256", name: "_curveParameter", type: "uint256" },
      { internalType: "enum Event.EventState", name: "_state", type: "uint8" },
      { internalType: "address", name: "_manager", type: "address" },
      { internalType: "uint256", name: "_totalRevenue", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "supply", type: "uint256" }],
    name: "getPriceAtSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "startSupply", type: "uint256" },
      { internalType: "uint256", name: "count", type: "uint256" },
    ],
    name: "getPriceRange",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "buyer", type: "address" }],
    name: "getTicketsByBuyer",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "holder", type: "address" }],
    name: "hasTicket",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "imageUrl",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "manager",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "maxSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "remainingTickets",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "state",
    outputs: [{ internalType: "enum Event.EventState", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ticketsSold",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalRevenue",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "venue",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  { stateMutability: "payable", type: "receive" },
] as const;

// TicketNFT ABI
export const TicketNFTABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getTicketData",
    outputs: [
      {
        components: [
          { internalType: "address", name: "eventContract", type: "address" },
          { internalType: "string", name: "eventName", type: "string" },
          { internalType: "uint256", name: "eventDate", type: "uint256" },
          { internalType: "string", name: "venue", type: "string" },
          { internalType: "uint256", name: "purchasePrice", type: "uint256" },
          { internalType: "uint256", name: "purchaseTimestamp", type: "uint256" },
          { internalType: "uint256", name: "ticketNumber", type: "uint256" },
        ],
        internalType: "struct TicketNFT.TicketData",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getTicketsByOwner",
    outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "tokenURI",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "ownerOf",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Curve types for TypeScript
export enum CurveType {
  LINEAR = 0,
  EXPONENTIAL = 1,
}

// Event states
export enum EventState {
  UPCOMING = 0,
  ONGOING = 1,
  COMPLETED = 2,
  CANCELLED = 3,
}

// Type for event info
export interface EventInfo {
  name: string;
  description: string;
  venue: string;
  eventDate: bigint;
  imageUrl: string;
  maxSupply: bigint;
  ticketsSold: bigint;
  currentPrice: bigint;
  basePrice: bigint;
  curveType: CurveType;
  curveParameter: bigint;
  state: EventState;
  manager: string;
  totalRevenue: bigint;
}

// Type for ticket data
export interface TicketData {
  eventContract: string;
  eventName: string;
  eventDate: bigint;
  venue: string;
  purchasePrice: bigint;
  purchaseTimestamp: bigint;
  ticketNumber: bigint;
}
