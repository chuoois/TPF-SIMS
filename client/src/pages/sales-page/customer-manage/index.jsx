/**
 * Component SalesCustomerManage
 * Quản lý khách hàng dành cho nhân viên bán hàng (SALES/OWNER)
 * - Danh sách + tìm kiếm real-time
 * - Tạo mới / cập nhật hồ sơ khách hàng
 * - Thêm / cập nhật ghi chú đặc biệt
 *
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */

import { useEffect, useState, useCallback } from "react";
import { salesService } from "@/services/sales.service";
import {
  Plus,
  Pencil,
  NotebookPen,
  X,
  Search,
  Users,
  User,
  Building2,
} from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ===================== VALIDATION =====================
const customerSchema = Yup.object().shape({
  fullName: Yup.string().required("Vui lòng nhập họ tên"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ")
    .notRequired(),
  email: Yup.string().email("Email không hợp lệ").notRequired(),
  address: Yup.string().notRequired(),
  gender: Yup.string().notRequired(),
  dob: Yup.string().notRequired(),
  customerType: Yup.string().notRequired(),
  note: Yup.string().notRequired(),
});

const noteSchema = Yup.object().shape({
  note: Yup.string().required("Vui lòng nhập nội dung ghi chú"),
});

// ===================== HELPERS =====================
const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("vi-VN");
};

export default function SalesCustomerManage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);

  // ---- Debounce search ----
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ---- Fetch danh sách ----
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await salesService.getCustomers(debouncedSearch);
      setCustomers(data);
    } catch {
      toast.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ---- Stats ----
  const stats = {
    total: customers.length,
    individual: customers.filter((c) => c.customer_type === "Cá nhân").length,
    business: customers.filter((c) => c.customer_type === "Doanh nghiệp")
      .length,
  };

  // ---- Handlers ----
  const handleOpenCreate = () => {
    setCurrentCustomer(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer) => {
    setCurrentCustomer(customer);
    setIsFormOpen(true);
  };

  const handleOpenNote = (customer) => {
    setCurrentCustomer(customer);
    setIsNoteOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentCustomer(null);
  };

  const handleCloseNote = () => {
    setIsNoteOpen(false);
    setCurrentCustomer(null);
  };

  const handleSubmitForm = async (values, { setSubmitting }) => {
    try {
      if (currentCustomer) {
        await salesService.updateCustomer(
          currentCustomer.pk_customer_id,
          values,
        );
        toast.success("Cập nhật hồ sơ thành công");
      } else {
        await salesService.createCustomer(values);
        toast.success("Tạo hồ sơ khách hàng thành công");
      }
      fetchCustomers();
      handleCloseForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu hồ sơ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitNote = async (values, { setSubmitting }) => {
    try {
      await salesService.updateCustomerNote(
        currentCustomer.pk_customer_id,
        values.note,
      );
      toast.success("Ghi chú đã được cập nhật");
      fetchCustomers();
      handleCloseNote();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi cập nhật ghi chú");
    } finally {
      setSubmitting(false);
    }
  };

  // ===================== RENDER =====================
  return (
    <>
      <PageHelmet title="Quản lý khách hàng - TPF-SIMS" />
      <div className="space-y-6">
        {/* ─── HEADER ─── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Quản lý khách hàng
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Hồ sơ và thông tin khách hàng TPF-SIMS
            </p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            <span>Thêm khách hàng</span>
          </Button>
        </div>

        {/* ─── STATS ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "Tổng khách hàng",
              value: stats.total,
              icon: Users,
              color: "text-primary",
            },
            {
              label: "Cá nhân",
              value: stats.individual,
              icon: User,
              color: "text-blue-500",
            },
            {
              label: "Doanh nghiệp",
              value: stats.business,
              icon: Building2,
              color: "text-amber-500",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card
                key={idx}
                className="bg-white shadow-none border border-gray-200"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-lg bg-gray-50 border ${item.color}`}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      {item.label}
                    </p>
                    <h3 className={`text-2xl font-bold mt-0.5 ${item.color}`}>
                      {item.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ─── SEARCH BAR ─── */}
        <div className="bg-white p-3 border rounded-md shadow-sm flex gap-3 items-center">
          <Search size={16} className="text-gray-400 shrink-0" />
          <Input
            placeholder="Tìm theo tên, số điện thoại, mã khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-9 border-0 shadow-none focus-visible:ring-0 p-0"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSearchTerm("")}
            >
              <X size={14} />
            </Button>
          )}
        </div>

        {/* ─── TABLE ─── */}
        <Card className="border shadow-none overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-16 text-center text-primary animate-pulse">
                Đang tải dữ liệu...
              </div>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-380px)] relative">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                    <tr>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[50px]">
                        #
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Khách hàng
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        SĐT / Email
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Loại / Địa chỉ
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Ghi chú
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Ngày tạo
                      </th>
                      <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {customers.map((c, index) => (
                      <tr
                        key={c.pk_customer_id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-4 text-xs text-gray-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 border border-primary/20">
                              {c.full_name?.charAt(0)?.toUpperCase() ?? "K"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                {c.full_name}
                              </p>
                              <p className="text-[10px] text-gray-400 font-mono tracking-wider">
                                {c.customer_code}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-gray-700 font-medium">
                            {c.phone_number || "—"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {c.email || "—"}
                          </p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                              c.customer_type === "Doanh nghiệp"
                                ? "bg-amber-50 text-amber-600 border border-amber-200"
                                : "bg-blue-50 text-blue-600 border border-blue-200"
                            }`}
                          >
                            {c.customer_type || "Cá nhân"}
                          </span>
                          <p
                            className="text-xs text-gray-400 mt-1 max-w-[160px] truncate"
                            title={c.address}
                          >
                            {c.address || "—"}
                          </p>
                        </td>
                        <td className="p-4 max-w-[180px]">
                          {c.note ? (
                            <p
                              className="text-xs text-gray-600 italic line-clamp-2"
                              title={c.note}
                            >
                              {c.note}
                            </p>
                          ) : (
                            <span className="text-xs text-gray-300">
                              Chưa có ghi chú
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-xs text-gray-400">
                          {formatDate(c.created_at)}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEdit(c)}
                              className="h-8 px-2 text-gray-400 hover:text-primary hover:bg-gray-100"
                              title="Chỉnh sửa hồ sơ"
                            >
                              <Pencil size={13} />
                              <span className="ml-1 text-[11px] font-bold uppercase">
                                Sửa
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenNote(c)}
                              className="h-8 px-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50"
                              title="Ghi chú đặc biệt"
                            >
                              <NotebookPen size={13} />
                              <span className="ml-1 text-[11px] font-bold uppercase">
                                Ghi chú
                              </span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {customers.length === 0 && !loading && (
                      <tr>
                        <td colSpan="7" className="p-16 text-center">
                          <div className="flex flex-col items-center text-gray-300">
                            <Users size={40} className="mb-3" />
                            <p className="text-sm font-medium">
                              {debouncedSearch
                                ? `Không tìm thấy kết quả cho "${debouncedSearch}"`
                                : "Chưa có khách hàng nào"}
                            </p>
                            {debouncedSearch && (
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => setSearchTerm("")}
                                className="mt-2 text-primary font-bold"
                              >
                                Xoá bộ lọc
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================== MODAL: TẠO / SỬA HỒ SƠ ===================== */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <Card className="w-full max-w-2xl bg-white shadow-2xl border-none overflow-hidden rounded-xl">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <CardTitle className="text-lg font-bold text-primary">
                {currentCustomer
                  ? "Cập nhật hồ sơ khách hàng"
                  : "Tạo hồ sơ khách hàng mới"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseForm}
                className="rounded-full text-gray-400"
              >
                <X size={20} />
              </Button>
            </div>

            <Formik
              enableReinitialize
              initialValues={{
                fullName: currentCustomer?.full_name || "",
                phoneNumber: currentCustomer?.phone_number || "",
                email: currentCustomer?.email || "",
                address: currentCustomer?.address || "",
                gender: currentCustomer?.gender || "Nam",
                dob: currentCustomer?.dob
                  ? new Date(currentCustomer.dob).toISOString().split("T")[0]
                  : "",
                customerType: currentCustomer?.customer_type || "Cá nhân",
                note: currentCustomer?.note || "",
              }}
              validationSchema={customerSchema}
              onSubmit={handleSubmitForm}
            >
              {({ isSubmitting }) => (
                <Form className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                  {/* ── THÔNG TIN CƠ BẢN ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 border-b pb-2 uppercase italic tracking-wider">
                      Thông tin cơ bản
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1">
                        <Label>
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Field
                          name="fullName"
                          as={Input}
                          placeholder="Nguyễn Văn A"
                        />
                        <ErrorMessage
                          name="fullName"
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Số điện thoại</Label>
                        <Field
                          name="phoneNumber"
                          as={Input}
                          placeholder="0901234567"
                        />
                        <ErrorMessage
                          name="phoneNumber"
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Email</Label>
                        <Field
                          name="email"
                          type="email"
                          as={Input}
                          placeholder="example@gmail.com"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-red-500 text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Giới tính</Label>
                        <Field
                          as="select"
                          name="gender"
                          className="w-full h-10 border rounded-md px-3 text-sm bg-white"
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </Field>
                      </div>

                      <div className="space-y-1">
                        <Label>Ngày sinh</Label>
                        <Field type="date" name="dob" as={Input} />
                      </div>

                      <div className="space-y-1">
                        <Label>Loại khách hàng</Label>
                        <Field
                          as="select"
                          name="customerType"
                          className="w-full h-10 border rounded-md px-3 text-sm bg-white"
                        >
                          <option value="Cá nhân">Cá nhân</option>
                          <option value="Doanh nghiệp">Doanh nghiệp</option>
                        </Field>
                      </div>

                      <div className="col-span-2 space-y-1">
                        <Label>Địa chỉ</Label>
                        <Field
                          name="address"
                          as={Input}
                          placeholder="123 Lê Lợi, Quận 1, TP.HCM"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── GHI CHÚ (khi tạo mới) ── */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-500 border-b pb-2 uppercase italic tracking-wider">
                      Ghi chú thêm
                    </h4>
                    <div className="space-y-1">
                      <Label>Ghi chú</Label>
                      <Field
                        name="note"
                        as="textarea"
                        rows={3}
                        placeholder="Ghi chú về sở thích, yêu cầu đặc biệt..."
                        className="w-full border rounded-md px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseForm}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="font-bold"
                    >
                      {isSubmitting
                        ? "Đang lưu..."
                        : currentCustomer
                          ? "Cập nhật"
                          : "Tạo hồ sơ"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        </div>
      )}

      {/* ===================== MODAL: GHI CHÚ ĐẶC BIỆT ===================== */}
      {isNoteOpen && currentCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <Card className="w-full max-w-lg bg-white shadow-2xl border-none overflow-hidden rounded-xl">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <div>
                <CardTitle className="text-lg font-bold text-amber-600 flex items-center gap-2">
                  <NotebookPen size={18} />
                  Ghi chú đặc biệt
                </CardTitle>
                <p className="text-xs text-gray-400 mt-0.5">
                  {currentCustomer.full_name} – {currentCustomer.customer_code}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseNote}
                className="rounded-full text-gray-400"
              >
                <X size={20} />
              </Button>
            </div>

            <Formik
              enableReinitialize
              initialValues={{ note: currentCustomer?.note || "" }}
              validationSchema={noteSchema}
              onSubmit={handleSubmitNote}
            >
              {({ isSubmitting }) => (
                <Form className="p-6 space-y-4">
                  <div className="space-y-1">
                    <Label>
                      Nội dung ghi chú <span className="text-red-500">*</span>
                    </Label>
                    <Field
                      name="note"
                      as="textarea"
                      rows={5}
                      placeholder="VD: Giao trước 16h, sơn màu kem ivory, lắp tầng 3 bên trái..."
                      className="w-full border rounded-md px-3 py-2 text-sm bg-white resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <ErrorMessage
                      name="note"
                      component="div"
                      className="text-red-500 text-xs"
                    />
                  </div>
                  <p className="text-xs text-gray-400 bg-amber-50 border border-amber-100 rounded-md p-3">
                    💡 Ghi chú dành cho các yêu cầu đặc biệt: ngày giao hàng,
                    màu sơn, vị trí lắp đặt...
                  </p>
                  <div className="flex justify-end gap-3 pt-2 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseNote}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="font-bold bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {isSubmitting ? "Đang lưu..." : "Lưu ghi chú"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        </div>
      )}
    </>
  );
}
