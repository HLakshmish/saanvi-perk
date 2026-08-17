import React, { useState, useEffect, useMemo } from "react";
import { Employee } from "../types/employees.types";
import { EmployeeCard } from "./employee-card";
import { Search, Loader2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { getCompanySuperAdmin } from "../api/employees.api";
import { cn } from "@/lib/utils";

interface OrganizationChartProps {
  employees: Employee[];
  className?: string;
  currentUserName?: string;
  currentCompanyName?: string;
}

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({
  employees,
  className,
  currentUserName,
  currentCompanyName,
}) => {
  const [superAdmin, setSuperAdmin] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Expand / Collapse state (Set of expanded employee IDs)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Zoom scale state (default 90%)
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);

  // Fetch SuperAdmin details
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      try {
        setIsLoading(true);
        const res = await getCompanySuperAdmin();
        if (res.success && res.data) {
          const comp = res.data;
          const sa = comp.superAdmin;

          const companyLocation = comp.city
            ? (comp.state ? `${comp.city}, ${comp.state}` : comp.city)
            : (currentCompanyName || "Headquarters");

          if (sa) {
            const rootEmp: Employee = {
              id: `sa-${sa.superAdminId}`,
              employeeCode: `SA-${String(sa.superAdminId).padStart(5, "0")}`,
              name: `${sa.firstName} ${sa.lastName || ""}`.trim() || "Super Admin",
              email: sa.email,
              location: companyLocation,
              department: "Management",
              designation: "SuperAdmin",
              employeeGroup: "Full-Time",
              profilePic: sa.profilePic || undefined,
              reportsTo: undefined,
            };
            setSuperAdmin(rootEmp);
            // Default: expand SuperAdmin so the tree is open initially
            setExpandedNodes(new Set([rootEmp.id]));
          } else {
            const fallbackRoot: Employee = {
              id: "sa-root",
              employeeCode: "SA-00001",
              name: currentUserName || "Super Admin",
              email: comp.companyEmail || "superadmin@saanvi.com",
              location: companyLocation,
              department: "Management",
              designation: "SuperAdmin",
              employeeGroup: "Full-Time",
              reportsTo: undefined,
            };
            setSuperAdmin(fallbackRoot);
            setExpandedNodes(new Set([fallbackRoot.id]));
          }
        } else {
          const fallbackRoot: Employee = {
            id: "sa-root",
            employeeCode: "SA-00001",
            name: currentUserName || "Super Admin",
            email: "superadmin@saanvi.com",
            location: currentCompanyName || "Headquarters",
            department: "Management",
            designation: "SuperAdmin",
            employeeGroup: "Full-Time",
            reportsTo: undefined,
          };
          setSuperAdmin(fallbackRoot);
          setExpandedNodes(new Set([fallbackRoot.id]));
        }
      } catch (e) {
        console.warn("Failed to fetch company SuperAdmin details", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuperAdmin();
  }, [currentUserName, currentCompanyName]);

  // Build the hierarchical tree structure
  const rootTree = useMemo<TreeNode | null>(() => {
    if (!superAdmin) return null;

    // Build adjacency list of parent employeeCode -> children
    const parentCodeToChildren = new Map<string, Employee[]>();
    const rootLevelEmployees: Employee[] = [];

    employees.forEach((emp) => {
      if (emp.reportsTo) {
        const list = parentCodeToChildren.get(emp.reportsTo) || [];
        list.push(emp);
        parentCodeToChildren.set(emp.reportsTo, list);
      } else {
        // Direct report to SuperAdmin
        rootLevelEmployees.push(emp);
      }
    });

    // Recursive helper to construct TreeNode
    const buildSubtree = (emp: Employee): TreeNode => {
      const childEmps = parentCodeToChildren.get(emp.employeeCode) || [];
      return {
        employee: emp,
        children: childEmps.map((child) => buildSubtree(child)),
      };
    };

    // Construct Level 1 branches under SuperAdmin
    const topLevelChildren: TreeNode[] = rootLevelEmployees.map((adminEmp) => {
      return buildSubtree(adminEmp);
    });

    return {
      employee: superAdmin,
      children: topLevelChildren,
    };
  }, [superAdmin, employees]);

  // Toggle node expansion
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Combine SuperAdmin + employees for search
  const allSearchable = useMemo(() => {
    const list = [...employees];
    if (superAdmin) {
      list.unshift(superAdmin);
    }
    return list;
  }, [employees, superAdmin]);

  // Filter employees for the search box
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return allSearchable.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.employeeCode.toLowerCase().includes(query) ||
        emp.designation.toLowerCase().includes(query)
    );
  }, [allSearchable, searchQuery]);

  const handleSelectEmployee = (emp: Employee) => {
    setHighlightedCode(emp.employeeCode);
    setSearchQuery("");
    setIsDropdownOpen(false);

    // Auto-expand all ancestors so the highlighted node is visible
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (superAdmin) next.add(superAdmin.id);
      
      // Trace parent hierarchy
      let currentMgrCode = emp.reportsTo;
      while (currentMgrCode) {
        const mgr = employees.find((e) => e.employeeCode === currentMgrCode);
        if (mgr) {
          next.add(mgr.id);
          currentMgrCode = mgr.reportsTo;
        } else {
          break;
        }
      }
      return next;
    });

    // Remove highlight after 4.5 seconds
    setTimeout(() => {
      setHighlightedCode((prev) => (prev === emp.employeeCode ? "" : prev));
    }, 4500);
  };

  // Recursive Tree Component to render nodes and connector lines
  const renderTreeNode = (node: TreeNode, isRootNode = false): React.ReactNode => {
    const isExpanded = expandedNodes.has(node.employee.id);
    const hasChildren = node.children.length > 0;
    const isHighlighted = node.employee.employeeCode === highlightedCode;

    return (
      <div key={node.employee.id} className="flex flex-col items-center">
        {/* Node Card */}
        <EmployeeCard
          employee={node.employee}
          isRoot={isRootNode}
          childCount={node.children.length}
          isExpanded={isExpanded}
          onToggleExpand={() => toggleNode(node.employee.id)}
          className={cn(
            isHighlighted &&
              "ring-4 ring-[#013e37] ring-offset-4 scale-105 animate-pulse shadow-lg rounded-2xl"
          )}
        />

        {/* Tree Connectors & Children Branches */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Vertical stem dropping down from parent card */}
            <div className="w-[2px] h-6 bg-slate-300"></div>

            {/* If Single Child: continuous vertical stem */}
            {node.children.length === 1 ? (
              <div className="flex flex-col items-center">
                <div className="w-[2px] h-6 bg-slate-300"></div>
                {renderTreeNode(node.children[0])}
              </div>
            ) : (
              /* If Multiple Children: horizontal bridge + vertical drops */
              <div className="flex flex-row items-start justify-center">
                {node.children.map((childNode, index) => {
                  const isFirst = index === 0;
                  const isLast = index === node.children.length - 1;

                  return (
                    <div
                      key={childNode.employee.id}
                      className="flex flex-col items-center relative px-3 sm:px-5"
                    >
                      {/* Horizontal connector segment */}
                      <div
                        className={cn(
                          "absolute top-0 h-[2px] bg-slate-300",
                          isFirst
                            ? "left-1/2 right-0"
                            : isLast
                            ? "left-0 right-1/2"
                            : "left-0 right-0"
                        )}
                      />

                      {/* Vertical drop into this child card */}
                      <div className="w-[2px] h-6 bg-slate-300"></div>

                      {/* Child subtree */}
                      {renderTreeNode(childNode)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <Loader2 className="w-8 h-8 text-[#013e37] animate-spin" />
        <span className="text-slate-500 text-xs font-bold">
          Loading organizational hierarchy...
        </span>
      </div>
    );
  }

  if (!rootTree) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-500 font-semibold text-sm">
        No employee hierarchy data found.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex flex-col w-full bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-6 overflow-hidden",
        className
      )}
    >
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-[#013e37] tracking-tight">
              Organization Hierarchy
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click on any card to expand or collapse its reporting branch.
          </p>
        </div>

        {/* Action Controls: Search & Zoom & Expand */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search employee or code..."
              className="w-full pl-9 pr-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#013e37] font-semibold transition-all"
            />

            {/* Search Dropdown Overlay */}
            {isDropdownOpen && searchResults.length > 0 && (
              <div className="absolute right-0 top-full mt-1.5 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50 divide-y divide-slate-100">
                {searchResults.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className="flex flex-col w-full text-left px-3.5 py-2.5 hover:bg-[#013e37]/5 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 text-xs uppercase">
                      {emp.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      <span className="font-mono text-slate-400">{emp.employeeCode}</span> •{" "}
                      {emp.designation} ({emp.department})
                    </span>
                  </button>
                ))}
              </div>
            )}

            {isDropdownOpen && searchQuery.trim() !== "" && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.1))}
              title="Zoom Out"
              className="p-1.5 text-slate-600 hover:text-[#013e37] hover:bg-white rounded-lg transition-all cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold font-mono text-slate-600 px-1 select-none">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((prev) => Math.min(1.4, prev + 0.1))}
              title="Zoom In"
              className="p-1.5 text-slate-600 hover:text-[#013e37] hover:bg-white rounded-lg transition-all cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(0.9)}
              title="Reset Zoom (90%)"
              className="p-1.5 text-slate-600 hover:text-[#013e37] hover:bg-white rounded-lg transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Hierarchy Tree Viewport (Scrollable without left-side clipping) */}
      <div className="w-full overflow-x-auto overflow-y-auto min-h-[550px] p-6 sm:p-8 bg-slate-50/60 rounded-2xl border border-slate-200/60">
        <div
          className="w-fit min-w-max mx-auto transition-transform duration-300 origin-top flex justify-center py-4 px-8"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {renderTreeNode(rootTree, true)}
        </div>
      </div>
    </div>
  );
};
