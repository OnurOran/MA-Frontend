import React, { useState } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from './input';
import { Button } from './button';

type FilterOption = {
  label: string;
  value: string;
};

type FilterConfig<TValue = string> = {
  id: string;
  title?: string;
  options: FilterOption[];
  filterValue?: TValue;
};

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];

  searchKey?: string;

  filterableColumns?: FilterConfig[];

  toolbarContent?: React.ReactNode;
  pageSizeOptions?: number[];
  emptyMessage?: string;

  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
};

export function DataTable<TData>({
  columns,
  data,
  searchKey,
  filterableColumns = [],
  toolbarContent,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage = 'Kayıt bulunamadı',
  sorting,
  onSortingChange,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const resolvedSorting = sorting ?? internalSorting;

  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const next =
      typeof updater === 'function'
        ? (updater as (old: SortingState) => SortingState)(resolvedSorting)
        : updater;
    setInternalSorting(next);
    onSortingChange?.(next);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: resolvedSorting,
      globalFilter,
      columnFilters,
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(value);
    } else {
      setGlobalFilter(value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          {searchKey && (
            <div className="w-full md:w-64">
              <Input
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-10"
              />
            </div>
          )}

          {filterableColumns.map((filter) => {
            const column = table.getColumn(filter.id);
            const value = (column?.getFilterValue() as string) ?? '';
            return (
              <select
                key={filter.id}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={value}
                onChange={(e) => column?.setFilterValue(e.target.value || undefined)}
              >
                <option value="">{filter.title ?? 'Filtrele'}</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          })}
        </div>

        {toolbarContent && <div className="flex items-center gap-2">{toolbarContent}</div>}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    const sortingState = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        scope="col"
                        className="px-4 py-3 font-semibold"
                      >
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            className={`flex items-center gap-1 ${canSort ? 'hover:text-slate-800' : ''}`}
                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="text-slate-400">
                                {sortingState === 'asc' && '▲'}
                                {sortingState === 'desc' && '▼'}
                                {!sortingState && ''}
                              </span>
                            )}
                          </button>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-t border-slate-200 hover:bg-slate-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 align-top">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Sayfa boyutu:</span>
            <select
              className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-slate-600">
              Sayfa {table.getState().pagination.pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Sonraki
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
