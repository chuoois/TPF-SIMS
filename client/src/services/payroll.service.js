import axiosInstance from "@/lib/axios";

/**
 * Payroll Service
 * Created By: ThinhBui
 * Created Date: 26/04/2026
 */
const payrollService = {
  // ── PAYROLL PERIOD ───────────────────────────────────────────

  async getAllPeriods() {
    const response = await axiosInstance.get("/payroll/periods");
    return response.data;
  },

  async getPeriodById(id) {
    const response = await axiosInstance.get(`/payroll/periods/${id}`);
    return response.data;
  },

  async createPeriod(data) {
    const response = await axiosInstance.post("/payroll/periods", data);
    return response.data;
  },

  async lockPeriod(id) {
    const response = await axiosInstance.post(`/payroll/periods/${id}/lock`);
    return response.data;
  },

  async addRecordToPeriod(periodId, fk_employee_id) {
    const response = await axiosInstance.post(`/payroll/periods/${periodId}/records`, { fk_employee_id });
    return response.data;
  },

  // ── SALARY RECORD ────────────────────────────────────────────

  async updateRecord(id, data) {
    const response = await axiosInstance.patch(`/payroll/records/${id}`, data);
    return response.data;
  },

  async incrementDaysWorked(id) {
    const response = await axiosInstance.patch(`/payroll/records/${id}/increment-day`);
    return response.data;
  },

  async deleteRecord(id) {
    const response = await axiosInstance.delete(`/payroll/records/${id}`);
    return response.data;
  },

  async payRecord(id) {
    const response = await axiosInstance.patch(`/payroll/records/${id}/pay`);
    return response.data;
  },

  async unpayRecord(id) {
    const response = await axiosInstance.patch(`/payroll/records/${id}/unpay`);
    return response.data;
  },

  // ── SALARY ADJUSTMENT ────────────────────────────────────────

  async addAdjustment(recordId, data) {
    const response = await axiosInstance.post(`/payroll/records/${recordId}/adjustments`, data);
    return response.data;
  },

  async deleteAdjustment(id) {
    const response = await axiosInstance.delete(`/payroll/adjustments/${id}`);
    return response.data;
  },
};

export default payrollService;
