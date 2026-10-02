"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { subscribeToSyncEvents } from "@/lib/sync/sync-events";

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
  const [user, setUser] = useState<UserSession | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { label: "Tournaments", href: "/tournaments", icon: Trophy },
    { label: "Games", href: "/games", icon: Gamepad2 },
    { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
    { label: "Organizers", href: "/organizers", icon: Users },
  ];

  const role = user?.role ? user.role.toUpperCase() : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#08090e]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo */}
        <BrandLogo showTagline={false} />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "text-lime-400 bg-lime-950/30 border border-lime-500/20"
                    : "text-zinc-300 hover:text-white hover:bg-zinc-800/40"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side items */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              {/* Wallet Badge if player */}
              {role === "PLAYER" && (
                <Link
                  href="/player/wallet"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-200 hover:border-lime-500/40 transition-colors"
                >
                  <Wallet className="h-3.5 w-3.5 text-lime-400" />
                  <span>
                    ₹{walletBalance !== null ? walletBalance : 0}
                  </span>
                </Link>
              )}

              <NotificationBell />

              {/* Role specific dashboard link */}
              {role === "ADMIN" && (
                <Link href="/admin/dashboard">
                  <Button variant="danger" size="sm" className="shadow-lg shadow-red-950/40">
                    <Shield className="h-3.5 w-3.5 mr-1" /> Admin Panel
                  </Button>
                </Link>
              )}

              {role === "ORGANIZER" && (
                <Link href="/organizer/dashboard">
                  <Button variant="primary" size="sm" className="shadow-lg shadow-violet-950/40">
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1" /> Host Hub
                  </Button>
                </Link>
              )}

              {role === "PLAYER" && (
                <Link href="/player/dashboard">
                  <Button variant="secondary" size="sm">
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1" /> Dashboard
                  </Button>
                </Link>
              )}

              {/* User profile avatar / name */}
              <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                <Link
                  href={
                    role === "ADMIN"
                      ? "/admin/dashboard"
                      : role === "ORGANIZER"
                      ? "/organizer/dashboard"
                      : "/player/profile"
                  }
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center text-xs font-black text-black">
                    {user.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-zinc-300 max-w-[100px] truncate">
                    {user.username}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800/80 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="lime" size="sm">
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
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-xs font-bold text-lime-400 active:scale-95 transition-transform"
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
              className="h-8 w-8 rounded-full bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center text-xs font-black text-black active:scale-95 transition-transform shrink-0"
            >
              {user.username.slice(0, 2).toUpperCase()}
            </Link>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-95 transition-transform cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-[#0a0d16]/98 backdrop-blur-2xl px-4 pt-3 pb-8 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* User Status Bar if logged in */}
          {user ? (
            <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center text-xs font-black text-black shrink-0">
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white leading-tight">{user.username}</div>
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      role === "ADMIN"
                        ? "bg-red-950/80 text-red-400 border border-red-500/30"
                        : role === "ORGANIZER"
                        ? "bg-violet-950/80 text-violet-300 border border-violet-500/30"
                        : "bg-lime-950/80 text-lime-400 border border-lime-500/30"
                    }`}
                  >
                    {role}
                  </span>
                </div>
              </div>

              {role === "PLAYER" && (
                <Link
                  href="/player/wallet"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700/80 text-xs font-bold text-lime-400"
                >
                  <Wallet className="h-3.5 w-3.5 text-lime-400" />
                  <span>₹{walletBalance !== null ? walletBalance : 0}</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="secondary" className="w-full text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button variant="lime" className="w-full text-xs font-bold">
                  Register Free
                </Button>
              </Link>
            </div>
          )}

          {/* ADMIN NAVIGATION CONSOLE (When logged in as Admin) */}
          {user && role === "ADMIN" && (
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 space-y-2">
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
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                          : "text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800"
                      }`}
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
            <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-900/40 space-y-2">
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
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-violet-600 text-white shadow-md shadow-violet-950/40"
                          : "text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800"
                      }`}
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
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-lime-400 px-1">
                <Trophy className="h-3.5 w-3.5 text-lime-400" />
                <span>Player Arena</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "My Matches", href: "/player/tournaments", icon: Gamepad2 },
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
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${
                        isActive
                          ? "bg-lime-500 text-black shadow-md shadow-lime-950/40"
                          : "text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800"
                      }`}
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
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "text-lime-400 bg-lime-950/40 border border-lime-500/30"
                        : "text-zinc-300 hover:bg-zinc-800/80 bg-zinc-900/40"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 text-lime-400" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick Game Filter shortcuts */}
          <div className="pt-2 border-t border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              Esports Arenas
            </span>
            <div className="flex gap-2 mt-1.5">
              <Link
                href="/tournaments?game=free-fire-max"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-2.5 rounded-lg bg-orange-950/40 border border-orange-500/30 text-center text-xs font-bold text-orange-400 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                🔥 Free Fire MAX
              </Link>
              <Link
                href="/tournaments?game=bgmi"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 px-2.5 rounded-lg bg-yellow-950/40 border border-yellow-500/30 text-center text-xs font-bold text-yellow-400 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
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
              className="w-full py-2.5 text-center text-xs font-bold text-red-400 hover:bg-red-950/30 rounded-lg border border-red-500/20 active:scale-95 transition-transform cursor-pointer flex items-center justify-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out from Battlexa
            </button>
          )}
        </div>
      )}
    </header>
  );
}
