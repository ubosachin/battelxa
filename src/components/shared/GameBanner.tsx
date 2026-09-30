"use client";

import React, { useState, useMemo } from "react";
import { GameLogo } from "./GameLogo";
import { cn } from "@/lib/utils";

interface GameBannerProps {
  game: string;
  className?: string;
  heightClass?: string;
  showLogo?: boolean;
  format?: string;
  overlayContent?: React.ReactNode;
}

const GAME_WALLPAPERS: Record<string, { url: string; gradient: string; tint: string }> = {
  "free-fire-max": {
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-red-950 via-orange-950 to-zinc-950",
    tint: "from-[#0e111a] via-[#0e111a]/70 to-red-950/40",
  },
  bgmi: {
    url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-amber-950 via-slate-900 to-zinc-950",
    tint: "from-[#0e111a] via-[#0e111a]/70 to-blue-950/40",
  },
  "cod-mobile": {
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-emerald-950 via-zinc-900 to-zinc-950",
    tint: "from-[#0e111a] via-[#0e111a]/70 to-emerald-950/40",
  },
  valorant: {
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-rose-950 via-zinc-900 to-zinc-950",
    tint: "from-[#0e111a] via-[#0e111a]/70 to-rose-950/40",
  },
};

export function GameBanner({
  game,
  className = "",
  heightClass = "h-36 sm:h-44",
  showLogo = true,
  format,
  overlayContent,
}: GameBannerProps) {
  const [imgError, setImgError] = useState(false);

  const clean = (game || "").toLowerCase().replace(/[_\s]+/g, "-");

  const config = useMemo(() => {
    if (clean.includes("fire") || clean.includes("ff")) {
      return GAME_WALLPAPERS["free-fire-max"];
    }
    if (clean.includes("bgmi") || clean.includes("pubg") || clean.includes("battleground")) {
      return GAME_WALLPAPERS["bgmi"];
    }
    if (clean.includes("cod")) {
      return GAME_WALLPAPERS["cod-mobile"];
    }
    if (clean.includes("val")) {
      return GAME_WALLPAPERS["valorant"];
    }
    // Generic dynamic fallback
    return {
      url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      gradient: "from-violet-950 via-zinc-900 to-zinc-950",
      tint: "from-[#0e111a] via-[#0e111a]/70 to-violet-950/40",
    };
  }, [clean]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl bg-[#0a0d16]",
        heightClass,
        className
      )}
    >
      {/* Background Graphic */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 bg-gradient-to-r",
          config.gradient
        )}
        style={{
          backgroundImage: !imgError ? `url(${config.url})` : undefined,
        }}
      >
        {/* Darkening Gradients for text contrast */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t",
            config.tint
          )}
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Top Banner Content: Logos & Format Badges */}
      <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {showLogo && (
            <div className="flex items-center gap-2 max-w-full min-w-0">
              <GameLogo game={game} variant="badge" size="responsive" />
              {format && (
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/70 text-zinc-300 border border-white/10 backdrop-blur-md shrink-0">
                  {format}
                </span>
              )}
            </div>
          )}

          {overlayContent}
        </div>
      </div>
    </div>
  );
}
