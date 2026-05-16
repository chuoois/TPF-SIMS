import axiosInstance from "@/lib/axios";

const workerService = {
  /**
   * Lấy danh sách các đơn hàng và công việc đang chờ hoặc đang gia công
   */
  async getPendingTasks() {
    const response = await axiosInstance.get("/worker/tasks/pending");
    return response.data;
  },

  /**
   * Lấy danh sách nhiệm vụ đã hoàn thành
   */
  async getCompletedTasks() {
    const response = await axiosInstance.get("/worker/tasks/completed");
    return response.data;
  },

  /**
   * Bắt đầu gia công (Chờ → Đang gia công)
   * @param {number|string} orderItemId - pk_order_item_id
   */
  async startTask(orderItemId) {
    const response = await axiosInstance.post(`/worker/tasks/start/${orderItemId}`);
    return response.data;
  },

  /**
   * Hoàn thành gia công / Gửi ảnh chờ duyệt
   * @param {number|string} orderItemId - pk_order_item_id
   * @param {string[]} finishedImages - Mảng URL ảnh hoàn thiện
   */
  async completeTask(orderItemId, finishedImages) {
    const response = await axiosInstance.post(`/worker/tasks/complete/${orderItemId}`, {
      finishedImages
    });
    return response.data;
  },
};

export default workerService;
