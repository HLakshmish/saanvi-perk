import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  MapPin, 
  X, 
  Phone,
  Globe,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { OfficeLocation, CreateLocationInput } from "../types/location.types";
import { getLocations, createLocation, updateLocation, deleteLocation } from "../api/location.api";
import { LocationFormModal } from "./LocationFormModal";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SearchBox } from "@/components/ui/search-box";

interface LocationTabProps {
  onBack: () => void;
}

export const LocationTab: React.FC<LocationTabProps> = ({ onBack }) => {
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(null);
  const [viewingLocation, setViewingLocation] = useState<OfficeLocation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const locData = await getLocations();
      setLocations(locData);
    } catch (err: any) {
      setError(err.message || "Failed to load office locations.");
      toast.error("Error loading location data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData: CreateLocationInput) => {
    if (editingLocation) {
      // Update
      const res = await updateLocation(editingLocation.officeLocationId, formData);
      if (res.success) {
        toast.success(res.message || "Location updated successfully");
        setIsFormOpen(false);
        setEditingLocation(null);
        fetchData();
      } else {
        toast.error(res.error || "Failed to update location");
      }
    } else {
      // Create
      const res = await createLocation(formData);
      if (res.success) {
        toast.success(res.message || "Location created successfully");
        setIsFormOpen(false);
        fetchData();
      } else {
        toast.error(res.error || "Failed to create location");
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete the location "${name}"?`)) {
      try {
        const res = await deleteLocation(id);
        if (res.success) {
          toast.success(res.message || "Location deleted successfully");
          fetchData();
        } else {
          toast.error(res.error || "Failed to delete location");
        }
      } catch (err: any) {
        toast.error("Error deleting location: " + err.message);
      }
    }
  };

  const formatAddress = (loc: OfficeLocation) => {
    const parts = [loc.city, loc.state, loc.country].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "—";
  };

  // Filtered list
  const filteredLocations = locations.filter((loc) => {
    const query = searchQuery.toLowerCase();
    const matchesName = loc.locationName.toLowerCase().includes(query);
    const matchesCode = loc.locationCode.toLowerCase().includes(query);
    const matchesCity = (loc.city || "").toLowerCase().includes(query);
    const matchesState = (loc.state || "").toLowerCase().includes(query);
    const matchesCountry = (loc.country || "").toLowerCase().includes(query);

    return matchesName || matchesCode || matchesCity || matchesState || matchesCountry;
  });

  return (
    <>
      <div className="space-y-6 animate-fade-in">
        {/* Top Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
            <button
              onClick={onBack}
              className="text-slate-500 hover:text-[#013e37] font-bold transition-colors cursor-pointer"
            >
              Organization
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Locations</span>
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              setEditingLocation(null);
              setIsFormOpen(true);
            }}
            className="bg-[#013e37] text-[#ffefb3] hover:bg-[#012d28] font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </Button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="w-full max-w-xs">
            <SearchBox
              placeholder="Search location name, code, city..."
              value={searchQuery}
              onChange={(val) => setSearchQuery(val)}
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Total: <span className="font-extrabold text-[#013e37]">{filteredLocations.length}</span> locations
          </div>
        </div>

        {/* Data Table Container */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
            <div className="w-8 h-8 rounded-full border-3 border-[#013e37] border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-600">Loading office locations...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-8 text-center text-rose-700 text-xs font-semibold">
            {error}
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-2xs">
            <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Locations Found</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {searchQuery ? "No locations matched your search query." : "Click 'Add Location' above to create your first office location."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Location Name</th>
                    <th className="py-3.5 px-4">Code</th>
                    <th className="py-3.5 px-4">City / Region</th>
                    <th className="py-3.5 px-4">Phone</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredLocations.map((loc) => (
                    <tr key={loc.officeLocationId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#013e37]/10 text-[#013e37] flex items-center justify-center font-bold text-xs shrink-0">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span>{loc.locationName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                        {loc.locationCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {formatAddress(loc)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">
                        {loc.officePhoneNumber || loc.mobileNumber || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {loc.status ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingLocation(loc)}
                            title="View Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#013e37] hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingLocation(loc);
                              setIsFormOpen(true);
                            }}
                            title="Edit"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#013e37] hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loc.officeLocationId, loc.locationName)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Location Create / Edit Modal */}
      <LocationFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleSave}
        location={editingLocation}
      />

      {/* Location View Details Modal */}
      {viewingLocation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#013e37]/10 text-[#013e37] flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{viewingLocation.locationName}</h3>
                  <p className="text-xs font-mono font-bold text-slate-500">{viewingLocation.locationCode}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingLocation(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Address:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {[viewingLocation.addressLine1, viewingLocation.addressLine2].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">City / Region:</span>
                  <span className="font-bold text-slate-900">{formatAddress(viewingLocation)}</span>
                </div>
                {viewingLocation.pincode && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Pincode:</span>
                    <span className="font-bold text-slate-900 font-mono">{viewingLocation.pincode}</span>
                  </div>
                )}
                {viewingLocation.officePhoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Phone:</span>
                    <span className="font-bold text-slate-900 font-mono">{viewingLocation.officePhoneNumber}</span>
                  </div>
                )}
                {viewingLocation.fax && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Fax:</span>
                    <span className="font-bold text-slate-900 font-mono">{viewingLocation.fax}</span>
                  </div>
                )}
                {viewingLocation.website && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Website:</span>
                    <a
                      href={viewingLocation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-[#013e37] hover:underline truncate max-w-[200px]"
                    >
                      {viewingLocation.website}
                    </a>
                  </div>
                )}
                {viewingLocation.timezone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Timezone:</span>
                    <span className="font-bold text-slate-900 font-mono">{viewingLocation.timezone}</span>
                  </div>
                )}
                {(viewingLocation.latitude !== null || viewingLocation.longitude !== null) && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Geo Coordinates:</span>
                    <span className="font-bold text-[#013e37] font-mono">
                      {viewingLocation.latitude ?? "—"}, {viewingLocation.longitude ?? "—"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">Status:</span>
                  <span className={`font-bold ${viewingLocation.status ? "text-emerald-600" : "text-slate-500"}`}>
                    {viewingLocation.status ? "Active" : "Inactive"}
                  </span>
                </div>
                {viewingLocation.remarks && (
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-500 font-semibold block mb-0.5">Remarks:</span>
                    <p className="text-slate-800 font-medium leading-relaxed">{viewingLocation.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={() => setViewingLocation(null)}
                className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl px-5"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
