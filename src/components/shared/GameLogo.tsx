"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type GameSize = "xs" | "sm" | "md" | "lg" | "xl" | "responsive";
export type GameVariant = "icon" | "badge" | "full" | "pill";

export interface GameLogoProps {
  /** Game slug, name, or identifier (e.g. 'free-fire-max', 'bgmi', or dynamic DB slug) */
  game: string;
  /** Optional custom title override */
  title?: string;
  name?: string;
  /** Optional developer / publisher name */
  developer?: string;
  /** Optional category or genre */
  category?: string;
  /** Optional custom icon image URL from DB */
  iconUrl?: string;
  /** Size variant */
  size?: GameSize;
  /** Display variant: badge (icon + name + subtitle), icon only, full logo image, or compact pill */
  variant?: GameVariant;
  /** Extra CSS classes */
  className?: string;
  /** Whether to show title & badge text */
  showText?: boolean;
  /** Whether to show subtitle (developer/category) in badge mode */
  showSubtitle?: boolean;
  /** Optional hover animations */
  interactive?: boolean;
}

function getInitials(title: string): string {
  if (!title) return "BX";
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

function normalizeGameKey(input: string): string {
  if (!input) return "";
  return input.toLowerCase().replace(/[_\s]+/g, "-").trim();
}

export function GameLogo({
  game,
  title,
  name,
  developer,
  category,
  iconUrl,
  size = "md",
  variant = "badge",
  className = "",
  showText = true,
  showSubtitle = true,
  interactive = true,
}: GameLogoProps) {
  const [imgError, setImgError] = useState(false);
  const [iconError, setIconError] = useState(false);

  const cleanKey = normalizeGameKey(game || name || title || "");
  const isFF =
    cleanKey === "free-fire-max" ||
    cleanKey === "free-fire" ||
    cleanKey.includes("fire");
  const isBGMI =
    cleanKey === "bgmi" ||
    cleanKey === "battlegrounds-mobile-india" ||
    cleanKey === "pubg" ||
    cleanKey.includes("bgmi") ||
    cleanKey.includes("battleground");
  const isCOD =
    cleanKey.includes("cod") ||
    cleanKey.includes("call-of-duty");

  // Responsive dimensions
  const iconDimensions: Record<GameSize, string> = {
    xs: "w-5 h-5 text-[9px] rounded-md",
    sm: "w-6 h-6 sm:w-7 sm:h-7 text-[10px] sm:text-xs rounded-lg",
    md: "w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-xs sm:text-sm rounded-lg sm:rounded-xl",
    lg: "w-10 h-10 sm:w-12 sm:h-12 text-sm sm:text-base rounded-xl sm:rounded-2xl",
    xl: "w-14 h-14 sm:w-16 sm:h-16 text-base sm:text-lg rounded-2xl",
    responsive:
      "w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-[10px] sm:text-xs rounded-lg sm:rounded-xl",
  };

  const fullDimensions: Record<GameSize, string> = {
    xs: "h-5 max-w-[90px] w-auto",
    sm: "h-6 sm:h-7 max-w-[120px] w-auto",
    md: "h-8 sm:h-9 max-w-[150px] w-auto",
    lg: "h-10 sm:h-12 max-w-[200px] w-auto",
    xl: "h-14 sm:h-16 max-w-[260px] w-auto",
    responsive:
      "h-6 xs:h-7 sm:h-8 md:h-9 max-w-[140px] sm:max-w-[180px] w-auto",
  };

  const textStyles: Record<
    GameSize,
    { title: string; subtitle: string; tag: string }
  > = {
    xs: {
      title: "text-[9px] font-black",
      subtitle: "text-[7px]",
      tag: "text-[7px] px-1 py-0.1",
    },
    sm: {
      title: "text-[10px] sm:text-[11px] font-black",
      subtitle: "text-[8px] sm:text-[9px]",
      tag: "text-[8px] px-1 py-0.2",
    },
    md: {
      title: "text-[10px] sm:text-[11px] md:text-xs font-black",
      subtitle: "text-[8px] sm:text-[9px] md:text-[10px]",
      tag: "text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2",
    },
    lg: {
      title: "text-xs sm:text-sm md:text-base font-black",
      subtitle: "text-[9px] sm:text-[10px] md:text-xs",
      tag: "text-[9px] sm:text-[10px] px-1.5 py-0.5",
    },
    xl: {
      title: "text-sm sm:text-base md:text-lg font-black",
      subtitle: "text-xs sm:text-sm",
      tag: "text-xs px-2 py-0.5",
    },
    responsive: {
      title: "text-[10px] xs:text-[11px] sm:text-xs font-black",
      subtitle: "text-[8px] xs:text-[9px] sm:text-[10px]",
      tag: "text-[8px] xs:text-[9px] px-1 sm:px-1.5 py-0.2",
    },
  };

  // Real Metadata for supported games & dynamic DB games
  const gameInfo = isFF
    ? {
        title: "FREE FIRE",
        tag: "MAX",
        tagBg: "bg-gradient-to-r from-red-600 to-orange-500 text-white",
        subtitle: developer || "GARENA ESPORTS",
        gradientBg: "from-orange-950/80 via-zinc-900 to-zinc-900",
        borderGlow: "border-amber-500/30",
        shadowGlow: "shadow-[0_2px_12px_rgba(249,115,22,0.25)]",
        subColor: "text-amber-400/90",
        defaultIcon: "/games/free-fire-icon.svg",
        officialLogoUrl: "/games/free-fire-max.svg",
      }
    : isBGMI
    ? {
        title: "BATTLEGROUNDS",
        tag: "BGMI",
        tagBg: "bg-amber-500 text-black font-black",
        subtitle: developer || "KRAFTON ESPORTS",
        gradientBg: "from-yellow-950/70 via-zinc-900 to-zinc-900",
        borderGlow: "border-yellow-500/30",
        shadowGlow: "shadow-[0_2px_12px_rgba(234,179,8,0.25)]",
        subColor: "text-amber-400",
        defaultIcon: "/games/bgmi-icon.svg",
        officialLogoUrl: "/games/bgmi.svg",
      }
    : isCOD
    ? {
        title: "CALL OF DUTY",
        tag: "MOBILE",
        tagBg: "bg-emerald-500 text-black font-black",
        subtitle: developer || "ACTIVISION",
        gradientBg: "from-emerald-950/70 via-zinc-900 to-zinc-900",
        borderGlow: "border-emerald-500/30",
        shadowGlow: "shadow-[0_2px_12px_rgba(16,185,129,0.25)]",
        subColor: "text-emerald-400",
        defaultIcon: "/games/cod-mobile-icon.svg",
        officialLogoUrl: "/games/cod-mobile-icon.svg",
      }
    : {
        title:
          title ||
          name ||
          (game ? game.replace(/[_-]+/g, " ").trim().toUpperCase() : "ARENA"),
        tag: getInitials(title || name || game),
        tagBg: "bg-violet-600 text-white font-bold",
        subtitle:
          developer || category || "OFFICIAL ESPORTS ARENA",
        gradientBg: "from-violet-950/70 via-zinc-900 to-zinc-900",
        borderGlow: "border-violet-500/30",
        shadowGlow: "shadow-[0_2px_12px_rgba(139,92,246,0.25)]",
        subColor: "text-violet-400",
        defaultIcon: iconUrl || "",
        officialLogoUrl: iconUrl || "",
      };

  const activeImageUrl = iconUrl || (gameInfo.officialLogoUrl || "");

  // 1. Full logo image variant
  if (variant === "full" && activeImageUrl && !imgError) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center shrink-0 transition-transform duration-200",
          interactive && "hover:scale-[1.02]",
          className
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeImageUrl}
          alt={`${gameInfo.title} Logo`}
          className={cn(
            fullDimensions[size],
            "object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          )}
          onError={() => setImgError(true)}
          loading="eager"
        />
      </div>
    );
  }

  // Render authentic vector emblem or real DB image
  const renderIconBox = (dimClass: string) => {
    const iconSource = iconUrl || gameInfo.defaultIcon;

    // If an icon asset is available and hasn't errored, display the official crisp image
    if (iconSource && !iconError) {
      return (
        <div
          className={cn(
            "relative overflow-hidden flex items-center justify-center shrink-0 border border-white/10 bg-zinc-950 rounded-lg p-0.5",
            dimClass
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconSource}
            alt={`${gameInfo.title} Icon`}
            className="w-full h-full object-contain filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]"
            onError={() => setIconError(true)}
            loading="eager"
          />
        </div>
      );
    }

    // Authentic Free Fire MAX Vector Emblem
    if (isFF) {
      return (
        <div
          className={cn(
            "relative flex items-center justify-center bg-gradient-to-tr from-[#7c1404] via-[#ea580c] to-[#facc15] shadow-[0_0_15px_rgba(234,88,12,0.5)] border border-amber-400/40 shrink-0",
            dimClass
          )}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-[72%] h-[72%] fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            <path
              d="M50 5 L63 32 L88 28 L72 50 L95 72 L62 70 L50 95 L38 70 L5 72 L28 50 L12 28 L37 32 Z"
              fill="#FACC15"
            />
            <path
              d="M50 18 L58 38 L78 35 L65 52 L82 68 L58 66 L50 85 L42 66 L18 68 L35 52 L22 35 L42 38 Z"
              fill="#DC2626"
            />
            <text
              x="50"
              y="61"
              fontSize="24"
              fontWeight="900"
              fontFamily="Impact, sans-serif"
              textAnchor="middle"
              fill="#FFFFFF"
              letterSpacing="-1"
            >
              FF
            </text>
          </svg>
          <span className="absolute -bottom-1 -right-1 px-1 py-0 bg-red-600 text-white font-black text-[7px] sm:text-[8px] rounded border border-white/20 uppercase tracking-tighter shadow-sm">
            MAX
          </span>
        </div>
      );
    }

    // Authentic BGMI Level-3 Helmet Stencil Vector Emblem
    if (isBGMI) {
      return (
        <div
          className={cn(
            "relative flex items-center justify-center bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-yellow-400/40 shrink-0",
            dimClass
          )}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-[75%] h-[75%] fill-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            <path
              d="M50 10 C28 10 16 26 16 48 C16 68 28 85 50 88 C72 85 84 68 84 48 C84 26 72 10 50 10 Z"
              fill="#1E293B"
              stroke="#F59E0B"
              strokeWidth="5"
            />
            <path
              d="M26 44 L74 44 L70 58 L30 58 Z"
              fill="#000000"
              stroke="#F59E0B"
              strokeWidth="3"
            />
            <line x1="38" y1="44" x2="38" y2="58" stroke="#F59E0B" strokeWidth="2" />
            <line x1="50" y1="44" x2="50" y2="58" stroke="#F59E0B" strokeWidth="2" />
            <line x1="62" y1="44" x2="62" y2="58" stroke="#F59E0B" strokeWidth="2" />
            <path d="M42 66 L58 66 L55 76 L45 76 Z" fill="#F59E0B" />
          </svg>
          <span className="absolute -bottom-1 -right-1 px-1 py-0 bg-amber-500 text-black font-black text-[7px] sm:text-[8px] rounded border border-black/30 uppercase tracking-tighter shadow-sm">
            BGMI
          </span>
        </div>
      );
    }

    // Dynamic clean initial badge for any other real DB game
    return (
      <div
        className={cn(
          "relative flex items-center justify-center font-black text-white shrink-0 border border-white/20 select-none bg-gradient-to-tr from-violet-700 via-purple-600 to-indigo-500 shadow-md",
          dimClass
        )}
      >
        <span className="font-mono text-xs">{gameInfo.tag}</span>
      </div>
    );
  };

  // 2. ICON ONLY VARIANT
  if (variant === "icon") {
    return (
      <div
        title={gameInfo.title}
        aria-label={gameInfo.title}
        className={cn(
          "inline-flex shrink-0 transition-transform duration-200",
          interactive && "hover:scale-105 active:scale-95 cursor-pointer",
          className
        )}
      >
        {renderIconBox(iconDimensions[size])}
      </div>
    );
  }

  // 3. PILL VARIANT (Ultra compact for tables/chips)
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border bg-zinc-900/90 backdrop-blur-md shrink-0 max-w-full min-w-0 transition-all duration-200",
          gameInfo.borderGlow,
          interactive && "hover:border-opacity-100 hover:bg-zinc-800/90",
          className
        )}
      >
        {renderIconBox("w-4 h-4 rounded-full text-[8px]")}
        {showText && (
          <span className="text-[10px] font-bold text-zinc-200 uppercase truncate max-w-[100px] xs:max-w-[130px] sm:max-w-none">
            {gameInfo.title}
          </span>
        )}
      </div>
    );
  }

  // 4. BADGE VARIANT (Standard Default) - Fully responsive with real data
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 xs:gap-2 px-2 py-1 sm:px-2.5 sm:py-1 rounded-xl bg-gradient-to-r border backdrop-blur-md max-w-full min-w-0 transition-all duration-200",
        gameInfo.gradientBg,
        gameInfo.borderGlow,
        gameInfo.shadowGlow,
        interactive && "hover:border-opacity-100 hover:shadow-lg",
        className
      )}
    >
      {renderIconBox(iconDimensions[size])}

      {showText && (
        <div className="flex flex-col text-left leading-none min-w-0 flex-1">
          {/* Main Title Row */}
          <div className="flex items-center gap-1 min-w-0">
            <span
              className={cn(
                "tracking-wide text-white uppercase truncate font-mono min-w-0",
                textStyles[size].title
              )}
            >
              {gameInfo.title}
            </span>
            {gameInfo.tag && (
              <span
                className={cn(
                  "rounded uppercase tracking-tight shrink-0 font-extrabold shadow-sm",
                  gameInfo.tagBg,
                  textStyles[size].tag
                )}
              >
                {gameInfo.tag}
              </span>
            )}
          </div>

          {/* Subtitle / Developer Row */}
          {showSubtitle && (
            <span
              className={cn(
                "tracking-wider truncate font-semibold mt-0.5",
                gameInfo.subColor,
                textStyles[size].subtitle
              )}
            >
              {gameInfo.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
