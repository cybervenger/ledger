// Your portfolio. Edit this file when you buy or sell — qty and avgCost
// drive every calculation downstream. cmp is just a fallback shown before
// the live quote loads (or if the market data fetch fails).
//
// symbol: NSE ticker without the .NS suffix (used to fetch live price)

export interface Holding {
  symbol: string;
  name: string;
  qty: number;
  avgCost?: number; // optional: lets the tracker show P&L, not just value
  cmpFallback: number;
}

export const holdings: Holding[] = [
  { symbol: "BPCL", name: "BPCL", qty: 100, cmpFallback: 306.6 },
  { symbol: "CASTROLIND", name: "Castrol India", qty: 320, cmpFallback: 185.8 },
  { symbol: "COALINDIA", name: "Coal India", qty: 190, cmpFallback: 451.3 },
  { symbol: "IRFC", name: "IRFC", qty: 100, cmpFallback: 99.51 },
  { symbol: "ITC", name: "ITC", qty: 100, cmpFallback: 292.5 },
  { symbol: "ITCHOTELS", name: "ITC Hotels", qty: 10, cmpFallback: 170.92 },
  { symbol: "IOC", name: "Indian Oil", qty: 590, cmpFallback: 143.43 },
  { symbol: "INFY", name: "Infosys", qty: 60, cmpFallback: 1051.4 },
  { symbol: "ONGC", name: "ONGC", qty: 30, cmpFallback: 246.25 },
  { symbol: "RGREENWND", name: "GreenPower", qty: 250, cmpFallback: 11.13 },
  { symbol: "RAILTEL", name: "RailTel", qty: 30, cmpFallback: 319.4 },
  { symbol: "VEDL", name: "Vedanta", qty: 400, cmpFallback: 300.8 },
  { symbol: "VIKASECO", name: "Vikas Ecotech", qty: 1500, cmpFallback: 1.27 },
  { symbol: "VISL", name: "Vardhman Special Steels", qty: 235, cmpFallback: 25.57 },
  { symbol: "VAML", name: "Vedanta Aluminium (VAML)", qty: 235, cmpFallback: 457.77 },
  { symbol: "VOGL", name: "Vedanta Oil & Gas (VOGL)", qty: 235, cmpFallback: 32.87 },
  { symbol: "VEDPOWER", name: "Vedanta Power", qty: 235, cmpFallback: 41.03 },
  { symbol: "MAZDOCK", name: "Mazagon Dock", qty: 20, avgCost: 2730.26, cmpFallback: 2541.7 },
  { symbol: "WIPRO", name: "WIPRO", qty: 92, avgCost: 166, cmpFallback: 171.5 }
];
