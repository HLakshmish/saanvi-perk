import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { OfficeLocation, CreateLocationInput } from "../types/location.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateLocationInput) => Promise<void>;
  location: OfficeLocation | null;
}

export const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  location,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [pincode, setPincode] = useState("");
  const [officePhoneNumber, setOfficePhoneNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [fax, setFax] = useState("");
  const [website, setWebsite] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState<boolean>(true);

  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location) {
      setName(location.locationName);
      setCode(location.locationCode);
      setAddressLine1(location.addressLine1 || "");
      setAddressLine2(location.addressLine2 || "");
      setCity(location.city || "");
      setState(location.state || "");
      setCountry(location.country || "India");
      setPincode(location.pincode || "");
      setOfficePhoneNumber(location.officePhoneNumber || "");
      setMobileNumber(location.mobileNumber || "");
      setFax(location.fax || "");
      setWebsite(location.website || "");
      setTimezone(location.timezone || "Asia/Kolkata");
      setLatitude(location.latitude !== undefined && location.latitude !== null ? String(location.latitude) : "");
      setLongitude(location.longitude !== undefined && location.longitude !== null ? String(location.longitude) : "");
      setRemarks(location.remarks || "");
      setStatus(location.status);
    } else {
      setName("");
      setCode("");
      setAddressLine1("");
      setAddressLine2("");
      setCity("");
      setState("");
      setCountry("India");
      setPincode("");
      setOfficePhoneNumber("");
      setMobileNumber("");
      setFax("");
      setWebsite("");
      setTimezone("Asia/Kolkata");
      setLatitude("");
      setLongitude("");
      setRemarks("");
      setStatus(true);
    }
    setErrors({});
  }, [location, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; code?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Location Name is required";
    }
    if (!code.trim()) {
      newErrors.code = "Location Code is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        locationName: name.trim(),
        locationCode: code.trim().toUpperCase(),
        addressLine1: addressLine1.trim() || null,
        addressLine2: addressLine2.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || "India",
        pincode: pincode.trim() || null,
        officePhoneNumber: officePhoneNumber.trim() || null,
        mobileNumber: mobileNumber.trim() || null,
        fax: fax.trim() || null,
        website: website.trim() || null,
        timezone: timezone.trim() || "Asia/Kolkata",
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
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
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-bold text-brand-primary uppercase tracking-wider">
            {location ? "Edit Location" : "Add Location"}
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
            {/* Location Name */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Location Name *
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="e.g. Headquarters - Bengaluru"
                error={errors.name}
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Location Code */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Location Code *
              </label>
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) setErrors((prev) => ({ ...prev, code: undefined }));
                }}
                placeholder="e.g. HQ_BLR"
                disabled={!!location}
                error={errors.code}
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Office Phone */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Office Phone
              </label>
              <Input
                value={officePhoneNumber}
                onChange={(e) => setOfficePhoneNumber(e.target.value)}
                placeholder="+91 80 1234 5678"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Fax Number */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Fax Number
              </label>
              <Input
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="e.g. +91 80 1234 5679"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Website URL */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Location Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://company.com/location"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Timezone */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT +8:00)</option>
              </select>
            </div>

            {/* Geo Coordinates for Attendance Check-In */}
            <div className="col-span-2 grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="col-span-2 text-[11px] font-extrabold text-brand-primary uppercase tracking-wider flex items-center justify-between">
                <span>Geo Coordinates (Geo-Fencing)</span>
                <span className="text-[9px] font-bold text-slate-400 font-mono">GPS Attendance</span>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 12.9716"
                  className="!bg-white !text-slate-800 !border-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase block">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 77.5946"
                  className="!bg-white !text-slate-800 !border-slate-200"
                />
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Address Line 1
              </label>
              <Input
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="Building name, street, suite..."
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Address Line 2 */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Address Line 2
              </label>
              <Input
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Area, landmark..."
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                City
              </label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Bengaluru"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                State
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Karnataka"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Country
              </label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Pincode
              </label>
              <Input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="560001"
                className="!bg-slate-50 !text-slate-800 !border-slate-200"
              />
            </div>

            {/* Remarks */}
            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Remarks / Description
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Office location notes..."
                rows={2}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none"
              />
            </div>

            {/* Status */}
            <div className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Active Status</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Enable or disable this location for employee assignments
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(!status)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  status ? "bg-brand-primary" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 left-0.5 flex items-center justify-center ${
                    status ? "translate-x-6 text-brand-primary" : "text-slate-400"
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
              className="text-xs font-bold bg-brand-primary text-brand-btn-text hover:bg-brand-primary-hover rounded-xl shadow-xs"
            >
              {isSubmitting ? "Saving..." : location ? "Update Location" : "Create Location"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
