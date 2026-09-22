import React from "react";

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollClassName?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  children,
  className = "",
  scrollClassName = "",
  ...props
}) => (
  <div
    className={`w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs hover:shadow-xs transition-all duration-300 ${className}`}
    {...props}
  >
    <div className={`overflow-x-auto ${scrollClassName}`}>{children}</div>
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
    className={`bg-table-header-bg font-bold text-table-header-text select-none sticky top-0 z-20 ${className}`}
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
    className={`py-2.5 px-5 text-[10px] font-extrabold text-table-header-text uppercase tracking-wider sticky top-0 bg-table-header-bg z-20 shadow-[0_1px_0_0_rgba(11,37,68,0.2)] ${className}`}
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
