import React from "react";
import { Palette, Settings2 } from "lucide-react";
import AttributeManagementBase from "@/pages/common/management-producAtttribute/AttributeManagementBase";

const ColorsPage = () => {
  return (
    <AttributeManagementBase
      type="color"
      title="Quản lý bảng màu sắc"
      unitLabel="màu sắc"
      icon={Settings2}
      itemIcon={Palette}
      placeholder="VD: Cánh gián, Sơn trắng S8, Xám lông chuột..."
      searchField="color_name"
      pkField="pk_product_color_id"
      responseKey="colors"
    />
  );
};

export default ColorsPage;
