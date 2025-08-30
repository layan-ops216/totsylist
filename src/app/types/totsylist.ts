export type BudgetTier = "budget" | "midtier" | "premium";

export type ProductItem = {
  name: string;
  brand?: string;
  url?: string;
  est_price_usd?: number;
  why: string;
  eco_friendly: boolean;
  age_range?: string;
  notes?: string;
};

export type CategoryBlock = {
  category:
    | "Feeding"
    | "Diapering"
    | "Travel"
    | "Nursery"
    | "Bath"
    | "Health & Safety"
    | "Clothing"
    | "Play"
    | "Postpartum";
  priority: "essential" | "nice_to_have";
  items: ProductItem[];
};

export type TotsyListResponse = {
  summary: {
    due_date: string;
    budget: BudgetTier;
    key_prefs: string[];
    disclaimers: string[];
  };
  categories: CategoryBlock[];
};