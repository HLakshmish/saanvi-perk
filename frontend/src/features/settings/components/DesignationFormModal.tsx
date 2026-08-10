import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Designation } from "../types/designation.types";
import { Department } from "../types/department.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DesignationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    designationName: string;
    designationCode: string;
    departmentId: number;
    remarks: string | null;
    status: boolean;
  }) => Promise<void>;
  designation: Designation | null;
  departments: Department[];
}

export const DesignationFormModal: React.FC<DesignationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  designation,
  departments,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<boolean>(true);

  const [errors, setErrors] = useState<{ name?: string; code?: string; departmentId?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (designation) {
      setName(designation.designationName);
      setCode(designation.designationCode);
      setDepartmentId(designation.departmentId ? String(designation.departmentId) : "");
      setRemarks(designation.remarks || "");
      setStatus(designation.status);
    } else {
      setName("");
      setCode("");
      setDepartmentId(departments.length > 0 ? String(departments[0].departmentId) : "");
      setRemarks("");
      setStatus(true);
    }
    setErrors({});
  }, [designation, isOpen, departments]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; code?: string; departmentId?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Designation Name is required";
    }
    if (!code.trim()) {
      newErrors.code = "Designation Code is required";
    }
    if (!departmentId) {
      newErrors.departmentId = "Department selection is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        designationName: name.trim(),
        designationCode: code.trim().toUpperCase(),
        departmentId: Number(departmentId),
        remarks: remarks.trim() || null,
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
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {designation ? "Edit Designation" : "Add Designation"}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            {/* Designation Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Designation Name *
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Senior Software Engineer"
                error={errors.name}
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Designation Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Designation Code *
              </label>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                }}
                placeholder="e.g. SR_DEV"
                disabled={!!designation}
                error={errors.code}
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Department Select */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Department *
              </label>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value);
                  if (errors.departmentId) setErrors((prev) => ({ ...prev, departmentId: undefined }));
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] transition-all"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.departmentName} ({dept.departmentCode})
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-[10px] text-rose-500 font-medium">{errors.departmentId}</p>
              )}
            </div>

            {/* Remarks / Description */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Remarks / Description
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Brief role responsibilities or designation details..."
                rows={3}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#013e37]/20 focus:border-[#013e37] transition-all resize-none"
              />
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Active Status</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Enable or disable this designation for employment assignments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(!status)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  status ? "bg-[#013e37]" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                    status ? "translate-x-6 text-[#013e37]" : "text-slate-400"
                  }`}
                >
                  {status && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 border-slate-200 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-bold bg-[#013e37] text-[#ffefb3] hover:bg-[#012d28] rounded-xl shadow-xs"
            >
              {isSubmitting ? "Saving..." : designation ? "Update Designation" : "Create Designation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
