import { useEffect, useState } from "react";
import { useAdminUserStore } from "@/stores/adminUserStore";
import type { AdminUserResponse, AdminCreateUserRequest, AdminUpdateUserRequest } from "@/types";
import {
    Users, Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight,
    Loader2, X, CheckCircle2, XCircle, ShieldCheck, RefreshCcw, ChevronUp, ChevronDown, ArrowUpDown
} from "lucide-react";

// ─── Toast ──────────────────────────────────────────────────────────────
function Toast({ msg, ok, onClose }: { msg: string; ok: boolean; onClose: () => void }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-xl ${ok ? "bg-emerald-500/90 text-white" : "bg-red-500/90 text-white"}`}>
            {ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            {msg}
        </div>
    );
}

// ─── User Form Dialog ───────────────────────────────────────────────────
interface UserFormProps {
    initial?: AdminUserResponse | null;
    onClose: () => void;
    onSubmit: (data: AdminCreateUserRequest | AdminUpdateUserRequest) => Promise<void>;
    isSaving: boolean;
}
function UserDialog({ initial, onClose, onSubmit, isSaving }: UserFormProps) {
    const isEdit = !!initial;
    const [name, setName] = useState(initial?.name ?? "");
    const [email, setEmail] = useState(initial?.email ?? "");
    const [role, setRole] = useState<"user" | "admin">(initial?.role ?? "user");
    const [profilePicture, setProfilePicture] = useState(initial?.profile_picture ?? "");

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        const data = isEdit
            ? { name, role, profile_picture: profilePicture || null } as AdminUpdateUserRequest
            : { name, email, role, profile_picture: profilePicture || null } as AdminCreateUserRequest;
        onSubmit(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                    <h2 className="text-base font-semibold text-white">
                        {isEdit ? "Edit User" : "Create User"}
                    </h2>
                    <button onClick={onClose} className="text-white/40 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    <div>
                        <label className="label-sm">Name *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required
                            className="input-field mt-1.5" placeholder="Full name" />
                    </div>
                    {!isEdit && (
                        <div>
                            <label className="label-sm">Email *</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="input-field mt-1.5" placeholder="user@example.com" />
                        </div>
                    )}
                    <div>
                        <label className="label-sm">Role</label>
                        <select value={role} onChange={(e) => setRole(e.target.value as "user" | "admin")}
                            className="input-field mt-1.5 [&>option]:bg-neutral-900">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-sm">Profile Picture URL</label>
                        <input value={profilePicture} onChange={(e) => setProfilePicture(e.target.value)}
                            className="input-field mt-1.5" placeholder="https://…" />
                    </div>
                    {isEdit && (
                        <p className="text-xs text-amber-400/70 bg-amber-500/5 rounded-lg px-3 py-2">
                            Note: Email cannot be changed after creation.
                        </p>
                    )}
                    <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                        <button type="button" onClick={onClose}
                            className="rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                        <button type="submit" disabled={isSaving}
                            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-black hover:bg-amber-400 disabled:opacity-60">
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isEdit ? "Save Changes" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Page ──────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
    const { users, pagination, isLoading, fetchUsers, createUser, updateUser, deleteUser, reactivateUser } = useAdminUserStore();

    const [search, setSearch] = useState("");
    const [role, setRole] = useState<"" | "user" | "admin">("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
    const [sortBy, setSortBy] = useState<"name" | "email" | "created_at">("created_at");
    const [orderBy, setOrderBy] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const PER_PAGE = 20;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AdminUserResponse | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<AdminUserResponse | null>(null);
    const [confirmReactivate, setConfirmReactivate] = useState<AdminUserResponse | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => setToast({ msg, ok });

    const load = (p = page) => fetchUsers({ search, role: role || undefined, status: statusFilter || undefined, sort_by: sortBy, order_by: orderBy, page: p, per_page: PER_PAGE });

    useEffect(() => { load(1); setPage(1); }, [search, role, statusFilter, sortBy, orderBy]);

    const handleSort = (field: "name" | "email" | "created_at") => {
        if (sortBy === field) {
            setOrderBy(orderBy === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setOrderBy("asc");
        }
    };

    const handleSave = async (data: AdminCreateUserRequest | AdminUpdateUserRequest) => {
        setIsSaving(true);
        let result: { success: boolean; message: string };
        if (editing) {
            result = await updateUser(editing.id, data as AdminUpdateUserRequest);
        } else {
            result = await createUser(data as AdminCreateUserRequest);
        }
        setIsSaving(false);
        if (result.success) {
            setDialogOpen(false);
            setEditing(null);
        }
        showToast(result.message, result.success);
    };

    const handleDelete = async (user: AdminUserResponse) => {
        const result = await deleteUser(user.id);
        if (result.success) setConfirmDelete(null);
        showToast(result.message, result.success);
        load();
    };

    const handleReactivate = async (user: AdminUserResponse) => {
        const result = await reactivateUser(user.id);
        if (result.success) setConfirmReactivate(null);
        showToast(result.message, result.success);
        load();
    };

    const openCreate = () => { setEditing(null); setDialogOpen(true); };
    const openEdit = (u: AdminUserResponse) => { setEditing(u); setDialogOpen(true); };
    const changePage = (p: number) => { setPage(p); fetchUsers({ search, role: role || undefined, status: statusFilter || undefined, sort_by: sortBy, order_by: orderBy, page: p, per_page: PER_PAGE }); };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {toast && <Toast msg={toast.msg} ok={toast.ok} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="h-6 w-6 text-amber-500" /> User Management
                    </h1>
                    <p className="mt-0.5 text-sm text-white/40">
                        {pagination ? `${pagination.total.toLocaleString()} users total` : "All users"}
                    </p>
                </div>
                <button onClick={openCreate}
                    className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
                    <Plus className="h-4 w-4" /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="mb-5 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…"
                        className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/50" />
                </div>
                <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/70 [&>option]:bg-neutral-900 outline-none">
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="h-9 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/70 [&>option]:bg-neutral-900 outline-none">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-white/5 bg-white/5">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-16 text-center text-sm text-white/30">No users found</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/5 text-xs font-medium uppercase tracking-wider text-white/30">
                                <th className="px-4 py-3 text-left cursor-pointer hover:text-white transition-colors group/th" onClick={() => handleSort("name")}>
                                    <div className="flex items-center gap-1">User {sortBy === "name" ? (orderBy === "asc" ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
                                </th>
                                <th className="px-4 py-3 text-left hidden sm:table-cell">Role</th>
                                <th className="px-4 py-3 text-left hidden md:table-cell">Provider</th>
                                <th className="px-4 py-3 text-left hidden lg:table-cell">Status</th>
                                <th className="px-4 py-3 text-left hidden xl:table-cell cursor-pointer hover:text-white transition-colors group/th" onClick={() => handleSort("created_at")}>
                                    <div className="flex items-center gap-1">Joined {sortBy === "created_at" ? (orderBy === "asc" ? <ChevronUp className="h-4 w-4 text-amber-500" /> : <ChevronDown className="h-4 w-4 text-amber-500" />) : <ArrowUpDown className="h-3 w-3 opacity-30" />}</div>
                                </th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((u) => (
                                <tr key={u.id} className="group transition-colors hover:bg-white/[0.03]">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {u.profile_picture ? (
                                                <img src={u.profile_picture} alt={u.name}
                                                    className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-white">{u.name}</p>
                                                <p className="truncate text-xs text-white/40">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${u.role === "admin" ? "bg-amber-500/15 text-amber-400" : "bg-blue-500/15 text-blue-400"}`}>
                                            {u.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-xs text-white/40 capitalize">
                                            {u.oauth_provider ?? "manual"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${u.deleted_at ? "bg-red-500/15 text-red-400" : "bg-emerald-500/15 text-emerald-400"}`}>
                                            {u.deleted_at ? "Inactive" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-white/30">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {u.deleted_at ? (
                                                <button onClick={() => setConfirmReactivate(u)}
                                                    className="rounded-lg p-1.5 text-white/40 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Reactivate user">
                                                    <RefreshCcw className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => openEdit(u)}
                                                        className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition-colors" title="Edit user">
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    {u.role !== "admin" && (
                                                        <button onClick={() => setConfirmDelete(u)}
                                                            className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Delete user">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-white/30">
                        Page {pagination.page} of {pagination.total_pages}
                    </p>
                    <div className="flex gap-2">
                        <button disabled={page <= 1} onClick={() => changePage(page - 1)}
                            className="rounded-lg p-2 text-white/40 hover:bg-white/5 disabled:opacity-30">
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button disabled={page >= pagination.total_pages} onClick={() => changePage(page + 1)}
                            className="rounded-lg p-2 text-white/40 hover:bg-white/5 disabled:opacity-30">
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Dialog */}
            {dialogOpen && (
                <UserDialog
                    initial={editing}
                    onClose={() => { setDialogOpen(false); setEditing(null); }}
                    onSubmit={handleSave}
                    isSaving={isSaving}
                />
            )}

            {/* Delete Confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] p-6 shadow-2xl">
                        <h2 className="text-base font-semibold text-white">Delete User?</h2>
                        <p className="mt-2 text-sm text-white/50">
                            "{confirmDelete.name}" will be soft-deleted.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setConfirmDelete(null)}
                                className="rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                            <button onClick={() => handleDelete(confirmDelete)}
                                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reactivate Confirm */}
            {confirmReactivate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[oklch(0.14_0.02_260)] p-6 shadow-2xl">
                        <h2 className="text-base font-semibold text-white">Reactivate User?</h2>
                        <p className="mt-2 text-sm text-white/50">
                            "{confirmReactivate.name}" will be reactivated and regain access.
                        </p>
                        <div className="mt-5 flex justify-end gap-3">
                            <button onClick={() => setConfirmReactivate(null)}
                                className="rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white">Cancel</button>
                            <button onClick={() => handleReactivate(confirmReactivate)}
                                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400">Reactivate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
