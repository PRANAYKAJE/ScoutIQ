"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSavedSearches, saveSavedSearches } from "@/lib/storage";
import { SavedSearch } from "@/types";

export default function SavedSearchesPage() {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    const savedSearches = getSavedSearches();
    setSearches(savedSearches);
  }, []);

  const handleDelete = (id: string) => {
    const updated = searches.filter((s) => s.id !== id);
    saveSavedSearches(updated);
    setSearches(updated);
  };

  const handleRerun = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set("search", search.query);
    if (search.industry && search.industry !== "All") params.set("industry", search.industry);
    if (search.sort && search.sort !== "name-asc") params.set("sort", search.sort);
    router.push(`/companies?${params.toString()}`);
  };

  const getIndustryLabel = (industry: string) => {
    return industry === "All" ? "All Industries" : industry;
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "name-asc":
        return "Name A-Z";
      case "name-desc":
        return "Name Z-A";
      case "industry":
        return "Industry";
      default:
        return sort;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Saved Searches</h1>
          <p className="text-text-secondary mt-1">
            Quick access to your saved search queries
          </p>
        </div>
        <Link href="/companies" className="btn-primary">
          New Search
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-text-primary mb-2">No Saved Searches</h3>
            <p className="text-text-secondary mb-4">
              Save your search queries to quickly access them later.
            </p>
            <Link href="/companies" className="btn-primary inline-block">
              Browse Companies
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {searches.map((search) => (
            <div key={search.id} className="card hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">{search.name}</h3>
                  <div className="text-xs text-text-muted mt-1">
                    {new Date(search.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(search.id)}
                  className="text-text-muted hover:text-error transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {search.query && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-text-secondary">{search.query}</span>
                  </div>
                )}
                {search.industry && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-text-secondary">{getIndustryLabel(search.industry)}</span>
                  </div>
                )}
                {search.sort && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span className="text-text-secondary">{getSortLabel(search.sort)}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleRerun(search)}
                className="btn-primary w-full"
              >
                Re-run Search
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
