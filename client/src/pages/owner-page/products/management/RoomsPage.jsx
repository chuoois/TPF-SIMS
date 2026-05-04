import React from "react";
import { Palette, Settings2 } from "lucide-react";
import AttributeManagementBase from "@/pages/common/management-producAtttribute/AttributeManagementBase";

const RoomsPage = () => {
  return (
    <AttributeManagementBase
      type="room"
      title="Quản lý phòng"
      unitLabel="phòng"
      icon={Settings2}
      itemIcon={Palette}
      placeholder="VD: Phòng khách hiện đại, Bàn làm việc..."
      searchField="room_name"
      pkField="pk_product_room_id"
      responseKey="rooms"
    />
  );
};

export default RoomsPage;