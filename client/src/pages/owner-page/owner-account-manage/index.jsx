/**
 * Component OwnerAccountManage
 * Quản lý tài khoản nhân viên (CRUD)
 *
 * Created By: ThinhBui
 * Created Date: 18/02/2026
 */

import { useEffect, useState } from "react";
import { ownerService } from "../../../services/owner.service";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";

import {
  Card,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OwnerAccountManage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  // ================= VALIDATION =================
  const accountSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email không hợp lệ")
      .required("Vui lòng nhập email"),

    password: Yup.string().when("isEdit", {
      is: false,
      then: (schema) =>
        schema
          .required("Vui lòng nhập mật khẩu")
          .min(6, "Mật khẩu tối thiểu 6 ký tự"),
      otherwise: (schema) => schema.notRequired(),
    }),

    fullName: Yup.string().required("Vui lòng nhập họ tên"),

    roleCode: Yup.string().required("Vui lòng chọn vai trò"),

    phoneNumber: Yup.string(),

    gender: Yup.number().required(),

    salaryType: Yup.number().required(),

    status: Yup.number(),
  });

  // ================= FETCH =================
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await ownerService.getAllAccounts();
      setAccounts(data);
    } catch (error) {
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  // ================= MODAL =================
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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) return;

    try {
      await ownerService.deleteAccount(id);
      toast.success("Xóa tài khoản thành công");
      fetchAccounts();
    } catch (error) {
      toast.error("Lỗi khi xóa tài khoản");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
          <p className="text-muted-foreground">
            Quản lý nhân viên và tài khoản hệ thống
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="flex items-center gap-2">
          <Plus size={20} />
          Thêm tài khoản
        </Button>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Họ tên</th>
                <th className="p-4">SĐT</th>
                <th className="p-4">Vai trò</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {accounts.map((acc) => (
                <tr key={acc.pk_user_account_id} className="hover:bg-gray-50">
                  <td className="p-4">{acc.email}</td>
                  <td className="p-4">{acc.profile?.full_name || "-"}</td>
                  <td className="p-4">{acc.profile?.phone_number || "-"}</td>
                  <td className="p-4">
                    {acc.role?.role_name || acc.role?.role_code}
                  </td>
                  <td className="p-4">
                    {acc.status === 1 ? "Hoạt động" : "Khóa"}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(acc)}
                    >
                      <Pencil size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleDelete(acc.pk_user_account_id)
                      }
                    >
                      <Trash2 size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    Chưa có tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <CardTitle>
                {currentAccount
                  ? "Cập nhật tài khoản"
                  : "Thêm tài khoản mới"}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleCloseModal}>
                <X size={24} />
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
                  ? new Date(currentAccount.profile.dob)
                      .toISOString()
                      .split("T")[0]
                  : "",
                isEdit: !!currentAccount,
              }}
              validationSchema={accountSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  if (currentAccount) {
                    await ownerService.updateAccount(
                      currentAccount.pk_user_account_id,
                      values
                    );
                    toast.success("Cập nhật tài khoản thành công");
                  } else {
                    await ownerService.createAccount(values);
                    toast.success("Tạo tài khoản thành công");
                  }

                  fetchAccounts();
                  handleCloseModal();
                } catch (error) {
                  toast.error(
                    error.response?.data?.message ||
                      "Lỗi khi lưu tài khoản"
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Email</Label>
                      <Field
                        name="email"
                        type="email"
                        as={Input}
                        disabled={!!currentAccount}
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    {!currentAccount && (
                      <div>
                        <Label>Mật khẩu</Label>
                        <Field
                          name="password"
                          type="password"
                          as={Input}
                        />
                        <ErrorMessage
                          name="password"
                          component="div"
                          className="text-red-500 text-sm"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Họ tên</Label>
                      <Field name="fullName" as={Input} />
                      <ErrorMessage
                        name="fullName"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label>Vai trò</Label>
                      <Field as="select" name="roleCode" className="w-full border rounded px-3 py-2">
                        <option value="">Chọn vai trò</option>
                        <option value="SALES">Nhân viên bán hàng</option>
                        <option value="ACCOUNTANT">Kế toán</option>
                        <option value="WORKER">Thợ</option>
                        <option value="OWNER">Chủ cửa hàng</option>
                      </Field>
                      <ErrorMessage
                        name="roleCode"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>

                    <div>
                      <Label>Ngày sinh</Label>
                      <Field type="date" name="dob" as={Input} />
                    </div>

                    <div>
                      <Label>Giới tính</Label>
                      <Field as="select" name="gender" className="w-full border rounded px-3 py-2">
                        <option value={0}>Nữ</option>
                        <option value={1}>Nam</option>
                      </Field>
                    </div>

                    <div>
                      <Label>Loại lương</Label>
                      <Field as="select" name="salaryType" className="w-full border rounded px-3 py-2">
                        <option value={1}>Theo giờ</option>
                        <option value={2}>Theo tháng</option>
                      </Field>
                    </div>

                    {currentAccount && (
                      <div>
                        <Label>Trạng thái</Label>
                        <Field as="select" name="status" className="w-full border rounded px-3 py-2">
                          <option value={1}>Hoạt động</option>
                          <option value={0}>Khóa</option>
                        </Field>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCloseModal}>
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {currentAccount ? "Cập nhật" : "Tạo tài khoản"}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Card>
        </div>
      )}
    </div>
  );
}
