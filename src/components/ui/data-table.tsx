'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

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

  enableColumnVisibility?: boolean;
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
  enableColumnVisibility = true,
}: DataTableProps<TData>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [searchTerm, setSearchTerm] = React.useState('');

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
      columnVisibility,
    },
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
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
    <div className="w-full space-y-4">
      {}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-wrap gap-2">
          {}
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

          {}
          {filterableColumns.map((filter) => {
            const column = table.getColumn(filter.id);
            const value = (column?.getFilterValue() as string) ?? '';
            return (
              <select
                key={filter.id}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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

        {}
        <div className="flex items-center gap-2">
          {}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto h-10">
                  Sütunlar <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {typeof column.columnDef.header === 'string'
                          ? column.columnDef.header
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {}
          {toolbarContent}
        </div>
      </div>

      {}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortingState = header.column.getIsSorted();
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className={`flex items-center gap-1 ${
                            canSort ? 'hover:text-foreground cursor-pointer' : ''
                          }`}
                          onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-muted-foreground text-xs">
                              {sortingState === 'asc' && '▲'}
                              {sortingState === 'desc' && '▼'}
                              {!sortingState && '⇅'}
                            </span>
                          )}
                        </button>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Sayfa boyutu:</span>
          <select
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
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
          <span className="text-sm text-muted-foreground">
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
  );
}
