import React from "react";

export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <div
    className={`w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-all duration-300 ${className}`}
    {...props}
  >
    <div className="overflow-x-auto">{children}</div>
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <table
    className={`w-full text-left border-collapse text-sm text-slate-700 ${className}`}
    {...props}
  >
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <thead
    className={`bg-table-header-bg border-b border-[#0b2544]/10 font-bold text-table-header-text select-none ${className}`}
    {...props}
  >
    {children}
  </thead>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <th
    className={`py-2.5 px-5 text-[10px] font-extrabold text-table-header-text uppercase tracking-wider ${className}`}
    {...props}
  >
    {children}
  </th>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <tbody className={`divide-y divide-slate-100 bg-white ${className}`} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <tr
    className={`hover:bg-brand-primary-light/25 transition-colors cursor-pointer group ${className}`}
    {...props}
  >
    {children}
  </tr>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <td className={`py-2.5 px-5 ${className}`} {...props}>
    {children}
  </td>
);
