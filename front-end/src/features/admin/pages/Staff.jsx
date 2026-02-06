import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { staffAPI, getAssetUrl } from "@shared/utils/api.js";
import { useToast } from "@shared/context/ToastContext";
import { useConfirm } from "@shared/context/ConfirmContext";
import { useTranslation } from "react-i18next";
import "../styles/dashboard.css";
import "../styles/pages.css";

// SVG Icons
const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return createPortal(
        <div className="modalBackdrop" onMouseDown={onClose}>
            <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="modalHead">
                    <div className="modalTitle">{title}</div>
                    <button className="iconBtn" type="button" onClick={onClose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="modalBody">{children}</div>
            </div>
        </div>,
        document.body
    );
}

function StatusBadge({ status }) {
    const { t } = useTranslation();
    if (status === "ACTIVE") return <span className="pill ok">{t("status.active")}</span>;
    if (status === "LOCKED") return <span className="pill cancel">{t("status.locked")}</span>;
    return <span className="pill pending">{status}</span>;
}

const emptyForm = {
    username: "",
    email: "",
    fullName: "",
    phone: "",
    roleId: "",
    password: "",
    confirmPassword: "",
};

export default function Staff() {
    const { t } = useTranslation();
    const [staffList, setStaffList] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");

    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();
    const { showConfirm } = useConfirm();

    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordStaff, setPasswordStaff] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const ROLES = [
        { value: "ADMIN", label: t("staff.role_admin") },
        { value: "STAFF", label: t("staff.role_staff") },
        { value: "MANAGER", label: t("staff.role_manager") },
    ];

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [staffData, rolesData] = await Promise.all([
                staffAPI.getAll(),
                staffAPI.getRoles().catch(() => ROLES),
            ]);
            setStaffList(staffData || []);
            setRoles(rolesData || ROLES);
        } catch (error) {
            console.error("Failed to load staff:", error);
        } finally {
            setLoading(false);
        }
    }

    const editing = useMemo(
        () => staffList.find((s) => s.id === editingId) || null,
        [staffList, editingId]
    );

    const filtered = useMemo(() => {
        return staffList.filter((s) => {
            if (roleFilter !== "all" && s.roleName !== roleFilter) return false;
            const text = `${s.username || ""} ${s.fullName || ""} ${s.email || ""} ${s.phone || ""}`.toLowerCase();
            return !q || text.includes(q.toLowerCase());
        });
    }, [staffList, q, roleFilter]);

    // Role counts for chips
    const roleCounts = useMemo(() => {
        const counts = { all: staffList.length };
        staffList.forEach((s) => {
            if (s.roleName) {
                counts[s.roleName] = (counts[s.roleName] || 0) + 1;
            }
        });
        return counts;
    }, [staffList]);

    const uniqueRoles = useMemo(() => {
        return [...new Set(staffList.map((s) => s.roleName).filter(Boolean))];
    }, [staffList]);

    function openAdd() {
        setEditingId(null);
        setForm(emptyForm);
        setEditOpen(true);
    }

    function openEdit(s) {
        setEditingId(s.id);
        setForm({
            username: s.username || "",
            email: s.email || "",
            fullName: s.fullName || "",
            phone: s.phone || "",
            roleId: s.roleId ? String(s.roleId) : "",
            password: "",
            confirmPassword: "",
        });
        setEditOpen(true);
    }

    async function save() {
        if (!form.username || !form.email || !form.fullName) {
            showToast(t("staff.validate_info"), "error");
            return;
        }

        if (!editingId && (!form.password || form.password !== form.confirmPassword)) {
            showToast(t("staff.validate_password"), "error");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                username: form.username,
                email: form.email,
                fullName: form.fullName,
                phone: form.phone,
                roleId: form.roleId ? Number(form.roleId) : null,
                password: form.password || undefined,
            };

            if (editingId) {
                await staffAPI.update(editingId, payload);
            } else {
                await staffAPI.create(payload);
            }
            await loadData();
            setEditOpen(false);
            showToast(editingId ? t("staff.msg_update_success") : t("staff.msg_create_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(s) {
        try {
            await staffAPI.toggleStatus(s.id);
            await loadData();
            showToast(t("staff.msg_toggle_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        }
    }

    async function deleteStaff(s) {
        if (!(await showConfirm(t("common.confirm_delete_title"), t("staff.delete_confirm", { name: s.fullName })))) return;
        try {
            await staffAPI.delete(s.id);
            await loadData();
            showToast(t("staff.msg_delete_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        }
    }

    function openPasswordModal(s) {
        setPasswordStaff(s);
        setNewPassword("");
        setConfirmNewPassword("");
        setPasswordOpen(true);
    }

    async function changePassword() {
        if (!newPassword || newPassword !== confirmNewPassword) {
            showToast(t("staff.validate_password"), "error");
            return;
        }
        setSaving(true);
        try {
            await staffAPI.changePassword(passwordStaff.id, newPassword);
            setPasswordOpen(false);
            showToast(t("staff.msg_password_success"));
        } catch (error) {
            showToast(error.message || "Error", "error");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="card">
                <div className="cardHead">
                    <div className="cardTitle">{t("staff.title")}</div>
                </div>
                <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
                    {t("common.loading")}
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="cardHead">
                <div>
                    <div className="cardTitle">{t("staff.title")}</div>
                    <div className="cardSub">{t("staff.subtitle", { count: staffList.length })}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    <input
                        className="miniInput"
                        placeholder={t("staff.search_placeholder")}
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="btnPrimary" type="button" onClick={openAdd}>
                        {t("staff.btn_add")}
                    </button>
                </div>
            </div>

            {/* Role Filter Chips */}
            <div className="chips" style={{ marginBottom: 16 }}>
                <button
                    className={`chip ${roleFilter === "all" ? "on" : ""}`}
                    onClick={() => setRoleFilter("all")}
                    type="button"
                >
                    {t("staff.tab_all")} ({roleCounts.all || 0})
                </button>
                {uniqueRoles.map((role) => (
                    <button
                        key={role}
                        className={`chip ${roleFilter === role ? "on" : ""}`}
                        onClick={() => setRoleFilter(role)}
                        type="button"
                    >
                        {t(`staff.role_${role.toLowerCase()}`)} ({roleCounts[role] || 0})
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="table">
                <div className="tr th">
                    <div>{t("staff.col_staff")}</div>
                    <div>{t("staff.col_contact")}</div>
                    <div>{t("staff.col_role")}</div>
                    <div>{t("staff.col_status")}</div>
                    <div>{t("staff.col_action")}</div>
                </div>
                {filtered.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
                        {t("staff.empty")}
                    </div>
                ) : (
                    filtered.map((s) => {
                        return (
                            <div className="tr" key={s.id}>
                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                    <div
                                        style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: "50%",
                                            background: "var(--admin-accent-gradient)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: "#0a0a0f",
                                        }}
                                    >
                                        {(s.fullName || s.username || "?").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{s.fullName || s.username}</div>
                                        <div className="mono" style={{ fontSize: 11, color: "var(--admin-text-muted)" }}>
                                            @{s.username}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 13 }}>{s.email}</div>
                                    <div style={{ fontSize: 12, color: "var(--admin-text-muted)" }}>{s.phone || "—"}</div>
                                </div>
                                <div>
                                    <span className="chip on" style={{ padding: "4px 10px", fontSize: 11 }}>
                                        {s.roleName || t("staff.not_assigned")}
                                    </span>
                                </div>
                                <div>
                                    <StatusBadge status={s.status} />
                                </div>
                                <div className="rowActions">
                                    <button className="linkBtn" type="button" onClick={() => openEdit(s)}>
                                        {t("common.edit")}
                                    </button>
                                    <button className="linkBtn" type="button" onClick={() => openPasswordModal(s)}>
                                        {t("staff.btn_change_password")}
                                    </button>
                                    <button
                                        className="linkBtn"
                                        type="button"
                                        onClick={() => toggleStatus(s)}
                                        style={{ color: s.status === "ACTIVE" ? "var(--admin-warning)" : "var(--admin-success)" }}
                                    >
                                        {s.status === "ACTIVE" ? t("staff.btn_lock") : t("staff.btn_unlock")}
                                    </button>
                                    <button
                                        className="linkBtn"
                                        type="button"
                                        onClick={() => deleteStaff(s)}
                                        style={{ color: "var(--admin-error)" }}
                                    >
                                        {t("common.delete")}
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Edit Modal */}
            <Modal
                open={editOpen}
                title={editing ? t("staff.modal_edit", { username: editing.username }) : t("staff.modal_add")}
                onClose={() => setEditOpen(false)}
            >
                <div className="formGrid">
                    <label className="field">
                        <span>{t("staff.label_username")}</span>
                        <input
                            value={form.username}
                            onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                            placeholder="username"
                            disabled={!!editingId}
                        />
                    </label>
                    <label className="field">
                        <span>{t("staff.label_fullname")}</span>
                        <input
                            value={form.fullName}
                            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                            placeholder="Nguyễn Văn A"
                        />
                    </label>
                    <label className="field">
                        <span>{t("staff.label_email")}</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                            placeholder="email@example.com"
                        />
                    </label>
                    <label className="field">
                        <span>{t("staff.label_phone")}</span>
                        <input
                            value={form.phone}
                            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                            placeholder="0901234567"
                        />
                    </label>
                    <label className="field">
                        <span>{t("staff.label_role")}</span>
                        <select
                            value={form.roleId}
                            onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
                            className="form-select"
                        >
                            <option value="">{t("staff.label_role_placeholder")}</option>
                            {(roles.length > 0 ? roles : ROLES).map((r) => (
                                <option key={r.id || r.value} value={r.id || r.value}>
                                    {r.name || r.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    {!editingId && (
                        <>
                            <label className="field">
                                <span>{t("staff.label_password")}</span>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                />
                            </label>
                            <label className="field">
                                <span>{t("staff.label_confirm_password")}</span>
                                <input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                                    placeholder="••••••••"
                                />
                            </label>
                        </>
                    )}
                </div>
                <div className="modalActions">
                    <button className="btnGhost" type="button" onClick={() => setEditOpen(false)}>
                        {t("common.cancel")}
                    </button>
                    <button className="btnPrimary" type="button" onClick={save} disabled={saving}>
                        {saving ? t("products.gallery_saving") : editing ? t("common.save") : t("common.add")}
                    </button>
                </div>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                open={passwordOpen}
                title={t("staff.modal_password", { username: passwordStaff?.username || "" })}
                onClose={() => setPasswordOpen(false)}
            >
                <div className="formGrid">
                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span>{t("staff.label_new_password")}</span>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder={t("staff.placeholder_new_password")}
                        />
                    </label>
                    <label className="field" style={{ gridColumn: "1 / -1" }}>
                        <span>{t("staff.label_confirm_new_password")}</span>
                        <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder={t("staff.placeholder_confirm_new_password")}
                        />
                    </label>
                </div>
                <div className="modalActions">
                    <button className="btnGhost" type="button" onClick={() => setPasswordOpen(false)}>
                        {t("common.cancel")}
                    </button>
                    <button className="btnPrimary" type="button" onClick={changePassword} disabled={saving}>
                        {saving ? t("products.gallery_saving") : t("staff.btn_change_password")}
                    </button>
                </div>
            </Modal>
        </div>
    );
}
