/**
 * Component OwnerAccountManage
 * Quản lý tài khoản nhân viên (CRUD)
 *
 * Created By: ThinhBui
 * Created Date: 18/02/2026
 */

import { useEffect, useState } from "react";
import { ownerService } from "../../../services/owner.service";
import { Plus, Pencil, Trash2, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import useDebounce from "@/hooks/useDebounce";
import { PageHelmet } from "@/components/seo/PageHelmet"
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function OwnerAccountManage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  // SEARCH & FILTER STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // ================= STATS =================
  const stats = {
    total: accounts.length,
    active: accounts.filter((a) => a.status === 1).length,
    locked: accounts.filter((a) => a.status === -1).length,
    inactive: accounts.filter((a) => a.status === 0).length,
  };

  // ================= FILTERED ACCOUNTS =================
  // LƯU Ý: Hiện tại server-side search chỉ tìm theo searchTerm. 
  // Code dưới đây lọc thêm theo Role/Status client-side từ kết quả phân trang.
  const filteredAccounts = accounts.filter((acc) => {
    const matchesRole = filterRole ? acc.role?.role_code === filterRole : true;
    const matchesStatus =
      filterStatus !== "" ? acc.status === Number(filterStatus) : true;
    return matchesRole && matchesStatus;
  });

  // ================= VALIDATION =================
  const accountSchema = Yup.object().shape({
    email: Yup.string()
      .trim()
      .email("Email không đúng định dạng")
      .required("Vui lòng nhập email"),
    password: Yup.string().when("isEdit", {
      is: false,
      then: (schema) =>
        schema
          .required("Vui lòng nhập mật khẩu")
          .min(6, "Mật khẩu tối thiểu 6 ký tự"),
      otherwise: (schema) => schema.notRequired(),
    }),
    fullName: Yup.string()
      .trim()
      .min(2, "Họ tên quá ngắn")
      .required("Vui lòng nhập họ tên nhân viên"),
    roleCode: Yup.string().required("Vui lòng chọn vai trò"),
    phoneNumber: Yup.string()
      .trim()
      .matches(
        /^(0[3|5|7|8|9])+([0-9]{8})$/,
        "Số điện thoại không hợp lệ (ví dụ: 0901234567)"
      )
      .nullable(),
    dob: Yup.date()
      .max(new Date(), "Ngày sinh không được ở tương lai")
      .nullable()
      .transform((curr, orig) => (orig === "" ? null : curr)),
    gender: Yup.number().required("Vui lòng chọn giới tính"),
    salaryType: Yup.number().required("Vui lòng chọn loại lương"),
    status: Yup.number(),
  });

  const FieldError = ({ name }) => (
    <ErrorMessage
      name={name}
      render={(msg) => (
        <p className="text-[11px] text-red-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
          {msg}
        </p>
      )}
    />
  );

  const inputErrorClass = (touched, error) =>
    touched && error ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10" : "border-gray-200";

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // ================= FETCH =================
  useEffect(() => {
    fetchAccounts(1);
  }, [debouncedSearchTerm]);

  const fetchAccounts = async (page = 1) => {
    try {
      setLoading(true);
      const data = await ownerService.getAllAccounts(page, limit, searchTerm);
      setAccounts(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.page || 1);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAccounts(newPage);
    }
  };

  // ================= HANDLERS =================
  const handleOpenCreate = () => {
    setCurrentAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (account) => {
    setCurrentAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAccount(null);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ownerService.updateAccountStatus(id, newStatus);
      toast.success("Cập nhật trạng thái thành công");
      fetchAccounts();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;
    try {
      await ownerService.deleteAccount(id);
      toast.success("Xóa tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Lỗi khi xóa tài khoản");
    }
  };

  if (loading) return <div className="p-8 text-center text-primary animate-pulse">Đang tải dữ liệu...</div>;

  return (
    <>
      <PageHelmet title="Quản lý tài khoản - TPF-SIMS" />
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản</h1>
            <p className="text-gray-500">
              Hệ thống quản trị tài khoản TPF-SIMS
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="flex items-center gap-2">
            <Plus size={20} />
            <span>Thêm tài khoản</span>
          </Button>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Tổng số", value: stats.total, border: "border-gray-200" },
            { label: "Hoạt động", value: stats.active, border: "border-gray-200", text: "text-primary" },
            { label: "Tạm nghỉ", value: stats.inactive, border: "border-gray-200", text: "text-zinc-500" },
            { label: "Đã khóa", value: stats.locked, border: "border-gray-200", text: "text-gray-400" },
          ].map((item, idx) => (
            <Card key={idx} className={`bg-white shadow-none border ${item.border}`}>
              <CardContent className="p-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
                <h3 className={`text-2xl font-bold mt-1 ${item.text || "text-primary"}`}>{item.value}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-3 border rounded-md flex flex-col md:flex-row gap-3 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Tìm theo email, họ tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 border-gray-200 pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="h-10 border rounded-md px-3 text-sm bg-white border-gray-200 text-gray-600 outline-none"
            >
              <option value="">Tất cả vai trò</option>
              <option value="SALES">Bán hàng</option>
              <option value="ACCOUNTANT">Kế toán</option>
              <option value="WORKER">Thợ</option>
              <option value="OWNER">Chủ</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 border rounded-md px-3 text-sm bg-white border-gray-200 text-gray-600 outline-none"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="1">Hoạt động</option>
              <option value="0">Tạm nghỉ</option>
              <option value="-1">Đã khóa</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <Card className="border shadow-none overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-auto h-[calc(100vh-350px)] relative">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                  <tr>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[50px]">#</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Người dùng / Email</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">SĐT / Vai trò</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Trạng thái (Đổi nhanh)</th>
                    <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {filteredAccounts.map((acc, index) => (
                    <tr key={acc.pk_user_account_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-xs text-gray-400 font-medium">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0 border border-gray-200">
                            {(acc.profile?.full_name || acc.email).charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-gray-800 truncate text-sm" title={acc.profile?.full_name}>
                              {acc.profile?.full_name || "Chưa đặt tên"}
                            </p>
                            <p className="text-xs text-gray-400 truncate" title={acc.email}>{acc.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-gray-700 font-medium">{acc.profile?.phone_number || "-"}</p>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {acc.role?.role_name || acc.role?.role_code}
                        </p>
                      </td>
                      <td className="p-4">
                        <select
                          value={acc.status}
                          onChange={(e) => handleStatusChange(acc.pk_user_account_id, Number(e.target.value))}
                          title="Bấm để thay đổi nhanh trạng thái"
                          className={`text-[11px] uppercase tracking-wider rounded border px-3 py-1.5 outline-none font-bold cursor-pointer transition-all ${acc.status === 1 ? "bg-white text-gray-800 border-gray-300" :
                            acc.status === 0 ? "bg-gray-50 text-gray-400 border-gray-200" :
                              "bg-red-50 text-red-500 border-red-100"
                            }`}
                        >
                          <option value={1}>Hoạt động</option>
                          <option value={0}>Tạm nghỉ</option>
                          <option value={-1}>Đã khóa</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(acc)}
                            title="Chỉnh sửa chi tiết"
                            className="h-8 px-2 text-gray-400 hover:text-primary hover:bg-gray-100"
                          >
                            <Pencil size={14} /> <span className="ml-1 text-[11px] font-bold uppercase">Sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(acc.pk_user_account_id)}
                            title="Xóa tài khoản"
                            className="h-8 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} /> <span className="ml-1 text-[11px] font-bold uppercase">Xóa</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAccounts.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-300">
                          <p className="text-sm font-medium">Không tìm thấy kết quả phù hợp</p>
                          <Button variant="link" size="sm" onClick={() => { setSearchTerm(""); setFilterRole(""); setFilterStatus(""); }} className="mt-2 text-primary font-bold">
                            Đặt lại bộ lọc
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          {/* PAGINATION CONTROLS */}
          <div className="bg-gray-50/50 border-t p-3 flex justify-between items-center">
            <div className="text-xs text-gray-500 italic">
              Hiển thị {filteredAccounts.length} / {totalItems} tài khoản
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === 1 || loading}
                onClick={() => handlePageChange(currentPage - 1)}
                className="h-8 w-8 border-gray-200 shadow-none"
              >
                <ChevronLeft size={14} />
              </Button>
              <div className="bg-white border rounded-md h-8 px-3 flex items-center justify-center min-w-[60px] shadow-sm">
                <span className="text-xs font-bold text-primary">
                  {currentPage}{" "}
                  <span className="text-gray-300 mx-1 font-normal">/</span>{" "}
                  {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="icon"
                disabled={currentPage === totalPages || loading}
                onClick={() => handlePageChange(currentPage + 1)}
                className="h-8 w-8 border-gray-200 shadow-none"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </Card>

        {/* ================= MODAL ================= */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <Card className="w-full max-w-xl bg-white shadow-2xl border-none overflow-hidden rounded-xl">
              <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                <CardTitle className="text-lg font-bold text-primary">
                  {currentAccount ? "Cập Nhật Nhân Sự" : "Tạo Tài Khoản Mới"}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="rounded-full text-gray-400">
                  <X size={20} />
                </Button>
              </div>

              <Formik
                enableReinitialize
                initialValues={{
                  email: currentAccount?.email || "",
                  password: "",
                  fullName: currentAccount?.profile?.full_name || "",
                  phoneNumber: currentAccount?.profile?.phone_number || "",
                  roleCode: currentAccount?.role?.role_code || "",
                  gender: currentAccount?.profile?.gender ?? 0,
                  salaryType: currentAccount?.profile?.salary_type ?? 1,
                  status: currentAccount?.status ?? 1,
                  dob: currentAccount?.profile?.dob
                    ? new Date(currentAccount.profile.dob).toISOString().split("T")[0]
                    : "",
                  isEdit: !!currentAccount,
                }}
                validationSchema={accountSchema}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    if (currentAccount) {
                      await ownerService.updateAccount(currentAccount.pk_user_account_id, values);
                      toast.success("Cập nhật tài khoản thành công");
                    } else {
                      await ownerService.createAccount(values);
                      toast.success("Tạo tài khoản thành công");
                    }
                    fetchAccounts();
                    handleCloseModal();
                  } catch (error) {
                    toast.error(error.response?.data?.message || "Lỗi khi lưu tài khoản");
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting, touched, errors, getFieldProps }) => (
                  <Form className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                    {/* PHẦN 1: THÔNG TIN TÀI KHOẢN */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-500 border-b pb-2 uppercase italic tracking-wider">Thông tin tài khoản</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={touched.email && errors.email ? "text-red-500" : ""}>
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            {...getFieldProps("email")}
                            type="email"
                            disabled={!!currentAccount}
                            className={`h-10 transition-all ${inputErrorClass(touched.email, errors.email)} ${!!currentAccount ? "bg-gray-100" : "bg-white"}`}
                            placeholder="example@gmail.com"
                          />
                          <FieldError name="email" />
                        </div>

                        {!currentAccount && (
                          <div className="space-y-1">
                            <Label className={touched.password && errors.password ? "text-red-500" : ""}>
                              Mật khẩu <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              {...getFieldProps("password")}
                              type="password"
                              className={`h-10 transition-all ${inputErrorClass(touched.password, errors.password)}`}
                              placeholder="••••••••"
                            />
                            <FieldError name="password" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <Label className={touched.roleCode && errors.roleCode ? "text-red-500" : ""}>
                            Vai trò <span className="text-red-500">*</span>
                          </Label>
                          <select
                            {...getFieldProps("roleCode")}
                            className={`w-full h-10 border rounded-md px-3 text-sm bg-white outline-none transition-all focus:ring-1 focus:ring-primary ${inputErrorClass(touched.roleCode, errors.roleCode)}`}
                          >
                            <option value="">Chọn vai trò</option>
                            <option value="SALES">Nhân viên bán hàng</option>
                            <option value="ACCOUNTANT">Kế toán</option>
                            <option value="WORKER">Thợ chế tác</option>
                            <option value="OWNER">Chủ cửa hàng</option>
                          </select>
                          <FieldError name="roleCode" />
                        </div>

                        {currentAccount && (
                          <div className="space-y-1">
                            <Label>Trạng thái</Label>
                            <Field as="select" name="status" className="w-full h-10 border rounded-md px-3 text-sm bg-white">
                              <option value={1}>Hoạt động</option>
                              <option value={0}>Tạm nghỉ</option>
                              <option value={-1}>Đã khóa / Nghỉ việc</option>
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* PHẦN 2: THÔNG TIN CÁ NHÂN */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-500 border-b pb-2 uppercase italic tracking-wider">Thông tin cá nhân</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className={touched.fullName && errors.fullName ? "text-red-500" : ""}>
                            Họ tên <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            {...getFieldProps("fullName")}
                            className={`h-10 transition-all ${inputErrorClass(touched.fullName, errors.fullName)}`}
                            placeholder="Nguyễn Văn A"
                          />
                          <FieldError name="fullName" />
                        </div>

                        <div className="space-y-1">
                          <Label className={touched.phoneNumber && errors.phoneNumber ? "text-red-500" : ""}>SĐT</Label>
                          <Input
                            {...getFieldProps("phoneNumber")}
                            className={`h-10 transition-all ${inputErrorClass(touched.phoneNumber, errors.phoneNumber)}`}
                            placeholder="0901234567"
                          />
                          <FieldError name="phoneNumber" />
                        </div>

                        <div className="space-y-1">
                          <Label className={touched.dob && errors.dob ? "text-red-500" : ""}>Ngày sinh</Label>
                          <Input
                            {...getFieldProps("dob")}
                            type="date"
                            className={`h-10 transition-all ${inputErrorClass(touched.dob, errors.dob)}`}
                          />
                          <FieldError name="dob" />
                        </div>

                        <div className="space-y-1">
                          <Label>Giới tính <span className="text-red-500">*</span></Label>
                          <select
                            {...getFieldProps("gender")}
                            className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={0}>Nữ</option>
                            <option value={1}>Nam</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <Label>Lương <span className="text-red-500">*</span></Label>
                          <select
                            {...getFieldProps("salaryType")}
                            className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-white outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value={1}>Theo giờ</option>
                            <option value={2}>Theo tháng</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={handleCloseModal}>
                        Đóng
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="font-bold">
                        {isSubmitting ? "Đang lưu..." : currentAccount ? "Cập nhật" : "Tạo tài khoản"}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
