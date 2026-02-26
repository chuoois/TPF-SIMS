import { useEffect, useState, useCallback } from "react";
import { accountantService } from "@/services/accountant.service";
import { masterDataService } from "@/services/master-data.service";
import useDebounce from "@/hooks/useDebounce";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
    Package,
    Search,
    Plus,
    Pencil,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight,
    Warehouse,
    Download,
} from "lucide-react";

/**
 * AccountantProductManage
 * Quản lý sản phẩm dành cho kế toán:
 * - Xem, tìm kiếm, lọc sản phẩm
 * - Nhập hàng (batch: sản phẩm mới + sản phẩm có sẵn)
 * - Cập nhật & xóa sản phẩm
 *
 * Created By: HieuNM
 * Created Date: 27/02/2026
 */

// ── Auto-generate SKU code (ngắn gọn) ───────────────────────────────────────
// Format: [4 ký tự đầu tên SP]-[WOOD_CODE]-[COLOR_CODE]-[SIZE]
// Ví dụ: GHET-OAK-BRN-120X60
function normalizeStr(str, maxLen) {
    return (str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\u0111/g, "d").replace(/\u0110/g, "D")
        .toUpperCase().trim()
        .replace(/\s+/g, "").replace(/[^A-Z0-9]/g, "")
        .slice(0, maxLen);
}

function generateSkuCode(productName, woodCode, colorCode, size) {
    return [
        normalizeStr(productName, 4),
        normalizeStr(woodCode, 5),
        normalizeStr(colorCode, 5),
        normalizeStr(size, 12),
    ].filter(Boolean).join("-");
}

// ── Status badge ────────────────────────────────────────────────────
const StatusBadge = ({ status }) => (
    <span className={cn(
        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border",
        status === "ACTIVE"
            ? "bg-green-50 text-green-600 border-green-100"
            : "bg-gray-50 text-gray-400 border-gray-100"
    )}>
        {status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
    </span>
);

// ── Format currency ─────────────────────────────────────────────────
const fmtCurrency = (val) =>
    val != null
        ? Number(val).toLocaleString("vi-VN") + " ₫"
        : <span className="text-gray-300">—</span>;

// ── Toast-based confirm dialog ────────────────────────────────
function confirmToast(message) {
    return new Promise((resolve) => {
        toast(
            (t) => (
                <div className="flex flex-col gap-2 min-w-[220px]">
                    <p className="text-sm font-semibold text-gray-800">{message}</p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => { toast.dismiss(t.id); resolve(false); }}
                            className="px-3 py-1.5 text-xs font-bold rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                        >Hủy</button>
                        <button
                            onClick={() => { toast.dismiss(t.id); resolve(true); }}
                            className="px-3 py-1.5 text-xs font-bold rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
                        >Xác nhận</button>
                    </div>
                </div>
            ),
            { duration: Infinity, style: { padding: "14px 16px" } }
        );
    });
}

// ── Main component ──────────────────────────────────────────────────
export default function AccountantProductManage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState([]);

    const [editModal, setEditModal] = useState(null);       // product to edit
    const [importModal, setImportModal] = useState(false);  // nhập hàng

    const debouncedSearch = useDebounce(searchTerm, 500);

    // ── Fetch categories for filter dropdown ──
    useEffect(() => {
        masterDataService.getAllCategories(1, 200, "")
            .then((d) => setCategories(d.items || []))
            .catch(() => { });
    }, []);

    // ── Fetch products ──
    const fetchProducts = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            const data = await accountantService.getAllProducts(page, limit, debouncedSearch, categoryFilter);
            setProducts(data.items || []);
            setTotalPages(data.totalPages || 1);
            setTotalItems(data.total || 0);
            setCurrentPage(data.page || 1);
        } catch {
            toast.error("Không thể tải danh sách sản phẩm");
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, categoryFilter]);

    useEffect(() => { fetchProducts(1); }, [fetchProducts]);

    // ── Delete ──
    const handleDelete = async (id, name) => {
        const ok = await confirmToast(`Xóa sản phẩm "${name}"?`);
        if (!ok) return;
        try {
            await accountantService.deleteProduct(id);
            toast.success("Xóa thành công");
            fetchProducts(currentPage);
        } catch {
            toast.error("Không thể xóa sản phẩm (có thể đang được sử dụng)");
        }
    };

    // ── Compute total inventory per product ──
    const totalInventory = (product) =>
        (product.skus || []).reduce((sum, sku) =>
            sum + (sku.warehouseInventories || []).reduce((s, inv) => s + (inv.quantity_available || 0), 0), 0);

    return (
        <>
            <PageHelmet title="Quản lý sản phẩm - TPF-SIMS" />
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package size={22} /> Quản lý sản phẩm
                        </h1>
                        <p className="text-gray-500 text-sm">Xem, nhập hàng và quản lý sản phẩm trong kho</p>
                    </div>
                    <Button onClick={() => setImportModal(true)} className="flex items-center gap-2">
                        <Download size={16} /> Nhập hàng
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 bg-white p-3 border rounded-md shadow-sm">
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Tìm theo tên sản phẩm..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-10 pl-10 border-gray-200"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); fetchProducts(1); }}
                        className="h-10 border border-gray-200 rounded-md px-3 text-sm bg-white focus:ring-1 focus:ring-primary outline-none min-w-[180px]"
                    >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((c) => (
                            <option key={c.pk_product_category_id} value={c.pk_product_category_id}>
                                {c.category_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <Card className="border shadow-none overflow-hidden">
                    <CardContent className="p-0">
                        <div className="overflow-auto h-[calc(100vh-320px)] relative">
                            {loading ? (
                                <div className="p-12 text-center text-primary animate-pulse">Đang tải...</div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 sticky top-0 z-10 border-b">
                                        <tr>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[50px]">#</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[60px]">Ảnh</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sản phẩm</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Danh mục</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Giá nhập</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Giá bán</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">SKUs</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">Tồn kho</th>
                                            <th className="p-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[110px]">Trạng thái</th>
                                            <th className="p-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y bg-white">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="p-12 text-center text-gray-400 text-sm">
                                                    Không tìm thấy sản phẩm nào
                                                </td>
                                            </tr>
                                        ) : products.map((p, idx) => (
                                            <tr key={p.pk_product_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-4 text-xs text-gray-400 font-medium">{(currentPage - 1) * limit + idx + 1}</td>
                                                <td className="p-2">
                                                    {p.product_img ? (
                                                        <img src={p.product_img} alt={p.product_name}
                                                            className="h-10 w-10 rounded-lg object-cover border border-gray-100 shadow-sm" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                            <Package size={14} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 font-semibold text-gray-800 text-sm max-w-[200px] truncate">{p.product_name}</td>
                                                <td className="p-4 text-sm text-gray-500">{p.productCategory?.category_name ?? <span className="text-gray-300">—</span>}</td>
                                                <td className="p-4 text-sm text-gray-700">{fmtCurrency(p.purchase_price)}</td>
                                                <td className="p-4 text-sm text-gray-700">{fmtCurrency(p.selling_price)}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {(p.skus || []).length === 0 ? (
                                                            <span className="text-gray-300 text-xs">—</span>
                                                        ) : (
                                                            <>
                                                                {(p.skus || []).slice(0, 3).map(s => (
                                                                    <span key={s.pk_sku_id}
                                                                        className="inline-block bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                                                        {s.sku_code}
                                                                    </span>
                                                                ))}
                                                                {(p.skus || []).length > 3 && (
                                                                    <span className="inline-block bg-gray-100 text-gray-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                                                        +{(p.skus || []).length - 3}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        totalInventory(p) === 0 ? "text-red-500" : "text-emerald-600"
                                                    )}>
                                                        {totalInventory(p).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="p-4"><StatusBadge status={p.product_status} /></td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            onClick={() => setEditModal(p)}
                                                            className="h-8 px-2 text-gray-400 hover:text-primary hover:bg-gray-100"
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost" size="sm"
                                                            onClick={() => handleDelete(p.pk_product_id, p.product_name)}
                                                            className="h-8 px-2 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </CardContent>

                    {/* Pagination */}
                    <div className="bg-gray-50/50 border-t p-3 flex justify-between items-center">
                        <div className="text-xs text-gray-500 italic">
                            Hiển thị {products.length} / {totalItems} sản phẩm
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon"
                                disabled={currentPage === 1 || loading}
                                onClick={() => fetchProducts(currentPage - 1)}
                                className="h-8 w-8 border-gray-200 shadow-none">
                                <ChevronLeft size={14} />
                            </Button>
                            <div className="bg-white border rounded-md h-8 px-3 flex items-center justify-center min-w-[60px] shadow-sm">
                                <span className="text-xs font-bold text-primary">
                                    {currentPage} <span className="text-gray-300 mx-1 font-normal">/</span> {totalPages}
                                </span>
                            </div>
                            <Button variant="outline" size="icon"
                                disabled={currentPage === totalPages || loading}
                                onClick={() => fetchProducts(currentPage + 1)}
                                className="h-8 w-8 border-gray-200 shadow-none">
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Edit Modal */}
            {editModal && (
                <EditProductModal
                    product={editModal}
                    onClose={() => setEditModal(null)}
                    onSaved={() => { setEditModal(null); fetchProducts(currentPage); }}
                />
            )}

            {/* Import Modal */}
            {importModal && (
                <ImportStockModal
                    onClose={() => setImportModal(false)}
                    onSaved={() => { setImportModal(false); fetchProducts(1); }}
                />
            )}
        </>
    );
}

// ══════════════════════════════════════════════════════════════════════
// Edit Product Modal
// ══════════════════════════════════════════════════════════════════════
function EditProductModal({ product, onClose, onSaved }) {
    const schema = Yup.object({
        product_name: Yup.string().trim().required("Vui lòng nhập tên sản phẩm").max(150),
        purchase_price: Yup.number().nullable().min(0, "Giá không hợp lệ"),
        selling_price: Yup.number().nullable().min(0, "Giá không hợp lệ"),
        product_status: Yup.string().oneOf(["ACTIVE", "INACTIVE"]),
        product_img: Yup.string().url("URL ảnh không hợp lệ").nullable(),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-md bg-white shadow-2xl border-none overflow-hidden rounded-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <CardTitle className="text-lg font-bold text-primary uppercase tracking-tight">Cập nhật sản phẩm</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-400"><X size={20} /></Button>
                </div>

                <Formik
                    initialValues={{
                        product_name: product.product_name || "",
                        purchase_price: product.purchase_price ?? "",
                        selling_price: product.selling_price ?? "",
                        product_status: product.product_status || "ACTIVE",
                        product_img: product.product_img || "",
                    }}
                    validationSchema={schema}
                    onSubmit={async (values, { setSubmitting }) => {
                        // Hỏi xác nhận trước khi cập nhật
                        const ok = await confirmToast(`Cập nhật sản phẩm "${product.product_name}"?`);
                        if (!ok) { setSubmitting(false); return; }
                        try {
                            await accountantService.updateProduct(product.pk_product_id, values);
                            toast.success("Cập nhật thành công!");
                            onSaved();
                        } catch (err) {
                            toast.error(err.response?.data?.message || "Lỗi cập nhật sản phẩm");
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, touched, errors, getFieldProps }) => (
                        <Form className="p-6 space-y-4">
                            {/* Name */}
                            <div className="space-y-1.5">
                                <Label className={cn("text-[13px] font-bold", touched.product_name && errors.product_name ? "text-red-500" : "text-gray-700")}>
                                    Tên sản phẩm <span className="text-red-500">*</span>
                                </Label>
                                <Input {...getFieldProps("product_name")}
                                    className={cn("h-11", touched.product_name && errors.product_name ? "border-red-400 bg-red-50/10" : "border-gray-200")} />
                                {touched.product_name && errors.product_name && <p className="text-[11px] text-red-500">{errors.product_name}</p>}
                            </div>

                            {/* Prices */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-[13px] font-bold text-gray-700">Giá nhập (₫)</Label>
                                    <Input type="number" min={0} {...getFieldProps("purchase_price")} className="h-11 border-gray-200" placeholder="0" />
                                    {touched.purchase_price && errors.purchase_price && <p className="text-[11px] text-red-500">{errors.purchase_price}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[13px] font-bold text-gray-700">Giá bán (₫)</Label>
                                    <Input type="number" min={0} {...getFieldProps("selling_price")} className="h-11 border-gray-200" placeholder="0" />
                                    {touched.selling_price && errors.selling_price && <p className="text-[11px] text-red-500">{errors.selling_price}</p>}
                                </div>
                            </div>

                            {/* Ảnh sản phẩm */}
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-bold text-gray-700">Ảnh sản phẩm (URL)</Label>
                                <Input {...getFieldProps("product_img")}
                                    placeholder="https://example.com/image.jpg"
                                    className={cn("h-11", touched.product_img && errors.product_img ? "border-red-400" : "border-gray-200")} />
                                {touched.product_img && errors.product_img && <p className="text-[11px] text-red-500">{errors.product_img}</p>}
                                {getFieldProps("product_img").value && !errors.product_img && (
                                    <img src={getFieldProps("product_img").value} alt="preview"
                                        className="mt-1.5 h-24 w-full object-cover rounded-lg border border-gray-100"
                                        onError={(e) => { e.target.style.display = "none"; }} />
                                )}
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label className="text-[13px] font-bold text-gray-700">Trạng thái</Label>
                                <select {...getFieldProps("product_status")}
                                    className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm bg-white focus:ring-1 focus:ring-primary outline-none">
                                    <option value="ACTIVE">Hoạt động</option>
                                    <option value="INACTIVE">Ngừng</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-6 border-t mt-6">
                                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest">Hủy</Button>
                                <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest">
                                    {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════
// Import Stock Modal (Nhập hàng – batch)
// ══════════════════════════════════════════════════════════════════════
const EMPTY_LINE = () => ({
    id: Math.random(),
    type: "existing",       // "existing" | "new"
    // -- existing fields --
    productId: "",
    skuId: "",
    // -- new product fields --
    productName: "",
    categoryId: "",
    woodTypeId: "",
    colorId: "",
    size: "",
    productImg: "",
    sellingPrice: "",
    // -- common --
    quantity: "",
    purchasePrice: "",
});

function ImportStockModal({ onClose, onSaved }) {
    const [lines, setLines] = useState([EMPTY_LINE()]);
    const [warehouseId, setWarehouseId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Master data for dropdowns
    const [warehouses, setWarehouses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [woodTypes, setWoodTypes] = useState([]);
    const [colors, setColors] = useState([]);
    const [products, setProducts] = useState([]);   // for existing product picker

    useEffect(() => {
        Promise.all([
            accountantService.getAllProducts(1, 500, "", ""),
            masterDataService.getAllCategories(1, 200, ""),
            masterDataService.getAllWoodTypes(1, 200, ""),
            masterDataService.getAllColors(1, 200, ""),
            accountantService.getWarehouses(),
        ]).then(([p, c, w, col, wh]) => {
            setProducts(p.items || []);
            setCategories(c.items || []);
            setWoodTypes(w.items || []);
            setColors(col.items || []);
            setWarehouses(wh || []);
        }).catch(() => toast.error("Không thể tải dữ liệu dropdown"));
    }, []);

    const updateLine = (id, field, value) => {
        setLines(prev => prev.map(l => {
            if (l.id !== id) return l;
            const updated = { ...l, [field]: value };
            // Auto-clear SKU when product changes
            if (field === "productId") updated.skuId = "";
            return updated;
        }));
    };

    const removeLine = (id) => {
        setLines(prev => prev.filter(l => l.id !== id));
    };

    const handleSubmit = async () => {
        if (!warehouseId) { toast.error("Vui lòng chọn kho nhập hàng"); return; }
        if (lines.length === 0) { toast.error("Vui lòng thêm ít nhất một mặt hàng"); return; }

        // Validate lines
        for (const l of lines) {
            if (!l.quantity || Number(l.quantity) <= 0) { toast.error("Số lượng phải lớn hơn 0"); return; }
            if (l.type === "existing" && (!l.productId || !l.skuId)) { toast.error("Vui lòng chọn sản phẩm và SKU"); return; }
            if (l.type === "new" && !l.productName.trim()) { toast.error("Vui lòng nhập tên sản phẩm mới"); return; }
        }

        setSubmitting(true);
        try {
            const payload = lines.map(l => ({
                type: l.type,
                ...(l.type === "existing"
                    ? { skuId: l.skuId, purchasePrice: l.purchasePrice || undefined }
                    : {
                        productName: l.productName,
                        categoryId: l.categoryId || undefined,
                        woodTypeId: l.woodTypeId || undefined,
                        colorId: l.colorId || undefined,
                        size: l.size || undefined,
                        productImg: l.productImg || undefined,
                        sellingPrice: l.sellingPrice || undefined,
                        purchasePrice: l.purchasePrice || undefined,
                    }),
                quantity: Number(l.quantity),
            }));

            await accountantService.importStock(warehouseId, payload);
            toast.success("Nhập hàng thành công!");
            onSaved();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi khi nhập hàng");
        } finally {
            setSubmitting(false);
        }
    };

    // Compute auto SKU code for new-product lines
    const getSkuPreview = (line) => {
        const wt = woodTypes.find(w => w.pk_wood_type_id === line.woodTypeId);
        const col = colors.find(c => c.pk_color_id === line.colorId);
        return generateSkuCode(line.productName, wt?.wood_code || "", col?.color_code || "", line.size);
    };

    // SKUs for a given product
    const skusFor = (productId) => {
        const p = products.find(x => x.pk_product_id === productId);
        return p?.skus || [];
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-4xl bg-white shadow-2xl border-none overflow-hidden rounded-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <CardTitle className="text-lg font-bold text-primary uppercase tracking-tight flex items-center gap-2">
                        <Warehouse size={18} /> Nhập hàng vào kho
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-gray-400"><X size={20} /></Button>
                </div>

                <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                    {/* Warehouse select */}
                    <div className="space-y-1.5">
                        <Label className="text-[13px] font-bold text-gray-700">Kho nhập hàng <span className="text-red-500">*</span></Label>
                        <select
                            value={warehouseId}
                            onChange={(e) => setWarehouseId(e.target.value)}
                            className="w-full h-11 border border-gray-200 rounded-md px-3 text-sm bg-white focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option value="">-- Chọn kho --</option>
                            {warehouses.map(w => (
                                <option key={w.pk_warehouse_id} value={w.pk_warehouse_id}>{w.warehouse_name}</option>
                            ))}
                        </select>
                        {warehouses.length === 0 && (
                            <p className="text-xs text-amber-600">⚠ Chưa thể tải danh sách kho. Nhập ID kho thủ công:</p>
                        )}
                        {warehouses.length === 0 && (
                            <Input
                                placeholder="Nhập warehouse ID..."
                                value={warehouseId}
                                onChange={(e) => setWarehouseId(e.target.value)}
                                className="h-10 border-gray-200 font-mono text-sm"
                            />
                        )}
                    </div>

                    {/* Lines */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-gray-700">Danh sách mặt hàng nhập</p>
                            <Button type="button" variant="outline" size="sm" onClick={() => setLines(p => [...p, EMPTY_LINE()])}
                                className="flex items-center gap-1 text-xs">
                                <Plus size={14} /> Thêm dòng
                            </Button>
                        </div>

                        {lines.map((line, i) => (
                            <ImportLine
                                key={line.id}
                                line={line}
                                index={i}
                                products={products}
                                categories={categories}
                                woodTypes={woodTypes}
                                colors={colors}
                                skusFor={skusFor}
                                getSkuPreview={getSkuPreview}
                                onChange={(field, val) => updateLine(line.id, field, val)}
                                onRemove={() => removeLine(line.id)}
                                canRemove={lines.length > 1}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t bg-gray-50">
                    <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest">Hủy</Button>
                    <Button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1 h-11 font-bold uppercase text-[12px] tracking-widest">
                        {submitting ? "Đang xử lý..." : `Nhập hàng (${lines.length} mặt hàng)`}
                    </Button>
                </div>
            </Card>
        </div>
    );
}

// ── One import line ─────────────────────────────────────────────────
function ImportLine({ line, index, products, categories, woodTypes, colors, skusFor, getSkuPreview, onChange, onRemove, canRemove }) {
    const skus = skusFor(line.productId);
    const skuPreview = line.type === "new" ? getSkuPreview(line) : "";

    return (
        <div className="border rounded-lg p-4 bg-gray-50/50 space-y-3 relative">
            {/* Line header + remove */}
            <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Mặt hàng #{index + 1}</p>
                <div className="flex items-center gap-3">
                    {/* Type toggle */}
                    <div className="flex bg-gray-200/50 rounded-md p-0.5 text-xs">
                        <button
                            type="button"
                            onClick={() => onChange("type", "existing")}
                            className={cn("px-3 py-1 rounded font-semibold transition-all",
                                line.type === "existing" ? "bg-white text-primary shadow-sm" : "text-gray-400")}
                        >Sản phẩm có sẵn</button>
                        <button
                            type="button"
                            onClick={() => onChange("type", "new")}
                            className={cn("px-3 py-1 rounded font-semibold transition-all",
                                line.type === "new" ? "bg-white text-primary shadow-sm" : "text-gray-400")}
                        >Sản phẩm mới</button>
                    </div>
                    {canRemove && (
                        <button type="button" onClick={onRemove} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {line.type === "existing" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Product select */}
                    <div className="space-y-1">
                        <Label className="text-[12px] font-bold text-gray-600">Sản phẩm *</Label>
                        <select value={line.productId} onChange={(e) => onChange("productId", e.target.value)}
                            className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm bg-white outline-none focus:ring-1 focus:ring-primary">
                            <option value="">-- Chọn sản phẩm --</option>
                            {products.map(p => <option key={p.pk_product_id} value={p.pk_product_id}>{p.product_name}</option>)}
                        </select>
                    </div>
                    {/* SKU select */}
                    <div className="space-y-1">
                        <Label className="text-[12px] font-bold text-gray-600">SKU *</Label>
                        <select value={line.skuId} onChange={(e) => onChange("skuId", e.target.value)}
                            disabled={!line.productId}
                            className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm bg-white outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50 disabled:text-gray-400">
                            <option value="">-- Chọn SKU --</option>
                            {skus.map(s => <option key={s.pk_sku_id} value={s.pk_sku_id}>{s.sku_code}</option>)}
                        </select>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[12px] font-bold text-gray-600">Tên sản phẩm *</Label>
                            <Input value={line.productName} onChange={(e) => onChange("productName", e.target.value)}
                                placeholder="Nhập tên sản phẩm..." className="h-9 border-gray-200 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[12px] font-bold text-gray-600">Danh mục</Label>
                            <select value={line.categoryId} onChange={(e) => onChange("categoryId", e.target.value)}
                                className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm bg-white outline-none focus:ring-1 focus:ring-primary">
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map(c => <option key={c.pk_product_category_id} value={c.pk_product_category_id}>{c.category_name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <Label className="text-[12px] font-bold text-gray-600">Loại gỗ</Label>
                            <select value={line.woodTypeId} onChange={(e) => onChange("woodTypeId", e.target.value)}
                                className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm bg-white outline-none focus:ring-1 focus:ring-primary">
                                <option value="">-- Loại gỗ --</option>
                                {woodTypes.map(w => <option key={w.pk_wood_type_id} value={w.pk_wood_type_id}>{w.wood_name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[12px] font-bold text-gray-600">Màu sắc</Label>
                            <select value={line.colorId} onChange={(e) => onChange("colorId", e.target.value)}
                                className="w-full h-9 border border-gray-200 rounded-md px-2 text-sm bg-white outline-none focus:ring-1 focus:ring-primary">
                                <option value="">-- Màu --</option>
                                {colors.map(c => <option key={c.pk_color_id} value={c.pk_color_id}>{c.color_name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[12px] font-bold text-gray-600">Kích thước</Label>
                            <Input value={line.size} onChange={(e) => onChange("size", e.target.value)}
                                placeholder="VD: 120x60, 120x60x80, L, 3 chỗ ngồi..." className="h-9 border-gray-200 text-sm" />
                        </div>
                    </div>
                    {/* Ảnh sản phẩm mới (URL) */}
                    <div className="space-y-1">
                        <Label className="text-[12px] font-bold text-gray-600">Ảnh sản phẩm (URL)</Label>
                        <Input value={line.productImg} onChange={(e) => onChange("productImg", e.target.value)}
                            placeholder="https://example.com/image.jpg" className="h-9 border-gray-200 text-sm" />
                        {line.productImg && (
                            <img src={line.productImg} alt="preview"
                                className="mt-1 h-16 w-full object-cover rounded-lg border border-gray-100"
                                onError={(e) => { e.target.style.display = "none"; }} />
                        )}
                    </div>

                    {/* SKU preview */}
                    {skuPreview && (
                        <div className="bg-primary/5 border border-primary/20 rounded-md px-3 py-2 flex items-center gap-2">
                            <span className="text-[11px] text-gray-500 font-medium">SKU tự sinh:</span>
                            <span className="font-mono font-bold text-primary text-sm tracking-wide">{skuPreview}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Common: quantity + purchase price */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-200">
                <div className="space-y-1">
                    <Label className="text-[12px] font-bold text-gray-600">Số lượng nhập *</Label>
                    <Input type="number" min={1} value={line.quantity} onChange={(e) => onChange("quantity", e.target.value)}
                        placeholder="0" className="h-9 border-gray-200 text-sm" />
                </div>
                <div className="space-y-1">
                    <Label className="text-[12px] font-bold text-gray-600">Giá nhập (₫)</Label>
                    <Input type="number" min={0} value={line.purchasePrice} onChange={(e) => onChange("purchasePrice", e.target.value)}
                        placeholder="0" className="h-9 border-gray-200 text-sm" />
                </div>
            </div>
        </div>
    );
}
