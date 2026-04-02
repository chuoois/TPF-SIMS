import React from "react";
import DataTable from "@/components/control/DataTable";

const InventoryLogTab = ({
  columns,
  data,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <DataTable
        columns={columns}
        data={data}
        onRowClick={() => { }}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchPlaceholder="Tìm theo mã SKU, tên SP, mã đơn..."
        pagination={{
          total: data.length,
          currentPage: 1, // Simple logs display most recent
          setCurrentPage: () => { },
          itemsPerPage: 50,
          setItemsPerPage: () => { },
        }}
      />
    </div>
  );
};

export default InventoryLogTab;
