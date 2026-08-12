"use client";

import React, { useState, useEffect } from "react";
import { AssetDetails, CreateAssetInput, AssetStatus } from "../types/assets.types";
import { createAsset, updateAsset } from "../api/assets.api";
import { X, Laptop, Check, Loader2, Info, Cpu, Calendar, FileText } from "lucide-react";

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetToEdit?: AssetDetails | null;
}

export const CreateAssetModal: React.FC<CreateAssetModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assetToEdit,
}) => {
  const [formData, setFormData] = useState<CreateAssetInput>({
    assetCode: "",
    assetName: "",
    assetType: "Laptop",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: undefined,
    vendorName: "",
    warrantyStartDate: "",
    warrantyEndDate: "",
    assetStatus: "AVAILABLE",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (assetToEdit) {
      setFormData({
        assetCode: assetToEdit.assetCode || "",
        assetName: assetToEdit.assetName || "",
        assetType: assetToEdit.assetType || "Laptop",
        brand: assetToEdit.brand || "",
        model: assetToEdit.model || "",
        serialNumber: assetToEdit.serialNumber || "",
        purchaseDate: assetToEdit.purchaseDate ? assetToEdit.purchaseDate.split("T")[0] : "",
        purchasePrice: assetToEdit.purchasePrice ? Number(assetToEdit.purchasePrice) : undefined,
        vendorName: assetToEdit.vendorName || "",
        warrantyStartDate: assetToEdit.warrantyStartDate ? assetToEdit.warrantyStartDate.split("T")[0] : "",
        warrantyEndDate: assetToEdit.warrantyEndDate ? assetToEdit.warrantyEndDate.split("T")[0] : "",
        assetStatus: assetToEdit.assetStatus || "AVAILABLE",
        description: assetToEdit.description || "",
      });
    } else {
      setFormData({
        assetCode: `AST-${Math.floor(1000 + Math.random() * 9000)}`,
        assetName: "",
        assetType: "Laptop",
        brand: "",
        model: "",
        serialNumber: "",
        purchaseDate: new Date().toISOString().split("T")[0],
        purchasePrice: undefined,
        vendorName: "",
        warrantyStartDate: "",
        warrantyEndDate: "",
        assetStatus: "AVAILABLE",
        description: "",
      });
    }
    setErrorMsg(null);
  }, [assetToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      let res;
      if (assetToEdit) {
        res = await updateAsset(assetToEdit.assetId, formData);
      } else {
        res = await createAsset(formData);
      }

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || "Failed to save asset");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-[#013e37] text-[#ffefb3] flex items-center justify-center shadow-md shrink-0">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#013e37]">
              {assetToEdit ? "Edit Asset Details" : "Register New Asset"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {assetToEdit ? "Update inventory specifications and warranty info" : "Add a physical or digital asset to your organization's inventory"}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Section 1: Basic Information */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              <Info className="w-4 h-4 text-[#013e37]" />
              <span>Basic Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Code *</label>
                <input
                  type="text"
                  required
                  value={formData.assetCode}
                  onChange={(e) => setFormData({ ...formData, assetCode: e.target.value })}
                  placeholder="e.g. AST-LAP-001"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="e.g. Dell Latitude 5440"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Asset Category *</label>
                <select
                  required
                  value={formData.assetType}
                  onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors cursor-pointer"
                >
                  <option value="LAPTOP">LAPTOP / Computer</option>
                  <option value="MONITOR">MONITOR / Display</option>
                  <option value="MOBILE">MOBILE / Tablet</option>
                  <option value="ACCESSORY">ACCESSORY / Peripherals</option>
                  <option value="FURNITURE">FURNITURE / Desk</option>
                  <option value="VEHICLE">VEHICLE</option>
                  <option value="OTHER">OTHER Equipment</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Initial Status *</label>
                <select
                  value={formData.assetStatus}
                  onChange={(e) => setFormData({ ...formData, assetStatus: e.target.value as AssetStatus })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-bold text-[#013e37] focus:outline-none focus:border-[#013e37] transition-colors cursor-pointer"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="UNDER_REPAIR">UNDER REPAIR</option>
                  <option value="LOST">LOST</option>
                  <option value="DAMAGED">DAMAGED</option>
                  <option value="RETIRED">RETIRED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Hardware Specifications */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-[#013e37]" />
              <span>Hardware Specifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Brand</label>
                <input
                  type="text"
                  value={formData.brand || ""}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="e.g. Dell, Apple"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Model</label>
                <input
                  type="text"
                  value={formData.model || ""}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g. Latitude 5440"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Serial Number</label>
                <input
                  type="text"
                  value={formData.serialNumber || ""}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="e.g. DL5440SN2026001"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Purchase & Warranty Details */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-[#013e37]" />
              <span>Purchase & Warranty</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor Name</label>
                <input
                  type="text"
                  value={formData.vendorName || ""}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="e.g. Dell Technologies India"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Purchase Price (₹)</label>
                <input
                  type="number"
                  value={formData.purchasePrice || ""}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="e.g. 68500"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate || ""}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Warranty Start Date</label>
                <input
                  type="date"
                  value={formData.warrantyStartDate || ""}
                  onChange={(e) => setFormData({ ...formData, warrantyStartDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Warranty End Date</label>
                <input
                  type="date"
                  value={formData.warrantyEndDate || ""}
                  onChange={(e) => setFormData({ ...formData, warrantyEndDate: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Notes & Description */}
          <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-[#013e37]" />
              <span>Notes & Specifications</span>
            </div>
            <textarea
              rows={2}
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add hardware specs, accessories included, or physical condition notes..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-900 focus:outline-none focus:border-[#013e37] transition-colors resize-none"
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
              className="px-5 py-2 rounded-xl bg-[#013e37] hover:bg-[#012d28] text-[#ffefb3] font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#ffefb3]" />
              ) : (
                <Check className="w-4 h-4 text-[#ffefb3]" />
              )}
              <span>{assetToEdit ? "Save Changes" : "Register Asset"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
