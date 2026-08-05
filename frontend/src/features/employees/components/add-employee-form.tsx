import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CreateEmployeeInput, RoleSelection, DepartmentSelection } from "../types/employees.types";
import { createEmployee, getRoles, getDepartments } from "../api/employees.api";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { UserRole } from "@/types/dashboard";

interface AddEmployeeFormProps {
  currentRole: UserRole;
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  currentRole,
  onCancel,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selection list states
  const [roles, setRoles] = useState<RoleSelection[]>([]);
  const [departments, setDepartments] = useState<DepartmentSelection[]>([]);

  // Form fields
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    employeeCode: "",
    officialEmail: "",
    password: "",
    phoneNumber: "",
    employmentType: "FULL_TIME" as CreateEmployeeInput["employmentType"],
    joiningDate: new Date().toISOString().split("T")[0],
    roleId: "",
    departmentId: "",
  });

  // Inline validation errors state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch dropdown selections on mount
  useEffect(() => {
    async function loadMetadata() {
      setIsFetchingMetadata(true);
      setErrorMsg(null);

      const [rolesRes, deptsRes] = await Promise.all([
        getRoles(),
        getDepartments(),
      ]);

      if (Array.isArray(rolesRes)) {
        setRoles(rolesRes);
      } else {
        setErrorMsg("Failed to load roles list.");
      }

      if (Array.isArray(deptsRes)) {
        setDepartments(deptsRes);
      } else {
        setErrorMsg((prev) => prev || "Failed to load departments list.");
      }

      setIsFetchingMetadata(false);
    }

    loadMetadata();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.employeeCode.trim()) errors.employeeCode = "Employee code is required";
    if (!formData.officialEmail.trim()) {
      errors.officialEmail = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.officialEmail)) {
      errors.officialEmail = "Invalid email format";
    }
    if (!formData.password) errors.password = "Password is required";
    if (!formData.joiningDate) errors.joiningDate = "Joining date is required";
    if (!formData.roleId) errors.roleId = "Role is required";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!validateForm()) return;

    setIsLoading(true);

    // Format fields for backend schema expectations
    const payload: CreateEmployeeInput = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      employeeCode: formData.employeeCode.trim(),
      officialEmail: formData.officialEmail.trim(),
      password: formData.password,
      phoneNumber: formData.phoneNumber.trim() || null,
      employmentType: formData.employmentType,
      joiningDate: new Date(formData.joiningDate).toISOString(), // Date-time format
      roleId: Number(formData.roleId),
      departmentId: formData.departmentId ? Number(formData.departmentId) : null,
    };

    const res = await createEmployee(payload);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message || "Employee added successfully!");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setErrorMsg(res.message || "Failed to create employee. Please try again.");
    }
  };

  // Helper to render standard inputs to ignore theme overrides
  const renderField = (name: string, label: string, type = "text", placeholder = "") => {
    const error = fieldErrors[name];
    const inputId = `form-input-${name}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        <label htmlFor={inputId} className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
          {label}
        </label>
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={formData[name as keyof typeof formData]}
          onChange={handleChange}
          className={`flex w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
            error ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" : "border-gray-300"
          }`}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  };

  if (isFetchingMetadata) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white border border-gray-200 rounded-2xl min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-500 text-sm font-medium">Loading form metadata...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl p-6 text-gray-900">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Add New Employee</h3>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 mb-6 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {renderField("firstName", "First Name", "text", "John")}
          {renderField("lastName", "Last Name", "text", "Doe")}
          {renderField("employeeCode", "Employee Code", "text", "e.g. ST00099")}
          {renderField("officialEmail", "Official Email", "email", "john.doe@saanvi.com")}
          {renderField("password", "Password", "password", "••••••••")}
          {renderField("phoneNumber", "Phone Number (Optional)", "text", "e.g. +91 9876543210")}

          {/* Employment Type */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Employment Type
            </label>
            <select
              name="employmentType"
              value={formData.employmentType}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contractor</option>
              <option value="INTERN">Intern</option>
            </select>
          </div>

          {/* Joining Date */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Joining Date
            </label>
            <input
              name="joiningDate"
              type="date"
              value={formData.joiningDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {fieldErrors.joiningDate && (
              <p className="text-xs text-red-500 font-medium">{fieldErrors.joiningDate}</p>
            )}
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              System Role
            </label>
            <select
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer ${
                fieldErrors.roleId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Role...</option>
              {roles.map((r) => (
                <option key={r.roleId} value={r.roleId}>
                  {r.roleName} ({r.roleCode})
                </option>
              ))}
            </select>
            {fieldErrors.roleId && (
              <p className="text-xs text-red-500 font-medium">{fieldErrors.roleId}</p>
            )}
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1.5 text-left w-full">
            <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Department (Optional)
            </label>
            <select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">Select Department...</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};
