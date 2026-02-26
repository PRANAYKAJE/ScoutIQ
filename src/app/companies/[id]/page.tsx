"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { companies } from "@/data/companies";
import { getNotes, saveNotes, getLists, saveLists, getEnrichment, saveEnrichment } from "@/lib/storage";
import { CompanyList, EnrichmentData } from "@/types";
import EnrichButton from "@/components/EnrichButton";

type Props = {
  params: { id: string };
};

export default function CompanyDetailPage({ params }: Props) {
  const { id } = params;
  const company = companies.find((c) => c.id === id);
  
  const [notes, setNotes] = useState("");
  const [lists, setLists] = useState<CompanyList[]>([]);
  const [showSaveDropdown, setShowSaveDropdown] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [enrichLoading, setEnrichLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "signals">("overview");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (company) {
      const savedNotes = getNotes(company.id);
      setNotes(savedNotes);
      const savedLists = getLists();
      setLists(savedLists);
      const savedEnrichment = getEnrichment(company.domain);
      setEnrichment(savedEnrichment);
    }
  }, [company]);

  if (!company) {
    notFound();
  }

  const handleNotesChange = (value: string) => {
    setNotes(value);
  };

  const handleNotesBlur = () => {
    if (company) {
      saveNotes(company.id, notes);
    }
  };

  const handleAddToList = (listId: string) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId && !list.companyIds.includes(company.id)) {
        return { ...list, companyIds: [...list.companyIds, company.id] };
      }
      return list;
    });
    saveLists(updatedLists);
    setLists(updatedLists);
    setShowSaveDropdown(false);
    showToastMessage("Company added to list");
  };

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    const newList: CompanyList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      companyIds: [company.id],
      createdAt: new Date().toISOString(),
    };
    const updatedLists = [...lists, newList];
    saveLists(updatedLists);
    setLists(updatedLists);
    setNewListName("");
    setShowSaveDropdown(false);
    showToastMessage("List created and company added");
  };

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const isInList = (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    return list ? list.companyIds.includes(company.id) : false;
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/companies" className="text-text-secondary hover:text-primary transition-colors flex items-center gap-2 text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Companies
        </Link>
      </div>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{company.name}</h1>
          <div className="flex items-center gap-3 mt-2">
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
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
              {company.industry}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowSaveDropdown(!showSaveDropdown)}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Save to List
            </button>
            
            {showSaveDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50">
                <div className="p-2">
                  {lists.length > 0 ? (
                    lists.map((list) => (
                      <button
                        key={list.id}
                        onClick={() => handleAddToList(list.id)}
                        disabled={isInList(list.id)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-surface-elevated transition-colors flex items-center justify-between disabled:opacity-50"
                      >
                        <span>{list.name}</span>
                        {isInList(list.id) && (
                          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-text-muted">No lists yet</div>
                  )}
                  <div className="border-t border-border mt-2 pt-2">
                    <div className="px-2">
                      <input
                        type="text"
                        placeholder="New list name..."
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                        className="input w-full text-sm"
                      />
                      <button
                        onClick={handleCreateList}
                        disabled={!newListName.trim()}
                        className="btn-primary w-full mt-2 text-sm"
                      >
                        Create & Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-border mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "notes"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Notes
          </button>
          <button
            onClick={() => setActiveTab("signals")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "signals"
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Signals
          </button>
        </nav>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-2">About</h2>
            <p className="text-text-secondary">{company.description}</p>
          </div>

          {!enrichment ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-text-primary mb-4">AI Enrichment</h2>
              <p className="text-text-secondary mb-4">
                Get AI-powered insights about this company from their website.
              </p>
              <EnrichButton
                domain={company.domain}
                onEnrich={(data) => {
                  setEnrichment(data);
                  saveEnrichment(company.domain, data);
                }}
                onLoading={setEnrichLoading}
              />
              {enrichLoading && (
                <div className="mt-4">
                  <div className="card skeleton h-40" />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 relative">
              {enrichLoading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                  <div className="card skeleton h-40 w-full" />
                </div>
              )}
              <div className="card border-primary/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">Enriched Data</h2>
                  <span className="text-xs text-text-muted">
                    Last updated: {new Date(enrichment.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-1">Summary</h3>
                    <p className="text-text-secondary text-sm">{enrichment.summary}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-1">What They Do</h3>
                    <p className="text-text-secondary text-sm">{enrichment.what_they_do}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-text-primary mb-2">Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {enrichment.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {enrichment.signals.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-text-primary mb-2">Signals</h3>
                      <div className="space-y-2">
                        {enrichment.signals.map((signal, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                              {signal.type}
                            </span>
                            <span className="text-text-secondary">{signal.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <EnrichButton
                domain={company.domain}
                onEnrich={(data) => {
                  setEnrichment(data);
                  saveEnrichment(company.domain, data);
                }}
                onLoading={setEnrichLoading}
                variant="secondary"
              />
            </div>
          )}
        </div>
      )}

      {activeTab === "notes" && (
        <div className="card">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add your notes about this company..."
            className="input w-full h-64 resize-none"
          />
          <div className="flex justify-between mt-2 text-sm text-text-muted">
            <span>Auto-saved</span>
            <span>{notes.length} characters</span>
          </div>
        </div>
      )}

      {activeTab === "signals" && (
        <div className="card">
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-text-muted mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <h3 className="text-lg font-medium text-text-primary mb-2">Signals Coming Soon</h3>
            <p className="text-text-secondary">
              Track funding rounds, hiring news, product launches, and more.
            </p>
          </div>
        </div>
      )}

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-primary text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
