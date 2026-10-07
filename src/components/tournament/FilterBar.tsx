"use client";

import React from "react";
import { Search, RotateCcw } from "lucide-react";

export interface FilterState {
  search: string;
  game: string;
  format: string;
  type: string;
  status: string;
  sortBy: string;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
}

export function FilterBar({ filters, onChange, onReset }: FilterBarProps) {
  const updateField = (field: keyof FilterState, value: string) => {
    onChange({
      ...filters,
      [field]: value,
    });
  };

  return (
    <div className="rounded-xl bg-white dark:bg-[#0e111a] border border-slate-200 dark:border-white/[0.08] p-3 sm:p-4 lg:p-5 space-y-3 sm:space-y-4 shadow-sm">
      {/* Mobile-Native Horizontal Quick-Tap Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 sm:hidden">
        <button
          type="button"
          onClick={() => updateField("game", "all")}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
            filters.game === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm"
              : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => updateField("game", "free-fire-max")}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
            filters.game === "free-fire-max"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-sm"
              : "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-500/30"
          }`}
        >
          🔥 FF MAX
        </button>
        <button
          type="button"
          onClick={() => updateField("game", "bgmi")}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
            filters.game === "bgmi"
              ? "bg-gradient-to-r from-yellow-500 to-lime-500 text-black shadow-sm"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-500/30"
          }`}
        >
          🎯 BGMI
        </button>
        <button
          type="button"
          onClick={() => updateField("type", filters.type === "FREE" ? "all" : "FREE")}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
            filters.type === "FREE"
              ? "bg-lime-500 text-black shadow-sm"
              : "bg-slate-100 text-lime-700 border border-lime-300 dark:bg-zinc-800 dark:text-lime-400 dark:border-lime-500/20"
          }`}
        >
          🎁 Free Cups
        </button>
        <button
          type="button"
          onClick={() => updateField("type", filters.type === "PAID" ? "all" : "PAID")}
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
            filters.type === "PAID"
              ? "bg-violet-600 text-white shadow-sm"
              : "bg-slate-100 text-violet-700 border border-violet-300 dark:bg-zinc-800 dark:text-violet-300 dark:border-violet-500/20"
          }`}
        >
          💰 Cash Pools
        </button>
        <button
          type="button"
          onClick={() =>
            updateField(
              "status",
              filters.status === "REGISTRATION_OPEN" ? "all" : "REGISTRATION_OPEN"
            )
          }
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all active:scale-95 ${
            filters.status === "REGISTRATION_OPEN"
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-slate-100 text-emerald-700 border border-emerald-300 dark:bg-zinc-800 dark:text-emerald-400 dark:border-emerald-500/20"
          }`}
        >
          ⚡ Open Now
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-400" />
        <input
          type="text"
          placeholder="Search tournaments by title, rules, or organizer..."
          value={filters.search}
          onChange={(e) => updateField("search", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900/90 border border-slate-300 dark:border-zinc-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
        />
      </div>

      {/* Filter Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Game Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Game Title
          </label>
          <select
            value={filters.game}
            onChange={(e) => updateField("game", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Games</option>
            <option value="free-fire-max">Free Fire MAX</option>
            <option value="bgmi">BGMI (Battlegrounds)</option>
          </select>
        </div>

        {/* Format Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Format / Mode
          </label>
          <select
            value={filters.format}
            onChange={(e) => updateField("format", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Formats</option>
            <option value="SOLO">Solo (1vAll)</option>
            <option value="DUO">Duo (2v2)</option>
            <option value="SQUAD">Squad (4v4)</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Entry Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateField("type", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Types</option>
            <option value="FREE">Free Cups</option>
            <option value="PAID">Cash Prize Cups</option>
            <option value="PRACTICE">Daily Scrims / Practice</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="all">All Statuses</option>
            <option value="REGISTRATION_OPEN">Registration Open</option>
            <option value="CHECK_IN">Check-in Active</option>
            <option value="LIVE">Live Matches</option>
            <option value="COMPLETED">Finished</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => updateField("sortBy", e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500"
          >
            <option value="upcoming">Upcoming First</option>
            <option value="prize_high">Highest Prize Pool</option>
            <option value="entry_low">Lowest Entry Fee</option>
            <option value="slots">Most Slots Open</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800/80">
        <span className="text-xs text-slate-500 dark:text-zinc-400">
          Showing real-time matches & verified organizers
        </span>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset filters
        </button>
      </div>
    </div>
  );
}
