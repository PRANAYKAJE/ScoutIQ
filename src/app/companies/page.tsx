"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { companies, industries } from "@/data/companies";
import { getSavedSearches, saveSavedSearches } from "@/lib/storage";
import { SavedSearch } from "@/types";

type SortOption = "name-asc" | "name-desc" | "industry";

const ITEMS_PER_PAGE = 10;

function CompaniesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialSearch = searchParams.get("search") || "";
  const initialIndustry = searchParams.get("industry") || "All";
  const initialSort = (searchParams.get("sort") as SortOption) || "name-asc";
  const initialPage = parseInt(searchParams.get("page") || "1");

  const [search, setSearch] = useState(initialSearch);
  const [industry, setIndustry] = useState(initialIndustry);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (industry !== "All") params.set("industry", industry);
    if (sort !== "name-asc") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    
    // simulate loading for small delay to show skeleton
    setLoading(true);
    const timer = setTimeout(() => {
      router.replace(`/companies?${params.toString()}`, { scroll: false });
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, industry, sort, page, router]);

  const filteredCompanies = useMemo(() => {
    let result = [...companies];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.domain.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    if (industry !== "All") {
      result = result.filter((c) => c.industry === industry);
    }

    switch (sort) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "industry":
        result.sort((a, b) => {
          const industrySort = a.industry.localeCompare(b.industry);
          if (industrySort !== 0) return industrySort;
          return a.name.localeCompare(b.name);
        });
        break;
    }

    return result;
  }, [search, industry, sort]);

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setPage(1);
  };

  const handleSortChange = (value: "name" | SortOption) => {
    if (value === "name") {
      // toggle between ascending/descending
      setSort((prev) => (prev === "name-asc" ? "name-desc" : "name-asc"));
    } else {
      setSort(value);
    }
    setPage(1);
  };

  const handleSaveSearch = () => {
    if (!saveName.trim()) return;
    const searches = getSavedSearches();
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveName.trim(),
      query: search,
      industry,
      sort,
      createdAt: new Date().toISOString(),
    };
    saveSavedSearches([...searches, newSearch]);
    setSaveName("");
    setShowSaveDialog(false);
  };

  const hasFilters = search || industry !== "All" || sort !== "name-asc";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Companies</h1>
          <p className="text-text-secondary mt-1">
            {filteredCompanies.length} companies found
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, domain, or description..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="input w-full"
          />
        </div>
        
        <select
          value={industry}
          onChange={(e) => handleIndustryChange(e.target.value)}
          className="input w-full sm:w-48"
        >
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind === "All" ? "All Industries" : ind}
            </option>
          ))}
        </select>


        {hasFilters && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Save Search
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
          <thead className="bg-surface-elevated">
            <tr>
              <th className="sticky top-0 z-10 text-left px-6 py-4 text-sm font-semibold text-text-primary">
            <button
              className="flex items-center gap-1"
              onClick={() => handleSortChange("name")}
            >
              Name
              {sort.startsWith("name") && (
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  {sort === "name-asc" ? (
                    <path d="M5 12l5-5 5 5H5z" />
                  ) : (
                    <path d="M5 8l5 5 5-5H5z" />
                  )}
                </svg>
              )}
            </button>
          </th>
          <th className="sticky top-0 z-10 text-left px-6 py-4 text-sm font-semibold text-text-primary">Domain</th>
          <th className="sticky top-0 z-10 text-left px-6 py-4 text-sm font-semibold text-text-primary">
            <button
              className="flex items-center gap-1"
              onClick={() => handleSortChange("industry")}
            >
              Industry
              {sort === "industry" && (
                <svg
                  className="w-3 h-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5 8l5 5 5-5H5z" />
                </svg>
              )}
            </button>
          </th>
          <th className="sticky top-0 z-10 text-right px-6 py-4 text-sm font-semibold text-text-primary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading
              ? Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-surface-elevated transition-colors">
                    <td className="px-6 py-4">
                      <div className="skeleton h-4 w-24" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="skeleton h-4 w-32" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="skeleton h-4 w-20" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="skeleton h-6 w-16 inline-block" />
                    </td>
                  </tr>
                ))
              : paginatedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-surface-elevated transition-colors">
                <td className="px-6 py-4">
                  <Link
                    href={`/companies/${company.id}`}
                    className="font-medium text-text-primary hover:text-primary transition-colors"
                  >
                    {company.name}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`https://${company.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {company.domain}
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                    {company.industry}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/companies/${company.id}`}
                    className="btn-ghost text-sm"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary"
          >
            Previous
          </button>
          <div className="text-text-secondary">
            Page {page} of {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary"
          >
            Next
          </button>
        </div>
      )}

      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Save Search</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary mb-1 block">Search Name</label>
                <input
                  type="text"
                  placeholder="e.g., AI companies in fintech"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  className="input w-full"
                  autoFocus
                />
              </div>
              <div className="text-sm text-text-muted">
                {search && <div>Query: {search}</div>}
                {industry !== "All" && <div>Industry: {industry}</div>}
                {sort !== "name-asc" && <div>Sort: {sort}</div>}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSearch}
                  disabled={!saveName.trim()}
                  className="btn-primary"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-text-muted">Loading...</div>
      </div>
    }>
      <CompaniesContent />
    </Suspense>
  );
}
