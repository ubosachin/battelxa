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
} from "lucide-react";

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
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.wallet) {
            setWalletBalance(data.wallet.balance);
          }
        }
      } catch {
        setUser(null);
      }
    }
    checkAuth();
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
        <div className="md:hidden border-b border-zinc-800 bg-[#0e111a] px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  <Icon className="h-4 w-4 text-lime-400" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-zinc-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900">
                  <span className="text-xs text-zinc-400">Signed in as</span>
                  <span className="text-xs font-bold text-lime-400">
                    {user.username} ({role})
                  </span>
                </div>
                {role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-bold rounded-lg bg-red-600 text-white shadow-lg shadow-red-950/40"
                  >
                    🛡️ Admin Console
                  </Link>
                )}
                {role === "ORGANIZER" && (
                  <Link
                    href="/organizer/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-violet-600 text-white"
                  >
                    Organizer Dashboard
                  </Link>
                )}
                {role === "PLAYER" && (
                  <Link
                    href="/player/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-2.5 text-center text-sm font-semibold rounded-lg bg-zinc-800 text-white"
                  >
                    Player Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 text-center text-xs font-semibold text-red-400 hover:bg-red-950/30 rounded-lg cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="lime" className="w-full">
                    Register Free
                  </Button>
                </Link>
              </div>
            )}

            {/* Game shortcuts for mobile */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Quick Game Filter</span>
              <div className="flex gap-2 mt-1.5">
                <Link
                  href="/tournaments?game=FREE_FIRE_MAX"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-orange-950/40 border border-orange-500/30 text-center text-xs font-bold text-orange-400 active:scale-95 transition-transform"
                >
                  🔥 FF MAX
                </Link>
                <Link
                  href="/tournaments?game=BGMI"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-center text-xs font-bold text-amber-400 active:scale-95 transition-transform"
                >
                  🎯 BGMI
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
