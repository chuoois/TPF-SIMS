import React from "react";
import { Palette, Settings2 } from "lucide-react";
import AttributeManagementBase from "@/pages/common/management-producAtttribute/AttributeManagementBase";

const CategoriesPage = () => {
  return (
    <AttributeManagementBase
      type="category"
      title="Quản lý danh mục sản phẩm"
      unitLabel="danh mục"
      icon={Palette}
      itemIcon={Settings2}
      placeholder="VD: Phòng khách hiện đại, Bàn làm việc..."
      searchField="category_name"
      pkField="pk_product_category_id"
      responseKey="categories"
    />
  );
};

export default CategoriesPage;
