export interface EnrichmentData {
  summary: string;
  what_they_do: string;
  keywords: string[];
  signals: Signal[];
  sources: string[];
  timestamp: string;
}

export interface Signal {
  type: string;
  text: string;
  source: string;
}

export interface CompanyList {
  id: string;
  name: string;
  companyIds: string[];
  createdAt: string;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  industry: string;
  sort: string;
  createdAt: string;
}
