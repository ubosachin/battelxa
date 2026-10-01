"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Shield,
  ShieldAlert,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Ban,
  RefreshCw,
  Lock,
  Gamepad2,
  Mail,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { formatCurrency } from "@/lib/utils";
import { emitSyncEvent, subscribeToSyncEvents } from "@/lib/sync/sync-events";

interface EnrichedUser {
  _id: string;
  username: string;
  email: string;
  role: "PLAYER" | "ORGANIZER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "BANNED";
  isVerified: boolean;
  isOnboarded?: boolean;
  createdAt: string;
  avatar?: string;
  wallet?: {
    balance: number;
    lockedBalance: number;
    totalWon: number;
  };
  profile?: {
    gamerTag?: string;
    freeFireId?: string;
    bgmiId?: string;
  } | null;
  organizerProfile?: {
    organizationName?: string;
    status?: string;
    verifiedByAdmin?: boolean;
  } | null;
}

interface StatsData {
  totalUsers: number;
  totalPlayers: number;
  totalOrganizers: number;
  totalAdmins: number;
  totalBanned: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalUsers: 0,
    totalPlayers: 0,
    totalOrganizers: 0,
    totalAdmins: 0,
    totalBanned: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);

  // Add User Form State
  const [addForm, setAddForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "PLAYER",
    status: "ACTIVE",
    gamerTag: "",
    freeFireId: "",
    bgmiId: "",
    initialBalance: 0,
    organizationName: "",
  });

  // Edit User Form State
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "PLAYER",
    status: "ACTIVE",
    isVerified: true,
    isOnboarded: true,
    newPassword: "",
    gamerTag: "",
    freeFireId: "",
    bgmiId: "",
    organizationName: "",
    organizerVerified: false,
  });

  // Wallet Adjustment Form State
  const [walletForm, setWalletForm] = useState<{
    type: "ADD" | "DEDUCT" | "SET";
    amount: number;
    reason: string;
  }>({
    type: "ADD",
    amount: 100,
    reason: "Administrative bonus credit",
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchUsers = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        search,
        role: roleFilter,
        status: statusFilter,
      });

      const res = await fetch(`/api/admin/users?${params.toString()}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
        if (data.pagination) setTotalPages(data.pagination.totalPages || 1);
      }
    } catch (e) {
      if (!silent) console.error("Error fetching users:", e);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers(false);

    // Cross-tab real-time sync listener
    const unsubscribe = subscribeToSyncEvents((payload) => {
      if (payload.type === "USER_ROLE_UPDATED" || payload.type === "AUTH_SESSION_CHANGED") {
        fetchUsers(true);
      }
    });

    const handleFocus = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchUsers(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    // Background 4-second poll
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchUsers(true);
      }
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchUsers]);

  // Open Edit Modal with user data
  const handleOpenEdit = (user: EnrichedUser) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified ?? true,
      isOnboarded: user.isOnboarded ?? true,
      newPassword: "",
      gamerTag: user.profile?.gamerTag || "",
      freeFireId: user.profile?.freeFireId || "",
      bgmiId: user.profile?.bgmiId || "",
      organizationName: user.organizerProfile?.organizationName || "",
      organizerVerified: user.organizerProfile?.verifiedByAdmin || false,
    });
    setModalMessage(null);
    setIsEditModalOpen(true);
  };

  // Open Wallet Modal
  const handleOpenWallet = (user: EnrichedUser) => {
    setSelectedUser(user);
    setWalletForm({
      type: "ADD",
      amount: 100,
      reason: "Administrative adjustment",
    });
    setModalMessage(null);
    setIsWalletModalOpen(true);
  };

  // Submit Add User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setModalMessage(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();

      if (res.ok) {
        setModalMessage({ type: "success", text: "User created successfully!" });
        emitSyncEvent("USER_ROLE_UPDATED");
        emitSyncEvent("AUTH_SESSION_CHANGED");
        setTimeout(() => {
          setIsAddModalOpen(false);
          fetchUsers(true);
        }, 1000);
      } else {
        setModalMessage({ type: "error", text: data.error || "Failed to create user" });
      }
    } catch {
      setModalMessage({ type: "error", text: "Network error creating user" });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Edit User
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    setModalMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok) {
        setModalMessage({ type: "success", text: "User details updated successfully!" });
        emitSyncEvent("USER_ROLE_UPDATED");
        emitSyncEvent("AUTH_SESSION_CHANGED");
        setTimeout(() => {
          setIsEditModalOpen(false);
          fetchUsers(true);
        }, 1000);
      } else {
        setModalMessage({ type: "error", text: data.error || "Failed to update user" });
      }
    } catch {
      setModalMessage({ type: "error", text: "Network error updating user" });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Wallet Adjustment
  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setActionLoading(true);
    setModalMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAdjustment: walletForm,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setModalMessage({ type: "success", text: "Wallet adjusted successfully!" });
        emitSyncEvent("AUTH_SESSION_CHANGED");
        setTimeout(() => {
          setIsWalletModalOpen(false);
          fetchUsers(true);
        }, 1000);
      } else {
        setModalMessage({ type: "error", text: data.error || "Failed to adjust wallet" });
      }
    } catch {
      setModalMessage({ type: "error", text: "Network error adjusting wallet" });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Ban / Unban
  const handleToggleBan = async (user: EnrichedUser) => {
    const isBanning = user.status !== "BANNED";
    const confirmPrompt = window.confirm(
      isBanning
        ? `Are you sure you want to BAN user "${user.username}"? They will lose access to all arenas.`
        : `Unban user "${user.username}" and restore ACTIVE status?`
    );
    if (!confirmPrompt) return;

    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isBanning ? "BANNED" : "ACTIVE",
        }),
      });
      if (res.ok) {
        emitSyncEvent("USER_ROLE_UPDATED");
        emitSyncEvent("AUTH_SESSION_CHANGED");
        fetchUsers(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to change user status");
      }
    } catch {
      alert("Network error updating status");
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-red-950/60 via-[#0e111a] to-zinc-950 border border-red-500/30">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
              Authority Operations
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Gladiator & Host Directory</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Add, edit, inspect, and update roles, credentials, in-game IDs, and wallet balances for any platform user.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-950/40 border border-lime-500/30 text-lime-400 text-xs font-mono">
            <span className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
            <span className="font-bold tracking-wider">LIVE SYNC (4s)</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchUsers(false)}
            className="text-xs"
            title="Refresh directory"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setModalMessage(null);
              setIsAddModalOpen(true);
            }}
            className="text-xs font-black shadow-lg shadow-red-950/40"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add New User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.08]">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Accounts</span>
          <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.08]">
          <span className="text-[10px] font-bold text-lime-400 uppercase">Contenders</span>
          <div className="text-2xl font-black text-lime-400 mt-1">{stats.totalPlayers}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.08]">
          <span className="text-[10px] font-bold text-violet-400 uppercase">Verified Hosts</span>
          <div className="text-2xl font-black text-violet-400 mt-1">{stats.totalOrganizers}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.08]">
          <span className="text-[10px] font-bold text-red-400 uppercase">Master Admins</span>
          <div className="text-2xl font-black text-red-400 mt-1">{stats.totalAdmins}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0e111a] border border-white/[0.08]">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Banned Accounts</span>
          <div className="text-2xl font-black text-zinc-400 mt-1">{stats.totalBanned}</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl bg-[#0e111a] border border-white/[0.08]">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by username, email, IGN, or UID..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-bold focus:outline-none focus:border-red-500/50 cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="PLAYER">Players Only</option>
            <option value="ORGANIZER">Organizers Only</option>
            <option value="ADMIN">Admins Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 font-bold focus:outline-none focus:border-red-500/50 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl bg-[#0e111a] border border-white/[0.08] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0a0c13] text-zinc-400 border-b border-zinc-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">In-Game IDs</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-red-500" />
                    Loading user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500 italic">
                    No users found matching your search criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const role = u.role?.toUpperCase();
                  const isBanned = u.status === "BANNED";

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-zinc-900/40 transition-colors"
                    >
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-violet-600 to-lime-500 flex items-center justify-center text-xs font-black text-black shrink-0">
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {u.username}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            role === "ADMIN"
                              ? "bg-red-600/20 text-red-400 border border-red-500/40"
                              : role === "ORGANIZER"
                              ? "bg-violet-600/20 text-violet-300 border border-violet-500/40"
                              : "bg-lime-500/20 text-lime-400 border border-lime-500/40"
                          }`}
                        >
                          {role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            u.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : u.status === "SUSPENDED"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Wallet Balance */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-lime-400 text-sm">
                            ₹{u.wallet?.balance || 0}
                          </span>
                          <button
                            onClick={() => handleOpenWallet(u)}
                            className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                            title="Quick Adjust Wallet"
                          >
                            <Wallet className="h-3 w-3" />
                          </button>
                        </div>
                      </td>

                      {/* In-Game IDs */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] text-zinc-300 space-y-0.5">
                          {u.profile?.freeFireId && (
                            <div>
                              <span className="text-zinc-500 text-[10px]">FF: </span>
                              <span className="font-mono text-zinc-200">
                                {u.profile.freeFireId}
                              </span>
                            </div>
                          )}
                          {u.profile?.bgmiId && (
                            <div>
                              <span className="text-zinc-500 text-[10px]">BGMI: </span>
                              <span className="font-mono text-zinc-200">
                                {u.profile.bgmiId}
                              </span>
                            </div>
                          )}
                          {!u.profile?.freeFireId && !u.profile?.bgmiId && (
                            <span className="text-zinc-500 italic text-[10px]">
                              {u.profile?.gamerTag ? `IGN: ${u.profile.gamerTag}` : "No game IDs linked"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEdit(u)}
                            className="text-xs h-7 px-2"
                            title="Edit User Details"
                          >
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>

                          <button
                            onClick={() => handleToggleBan(u)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isBanned
                                ? "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                                : "bg-red-950/40 text-red-400 hover:bg-red-900/60"
                            }`}
                            title={isBanned ? "Unban User" : "Ban User"}
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded bg-zinc-900 border border-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 1: ADD NEW USER                                     */}
      {/* ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Platform User"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          {modalMessage && (
            <Alert variant={modalMessage.type === "success" ? "success" : "error"}>
              {modalMessage.text}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Username"
              placeholder="e.g. assassin99"
              value={addForm.username}
              onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Password"
              type="password"
              placeholder="Min 6 characters"
              value={addForm.password}
              onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              required
            />
            <div>
              <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                Assign System Role
              </label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="PLAYER">PLAYER (Contender)</option>
                <option value="ORGANIZER">ORGANIZER (Tournament Host)</option>
                <option value="ADMIN">ADMIN (Full Authority)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <Input
              label="In-Game Gamer Tag"
              placeholder="e.g. SoulMortal"
              value={addForm.gamerTag}
              onChange={(e) => setAddForm({ ...addForm, gamerTag: e.target.value })}
            />
            <Input
              label="Free Fire MAX UID"
              placeholder="e.g. 782910291"
              value={addForm.freeFireId}
              onChange={(e) => setAddForm({ ...addForm, freeFireId: e.target.value })}
            />
            <Input
              label="BGMI Character ID"
              placeholder="e.g. 519284910"
              value={addForm.bgmiId}
              onChange={(e) => setAddForm({ ...addForm, bgmiId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <Input
              label="Initial Wallet Credit (₹)"
              type="number"
              placeholder="0"
              value={addForm.initialBalance}
              onChange={(e) => setAddForm({ ...addForm, initialBalance: Number(e.target.value) })}
            />
            {addForm.role === "ORGANIZER" && (
              <Input
                label="Organization / Clan Name"
                placeholder="e.g. Global Esports"
                value={addForm.organizationName}
                onChange={(e) => setAddForm({ ...addForm, organizationName: e.target.value })}
              />
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={actionLoading}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 2: EDIT USER DETAILS                                */}
      {/* ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.username || ""}`}
        maxWidth="xl"
      >
        <form onSubmit={handleUpdateUser} className="space-y-4">
          {modalMessage && (
            <Alert variant={modalMessage.type === "success" ? "success" : "error"}>
              {modalMessage.text}
            </Alert>
          )}

          {/* Section 1: Credentials & Role */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">
              1. Platform Account & Role
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Platform Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="PLAYER">PLAYER (Contender)</option>
                  <option value="ORGANIZER">ORGANIZER (Host)</option>
                  <option value="ADMIN">ADMIN (Master Authority)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  Account Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="BANNED">BANNED (Anti-Cheat)</option>
                </select>
              </div>

              <Input
                label="Reset Password (Optional)"
                type="password"
                placeholder="Leave blank to keep"
                value={editForm.newPassword}
                onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
              />
            </div>
          </div>

          {/* Section 2: In-Game Esports Identity */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <h4 className="text-xs font-bold text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gamepad2 className="h-3.5 w-3.5" /> 2. In-Game Esports Profile
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Gamer Tag"
                value={editForm.gamerTag}
                onChange={(e) => setEditForm({ ...editForm, gamerTag: e.target.value })}
              />
              <Input
                label="Free Fire MAX UID"
                value={editForm.freeFireId}
                onChange={(e) => setEditForm({ ...editForm, freeFireId: e.target.value })}
              />
              <Input
                label="BGMI Character ID"
                value={editForm.bgmiId}
                onChange={(e) => setEditForm({ ...editForm, bgmiId: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Organizer Profile if applicable */}
          {(editForm.role === "ORGANIZER" || selectedUser?.organizerProfile) && (
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> 3. Host Verification & Clan
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Organization / Clan Name"
                  value={editForm.organizationName}
                  onChange={(e) => setEditForm({ ...editForm, organizationName: e.target.value })}
                />
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="orgVerified"
                    checked={editForm.organizerVerified}
                    onChange={(e) => setEditForm({ ...editForm, organizerVerified: e.target.checked })}
                    className="rounded bg-zinc-900 border-zinc-800 text-violet-600 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                  <label htmlFor="orgVerified" className="text-xs font-bold text-white cursor-pointer">
                    Grant Verified Organizer Badge
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <span className="text-[11px] text-zinc-500">
              All modifications are recorded in the security Audit Log.
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={actionLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ────────────────────────────────────────────────────────── */}
      {/* MODAL 3: WALLET BALANCE ADJUSTMENT                         */}
      {/* ────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        title={`Adjust Wallet: ${selectedUser?.username || ""}`}
        maxWidth="md"
      >
        <form onSubmit={handleWalletSubmit} className="space-y-4">
          {modalMessage && (
            <Alert variant={modalMessage.type === "success" ? "success" : "error"}>
              {modalMessage.text}
            </Alert>
          )}

          <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Current Wallet Balance:</span>
            <span className="font-mono text-lg font-black text-lime-400">
              ₹{selectedUser?.wallet?.balance || 0}
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 block mb-1.5">
              Adjustment Action
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setWalletForm({ ...walletForm, type: "ADD" })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  walletForm.type === "ADD"
                    ? "bg-lime-500 text-black shadow-md shadow-lime-500/20"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Plus className="h-3 w-3" /> Credit (Add)
              </button>
              <button
                type="button"
                onClick={() => setWalletForm({ ...walletForm, type: "DEDUCT" })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  walletForm.type === "DEDUCT"
                    ? "bg-red-600 text-white shadow-md shadow-red-950/40"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                <Minus className="h-3 w-3" /> Debit (Cut)
              </button>
              <button
                type="button"
                onClick={() => setWalletForm({ ...walletForm, type: "SET" })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                  walletForm.type === "SET"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-950/40"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                }`}
              >
                Exact Set
              </button>
            </div>
          </div>

          <Input
            label="Amount (₹)"
            type="number"
            min="0"
            value={walletForm.amount}
            onChange={(e) => setWalletForm({ ...walletForm, amount: Number(e.target.value) })}
            required
          />

          <Input
            label="Reason for Adjustment"
            placeholder="e.g. Scrim prize compensation, test refund"
            value={walletForm.reason}
            onChange={(e) => setWalletForm({ ...walletForm, reason: e.target.value })}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsWalletModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={actionLoading}
            >
              Apply Adjustment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
