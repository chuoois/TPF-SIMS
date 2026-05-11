/**
 * Date Utilities — Timezone-safe helpers using date-fns
 * Mặc định theo giờ Việt Nam (UTC+7 / Asia/Ho_Chi_Minh)
 *
 * Created By: DNC
 */

import { format, parse, addDays, addMonths, differenceInDays, isAfter, isBefore, isEqual, startOfDay } from "date-fns";
import { vi } from "date-fns/locale";

// ===================== CONSTANTS =====================
const VN_OFFSET_MS = 7 * 60 * 60 * 1000; // UTC+7 in milliseconds

// ===================== CORE =====================

/**
 * Lấy thời điểm hiện tại theo giờ Việt Nam (Date object đã shift sang VN)
 */
export function nowVN() {
  const now = new Date();
  return new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + VN_OFFSET_MS);
}

/**
 * Lấy ngày hôm nay theo giờ Việt Nam — format YYYY-MM-DD
 * Dùng cho: date input value, min, default value, gửi API
 */
export function todayVN() {
  return format(nowVN(), "yyyy-MM-dd");
}

/**
 * Format một date string/Date object theo giờ VN
 * @param {string|Date} date - Date cần format
 * @param {string} formatStr - Format pattern (date-fns), default: "dd/MM/yyyy"
 * @returns {string}
 */
export function formatDateVN(date, formatStr = "dd/MM/yyyy") {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return format(d, formatStr, { locale: vi });
}

/**
 * Format ngày giờ đầy đủ theo VN
 * @param {string|Date} date
 * @returns {string} "14:30 11/05/2026"
 */
export function formatDateTimeVN(date) {
  return formatDateVN(date, "HH:mm dd/MM/yyyy");
}

/**
 * Format ngày theo dạng ngắn gọn
 * @param {string|Date} date
 * @returns {string} "11/05/2026"
 */
export function formatShortDateVN(date) {
  return formatDateVN(date, "dd/MM/yyyy");
}

/**
 * Format ngày theo dạng dài (có tên thứ)
 * @param {string|Date} date
 * @returns {string} "Thứ Hai, 11/05/2026"
 */
export function formatLongDateVN(date) {
  return formatDateVN(date, "EEEE, dd/MM/yyyy");
}

/**
 * Chuyển date string (YYYY-MM-DD) thành hiển thị DD/MM/YYYY
 * @param {string} isoDateStr - "2026-05-11"
 * @returns {string} "11/05/2026"
 */
export function isoToDisplayDate(isoDateStr) {
  if (!isoDateStr) return "";
  const parts = isoDateStr.split("T")[0].split("-");
  if (parts.length !== 3) return isoDateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ===================== CALCULATIONS =====================

/**
 * Thêm N ngày vào một ngày
 * @param {string|Date} date
 * @param {number} days
 * @returns {string} YYYY-MM-DD
 */
export function addDaysVN(date, days) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(addDays(d, days), "yyyy-MM-dd");
}

/**
 * Thêm N tháng vào một ngày
 * @param {string|Date} date
 * @param {number} months
 * @returns {string} YYYY-MM-DD
 */
export function addMonthsVN(date, months) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(addMonths(d, months), "yyyy-MM-dd");
}

/**
 * Tính số ngày chênh lệch giữa 2 ngày
 * @param {string|Date} dateA
 * @param {string|Date} dateB
 * @returns {number}
 */
export function diffDays(dateA, dateB) {
  const a = typeof dateA === "string" ? new Date(dateA) : dateA;
  const b = typeof dateB === "string" ? new Date(dateB) : dateB;
  return differenceInDays(a, b);
}

// ===================== COMPARISONS =====================

/**
 * Kiểm tra date A có sau date B không
 */
export function isDateAfter(dateA, dateB) {
  const a = typeof dateA === "string" ? new Date(dateA) : dateA;
  const b = typeof dateB === "string" ? new Date(dateB) : dateB;
  return isAfter(startOfDay(a), startOfDay(b));
}

/**
 * Kiểm tra date A có trước date B không
 */
export function isDateBefore(dateA, dateB) {
  const a = typeof dateA === "string" ? new Date(dateA) : dateA;
  const b = typeof dateB === "string" ? new Date(dateB) : dateB;
  return isBefore(startOfDay(a), startOfDay(b));
}

/**
 * Kiểm tra 2 ngày có giống nhau không (bỏ qua giờ)
 */
export function isSameDate(dateA, dateB) {
  const a = typeof dateA === "string" ? new Date(dateA) : dateA;
  const b = typeof dateB === "string" ? new Date(dateB) : dateB;
  return isEqual(startOfDay(a), startOfDay(b));
}

// ===================== RE-EXPORTS =====================
// Re-export date-fns functions for convenience
export { format, parse, addDays, addMonths, differenceInDays, isAfter, isBefore, isEqual, startOfDay };
export { vi as viLocale } from "date-fns/locale";
