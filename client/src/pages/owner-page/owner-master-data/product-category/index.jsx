import { useEffect, useState } from "react";
import { masterDataService } from "@/services/master-data.service";
import { Plus, Pencil, Trash2, X, LayoutGrid } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Component ProductCategoryManage
 * Quản lý danh mục loại sản phẩm (Master Data)
 * 
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */
export default function ProductCategoryManage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = items.filter((item) =>
        item.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validationSchema = Yup.object().shape({
        category_code: Yup.string()
            .trim()
            .required("Vui lòng nhập mã danh mục")
            .max(50, "Tối đa 50 ký tự"),
        category_name: Yup.string()
            .trim()
            .required("Vui lòng nhập tên danh mục")
            .max(150, "Tối đa 150 ký tự"),
        category_status: Yup.string().nullable(),
    });

    const FieldError = ({ name }) => (
        <p className="text-[11px] text-red-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
            <ErrorMessage name={name} />
        </p>
    );

    const inputErrorClass = (touched, error) =>
        touched && error ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10" : "border-gray-200";

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await masterDataService.getAllCategories();
            setItems(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Không thể tải danh mục sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setCurrentItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) return;
        try {
            await masterDataService.deleteCategory(id);
            toast.success("Xóa thành công");
            fetchItems();
        } catch (error) {
            toast.error("Không thể xóa (có thể đang có sản phẩm thuộc danh mục này)");
        }
    };

    if (loading) return <div className="p-8 text-center text-primary animate-pulse">Đang tải dữ liệu...</div>;

    return (
        <>
            <PageHelmet title="Danh mục sản phẩm - TPF-SIMS" />
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <LayoutGrid className="h-6 w-6 text-primary" />
                            Danh mục sản phẩm
                        </h1>
                        <p className="text-gray-500">Phòng khách, phòng ngủ, phòng thờ...</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                        <Plus size={20} />
                        <span>Thêm sản phẩm</span>
                    </Button>
                </div>

                <div className="bg-white p-3 border rounded-md shadow-sm">
                    <Input
                        placeholder="Tìm theo mã hoặc tên danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 border-gray-200"
                    />
                </div>

                <Card className="border shadow-none overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-auto max-h-[calc(100vh-250px)]">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                                    <tr>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[50px]">#</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mã danh mục</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tên danh mục</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Trạng thái</th>
                                        <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y bg-white">
                                    {filteredItems.map((item, index) => (
                                        <tr key={item.pk_product_category_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-xs text-gray-400 font-medium">{index + 1}</td>
                                            <td className="p-4 font-bold text-primary text-sm tracking-tight">{item.category_code}</td>
                                            <td className="p-4 text-sm font-semibold text-gray-800">{item.category_name}</td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${item.category_status === "ACTIVE"
                                                        ? "bg-green-50 text-green-600 border border-green-100"
                                                        : "bg-gray-50 text-gray-400 border border-gray-100"
                                                    }`}>
                                                    {item.category_status === "ACTIVE" ? "Hoạt động" : (item.category_status || "Khóa")}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="h-8 px-2 text-gray-400 hover:text-primary hover:bg-gray-100"
                                                    >
                                                        <Pencil size={14} /> <span className="ml-1 text-[11px] font-bold uppercase">Sửa</span>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.pk_product_category_id)}
                                                        className="h-8 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} /> <span className="ml-1 text-[11px] font-bold uppercase">Xóa</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-16 text-center text-gray-300">
                                                Chưa có dữ liệu danh mục
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <Card className="w-full max-w-md bg-white shadow-2xl border-none overflow-hidden rounded-xl">
                            <div className="flex justify-between items-center p-5 border-b bg-primary/5">
                                <CardTitle className="text-lg font-bold text-primary flex items-center gap-2 uppercase tracking-tight">
                                    <LayoutGrid size={18} />
                                    {currentItem ? "Cập nhật danh mục" : "Thêm danh mục sản phẩm"}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="rounded-full text-gray-400 ring-offset-background hover:bg-white transition-colors">
                                    <X size={20} />
                                </Button>
                            </div>

                            <Formik
                                enableReinitialize
                                initialValues={{
                                    category_code: currentItem?.category_code || "",
                                    category_name: currentItem?.category_name || "",
                                    category_status: currentItem?.category_status || "ACTIVE",
                                }}
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting }) => {
                                    try {
                                        if (currentItem) {
                                            await masterDataService.updateCategory(currentItem.pk_product_category_id, values);
                                            toast.success("Cập nhật thành công");
                                        } else {
                                            await masterDataService.createCategory(values);
                                            toast.success("Thêm mới thành công");
                                        }
                                        fetchItems();
                                        handleCloseModal();
                                    } catch (error) {
                                        toast.error(error.response?.data?.message || "Lỗi khi lưu dữ liệu");
                                    } finally {
                                        setSubmitting(false);
                                    }
                                }}
                            >
                                {({ isSubmitting, touched, errors, getFieldProps }) => (
                                    <Form className="p-6 space-y-5">
                                        <div className="space-y-1.5">
                                            <Label className={`text-[13px] font-bold transition-colors ${touched.category_code && errors.category_code ? "text-red-500" : "text-gray-700"}`}>
                                                Mã danh mục <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                {...getFieldProps("category_code")}
                                                disabled={!!currentItem}
                                                className={`h-11 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 ${inputErrorClass(touched.category_code, errors.category_code)} ${!!currentItem ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
                                                placeholder="VD: PHONG_KHACH, PHONG_NGU..."
                                            />
                                            <FieldError name="category_code" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className={`text-[13px] font-bold transition-colors ${touched.category_name && errors.category_name ? "text-red-500" : "text-gray-700"}`}>
                                                Tên danh mục <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                {...getFieldProps("category_name")}
                                                className={`h-11 shadow-sm transition-all focus:ring-2 focus:ring-primary/20 ${inputErrorClass(touched.category_name, errors.category_name)}`}
                                                placeholder="VD: Nội thất phòng khách, Phòng thờ..."
                                            />
                                            <FieldError name="category_name" />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-[13px] font-bold text-gray-700">Trạng thái</Label>
                                            <Field as="select" name="category_status" className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm bg-white outline-none focus:ring-2 focus:ring-primary/20 font-medium shadow-sm transition-all">
                                                <option value="ACTIVE">Hoạt động</option>
                                                <option value="INACTIVE">Khóa / Ngừng sử dụng</option>
                                            </Field>
                                        </div>

                                        <div className="flex items-center gap-3 pt-6 border-t mt-6">
                                            <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest hover:bg-gray-50 transition-colors">
                                                Hủy bỏ
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest shadow-md shadow-primary/20 transition-all">
                                                {isSubmitting ? "Đang xử lý..." : currentItem ? "Cập nhật ngay" : "Thêm mới ngay"}
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
