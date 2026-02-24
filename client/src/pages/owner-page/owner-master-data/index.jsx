import { useEffect, useState } from "react";
import useDebounce from "@/hooks/useDebounce";
import { masterDataService } from "@/services/master-data.service";
import { Plus, Pencil, Trash2, X, ListChecks, LayoutGrid, Settings2, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-hot-toast";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * Component OwnerMasterDataManage
 * Giao diện hợp nhất quản lý danh mục (Loại gỗ & Loại sản phẩm) dùng Tab.
 * 
 * Created By: ThinhBui
 * Created Date: 24/02/2026
 */
export default function OwnerMasterDataManage() {
    const [activeTab, setActiveTab] = useState("wood-type");

    return (
        <>
            <PageHelmet title="Quản lý danh mục - TPF-SIMS" />
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            Quản lý danh mục hệ thống
                        </h1>
                        <p className="text-gray-500 text-sm">Quản lý các thông số master data cho sản phẩm</p>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex p-1 bg-gray-200/50 rounded-lg w-fit">
                    <button
                        onClick={() => setActiveTab("wood-type")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm transition-all",
                            activeTab === "wood-type"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        )}
                    >
                        <ListChecks size={18} />
                        Loại gỗ
                    </button>
                    <button
                        onClick={() => setActiveTab("category")}
                        className={cn(
                            "flex items-center gap-2 px-6 py-2 rounded-md font-bold text-sm transition-all",
                            activeTab === "category"
                                ? "bg-white text-primary shadow-sm"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                        )}
                    >
                        <LayoutGrid size={18} />
                        Danh mục sản phẩm
                    </button>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                    {activeTab === "wood-type" ? <WoodTypeSection /> : <CategorySection />}
                </div>
            </div>
        </>
    );
}

// --- Wood Type Section Component ---
function WoodTypeSection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filteredItems = items; // Server side filtered

    const validationSchema = Yup.object().shape({
        wood_code: Yup.string().trim().required("Vui lòng nhập mã loại gỗ").max(50, "Tối đa 50 ký tự"),
        wood_name: Yup.string().trim().required("Vui lòng nhập tên loại gỗ").max(255, "Tối đa 255 ký tự"),
        description: Yup.string().trim().nullable(),
        wood_status: Yup.string().oneOf(["ACTIVE", "INACTIVE"], "Trạng thái không hợp lệ"),
    });

    const FieldError = ({ name }) => (
        <ErrorMessage
            name={name}
            render={(msg) => (
                <p className="text-[11px] text-red-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">{msg}</p>
            )}
        />
    );

    useEffect(() => { fetchItems(1); }, [debouncedSearchTerm]);

    const fetchItems = async (page = 1) => {
        try {
            setLoading(true);
            const data = await masterDataService.getAllWoodTypes(page, limit, searchTerm);
            setItems(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
            setCurrentPage(data.page || 1);
        } catch (error) { console.error("Error fetching wood types:", error); }
        finally { setLoading(false); }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchItems(newPage);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa loại gỗ này?")) return;
        try {
            await masterDataService.deleteWoodType(id);
            toast.success("Xóa thành công");
            fetchItems();
        } catch (error) { toast.error("Không thể xóa item đang sử dụng"); }
    };

    if (loading) return <div className="p-12 text-center text-primary animate-pulse">Đang tải...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 border rounded-md shadow-sm gap-4">
                <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Tìm theo mã hoặc tên loại gỗ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 border-gray-200 pl-10"
                    />
                </div>
                <Button onClick={() => { setCurrentItem(null); setIsModalOpen(true); }} className="flex items-center gap-2">
                    <Plus size={20} />
                    <span>Thêm loại gỗ</span>
                </Button>
            </div>

            <Card className="border shadow-none overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-auto h-[calc(100vh-350px)] relative">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                                <tr>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[50px]">#</th>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mã loại</th>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tên loại gỗ</th>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[120px]">Trạng thái</th>
                                    <th className="p-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                                {filteredItems.map((item, index) => (
                                    <tr key={item.pk_wood_type_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-xs text-gray-400 font-medium">{index + 1}</td>
                                        <td className="p-4 font-bold text-primary text-sm tracking-tight">{item.wood_code}</td>
                                        <td className="p-4 text-sm font-medium text-gray-800">{item.wood_name}</td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border",
                                                item.wood_status === "ACTIVE" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                            )}>
                                                {item.wood_status === "ACTIVE" ? "Hoạt động" : "Khóa"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="h-8 px-2 text-gray-400 hover:text-primary hover:bg-gray-100">
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.pk_wood_type_id)} className="h-8 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {/* PAGINATION CONTROLS */}
                <div className="bg-gray-50/50 border-t p-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500 italic">
                        Hiển thị {items.length} / {totalItems} loại gỗ
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
                                {currentPage} <span className="text-gray-300 mx-1 font-normal">/</span> {totalPages}
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

            {isModalOpen && (
                <MasterDataModal
                    title={currentItem ? "Cập nhật loại gỗ" : "Thêm loại gỗ mới"}
                    initialValues={{
                        wood_code: currentItem?.wood_code || "",
                        wood_name: currentItem?.wood_name || "",
                        wood_status: currentItem?.wood_status || "ACTIVE",
                    }}
                    validationSchema={validationSchema}
                    isEdit={!!currentItem}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (values) => {
                        if (currentItem) await masterDataService.updateWoodType(currentItem.pk_wood_type_id, values);
                        else await masterDataService.createWoodType(values);
                        fetchItems();
                    }}
                    codeLabel="Mã loại gỗ"
                    nameLabel="Tên loại gỗ"
                />
            )}
        </div>
    );
}

// --- Category Section Component ---
function CategorySection() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filteredItems = items; // Server side filtered

    const validationSchema = Yup.object().shape({
        category_code: Yup.string().trim().required("Vui lòng nhập mã danh mục").max(50, "Tối đa 50 ký tự"),
        category_name: Yup.string().trim().required("Vui lòng nhập tên danh mục").max(150, "Tối đa 150 ký tự"),
        category_status: Yup.string().nullable(),
    });

    useEffect(() => { fetchItems(1); }, [debouncedSearchTerm]);

    const fetchItems = async (page = 1) => {
        try {
            setLoading(true);
            const data = await masterDataService.getAllCategories(page, limit, searchTerm);
            setItems(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
            setCurrentPage(data.page || 1);
        } catch (error) { toast.error("Không thể tải danh mục sản phẩm"); }
        finally { setLoading(false); }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchItems(newPage);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa danh mục này?")) return;
        try {
            await masterDataService.deleteCategory(id);
            toast.success("Xóa thành công");
            fetchItems();
        } catch (error) { toast.error("Không thể xóa item đang sử dụng"); }
    };

    if (loading) return <div className="p-12 text-center text-primary animate-pulse">Đang tải...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-3 border rounded-md shadow-sm gap-4">
                <div className="flex-1 relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Tìm theo mã hoặc tên danh mục..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 border-gray-200 pl-10"
                    />
                </div>
                <Button onClick={() => { setCurrentItem(null); setIsModalOpen(true); }} className="flex items-center gap-2">
                    <Plus size={20} />
                    <span>Thêm danh mục</span>
                </Button>
            </div>

            <Card className="border shadow-none overflow-hidden">
                <CardContent className="p-0">
                    <div className="overflow-auto h-[calc(100vh-350px)] relative">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                                <tr>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[50px]">#</th>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Mã danh mục</th>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tên danh mục</th>
                                    <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[120px]">Trạng thái</th>
                                    <th className="p-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y bg-white">
                                {filteredItems.map((item, index) => (
                                    <tr key={item.pk_product_category_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-xs text-gray-400 font-medium">{index + 1}</td>
                                        <td className="p-4 font-bold text-primary text-sm tracking-tight">{item.category_code}</td>
                                        <td className="p-4 text-sm font-semibold text-gray-800">{item.category_name}</td>
                                        <td className="p-4">
                                            <span className={cn(
                                                "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border",
                                                item.category_status === "ACTIVE" ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"
                                            )}>
                                                {item.category_status === "ACTIVE" ? "Hoạt động" : "Khóa"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => { setCurrentItem(item); setIsModalOpen(true); }} className="h-8 px-2 text-gray-400 hover:text-primary hover:bg-gray-100">
                                                    <Pencil size={14} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.pk_product_category_id)} className="h-8 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50">
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                {/* PAGINATION CONTROLS */}
                <div className="bg-gray-50/50 border-t p-3 flex justify-between items-center">
                    <div className="text-xs text-gray-500 italic">
                        Hiển thị {items.length} / {totalItems} danh mục
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
                                {currentPage} <span className="text-gray-300 mx-1 font-normal">/</span> {totalPages}
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

            {isModalOpen && (
                <MasterDataModal
                    title={currentItem ? "Cập nhật danh mục" : "Thêm danh mục mới"}
                    initialValues={{
                        category_code: currentItem?.category_code || "",
                        category_name: currentItem?.category_name || "",
                        category_status: currentItem?.category_status || "ACTIVE",
                    }}
                    validationSchema={validationSchema}
                    isEdit={!!currentItem}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={async (values) => {
                        if (currentItem) await masterDataService.updateCategory(currentItem.pk_product_category_id, values);
                        else await masterDataService.createCategory(values);
                        fetchItems();
                    }}
                    codeLabel="Mã danh mục"
                    nameLabel="Tên danh mục"
                    isCategory={true}
                />
            )}
        </div>
    );
}

// --- Shared Modal Component ---
function MasterDataModal({ title, initialValues, validationSchema, isEdit, onClose, onSubmit, codeLabel, nameLabel, isCategory }) {
    const inputErrorClass = (touched, error) => touched && error ? "border-red-500 focus-visible:ring-red-500 bg-red-50/10" : "border-gray-200";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-white shadow-2xl border-none overflow-hidden rounded-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <CardTitle className="text-lg font-bold text-primary uppercase tracking-tight">{title}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-400"><X size={20} /></Button>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await onSubmit(values);
                            toast.success("Lưu thành công");
                            onClose();
                        } catch (error) { toast.error(error.response?.data?.message || "Lỗi lưu dữ liệu"); }
                        finally { setSubmitting(false); }
                    }}
                >
                    {({ isSubmitting, touched, errors, getFieldProps }) => (
                        <Form className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <Label className={cn("text-[13px] font-bold", touched[isCategory ? "category_code" : "wood_code"] && errors[isCategory ? "category_code" : "wood_code"] ? "text-red-500" : "text-gray-700")}>
                                    {codeLabel} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    {...getFieldProps(isCategory ? "category_code" : "wood_code")}
                                    disabled={isEdit}
                                    className={cn("h-11", inputErrorClass(touched[isCategory ? "category_code" : "wood_code"], errors[isCategory ? "category_code" : "wood_code"]), isEdit && "bg-gray-50")}
                                    placeholder="VD: MA_SO_01..."
                                />
                                <ErrorMessage name={isCategory ? "category_code" : "wood_code"} render={msg => <p className="text-[11px] text-red-500 font-medium">{msg}</p>} />
                            </div>

                            <div className="space-y-1.5">
                                <Label className={cn("text-[13px] font-bold", touched[isCategory ? "category_name" : "wood_name"] && errors[isCategory ? "category_name" : "wood_name"] ? "text-red-500" : "text-gray-700")}>
                                    {nameLabel} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    {...getFieldProps(isCategory ? "category_name" : "wood_name")}
                                    className={cn("h-11", inputErrorClass(touched[isCategory ? "category_name" : "wood_name"], errors[isCategory ? "category_name" : "wood_name"]))}
                                    placeholder="Nhập tên hiển thị..."
                                />
                                <ErrorMessage name={isCategory ? "category_name" : "wood_name"} render={msg => <p className="text-[11px] text-red-500 font-medium">{msg}</p>} />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-bold text-gray-700">Trạng thái</Label>
                                <Field as="select" name={isCategory ? "category_status" : "wood_status"} className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm bg-white focus:ring-1 focus:ring-primary outline-none">
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Khóa</option>
                                </Field>
                            </div>

                            <div className="flex gap-3 pt-6 border-t mt-6">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest">Hủy</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest">
                                    {isSubmitting ? "Đang xử lý..." : isEdit ? "Cập nhật" : "Thêm mới"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
}
