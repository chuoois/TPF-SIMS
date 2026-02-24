import { useEffect, useState } from "react";
import { masterDataService } from "@/services/master-data.service";
import { Plus, Pencil, Trash2, X, ListChecks } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Component WoodTypeManage
 * Quản lý danh mục loại gỗ (Master Data)
 * 
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */
export default function WoodTypeManage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = items.filter((item) =>
        item.wood_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.wood_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const validationSchema = Yup.object().shape({
        wood_code: Yup.string()
            .trim()
            .required("Vui lòng nhập mã loại gỗ")
            .max(50, "Tối đa 50 ký tự"),
        wood_name: Yup.string()
            .trim()
            .required("Vui lòng nhập tên loại gỗ")
            .max(255, "Tối đa 255 ký tự"),
        description: Yup.string().trim().nullable(),
        wood_status: Yup.string().oneOf(["ACTIVE", "INACTIVE"], "Trạng thái không hợp lệ"),
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

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await masterDataService.getAllWoodTypes();
            setItems(data);
        } catch (error) {
            console.error("Error fetching wood types:", error);
            toast.error("Không thể tải danh sách loại gỗ");
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
        if (!window.confirm("Bạn có chắc chắn muốn xóa loại gỗ này không?")) return;
        try {
            await masterDataService.deleteWoodType(id);
            toast.success("Xóa thành công");
            fetchItems();
        } catch (error) {
            toast.error("Không thể xóa (có thể đang được sử dụng trong sản phẩm)");
        }
    };

    if (loading) return <div className="p-8 text-center text-primary animate-pulse">Đang tải dữ liệu...</div>;

    return (
        <>
            <PageHelmet title="Quản lý loại gỗ - TPF-SIMS" />
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ListChecks className="h-6 w-6 text-primary" />
                            Quản lý loại gỗ
                        </h1>
                        <p className="text-gray-500">Danh mục các loại gỗ sử dụng trong chế tác</p>
                    </div>
                    <Button onClick={handleOpenCreate} className="flex items-center gap-2">
                        <Plus size={20} />
                        <span>Thêm loại gỗ</span>
                    </Button>
                </div>

                <div className="bg-white p-3 border rounded-md shadow-sm">
                    <Input
                        placeholder="Tìm theo mã hoặc tên loại gỗ..."
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
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mã loại</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Tên loại gỗ</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Mô tả</th>
                                        <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest w-[120px]">Trạng thái</th>
                                        <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y bg-white">
                                    {filteredItems.map((item, index) => (
                                        <tr key={item.pk_wood_type_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-xs text-gray-400 font-medium">{index + 1}</td>
                                            <td className="p-4 font-bold text-primary text-sm">{item.wood_code}</td>
                                            <td className="p-4 text-sm font-medium text-gray-800">{item.wood_name}</td>
                                            <td className="p-4 text-xs text-gray-500 max-w-[300px] truncate" title={item.description}>
                                                {item.description || "-"}
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${item.wood_status === "ACTIVE"
                                                        ? "bg-green-50 text-green-600 border border-green-100"
                                                        : "bg-gray-50 text-gray-400 border border-gray-100"
                                                    }`}>
                                                    {item.wood_status === "ACTIVE" ? "Hoạt động" : "Khóa"}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-sm">
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
                                                        onClick={() => handleDelete(item.pk_wood_type_id)}
                                                        className="h-8 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} /> <span className="ml-1 text-[11px] font-bold uppercase">Xóa</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <Card className="w-full max-w-lg bg-white shadow-2xl border-none overflow-hidden rounded-xl">
                            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                                <CardTitle className="text-lg font-bold text-primary uppercase tracking-tight">
                                    {currentItem ? "Cập nhật loại gỗ" : "Thêm loại gỗ mới"}
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={handleCloseModal} className="rounded-full text-gray-400">
                                    <X size={20} />
                                </Button>
                            </div>

                            <Formik
                                enableReinitialize
                                initialValues={{
                                    wood_code: currentItem?.wood_code || "",
                                    wood_name: currentItem?.wood_name || "",
                                    description: currentItem?.description || "",
                                    wood_status: currentItem?.wood_status || "ACTIVE",
                                }}
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setSubmitting }) => {
                                    try {
                                        if (currentItem) {
                                            await masterDataService.updateWoodType(currentItem.pk_wood_type_id, values);
                                            toast.success("Cập nhật thành công");
                                        } else {
                                            await masterDataService.createWoodType(values);
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
                                    <Form className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <Label className={touched.wood_code && errors.wood_code ? "text-red-500" : ""}>
                                                Mã loại gỗ <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                {...getFieldProps("wood_code")}
                                                disabled={!!currentItem}
                                                className={`h-11 ${inputErrorClass(touched.wood_code, errors.wood_code)} ${!!currentItem ? "bg-gray-50" : ""}`}
                                                placeholder="VD: GO_HUONG, GO_DO..."
                                            />
                                            <FieldError name="wood_code" />
                                        </div>

                                        <div className="space-y-1">
                                            <Label className={touched.wood_name && errors.wood_name ? "text-red-500" : ""}>
                                                Tên loại gỗ <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                {...getFieldProps("wood_name")}
                                                className={`h-11 ${inputErrorClass(touched.wood_name, errors.wood_name)}`}
                                                placeholder="VD: Gỗ Hương Đá, Gỗ Gõ Đỏ..."
                                            />
                                            <FieldError name="wood_name" />
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Mô tả</Label>
                                            <Field
                                                as="textarea"
                                                name="description"
                                                className="w-full min-h-[100px] border border-gray-200 rounded-md p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                                                placeholder="Thông tin thêm về loại gỗ..."
                                            />
                                        </div>

                                        {currentItem && (
                                            <div className="space-y-1">
                                                <Label>Trạng thái</Label>
                                                <Field as="select" name="wood_status" className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm bg-white outline-none focus:ring-1 focus:ring-primary font-medium">
                                                    <option value="ACTIVE">Hoạt động</option>
                                                    <option value="INACTIVE">Khóa / Ngừng sử dụng</option>
                                                </Field>
                                            </div>
                                        )}

                                        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                                            <Button type="button" variant="outline" onClick={handleCloseModal} className="h-11 px-6 font-bold uppercase text-[12px] tracking-wider">
                                                Hủy
                                            </Button>
                                            <Button type="submit" disabled={isSubmitting} className="h-11 px-8 font-bold uppercase text-[12px] tracking-wider">
                                                {isSubmitting ? "Đang lưu..." : currentItem ? "Cập nhật" : "Lưu dữ liệu"}
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
