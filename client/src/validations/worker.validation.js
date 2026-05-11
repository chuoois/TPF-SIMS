import * as Yup from "yup";

/**
 * Worker Validation Schemas (Frontend)
 * Validate dữ liệu nhập liệu trên giao diện Worker
 */

// Schema validate khi thợ gửi ảnh hoàn thành (mảng files)
export const finishedImagesSchema = Yup.object().shape({
  files: Yup.array()
    .min(1, "Vui lòng tải lên ít nhất 1 ảnh sản phẩm hoàn thành")
    .max(10, "Tối đa 10 ảnh")
    .required("Vui lòng tải lên ảnh sản phẩm hoàn thành trước khi gửi"),
});
