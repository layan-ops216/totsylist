export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  score: number;      // relevance score for ranking
  url?: string;
};

const CATALOG: Product[] = [
  { id: "stroller-uppa", name: "UPPAbaby Vista V2", brand: "UPPAbaby", category: "Stroller", price: 999, score: 0.9, url: "#" },
  { id: "stroller-city", name: "Baby Jogger City Mini GT2", brand: "Baby Jogger", category: "Stroller", price: 399, score: 0.84, url: "#" },
  { id: "monitor-nanit", name: "Nanit Pro Smart Monitor", brand: "Nanit", category: "Monitor", price: 299, score: 0.88 },
  { id: "monitor-vava", name: "VAVA Video Baby Monitor", brand: "VAVA", category: "Monitor", price: 159, score: 0.75 },
  { id: "carrier-ergo", name: "Ergobaby Omni Breeze", brand: "Ergobaby", category: "Carrier", price: 199, score: 0.82 },
  { id: "bottle-comotomo", name: "Comotomo Bottle 8oz (2pk)", brand: "Comotomo", category: "Feeding", price: 25, score: 0.7 },
  { id: "pump-s1", name: "Spectra S1 Plus", brand: "Spectra", category: "Pump", price: 225, score: 0.8 },
  { id: "crib-snuz", name: "SnuzPod4 Bedside Crib", brand: "Snuz", category: "Sleep", price: 279, score: 0.73 },
  { id: "sound-hatch", name: "Hatch Rest", brand: "Hatch", category: "Sleep", price: 69, score: 0.77 },
  { id: "seat-nuna", name: "Nuna PIPA RX", brand: "Nuna", category: "Car Seat", price: 399, score: 0.86 },
];

type Inputs = { location: string; dueDate: string; terms: string[] };

export function suggestProducts({ location, dueDate, terms }: Inputs): Product[] {
  const termSet = new Set(terms.map((t) => t.toLowerCase()));
  const boost = (p: Product) => {
    let s = p.score;
    termSet.forEach((t) => {
      if (p.name.toLowerCase().includes(t)) s += 0.05;
      if (p.brand.toLowerCase().includes(t)) s += 0.03;
      if (p.category.toLowerCase().includes(t)) s += 0.02;
    });
    if (location.toLowerCase().includes("seattle")) s += 0.01;
    if (dueDate) s += 0.005;
    return s;
  };

  return [...CATALOG]
    .map((p) => ({ ...p, score: Number(boost(p).toFixed(3)) }))
    .sort((a, b) => b.score - a.score);
}