"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getLists, saveLists } from "@/lib/storage";
import { CompanyList } from "@/types";
import { companies } from "@/data/companies";

export default function ListsPage() {
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [selectedList, setSelectedList] = useState<CompanyList | null>(null);
  const [newListName, setNewListName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const savedLists = getLists();
    setLists(savedLists);
  }, []);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList: CompanyList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      companyIds: [],
      createdAt: new Date().toISOString(),
    };
    const updatedLists = [...lists, newList];
    saveLists(updatedLists);
    setLists(updatedLists);
    setNewListName("");
  };

  const handleDeleteList = (listId: string) => {
    const updatedLists = lists.filter((l) => l.id !== listId);
    saveLists(updatedLists);
    setLists(updatedLists);
    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
    setShowDeleteConfirm(null);
  };

  const handleRemoveCompany = (listId: string, companyId: string) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        return { ...list, companyIds: list.companyIds.filter((id) => id !== companyId) };
      }
      return list;
    });
    saveLists(updatedLists);
    setLists(updatedLists);
    if (selectedList?.id === listId) {
      const updated = updatedLists.find((l) => l.id === listId);
      if (updated) setSelectedList(updated);
    }
  };

  const handleExportJSON = () => {
    if (!selectedList) return;
    const listCompanies = selectedList.companyIds
      .map((id) => companies.find((c) => c.id === id))
      .filter(Boolean);
    
    const dataStr = JSON.stringify(listCompanies, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedList.name.replace(/\s+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    if (!selectedList) return;
    const listCompanies = selectedList.companyIds
      .map((id) => companies.find((c) => c.id === id))
      .filter(Boolean);
    
    const headers = ["Name", "Domain", "Industry", "Description"];
    const rows = listCompanies.map((c) => [
      c?.name || "",
      c?.domain || "",
      c?.industry || "",
      c?.description || "",
    ]);
    
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedList.name.replace(/\s+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCompany = (id: string) => companies.find((c) => c.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Lists</h1>
          <p className="text-text-secondary mt-1">
            Organize companies into curated lists
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Create New List</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="List name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                className="input w-full"
              />
              <button
                onClick={handleCreateList}
                disabled={!newListName.trim()}
                className="btn-primary w-full"
              >
                Create List
              </button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your Lists</h2>
            {lists.length === 0 ? (
              <p className="text-text-muted text-sm">No lists yet. Create one above.</p>
            ) : (
              <div className="space-y-2">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => setSelectedList(list)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${
                      selectedList?.id === list.id
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "hover:bg-surface-elevated text-text-primary"
                    }`}
                  >
                    <div>
                      <div className="font-medium">{list.name}</div>
                      <div className="text-xs text-text-muted">{list.companyIds.length} companies</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(list.id);
                      }}
                      className="text-text-muted hover:text-error transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedList ? (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-primary">{selectedList.name}</h2>
                <div className="flex gap-2">
                  <button onClick={handleExportJSON} className="btn-secondary text-sm">
                    Export JSON
                  </button>
                  <button onClick={handleExportCSV} className="btn-secondary text-sm">
                    Export CSV
                  </button>
                </div>
              </div>

              {selectedList.companyIds.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-text-muted">No companies in this list yet.</p>
                  <Link href="/companies" className="btn-primary mt-4 inline-block">
                    Browse Companies
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedList.companyIds.map((companyId) => {
                    const company = getCompany(companyId);
                    if (!company) return null;
                    return (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-4 bg-surface-elevated rounded-lg"
                      >
                        <div>
                          <Link
                            href={`/companies/${company.id}`}
                            className="font-medium text-text-primary hover:text-primary transition-colors"
                          >
                            {company.name}
                          </Link>
                          <div className="text-sm text-text-secondary">{company.domain}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                            {company.industry}
                          </span>
                          <button
                            onClick={() => handleRemoveCompany(selectedList.id, company.id)}
                            className="text-text-muted hover:text-error transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <h3 className="text-lg font-medium text-text-primary mb-2">Select a List</h3>
                <p className="text-text-secondary">Choose a list from the left to view its companies.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Delete List?</h3>
            <p className="text-text-secondary mb-4">This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteList(showDeleteConfirm)}
                className="bg-error text-white px-4 py-2 rounded-lg font-medium hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
