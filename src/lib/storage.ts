import { CompanyList, SavedSearch, EnrichmentData } from "@/types";

const PREFIX = "scoutiq";

export function getNotes(companyId: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(`${PREFIX}_notes_${companyId}`) || "";
}

export function saveNotes(companyId: string, notes: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}_notes_${companyId}`, notes);
}

export function getLists(): CompanyList[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${PREFIX}_lists`);
  return data ? JSON.parse(data) : [];
}

export function saveLists(lists: CompanyList[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}_lists`, JSON.stringify(lists));
}

export function getSavedSearches(): SavedSearch[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(`${PREFIX}_saved_searches`);
  return data ? JSON.parse(data) : [];
}

export function saveSavedSearches(searches: SavedSearch[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}_saved_searches`, JSON.stringify(searches));
}

export function getEnrichment(domain: string): EnrichmentData | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(`${PREFIX}_enrichments_${domain}`);
  return data ? JSON.parse(data) : null;
}

export function saveEnrichment(domain: string, data: EnrichmentData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${PREFIX}_enrichments_${domain}`, JSON.stringify(data));
}
