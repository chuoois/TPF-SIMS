import React, { useState } from "react";
import {
  Search,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2
} from "lucide-react";
import CustomCheckbox from "./CustomCheckbox";
import ConfirmModal from "./ConfirmModal";

/**
 * DataTable Component
 * Standard layout for Dashboard tables with search, filters, and pagination.
 * Now automatically handles checkboxes, row hover actions, and EXPANDABLE rows.
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

  // Row Actions (per-row buttons shown on hover)
  rowActions = [], // [{ icon: Icon, onClick: (item) => {}, label, className }]

  // Bulk Actions
  bulkActions = [], // [{ label, icon: Icon, onClick, colorClass }]

  // Expansion (Dropdown Rows)
  renderDetail, // (item) => ReactNode
  expandedIds: controlledExpandedIds, // Optional controlled state
  onToggleExpand: controlledOnToggleExpand, // Optional controlled callback

  pagination = {
    total: 0,
    currentPage: 1,
    setCurrentPage: () => { },
    itemsPerPage: 15,
    setItemsPerPage: () => { },
  },

  // Extra Toolbar Content (e.g. specialized filters)
  extraFilters = null
}) => {
  const [activeConfirmAction, setActiveConfirmAction] = useState(null);
  const [localExpanded, setLocalExpanded] = useState([]); // Default for uncontrolled
  const totalPages = Math.ceil(pagination.total / pagination.itemsPerPage);

  // Determine which expansion state to use
  const isControlledExpansion = controlledExpandedIds !== undefined;
  const expandedList = isControlledExpansion ? controlledExpandedIds : localExpanded;

  const handleToggleExpand = (id) => {
    if (controlledOnToggleExpand) return controlledOnToggleExpand(id);
    setLocalExpanded(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

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

  // Build columns list
  const enhancedColumns = [...columns];

  // 1. Inject Expansion Chevron at the beginning
  if (renderDetail) {
    enhancedColumns.unshift({
      header: "",
      headerClassName: "w-[40px] text-center",
      render: (item) => {
        const isExpanded = expandedList.includes(item.id);
        const Icon = isExpanded ? ChevronUp : ChevronDown;
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(item.id);
              }}
              className={`p-1.5 rounded-lg transition-all border ${isExpanded ? 'bg-indigo-50 border-indigo-100 text-indigo-600 shadow-sm' : 'hover:bg-gray-50 border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              <Icon size={14} strokeWidth={3} />
            </button>
          </div>
        );
      },
      className: "text-center",
    });
  }

  // 2. Inject Checkbox Column if selection is enabled
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

  // 3. Inject Row Actions column if provided
  if (rowActions.length > 0) {
    enhancedColumns.push({
      header: "",
      headerClassName: "w-[100px]",
      className: "text-right",
      render: (item) => (
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {rowActions.map((action, idx) => {
            if (action.showIf && !action.showIf(item)) return null;
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (action.requireConfirm) {
                    setActiveConfirmAction({ ...action, __targetItem: item });
                  } else {
                    action.onClick(item);
                  }
                }}
                title={action.label || ""}
                className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all cursor-pointer hover:shadow-sm ${action.className || 'bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {Icon && <Icon size={14} />}
              </button>
            );
          })}
        </div>
      ),
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
        <ConfirmModal
          isOpen={!!activeConfirmAction}
          title={activeConfirmAction?.confirmTitle || "Xác nhận hành động?"}
          message={
            typeof activeConfirmAction?.confirmMessage === 'function' && activeConfirmAction?.__targetItem
              ? activeConfirmAction.confirmMessage(activeConfirmAction.__targetItem)
              : activeConfirmAction?.confirmMessage ||
              (activeConfirmAction?.__targetItem
                ? `Bạn có chắc chắn muốn thực hiện "${activeConfirmAction?.label}" cho mục này?`
                : `Bạn có chắc chắn muốn thực hiện "${activeConfirmAction?.label}" cho ${selectedIds.length} mục đã chọn?`)
          }
          onConfirm={() => {
            if (activeConfirmAction?.__targetItem) {
              activeConfirmAction.onClick(activeConfirmAction.__targetItem);
            } else {
              activeConfirmAction?.onClick();
            }
            setActiveConfirmAction(null);
          }}
          onCancel={() => setActiveConfirmAction(null)}
        />

        {setSelectedIds && selectedIds.length > 0 ? (
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
                  onClick={() => {
                    if (action.requireConfirm) {
                      setActiveConfirmAction(action);
                    } else {
                      action.onClick();
                    }
                  }}
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
                className="w-full h-10 pl-10 pr-8 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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

            {/* Filters Group (Extra + Date) */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Extra Filters */}
              {extraFilters && (
                <div className="flex items-center gap-2">
                  {extraFilters}
                </div>
              )}

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
                      className="h-10 pl-9 pr-3 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                    className="h-10 px-3 rounded-lg text-[13px] border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
                    className="h-10 px-4 rounded-lg text-[12px] font-bold text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100 cursor-pointer"
                  >
                    Xóa bộ lọc
                  </button>
                )}
              </div>
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
                const isExpanded = expandedList.includes(item.id);
                return (
                  <React.Fragment key={item.id || rowIdx}>
                    <tr
                      onClick={() => {
                        if (renderDetail) {
                          handleToggleExpand(item.id);
                        } else if (onRowClick) {
                          onRowClick(item);
                        }
                      }}
                      className={`
                        group relative transition-colors cursor-pointer 
                        hover:!bg-[var(--status-focus)] 
                        ${isSelected ? '!bg-[var(--status-focus)]' : ''} 
                        ${isExpanded ? '!bg-[var(--status-focus)]/50' : ''}
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
                          className={`px-4 py-3 text-[13px] ${col.className || ''}`}
                          style={{ color: "var(--text-main)", ...col.style }}
                        >
                          {col.render
                            ? col.render(item, rowIdx)
                            : col.key
                              ? item[col.key]
                              : ""
                          }
                        </td>
                      ))}
                    </tr>

                    {/* Expandable Detail Row */}
                    {renderDetail && isExpanded && (
                      <tr className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <td
                          colSpan={enhancedColumns.length}
                          className="bg-white"
                          style={{
                            borderBottom: "1px solid var(--grid-border)",
                          }}
                        >
                          {renderDetail(item)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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
              <div className="relative flex items-center">
                <select
                  value={pagination.itemsPerPage}
                  onChange={(e) => {
                    pagination.setItemsPerPage(Number(e.target.value));
                    pagination.setCurrentPage(1);
                  }}
                  className="h-8 px-2 pr-8 rounded-lg text-[13px] border cursor-pointer focus:outline-none appearance-none bg-white font-bold transition-all hover:border-gray-400"
                  style={{
                    borderColor: "var(--grid-border)",
                  }}
                >
                  {[15, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-2.5 pointer-events-none text-gray-400"
                  strokeWidth={2.5}
                />
              </div>
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
