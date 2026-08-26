"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  ChevronRight,
  Edit,
  Check,
  User,
  Users,
  Shield,
  ArrowLeft,
  Loader2,
  CheckSquare,
  Square,
  Lock,
} from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getUsersReportView, getRoles, updateUser } from "@/features/employees/api/employees.api";

// Fallback roles if API returns empty
const DEFAULT_FALLBACK_ROLES = ["Administrator", "Employee", "Edit Tax", "Manager"];

// Helper to deduplicate role names case-insensitively and cleanly
const deduplicateRoles = (roles: (string | undefined | null)[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  roles.forEach((r) => {
    if (!r) return;
    const trimmed = String(r).trim();
    if (trimmed && !seen.has(trimmed.toLowerCase())) {
      seen.add(trimmed.toLowerCase());
      result.push(trimmed);
    }
  });
  return result.length > 0 ? result : ["Employee"];
};

export const UsersManagementView: React.FC = () => {
  // Main Top-Right Navigation Tab ("list-of-users" | "assign-roles")
  const [activeTab, setActiveTab] = useState<"list-of-users" | "assign-roles">("list-of-users");

  // View state within List of Users tab ("list" | "details" | "add-edit")
  const [listViewState, setListViewState] = useState<"list" | "details" | "add-edit">("list");

  // Users Dataset state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected User for details / editing
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // Available Roles from Backend API
  const [availableRolesList, setAvailableRolesList] = useState<any[]>([]);

  // Form State for Add / Edit User
  const [formData, setFormData] = useState({
    username: "",
    employeeCode: "",
    displayName: "",
    status: "Active",
    password: "",
    confirmPassword: "",
    note: "",
    selectedRoles: ["Employee"] as string[],
  });

  // Assign Roles Tab state
  const [roleToAssign, setRoleToAssign] = useState("Employee");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isAssigningRoles, setIsAssigningRoles] = useState(false);

  // Derived role names
  const availableRoleNames = useMemo(() => {
    if (availableRolesList.length > 0) {
      return availableRolesList.map((r: any) => r.roleName);
    }
    return DEFAULT_FALLBACK_ROLES;
  }, [availableRolesList]);

  // Fetch users list and roles from backend API on mount
  const loadUsersData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.allSettled([
        getUsersReportView({ companyId: 2 }),
        getRoles(),
      ]);

      // 1. Process Roles
      if (rolesRes.status === "fulfilled" && Array.isArray(rolesRes.value) && rolesRes.value.length > 0) {
        setAvailableRolesList(rolesRes.value);
        setRoleToAssign((prev) => {
          const exists = rolesRes.value.some((r: any) => r.roleName === prev);
          return exists ? prev : (rolesRes.value[0]?.roleName || "Employee");
        });
      }

      // 2. Process Users
      if (usersRes.status === "fulfilled" && usersRes.value?.success && Array.isArray(usersRes.value.data) && usersRes.value.data.length > 0) {
        const mapped = usersRes.value.data.map((u: any, idx: number) => {
          const rawRoles = u.roles && u.roles.length > 0
            ? u.roles.map((r: any) => (typeof r === "string" ? r : r.roleName))
            : ["Employee"];
          const cleanRoles = deduplicateRoles(rawRoles);

          return {
            sNo: idx + 1,
            userId: u.userId,
            code: u.employeeCode || `ST00${String(u.userId).padStart(3, "0")}`,
            username: u.officialEmail || `${(u.firstName || "").toLowerCase()}@saanvitechin.com`,
            displayName: `${u.firstName || ""} ${u.lastName || ""}`.trim().toUpperCase() || "USER",
            firstName: u.firstName,
            lastName: u.lastName,
            status: u.status === "INACTIVE" ? "InActive" : "Active",
            isActive: u.status !== "INACTIVE",
            rolesAssigned: cleanRoles.join(", "),
            rolesList: cleanRoles,
            note: u.note || "",
          };
        });
        setUsersList(mapped);
      } else {
        // Fallback default sample data to match screenshot
        setUsersList([
          { sNo: 1, userId: 1, code: "ST00001", username: "chinmaya1@saanvitechin.com", displayName: "CHINMAYA BAIRY", status: "Active", isActive: true, rolesAssigned: "Employee, Administrator", rolesList: ["Employee", "Administrator"], note: "" },
          { sNo: 2, userId: 2, code: "ST00002", username: "veena@saanvitechin.com", displayName: "Veena", status: "Active", isActive: true, rolesAssigned: "Employee", rolesList: ["Employee"], note: "" },
          { sNo: 3, userId: 3, code: "ST00006", username: "shreenidhi@saanvitechin.com", displayName: "Shreenidhi", status: "Active", isActive: true, rolesAssigned: "Employee, Administrator", rolesList: ["Employee", "Administrator"], note: "" },
          { sNo: 4, userId: 4, code: "ST00016", username: "shilpa.m@saanvitechin.com", displayName: "Shilpa", status: "Active", isActive: true, rolesAssigned: "Employee", rolesList: ["Employee"], note: "" },
          { sNo: 5, userId: 5, code: "ST00030", username: "mishel.m@saanvitechin.com", displayName: "Mishel", status: "Active", isActive: true, rolesAssigned: "Employee", rolesList: ["Employee"], note: "" },
        ]);
      }
    } catch (err) {
      console.error("Failed to load users for management view:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, []);

  // Filtered list based on search query
  const filteredUsers = useMemo(() => {
    return usersList.filter((user) => {
      const q = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q) ||
        user.code.toLowerCase().includes(q) ||
        user.rolesAssigned.toLowerCase().includes(q)
      );
    });
  }, [usersList, searchQuery]);

  // Paginated users slice
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Toggle user active status switch
  const handleToggleStatus = (userId: number) => {
    const targetUser = usersList.find((u) => u.userId === userId);
    if (targetUser) {
      const newActive = !targetUser.isActive;
      toast.success(`User ${targetUser.displayName} status updated to ${newActive ? "Active" : "InActive"}`);
    }

    setUsersList((prev) =>
      prev.map((u) => {
        if (u.userId === userId) {
          const newActive = !u.isActive;
          return {
            ...u,
            isActive: newActive,
            status: newActive ? "Active" : "InActive",
          };
        }
        return u;
      })
    );
  };

  // Open User Details
  const handleOpenDetails = (user: any) => {
    setSelectedUser(user);
    setListViewState("details");
  };

  // Open Add User Form
  const handleOpenAddUser = () => {
    setSelectedUser(null);
    setFormData({
      username: "",
      employeeCode: "",
      displayName: "",
      status: "Active",
      password: "",
      confirmPassword: "",
      note: "",
      selectedRoles: ["Employee"],
    });
    setListViewState("add-edit");
  };

  // Open Edit User Form
  const handleOpenEditUser = (user: any) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      employeeCode: user.code,
      displayName: user.displayName,
      status: user.status,
      password: "",
      confirmPassword: "",
      note: user.note || "",
      selectedRoles: user.rolesList || ["Employee"],
    });
    setListViewState("add-edit");
  };

  // Save Add/Edit Form
  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username) {
      toast.error("Please enter a valid Username");
      return;
    }

    const cleanRoles = deduplicateRoles(formData.selectedRoles);

    if (selectedUser) {
      // Editing existing user
      setUsersList((prev) =>
        prev.map((u) => {
          if (u.userId === selectedUser.userId) {
            return {
              ...u,
              username: formData.username,
              code: formData.employeeCode || u.code,
              displayName: formData.displayName.toUpperCase() || u.displayName,
              status: formData.status,
              isActive: formData.status === "Active",
              rolesList: cleanRoles,
              rolesAssigned: cleanRoles.join(", "),
              note: formData.note,
            };
          }
          return u;
        })
      );
      toast.success("User details updated successfully!");
    } else {
      // Adding new user
      const newId = Date.now();
      const newUser = {
        sNo: usersList.length + 1,
        userId: newId,
        code: formData.employeeCode || `ST00${String(usersList.length + 1).padStart(3, "0")}`,
        username: formData.username,
        displayName: formData.displayName.toUpperCase() || "NEW USER",
        status: formData.status,
        isActive: formData.status === "Active",
        rolesList: cleanRoles,
        rolesAssigned: cleanRoles.join(", "),
        note: formData.note,
      };
      setUsersList((prev) => [newUser, ...prev]);
      toast.success("New user created successfully!");
    }

    setListViewState("list");
  };

  // Batch Select / Unselect helper for Assign Roles tab
  const handleToggleSelectUser = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.userId));
    }
  };

  const handleAssignRoleBatch = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one employee from the list");
      return;
    }

    setIsAssigningRoles(true);
    try {
      // Find roleId if available in availableRolesList
      const targetRoleObj = availableRolesList.find((r) => r.roleName === roleToAssign);
      const targetRoleId = targetRoleObj?.roleId;

      // Update backend in parallel for selected users if roleId is resolved
      if (targetRoleId) {
        await Promise.allSettled(
          selectedUserIds.map((uId) => {
            const userObj = usersList.find((u) => u.userId === uId);
            const currentRoleNames: string[] = userObj?.rolesList || [];
            // Map existing role names to IDs
            const existingRoleIds = currentRoleNames
              .map((rName) => availableRolesList.find((r) => r.roleName === rName)?.roleId)
              .filter(Boolean);
            const mergedIds = Array.from(new Set([...existingRoleIds, targetRoleId]));
            return updateUser(uId, { roleIds: mergedIds });
          })
        );
      }

      setUsersList((prev) =>
        prev.map((u) => {
          if (selectedUserIds.includes(u.userId)) {
            const updated = deduplicateRoles([...(u.rolesList || []), roleToAssign]);
            return {
              ...u,
              rolesList: updated,
              rolesAssigned: updated.join(", "),
            };
          }
          return u;
        })
      );

      toast.success(`Role '${roleToAssign}' assigned to ${selectedUserIds.length} selected employee(s)!`);
    } catch (err) {
      console.error("Error assigning roles in batch:", err);
      toast.error("Failed to assign role to all selected users.");
    } finally {
      setIsAssigningRoles(false);
      setSelectedUserIds([]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row with Title & Right-Corner Tab Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Users</h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage corporate system user accounts, access roles, and permissions
          </p>
        </div>

        {/* Top-Right Navigation Tabs: [ List of Users | Assign roles ] */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => {
              setActiveTab("list-of-users");
              setListViewState("list");
            }}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "list-of-users"
                ? "bg-white text-brand-primary shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            List of Users
          </button>
          <button
            onClick={() => setActiveTab("assign-roles")}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === "assign-roles"
                ? "bg-white text-brand-primary shadow-xs border border-slate-200/60"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Assign roles
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIST OF USERS */}
      {/* ========================================================================= */}
      {activeTab === "list-of-users" && (
        <>
          {/* STATE A: TABLE LIST VIEW */}
          {listViewState === "list" && (
            <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-2xs space-y-6">
              {/* Sub-Header & Breadcrumb Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="text-slate-700">Users</span>
                  <span>&gt;</span>
                  <span className="text-brand-primary">List of Users</span>
                </div>

                {/* Primary Action Button: + Add User */}
                <button
                  onClick={handleOpenAddUser}
                  className="px-5 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text text-xs font-extrabold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>

              {/* Search Control Bar */}
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search table items"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary shadow-2xs"
                  />
                </div>
              </div>

              {/* Users Data Table */}
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead className="w-16">S No.</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Roles Assigned</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="w-12 text-center"></TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary mb-2" />
                          <span className="text-xs font-bold">Loading users data...</span>
                        </TableCell>
                      </TableRow>
                    ) : paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.userId}>
                          <TableCell className="font-mono text-xs text-slate-500">{user.sNo}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-slate-700">{user.code}</TableCell>
                          <TableCell className="font-mono text-xs text-slate-600">{user.username}</TableCell>
                          <TableCell className="font-bold text-slate-800 text-xs">{user.displayName}</TableCell>
                          <TableCell className="text-xs text-slate-600 font-medium">{user.rolesAssigned}</TableCell>
                          <TableCell className="text-center">
                            {/* Toggle Switch */}
                            <button
                              onClick={() => handleToggleStatus(user.userId)}
                              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 inline-flex items-center ${
                                user.isActive ? "bg-brand-primary" : "bg-slate-300"
                              }`}
                              title={`Status: ${user.status}`}
                            >
                              <span
                                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                                  user.isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </TableCell>
                          <TableCell className="text-center">
                            <button
                              onClick={() => handleOpenDetails(user)}
                              className="p-1.5 text-slate-400 hover:text-brand-primary rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                          No users found matching search query.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Table Footer Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
                <div>
                  Showing {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
                  {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} entries
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span>Show</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-pointer shadow-2xs"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span>entries</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-600 disabled:opacity-40 cursor-pointer"
                    >
                      &lt;
                    </button>
                    <span className="px-3 py-1 bg-brand-primary text-brand-btn-text rounded-lg font-mono">
                      {currentPage}
                    </span>
                    <button
                      disabled={currentPage * pageSize >= filteredUsers.length}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-600 disabled:opacity-40 cursor-pointer"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STATE B: USER DETAILS VIEW */}
          {listViewState === "details" && selectedUser && (
            <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-2xs space-y-8 animate-fade-in">
              {/* Header with Breadcrumb & Edit Details trigger */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <button
                    onClick={() => setListViewState("list")}
                    className="hover:underline cursor-pointer"
                  >
                    Users
                  </button>
                  <span>&gt;</span>
                  <button
                    onClick={() => setListViewState("list")}
                    className="hover:underline cursor-pointer"
                  >
                    List of Users
                  </button>
                  <span>&gt;</span>
                  <span className="text-brand-primary">User details</span>
                </div>

                <button
                  onClick={() => handleOpenEditUser(selectedUser)}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-primary hover:underline cursor-pointer self-start sm:self-auto"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>

              {/* Four Main Metadata Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Username
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    {selectedUser.username}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Employee Code
                  </span>
                  <p className="text-xs font-mono font-bold text-slate-800">
                    {selectedUser.code}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Display Name
                  </span>
                  <p className="text-xs font-extrabold text-slate-800">
                    {selectedUser.displayName}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Status
                  </span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Note Section */}
              <div className="space-y-1.5 pb-6 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Note
                </span>
                <p className="text-xs text-slate-500 font-medium italic">
                  {selectedUser.note || "No custom notes configured for this account."}
                </p>
              </div>

              {/* Assigned Roles List Section */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Roles
                </h4>
                <div className="space-y-2">
                  {availableRoleNames.map((roleName) => {
                    const isAssigned = (selectedUser.rolesList || []).includes(roleName);
                    return (
                      <div key={roleName} className="flex items-center gap-2.5 text-xs">
                        {isAssigned ? (
                          <Check className="w-4 h-4 text-emerald-500 font-bold" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                        <span className={`font-bold ${isAssigned ? "text-slate-800" : "text-slate-400"}`}>
                          {roleName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STATE C: ADD / EDIT USER FORM */}
          {listViewState === "add-edit" && (
            <form onSubmit={handleSaveUserForm} className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-2xs space-y-8 animate-fade-in">
              {/* Header with Breadcrumb */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <button
                    type="button"
                    onClick={() => setListViewState("list")}
                    className="hover:underline cursor-pointer"
                  >
                    Users
                  </button>
                  <span>&gt;</span>
                  <button
                    type="button"
                    onClick={() => setListViewState("list")}
                    className="hover:underline cursor-pointer"
                  >
                    List of Users
                  </button>
                  <span>&gt;</span>
                  <span className="text-brand-primary">
                    {selectedUser ? "Edit User details" : "User details"}
                  </span>
                </div>
              </div>

              {/* Form Grid Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData((p) => ({ ...p, username: e.target.value }))}
                    placeholder="e.g. user@domain.com"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Employee Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.employeeCode}
                      onChange={(e) => setFormData((p) => ({ ...p, employeeCode: e.target.value }))}
                      placeholder="Search by name or #code"
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData((p) => ({ ...p, displayName: e.target.value }))}
                    placeholder="e.g. CHINMAYA BAIRY"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="InActive">InActive</option>
                  </select>
                </div>
              </div>

              {/* Form Grid Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Note
                  </label>
                  <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Optional administrative notes"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs"
                  />
                </div>
              </div>

              {/* Roles Checkboxes */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Roles
                </label>
                <div className="space-y-2">
                  {availableRoleNames.map((roleName) => {
                    const isChecked = formData.selectedRoles.includes(roleName);
                    return (
                      <label key={roleName} className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData((p) => ({
                                ...p,
                                selectedRoles: [...p.selectedRoles, roleName],
                              }));
                            } else {
                              setFormData((p) => ({
                                ...p,
                                selectedRoles: p.selectedRoles.filter((r) => r !== roleName),
                              }));
                            }
                          }}
                          className="w-4 h-4 rounded text-brand-primary border-slate-300 focus:ring-brand-primary cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {roleName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setListViewState("list")}
                  className="px-5 py-2 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text text-xs font-extrabold rounded-xl shadow-2xs transition-all cursor-pointer"
                >
                  {selectedUser ? "Save Changes" : "Add User"}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ASSIGN ROLES */}
      {/* ========================================================================= */}
      {activeTab === "assign-roles" && (
        <div className="bg-white border border-slate-200/70 rounded-3xl p-6 shadow-2xs space-y-6">
          {/* Sub-Header & Breadcrumb Bar */}
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 border-b border-slate-100 pb-4">
            <span className="text-slate-700">Users</span>
            <span>&gt;</span>
            <span className="text-brand-primary">Assign role</span>
          </div>

          {/* Top Section: Select Role Dropdown + Assign Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-b border-slate-100 pb-6">
            <select
              value={roleToAssign}
              onChange={(e) => setRoleToAssign(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-brand-primary shadow-2xs cursor-pointer min-w-[200px]"
            >
              {availableRoleNames.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            <button
              onClick={handleAssignRoleBatch}
              disabled={isAssigningRoles}
              className="px-6 py-2.5 bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text text-xs font-extrabold rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {isAssigningRoles && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isAssigningRoles ? "Assigning..." : "Assign"}</span>
            </button>
          </div>

          {/* Search & Selected Count Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search table items"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-brand-primary shadow-2xs"
              />
            </div>

            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl self-start sm:self-auto">
              Selected Employees - {selectedUserIds.length}
            </span>
          </div>

          {/* Batch Selection Table */}
          <TableContainer>
            <Table>
              <TableHeader>
                <tr>
                  <TableHead className="w-12 text-center">
                    <button
                      onClick={handleSelectAllUsers}
                      className="cursor-pointer text-slate-400 hover:text-white"
                      title="Select / Unselect All"
                    >
                      {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-brand-accent" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="w-16">S No.</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Employee Name</TableHead>
                  <TableHead>Employee Code</TableHead>
                  <TableHead>Roles Assigned</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isChecked = selectedUserIds.includes(user.userId);
                    return (
                      <TableRow key={user.userId}>
                        <TableCell className="text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelectUser(user.userId)}
                            className="w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">{user.sNo}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-600">{user.username}</TableCell>
                        <TableCell className="font-bold text-slate-800 text-xs">{user.displayName}</TableCell>
                        <TableCell className="font-mono text-xs font-bold text-slate-700">{user.code}</TableCell>
                        <TableCell className="text-xs text-slate-600 font-medium">{user.rolesAssigned}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                      No employees available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
    </div>
  );
};
