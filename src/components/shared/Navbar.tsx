"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { NotificationBell } from "./NotificationBell";
import { Button } from "@/components/ui/Button";
import {
  Trophy,
  Gamepad2,
  Users,
  Shield,
  Menu,
  X,
  Wallet,
  LogOut,
  LayoutDashboard,
  UserCog,
  ShieldAlert,
  Scale,
  FileText,
  PlusCircle,
  ShieldCheck,
  User,
  Crown,
  ChevronDown,
  Sparkles,
  Settings,
  Flame,
} from "lucide-react";
import { subscribeToSyncEvents } from "@/lib/sync/sync-events";
import { cn } from "@/lib/utils";

interface UserSession {
  id: string;
  email: string;
  username: string;
  role: "PLAYER" | "ORGANIZER" | "ADMIN";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!isMounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.wallet) {
            setWalletBalance(data.wallet.balance);
          }
        } else {
          setUser(null);
        }
      } catch {
        if (isMounted) setUser(null);
      }
    }

    checkAuth();

    // ⚡ Cross-tab real-time listener for instant role/session sync
    const unsubscribe = subscribeToSyncEvents((payload) => {
      if (
        payload.type === "AUTH_SESSION_CHANGED" ||
        payload.type === "ORGANIZER_STATUS_CHANGED" ||
        payload.type === "USER_ROLE_UPDATED"
      ) {
        checkAuth();
      }
    });

    // Window focus and periodic 5-second session check
    const handleFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkAuth();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        checkAuth();
      }
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [pathname]);

  // Click outside listener for User Menu Dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsUserMenuOpen(false);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: "Tournaments", href: "/tournaments", icon: Trophy },
    { label: "Games", href: "/games", icon: Gamepad2 },
    { label: "Leaderboard", href: "/leaderboard", icon: Crown },
    { label: "Organizers", href: "/organizers", icon: ShieldCheck },
  ];

  const role = user?.role ? user.role.toUpperCase() : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#08090e]/85 backdrop-blur-2xl transition-all shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="shrink-0 flex items-center">
          <BrandLogo showTagline={false} />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs xl:text-sm font-bold transition-all duration-200 group select-none",
                  isActive
                    ? "text-lime-400 bg-lime-400/[0.08] border border-lime-400/25 shadow-sm shadow-lime-950/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-lime-400" : "text-zinc-400 group-hover:text-white"
                  )}
                />
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full shadow-[0_0_8px_#a3e635]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              {/* Wallet Chip if player */}
              {role === "PLAYER" && (
                <Link
                  href="/player/wallet"
                  title="View Wallet Ledger & Balance"
                  className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-lime-950/40 via-zinc-900 to-zinc-900 hover:from-lime-950/60 border border-lime-500/30 hover:border-lime-400/60 transition-all shadow-sm shadow-lime-950/30 active:scale-95"
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-lime-500/20 text-lime-400 group-hover:scale-105 transition-transform">
                    <Wallet className="h-3.5 w-3.5 text-lime-400" />
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-lime-400/90">
                      Wallet
                    </span>
                    <span className="text-xs font-black font-mono text-white mt-0.5">
                      ₹{walletBalance !== null ? walletBalance.toLocaleString("en-IN") : 0}
                    </span>
                  </div>
                </Link>
              )}

              {/* Quick Action Button based on Role */}
              {role === "ORGANIZER" && (
                <Link href="/organizer/tournaments/create">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold shadow-md shadow-violet-950/40 border-none rounded-xl"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> Host Cup
                  </Button>
                </Link>
              )}

              {role === "ADMIN" && (
                <Link href="/admin/dashboard">
                  <Button
                    variant="danger"
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-extrabold shadow-md shadow-red-950/40 border-none rounded-xl"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1.5" /> Admin Panel
                  </Button>
                </Link>
              )}

              {role === "PLAYER" && (
                <Link href="/player/tournaments">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/10 font-bold rounded-xl"
                  >
                    <Gamepad2 className="h-3.5 w-3.5 mr-1.5 text-lime-400" /> My Matches
                  </Button>
                </Link>
              )}

              {/* Notification Bell */}
              <NotificationBell />

              {/* Modern User Profile Dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/[0.08] hover:border-white/20 transition-all duration-200 cursor-pointer select-none group",
                    isUserMenuOpen && "border-lime-500/40 bg-zinc-800 ring-2 ring-lime-500/20"
                  )}
                  title={`Account: ${user.username}`}
                  aria-label="User Account Menu"
                >
                  <div className="relative">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-violet-600 via-indigo-500 to-lime-400 p-[1.5px] shadow-sm group-hover:scale-105 transition-transform">
                      <div className="w-full h-full rounded-[6px] bg-zinc-950 flex items-center justify-center text-[11px] font-black text-white">
                        {user.username.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    {/* Small role indicator dot */}
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-black",
                        role === "ADMIN"
                          ? "bg-red-500"
                          : role === "ORGANIZER"
                          ? "bg-violet-400"
                          : "bg-lime-400"
                      )}
                    />
                  </div>

                  <ChevronDown
                    className={cn(
                      "h-3 w-3 text-zinc-400 pr-0.5 transition-transform duration-200",
                      isUserMenuOpen && "rotate-180 text-lime-400"
                    )}
                  />
                </button>

                {/* Dropdown Menu Card */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0c0f18] border border-white/10 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-zinc-100 divide-y divide-white/[0.06]">
                    {/* Header info */}
                    <div className="p-2 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-lime-400 p-[1.5px] shrink-0">
                          <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center text-xs font-black text-white">
                            {user.username.slice(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                            {user.username}
                            <Sparkles className="h-3 w-3 text-lime-400 shrink-0" />
                          </div>
                          <div className="text-[11px] text-zinc-400 truncate">
                            {user.email}
                          </div>
                        </div>
                      </div>

                      {role === "PLAYER" && walletBalance !== null && (
                        <div className="p-2 rounded-xl bg-zinc-900/90 border border-white/[0.06] flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">
                            Cash Balance
                          </span>
                          <span className="text-xs font-extrabold font-mono text-lime-400">
                            ₹{walletBalance.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Navigation Items based on Role */}
                    <div className="py-1.5 space-y-0.5">
                      {role === "PLAYER" && (
                        <>
                          <Link
                            href="/player/dashboard"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-lime-400" />
                            <span>Player Dashboard</span>
                          </Link>
                          <Link
                            href="/player/tournaments"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Trophy className="h-4 w-4 text-amber-400" />
                            <span>My Tournaments</span>
                          </Link>
                          <Link
                            href="/player/teams"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Users className="h-4 w-4 text-violet-400" />
                            <span>My Squad & Teams</span>
                          </Link>
                          <Link
                            href="/player/wallet"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            <span>Wallet & Payouts</span>
                          </Link>
                          <Link
                            href="/player/profile"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <User className="h-4 w-4 text-cyan-400" />
                            <span>Player Profile</span>
                          </Link>
                          <Link
                            href="/organizer/apply"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-lime-400 hover:bg-lime-950/30 transition-colors"
                          >
                            <PlusCircle className="h-4 w-4 text-lime-400" />
                            <span>Become an Organizer</span>
                          </Link>
                        </>
                      )}

                      {role === "ORGANIZER" && (
                        <>
                          <Link
                            href="/organizer/dashboard"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <LayoutDashboard className="h-4 w-4 text-violet-400" />
                            <span>Organizer Hub</span>
                          </Link>
                          <Link
                            href="/organizer/tournaments/create"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <PlusCircle className="h-4 w-4 text-lime-400" />
                            <span>Create Tournament</span>
                          </Link>
                          <Link
                            href="/organizer/payouts"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            <span>Organizer Payouts</span>
                          </Link>
                          <Link
                            href="/organizer/apply"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <ShieldCheck className="h-4 w-4 text-cyan-400" />
                            <span>Verification Status</span>
                          </Link>
                        </>
                      )}

                      {role === "ADMIN" && (
                        <>
                          <Link
                            href="/admin/dashboard"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <ShieldAlert className="h-4 w-4 text-red-500" />
                            <span>Admin Console</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <UserCog className="h-4 w-4 text-amber-400" />
                            <span>Manage Users</span>
                          </Link>
                          <Link
                            href="/admin/tournaments"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Trophy className="h-4 w-4 text-violet-400" />
                            <span>Tournaments Desk</span>
                          </Link>
                          <Link
                            href="/admin/payouts"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            <span>Payout Requests</span>
                          </Link>
                          <Link
                            href="/admin/disputes"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <Scale className="h-4 w-4 text-cyan-400" />
                            <span>Dispute Resolution</span>
                          </Link>
                          <Link
                            href="/admin/audit-logs"
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            <FileText className="h-4 w-4 text-zinc-400" />
                            <span>Audit Logs</span>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Footer sign out */}
                    <div className="pt-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-300 hover:text-white font-bold rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="lime"
                  size="sm"
                  className="font-extrabold shadow-md shadow-lime-950/40 rounded-xl"
                >
                  Play Now
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile App Bar Actions */}
        <div className="flex md:hidden items-center gap-2">
          {user && role === "PLAYER" && (
            <Link
              href="/player/wallet"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-lime-500/30 text-xs font-bold text-lime-400 active:scale-95 transition-transform"
            >
              <Wallet className="h-3.5 w-3.5 text-lime-400" />
              <span>₹{walletBalance !== null ? walletBalance : 0}</span>
            </Link>
          )}

          {user && <NotificationBell />}

          {user && (
            <Link
              href={
                role === "ADMIN"
                  ? "/admin/dashboard"
                  : role === "ORGANIZER"
                  ? "/organizer/dashboard"
                  : "/player/profile"
              }
              className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-lime-400 p-[1.5px] active:scale-95 transition-transform shrink-0"
            >
              <div className="w-full h-full rounded-[6px] bg-zinc-950 flex items-center justify-center text-xs font-black text-white">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900/60 border border-white/[0.08] active:scale-95 transition-transform cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0a0d16]/98 backdrop-blur-2xl px-4 pt-3 pb-8 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* User Status Bar if logged in */}
          {user ? (
            <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-lime-400 p-[1.5px] shrink-0">
                  <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center text-xs font-black text-white">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">
                    {user.username}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border inline-block mt-0.5",
                      role === "ADMIN"
                        ? "bg-red-950/80 text-red-400 border-red-500/30"
                        : role === "ORGANIZER"
                        ? "bg-violet-950/80 text-violet-300 border-violet-500/30"
                        : "bg-lime-950/80 text-lime-400 border-lime-500/30"
                    )}
                  >
                    {role}
                  </span>
                </div>
              </div>

              {role === "PLAYER" && (
                <Link
                  href="/player/wallet"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-950/40 border border-lime-500/30 text-xs font-bold text-lime-400"
                >
                  <Wallet className="h-3.5 w-3.5 text-lime-400" />
                  <span>₹{walletBalance !== null ? walletBalance : 0}</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full text-xs rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button variant="lime" className="w-full text-xs font-bold rounded-xl">
                  Register Free
                </Button>
              </Link>
            </div>
          )}

          {/* ADMIN NAVIGATION CONSOLE (When logged in as Admin) */}
          {user && role === "ADMIN" && (
            <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 px-1">
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                <span>Admin Authority Console</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
                  { label: "User Directory", href: "/admin/users", icon: UserCog },
                  { label: "Organizers", href: "/admin/organizers", icon: ShieldCheck },
                  { label: "Payouts", href: "/admin/payouts", icon: Wallet },
                  { label: "Tournaments", href: "/admin/tournaments", icon: Trophy },
                  { label: "Disputes", href: "/admin/disputes", icon: Scale },
                  { label: "Audit Logs", href: "/admin/audit-logs", icon: FileText },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                          : "text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-red-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* ORGANIZER NAVIGATION DESK (When logged in as Organizer) */}
          {user && role === "ORGANIZER" && (
            <div className="p-3 rounded-2xl bg-violet-950/20 border border-violet-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-violet-400 px-1">
                <LayoutDashboard className="h-3.5 w-3.5 text-violet-400" />
                <span>Organizer Desk</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Host Hub", href: "/organizer/dashboard", icon: LayoutDashboard },
                  { label: "Host Cup", href: "/organizer/tournaments/create", icon: PlusCircle },
                  { label: "Host Payouts", href: "/organizer/payouts", icon: Wallet },
                  { label: "Status", href: "/organizer/apply", icon: ShieldCheck },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-violet-600 text-white shadow-md shadow-violet-950/40"
                          : "text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* PLAYER ARENA (When logged in as Player) */}
          {user && role === "PLAYER" && (
            <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-lime-400 px-1">
                <Trophy className="h-3.5 w-3.5 text-lime-400" />
                <span>Player Arena</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "My Matches", href: "/player/tournaments", icon: Gamepad2 },
                  { label: "My Squad", href: "/player/teams", icon: Users },
                  { label: "Wallet Ledger", href: "/player/wallet", icon: Wallet },
                  { label: "My Profile", href: "/player/profile", icon: User },
                  { label: "Apply Host", href: "/organizer/apply", icon: PlusCircle },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-xs font-bold transition-all",
                        isActive
                          ? "bg-lime-500 text-black shadow-md shadow-lime-950/40"
                          : "text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5 text-lime-400 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Public Navigation */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-1">
              Arena Navigation
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all",
                      isActive
                        ? "text-lime-400 bg-lime-950/40 border border-lime-500/30"
                        : "text-zinc-300 hover:bg-zinc-800/80 bg-zinc-900/40"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 text-lime-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Game Filter shortcuts */}
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Esports Arenas
            </span>
            <div className="flex gap-2 mt-1.5">
              <Link
                href="/tournaments?game=free-fire-max"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-2.5 rounded-xl bg-orange-950/40 border border-orange-500/30 text-center text-xs font-bold text-orange-400 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                🔥 Free Fire MAX
              </Link>
              <Link
                href="/tournaments?game=bgmi"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-2.5 rounded-xl bg-yellow-950/40 border border-yellow-500/30 text-center text-xs font-bold text-yellow-400 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                🎯 BGMI Warzone
              </Link>
            </div>
          </div>

          {/* Sign Out Button if logged in */}
          {user && (
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="w-full py-2.5 text-center text-xs font-bold text-red-400 hover:bg-red-950/30 rounded-xl border border-red-500/20 active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out from Battlexa
            </button>
          )}
        </div>
      )}
    </header>
  );
}
