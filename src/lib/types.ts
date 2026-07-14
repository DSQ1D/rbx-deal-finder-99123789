export type Deal = {
  id: string;
  title: string;
  marketplace: string;
  price: string;
  seller: string;
  url: string;
  query?: string;
};

export type TrackedDeal = Deal & {
  addedAt: number;
  lastCheckedAt: number;
  active: boolean;
  status: "pending" | "decreased" | "increased" | "unchanged";
};

export type HistoryEntry = {
  query: string;
  at: number;
};
