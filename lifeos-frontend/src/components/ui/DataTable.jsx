/**
 * Data Table Component
 *
 * A full-featured data table with:
 * - Column sorting (asc/desc)
 * - Search/filtering
 * - Pagination
 * - Row selection
 * - Responsive design
 * - Loading and empty states
 * - Custom cell rendering
 */

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';

/**
 * DataTable Component
 */
export function DataTable({
  data = [],
  columns = [],
  // Sorting
  sortable = true,
  defaultSortColumn,
  defaultSortDirection = 'asc',
  // Pagination
  pagination = true,
  pageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  // Search
  searchable = true,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  // State
  loading = false,
  emptyMessage = 'No data available',
  // Styling
  className = '',
  compact = false,
  striped = false,
  hoverable = true,
  // Row props
  onRowClick,
  rowClassName,
  getRowId = (row, index) => row.id ?? index,
}) {
  // State
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    const keys = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.accessor);

    return data.filter((row) =>
      keys.some((key) => {
        const value = row[key];
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, searchKeys, columns]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    const column = columns.find((c) => c.accessor === sortColumn);
    const sortFn = column?.sortFn;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Custom sort function
      if (sortFn) {
        return sortDirection === 'asc' ? sortFn(a, b) : sortFn(b, a);
      }

      // Default sort
      if (aVal == null) return sortDirection === 'asc' ? 1 : -1;
      if (bVal == null) return sortDirection === 'asc' ? -1 : 1;

      // String comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;
    const start = (currentPage - 1) * currentPageSize;
    return sortedData.slice(start, start + currentPageSize);
  }, [sortedData, pagination, currentPage, currentPageSize]);

  // Pagination info
  const totalPages = Math.ceil(sortedData.length / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize + 1;
  const endIndex = Math.min(startIndex + currentPageSize - 1, sortedData.length);

  // Handlers
  const handleSort = useCallback((accessor) => {
    if (!sortable) return;

    if (sortColumn === accessor) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(accessor);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortable, sortColumn]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const handlePageSizeChange = useCallback((size) => {
    setCurrentPageSize(size);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSelectAll = useCallback((checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange(paginatedData.map((row, i) => getRowId(row, i)));
    } else {
      onSelectionChange([]);
    }
  }, [paginatedData, onSelectionChange, getRowId]);

  const handleSelectRow = useCallback((rowId, checked) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedRows, rowId]);
    } else {
      onSelectionChange(selectedRows.filter((id) => id !== rowId));
    }
  }, [selectedRows, onSelectionChange]);

  // Check if all rows on current page are selected
  const allSelected = selectable && paginatedData.length > 0 &&
    paginatedData.every((row, i) => selectedRows.includes(getRowId(row, i)));
  const someSelected = selectable && paginatedData.some((row, i) => selectedRows.includes(getRowId(row, i)));

  // Cell/row styles
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3';
  const headerPadding = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={`bg-[var(--bg-2)] border border-white/10 rounded-xl overflow-hidden ${className}`}>
      {/* Search Bar */}
      {searchable && (
        <div className="px-4 py-3 border-b border-white/10">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-10 py-2 bg-[var(--bg-1)] border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              {/* Selection checkbox */}
              {selectable && (
                <th className={`${headerPadding} w-12`}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => el && (el.indeterminate = someSelected && !allSelected)}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-violet-500 focus:ring-violet-500/50"
                  />
                </th>
              )}

              {/* Column headers */}
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  className={`
                    ${headerPadding} text-left text-xs font-medium text-white/60 uppercase tracking-wider
                    ${sortable && column.sortable !== false ? 'cursor-pointer select-none hover:text-white/80' : ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.accessor)}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {sortable && column.sortable !== false && (
                      <span className="text-white/30">
                        {sortColumn === column.accessor ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3 h-3" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={striped ? '' : 'divide-y divide-white/5'}>
            {loading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {selectable && <td className={cellPadding}><div className="w-4 h-4 bg-white/5 rounded animate-pulse" /></td>}
                  {columns.map((col) => (
                    <td key={col.accessor} className={cellPadding}>
                      <div className="h-4 bg-white/5 rounded animate-pulse" style={{ width: `${40 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-white/50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              // Data rows
              paginatedData.map((row, rowIndex) => {
                const rowId = getRowId(row, rowIndex);
                const isSelected = selectedRows.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    onClick={() => onRowClick?.(row, rowIndex)}
                    className={`
                      ${striped && rowIndex % 2 === 1 ? 'bg-white/[0.02]' : ''}
                      ${hoverable ? 'hover:bg-white/5' : ''}
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${isSelected ? 'bg-violet-500/10' : ''}
                      ${typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName || ''}
                      transition-colors
                    `}
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <td className={cellPadding} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-violet-500 focus:ring-violet-500/50"
                        />
                      </td>
                    )}

                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className={`${cellPadding} text-sm text-white/80`}
                      >
                        {column.cell
                          ? column.cell(row[column.accessor], row, rowIndex)
                          : row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-white/10">
          {/* Page size selector */}
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Show</span>
            <select
              value={currentPageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="bg-[var(--bg-1)] border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span>entries</span>
          </div>

          {/* Page info */}
          <div className="text-sm text-white/60">
            Showing {startIndex} to {endIndex} of {sortedData.length} entries
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`
                    w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${currentPage === pageNum
                      ? 'bg-violet-500 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/10'}
                  `}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * useTableSelection - Hook for managing table selection state
 */
export function useTableSelection(initialSelection = []) {
  const [selectedRows, setSelectedRows] = useState(initialSelection);

  const selectRow = useCallback((id) => {
    setSelectedRows((prev) => [...prev, id]);
  }, []);

  const deselectRow = useCallback((id) => {
    setSelectedRows((prev) => prev.filter((r) => r !== id));
  }, []);

  const toggleRow = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }, []);

  const selectAll = useCallback((ids) => {
    setSelectedRows(ids);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRows([]);
  }, []);

  return {
    selectedRows,
    setSelectedRows,
    selectRow,
    deselectRow,
    toggleRow,
    selectAll,
    clearSelection,
    hasSelection: selectedRows.length > 0,
    selectionCount: selectedRows.length,
  };
}

export default DataTable;
