import React from "react";
import { 
  Search, 
  X, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle2
} from "lucide-react";
import CustomCheckbox from "./CustomCheckbox";

/**
 * DataTable Component
 * Standard layout for Dashboard tables with search, filters, and pagination.
 * Now automatically handles checkboxes and row hover actions.
 */
const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  rowClassName,
  rowStyle,

  // Search & Filters
  searchTerm,
  setSearchTerm,
  searchPlaceholder = "Tìm kiếm...",
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  hasActiveFilters,
  clearAllFilters,

  // Selection
  selectedIds = [],
  setSelectedIds,
  onSelectAll, // Optional: if not provided, will calculate internally
  onSelectOne, // Optional: if not provided, will calculate internally
  
  // Hover Actions
  rowDetailAction, // { label, icon, onClick }
  
  // Bulk Actions
  bulkActions = [], // { label, icon: Icon, onClick, colorClass }
  
  // Pagination
  pagination = {
    total: 0,
    currentPage: 1,
    setCurrentPage: () => {},
    itemsPerPage: 15,
    setItemsPerPage: () => {},
  }
}) => {
  const totalPages = Math.ceil(pagination.total / pagination.itemsPerPage);

  // Internal Selection Handlers
  const handleSelectAll = (checked) => {
    if (onSelectAll) return onSelectAll(checked);
    if (checked) {
      setSelectedIds(data.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (onSelectOne) return onSelectOne(id);
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Inject Checkbox Column if selection is enabled
  const enhancedColumns = [...columns];
  if (setSelectedIds) {
    enhancedColumns.unshift({
      header: (
        <div className="flex items-center justify-center">
          <CustomCheckbox
            checked={data.length > 0 && selectedIds.length === data.length}
            onChange={handleSelectAll}
          />
        </div>
      ),
      headerClassName: "w-[50px] text-center",
      render: (item) => (
        <div className="flex items-center justify-center">
          <CustomCheckbox
            checked={selectedIds.includes(item.id)}
            onChange={() => handleSelectOne(item.id)}
          />
        </div>
      ),
      className: "text-center",
    });
  }

  return (
    <div
      className="flex flex-col bg-white rounded-2xl flex-1 overflow-hidden"
      style={{
        border: "1px solid var(--grid-border)",
      }}
    >
      {/* Table Toolbar */}
      <div
        className="px-4 shrink-0 flex items-center justify-between gap-4"
        style={{
          backgroundColor: "var(--grid-header-bg)",
          borderBottom: "1px solid var(--grid-border)",
          height: "64px",
        }}
      >
        {selectedIds.length > 0 ? (
          <div className="flex items-center justify-start gap-4 w-full animate-in fade-in slide-in-from-left-2 duration-300">
            <span 
              className="text-[12px] font-bold px-4 py-1.5 border flex items-center gap-2 rounded-lg"
              style={{ 
                color: "var(--brand-primary)", 
                backgroundColor: "var(--status-focus)",
                borderColor: "rgba(52, 176, 87, 0.2)"
              }}
            >
              Đã chọn {selectedIds.length} mục
            </span>
            <div className="flex items-center gap-2">
              {bulkActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={action.onClick}
                  className={`h-8 px-4 text-white text-[11px] font-bold hover:brightness-110 transition active:scale-95 flex items-center gap-2 cursor-pointer border-none rounded-lg ${action.colorClass || 'bg-rose-600'}`}
                >
                  {action.icon && <action.icon size={14} />}
                  {action.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedIds([])}
                className="h-8 px-4 text-[11px] font-bold hover:bg-gray-200 transition cursor-pointer border-none ml-2 rounded-lg"
                style={{ backgroundColor: "var(--grid-border)", color: "var(--text-secondary)" }}
              >
                BỎ CHỌN
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm min-w-[300px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-placeholder)" }}
              />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-8 rounded-xl text-[13px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                style={{
                  borderColor: "var(--grid-border)",
                  backgroundColor: "#fff",
                  color: "var(--text-main)",
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                >
                  <X size={14} style={{ color: "var(--text-placeholder)" }} />
                </button>
              )}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-placeholder)" }}
                  />
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="h-10 pl-9 pr-3 rounded-xl text-[13px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    style={{
                      borderColor: dateFrom ? "var(--brand-primary)" : "var(--grid-border)",
                      backgroundColor: "#fff",
                      color: "var(--text-main)",
                    }}
                  />
                </div>
                <span className="text-gray-400 text-xs font-bold">~</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 px-3 rounded-xl text-[13px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  style={{
                    borderColor: dateTo ? "var(--brand-primary)" : "var(--grid-border)",
                    backgroundColor: "#fff",
                    color: "var(--text-main)",
                  }}
                />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="h-10 px-4 rounded-xl text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left relative">
          <thead
            className="sticky top-0 z-10"
            style={{
              backgroundColor: "var(--grid-header-bg)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          >
            <tr>
              {enhancedColumns.map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider ${col.headerClassName || ''}`}
                  style={{ color: "var(--text-placeholder)", ...col.headerStyle }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? (
              data.map((item, rowIdx) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id || rowIdx}
                    onClick={() => onRowClick && onRowClick(item)}
                    className={`
                      group relative transition-colors cursor-pointer 
                      hover:!bg-[var(--status-focus)] 
                      ${isSelected ? '!bg-[var(--status-focus)]' : ''} 
                      ${rowClassName ? rowClassName(item) : ''}
                    `}
                    style={{ 
                      borderBottom: "1px solid var(--grid-border)",
                      ...rowStyle && rowStyle(item)
                    }}
                  >
                  {enhancedColumns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className={`px-4 py-3 ${col.className || ''}`}
                      style={col.style}
                    >
                      {col.render ? col.render(item, rowIdx) : item[col.key]}

                    </td>
                  ))}
                </tr>
              );
            })
            ) : (
              <tr>
                <td colSpan={enhancedColumns.length} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <p className="text-sm font-medium">Không tìm thấy bản ghi nào</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div
          className="flex items-center justify-between px-6 py-3 border-t shrink-0"
          style={{
            borderColor: "var(--grid-border)",
            backgroundColor: "var(--bg-main)",
          }}
        >
          <div className="text-[13px] text-gray-500">
            Tổng số bản ghi: <span className="font-bold text-gray-900">{pagination.total}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-gray-500">Số bản ghi/trang</span>
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => {
                  pagination.setItemsPerPage(Number(e.target.value));
                  pagination.setCurrentPage(1);
                }}
                className="h-8 px-2 pr-6 rounded-md text-[13px] border cursor-pointer focus:outline-none appearance-none bg-white font-bold"
                style={{
                  borderColor: "var(--grid-border)",
                  // Simple hack for custom arrow if needed
                }}
              >
                {[15, 30, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            <div className="text-[13px] text-gray-500">
              <span className="font-bold text-gray-900">
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{" "}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.total)}
              </span> bản ghi
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => pagination.setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={pagination.currentPage === 1}
                className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => pagination.setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={pagination.currentPage === totalPages || totalPages === 0}
                className="flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer hover:bg-gray-200 rounded p-1"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
