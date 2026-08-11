import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Department } from "../types/department.types";
import { Employee } from "../../employees/types/employees.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    departmentName: string;
    departmentCode: string;
    departmentHead: number | null;
    description: string | null;
    status: boolean;
  }) => Promise<void>;
  department: Department | null;
  employees: Employee[];
}

export const DepartmentFormModal: React.FC<DepartmentFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  department,
  employees,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [headId, setHeadId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<boolean>(true);

  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      setName(department.departmentName);
      setCode(department.departmentCode);
      setHeadId(department.departmentHead ? String(department.departmentHead) : "");
      setDescription(department.description || "");
      setStatus(department.status);
    } else {
      setName("");
      setCode("");
      setHeadId("");
      setDescription("");
      setStatus(true);
    }
    setErrors({});
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; code?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Department Name is required";
    }
    if (!code.trim()) {
      newErrors.code = "Department Code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        departmentName: name.trim(),
        departmentCode: code.trim().toUpperCase(),
        departmentHead: headId ? Number(headId) : null,
        description: description.trim() || null,
        status,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-bold text-[#013e37] uppercase tracking-wider">
            {department ? "Edit Department" : "Add Department"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Department Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Department Name *
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Finance & Accounts"
                error={errors.name}
                className="!bg-slate-50 !text-slate-800 !border-slate-200 dark:!bg-slate-50 dark:!text-slate-800 dark:!border-slate-200"
              />
            </div>

            {/* Department Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Department Code *
              </label>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                }}
                placeholder="e.g. FIN"
                disabled={!!department}
                error={errors.code}
                className="!bg-slate-50 !text-slate-800 !border-slate-200 dark:!bg-slate-50 dark:!text-slate-800 dark:!border-slate-200"
              />
            </div>

            {/* Department Head */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Department Head
              </label>
              <select
                value={headId}
                onChange={(e) => setHeadId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 text-sm focus:outline-none focus:border-[#013e37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="">-- Choose Head --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief department responsibilities..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 text-sm focus:outline-none focus:border-[#013e37] focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Status */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Status
              </label>
              <select
                value={status ? "active" : "inactive"}
                onChange={(e) => setStatus(e.target.value === "active")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-semibold text-slate-800 text-sm focus:outline-none focus:border-[#013e37] focus:bg-white transition-all cursor-pointer"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-9 text-xs rounded-xl !text-slate-700 dark:!text-slate-700 !border-slate-300 dark:!border-slate-300 hover:!bg-slate-50 dark:hover:!bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="h-9 text-xs rounded-xl flex items-center gap-1.5"
            >
              {!isSubmitting && <Check className="w-3.5 h-3.5" />}
              Save Department
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
