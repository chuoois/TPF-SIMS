import React from "react";
import { Palette, Settings2 } from "lucide-react";
import AttributeManagementBase from "@/pages/common/management-producAtttribute/AttributeManagementBase";

const MaterialsPage = () => {
  return (
    <AttributeManagementBase
      type="material"
      title="Quản lý chất liệu sản phẩm"
      unitLabel="màu sắc"
      icon={Settings2}
      itemIcon={Palette}
      placeholder="VD: Gỗ tự nhiên, Vải bố, Da thật..."
      searchField="material_name"
      pkField="pk_product_material_id"
      responseKey="materials"
    />
  );
};

export default MaterialsPage;
