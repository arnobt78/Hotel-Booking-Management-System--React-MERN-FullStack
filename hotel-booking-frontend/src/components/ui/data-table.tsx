import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type FilterFn,
} from "@tanstack/react-table";
import { Input } from "./input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import Pagination from "../Pagination";

/** Global case-insensitive substring match across row values */
const globalFilterFn: FilterFn<unknown> = (row, _columnId, filterValue) => {
  const q = String(filterValue ?? "")
    .toLowerCase()
    .trim();
  if (!q) return true;
  return row.getVisibleCells().some((cell) => {
    const v = cell.getValue();
    if (v == null) return false;
    return String(v).toLowerCase().includes(q);
  });
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  searchPlaceholder?: string;
  /** Optional slot to the right of the search input (e.g. filter Select) */
  filterSlot?: React.ReactNode;
  pageSize?: number;
};

/**
 * Reusable TanStack table with search + client pagination.
 * Use for admin / booking list UIs — keep column cell renderers for mutations.
 */
export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "Search…",
  filterSlot,
  pageSize = 10,
}: DataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable<TData>({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: globalFilterFn as FilterFn<TData>,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;
  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-sm"
        />
        {filterSlot ? <div className="shrink-0">{filterSlot}</div> : null}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-slate-50 hover:bg-slate-50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 ? (
        <Pagination
          page={pageIndex + 1}
          pages={pageCount}
          onPageChange={(p) => table.setPageIndex(p - 1)}
        />
      ) : null}
    </div>
  );
}
