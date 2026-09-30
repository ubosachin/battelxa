"use client";

import React, { useState, useEffect } from "react";
import { FilterBar, FilterState } from "@/components/tournament/FilterBar";
import { TournamentCard, TournamentCardData } from "@/components/tournament/TournamentCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Trophy, RefreshCw } from "lucide-react";

const INITIAL_FILTERS: FilterState = {
  search: "",
  game: "all",
  format: "all",
  type: "all",
  status: "all",
  sortBy: "upcoming",
};

export default function TournamentsDiscoveryPage() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [tournaments, setTournaments] = useState<TournamentCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTournaments = async (currentFilters: FilterState) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.search) params.append("search", currentFilters.search);
      if (currentFilters.game !== "all") params.append("game", currentFilters.game);
      if (currentFilters.format !== "all") params.append("format", currentFilters.format);
      if (currentFilters.type !== "all") params.append("type", currentFilters.type);
      if (currentFilters.status !== "all") params.append("status", currentFilters.status);
      if (currentFilters.sortBy) params.append("sortBy", currentFilters.sortBy);

      const res = await fetch(`/api/tournaments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (filters.game !== "all") params.append("game", filters.game);
        if (filters.format !== "all") params.append("format", filters.format);
        if (filters.type !== "all") params.append("type", filters.type);
        if (filters.status !== "all") params.append("status", filters.status);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);

        const res = await fetch(`/api/tournaments?${params.toString()}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setTournaments(data.tournaments || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    fetchTournaments(newFilters);
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
    fetchTournaments(INITIAL_FILTERS);
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-lime-400">
          <Trophy className="h-4 w-4" />
          Arena Competitions
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
          Tournament Discovery Hub
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
          Filter through live, upcoming, and practice battlegrounds for Free Fire MAX and BGMI. Find your format, register your squad, and claim prize payouts.
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleReset}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing <strong className="text-white">{tournaments.length}</strong> available tournament arenas
        </span>
        <button
          onClick={() => fetchTournaments(filters)}
          className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh list
        </button>
      </div>

      {/* Grid or Empty/Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 rounded-xl bg-zinc-900/60 p-4 space-y-3">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="rounded-2xl bg-[#0e111a] border border-zinc-800 p-12 text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-zinc-800/80 text-zinc-400">
            <Trophy className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Tournaments Match Your Filter</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Try adjusting your search criteria, format selection, or reset filters to see all available battles.
          </p>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white font-bold text-xs hover:bg-violet-500 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <TournamentCard key={t._id} tournament={t} />
          ))}
        </div>
      )}
    </div>
  );
}
