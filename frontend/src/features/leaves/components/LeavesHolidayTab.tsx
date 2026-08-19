import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Holiday } from "../types/leaves.types";
import { getHolidays } from "@/features/organization/api/calendar.api";
import {
  TableContainer,
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export const LeavesHolidayTab: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [searchTerm, setSearchTerm] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRemoteHolidays();
  }, []);

  const fetchRemoteHolidays = async () => {
    setIsLoading(true);
    try {
      const res = await getHolidays();
      if (res.success && res.data && res.data.length > 0) {
        const sortedResData = [...res.data].sort(
          (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );
        const mapped: Holiday[] = sortedResData.map((h) => ({
          id: String(h.holidayId),
          name: h.holidayName,
          startDate: new Date(h.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", weekday: "short" }),
          endDate: new Date(h.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", weekday: "short" }),
          numberOfHolidays: 1,
          type: h.holidayType === "WEEK_OFF" ? "Week Off" : "Holiday",
        }));
        setHolidays(mapped);
      } else {
        setHolidays([]);
      }
    } catch (e) {
      console.error(e);
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHolidays = holidays.filter(
    (h) =>
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.startDate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Header Row with Title & Year Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Holidays
          </h2>
          <p className="text-xs text-slate-500 font-semibold">
            Official company holiday schedule for {selectedYear}.
          </p>
        </div>

        {/* Year Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-slate-300 rounded-xl px-4 py-2 bg-white text-xs font-bold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2027">2027</option>
          </select>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search table items..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary shadow-2xs font-medium"
          />
        </div>

        {/* Holidays Table */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            <span className="text-xs font-semibold">Loading holiday schedule...</span>
          </div>
        ) : (
          <TableContainer className="rounded-2xl border-none shadow-none">
            <Table className="min-w-[700px]">
              <TableHeader>
                <tr>
                  <TableHead>Name of the Holiday</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>No. of Holidays</TableHead>
                  <TableHead>Holiday Type</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredHolidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-semibold text-slate-900">{holiday.name}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">{holiday.startDate}</TableCell>
                    <TableCell className="font-mono text-xs text-slate-700">{holiday.endDate}</TableCell>
                    <TableCell className="font-bold text-slate-900">{holiday.numberOfHolidays}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold border bg-brand-primary-light text-brand-primary border-brand-primary/20">
                        {holiday.type}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredHolidays.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-slate-400 font-semibold">
                      No holidays match your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    </div>
  );
};
