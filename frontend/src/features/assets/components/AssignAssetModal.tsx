"use client";

import React, { useState, useEffect } from "react";
import { AssetDetails, AssignAssetInput } from "../types/assets.types";
import { createAssignment } from "../api/assets.api";
import { getEmployees } from "@/features/employees/api/employees.api";
import { Employee } from "@/features/employees/types/employees.types";
import { X, UserCheck, Check, Loader2 } from "lucide-react";
import { snackbar as toast } from "@/components/ui/snackbar";

interface AssignAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetToAssign?: AssetDetails | null;
}

export const AssignAssetModal: React.FC<AssignAssetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assetToAssign,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const [formData, setFormData] = useState<AssignAssetInput>({
    assetId: 0,
    userId: 0,
    assignedDate: new Date().toISOString().split("T")[0],
    expectedReturnDate: "",
    conditionAtAssignment: "Brand New / Good",
    remarks: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsgState] = useState<string | null>(null);

  const setErrorMsg = (msg: string | null) => {
    setErrorMsgState(msg);
    if (msg) toast.error(msg);
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmployeesList();
      if (assetToAssign) {
        setFormData({
          assetId: assetToAssign.assetId,
          userId: 0,
          assignedDate: new Date().toISOString().split("T")[0],
          expectedReturnDate: "",
          conditionAtAssignment: "Brand New / Excellent",
          remarks: "",
        });
      }
      setErrorMsg(null);
    }
  }, [isOpen, assetToAssign]);

  const fetchEmployeesList = async () => {
    setIsLoadingEmployees(true);
    try {
      const data = await getEmployees();
      if (Array.isArray(data)) {
        setEmployees(data);
      }
    } catch (err) {
      console.warn("Could not load employees list:", err);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  if (!isOpen || !assetToAssign) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) {
      const msg = "Please select an employee to assign this asset.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createAssignment({
        ...formData,
        assetId: assetToAssign.assetId,
      });

      if (res.success) {
        toast.success("Asset assigned to employee successfully!");
        onSuccess();
        onClose();
      } else {
        const msg = res.message || "Failed to assign asset";
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred during assignment";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
          <div className="w-11 h-11 rounded-2xl bg-brand-primary text-brand-btn-text flex items-center justify-center shadow-md">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-primary">Assign Asset</h2>
            <p className="text-xs text-slate-500 font-medium">
              Allocate <span className="font-bold text-slate-800">{assetToAssign.assetName}</span> ({assetToAssign.assetCode}) to an employee
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Employee Selection */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Employee *</label>
            {isLoadingEmployees ? (
              <div className="p-3 text-slate-500 font-semibold flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                <span>Loading company employees...</span>
              </div>
            ) : (
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors cursor-pointer"
              >
                <option value={0}>-- Select Employee --</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={Number(emp.id)}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assignment Date *</label>
              <input
                type="date"
                required
                value={formData.assignedDate}
                onChange={(e) => setFormData({ ...formData, assignedDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Expected Return Date</label>
              <input
                type="date"
                value={formData.expectedReturnDate || ""}
                onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Condition at Handover</label>
            <input
              type="text"
              value={formData.conditionAtAssignment || ""}
              onChange={(e) => setFormData({ ...formData, conditionAtAssignment: e.target.value })}
              placeholder="e.g. Excellent / Sealed Box / Minor Scratches"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Assignment Notes / Remarks</label>
            <textarea
              rows={2}
              value={formData.remarks || ""}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add purpose of issue, charger/mouse provided..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-900 focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-brand-btn-text font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-brand-btn-text" />
              ) : (
                <Check className="w-4 h-4 text-brand-btn-text" />
              )}
              <span>Confirm Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
