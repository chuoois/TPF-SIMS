import { useState } from "react";
import { PageHelmet } from "@/components/seo/PageHelmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Receipt, CheckCircle, Search, Users, ArrowDownToLine } from "lucide-react";

/**
 * Accountant Customer Debt
 * Quản lý công nợ khách hàng (Mock data)
 *
 * Created By: AI
 * Updated: 14/03/2026
 */

// --- Mock Data ---
const formatCurrency = (n) => n != null ? new Intl.NumberFormat("vi-VN").format(n) + "₫" : "—";

const MOCK_DEBTS = [
    {
        id: "1",
        order_code: "HD260314A1B2C3",
        customer_name: "Nguyễn Văn A",
        phone_number: "0901234567",
        total_amount: 15500000,
        deposit_amount: 5000000,
        order_date: "10/03/2026",
    },
    {
        id: "2",
        order_code: "HD260313D4E5F6",
        customer_name: "Trần Thị B",
        phone_number: "0987654321",
        total_amount: 8200000,
        deposit_amount: 3000000,
        order_date: "12/03/2026",
    },
    {
        id: "3",
        order_code: "HD260312X7Y8Z9",
        customer_name: "Lê Minh C",
        phone_number: "0912223334",
        total_amount: 25000000,
        deposit_amount: 10000000,
        order_date: "05/03/2026",
    },
    {
        id: "4",
        order_code: "HD260310P1Q2R3",
        customer_name: "Phạm Xuân D",
        phone_number: "0934445556",
        total_amount: 4500000,
        deposit_amount: 1500000,
        order_date: "01/03/2026",
    },
];

export default function AccountantCustomerDebt() {
    const [debts, setDebts] = useState(MOCK_DEBTS);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);

    // Tính toán số nợ còn lại
    const getRemainingAmount = (total, deposit) => Math.max(0, total - deposit);

    // Filter tìm kiếm theo mã đơn, sđt hoặc tên khách
    const filteredDebts = debts.filter(
        (debt) =>
            debt.order_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            debt.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            debt.phone_number.includes(searchQuery)
    );

    // Xử lý mở modal thanh toán
    const handleOpenSettleModal = (debt) => {
        setSelectedDebt(debt);
        setIsSettleModalOpen(true);
    };

    // Xử lý xác nhận thanh toán (Mock)
    const handleConfirmSettle = () => {
        if (!selectedDebt) return;

        setDebts((prevDebts) =>
            prevDebts.map((debt) =>
                debt.id === selectedDebt.id
                    ? { ...debt, deposit_amount: debt.total_amount } // Cập nhật cọc = tổng tiền -> hết nợ
                    : debt
            )
        );

        setIsSettleModalOpen(false);
        setSelectedDebt(null);
    };

    return (
        <>
            <PageHelmet title="Công nợ khách hàng | Kế toán" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between shrink-0">
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
                            <Users size={22} style={{ color: "var(--brand-primary)" }} />
                            Công nợ khách hàng
                        </h1>
                        <p className="text-[13px] mt-0.5" style={{ color: "var(--text-placeholder)" }}>
                            Quản lý các khoản chưa thanh toán từ đơn đặt hàng riêng của khách hàng
                        </p>
                    </div>

                </div>

                <Card>
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Receipt className="w-5 h-5" /> Danh sách công nợ
                        </CardTitle>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm theo Mã đơn, Tên KH, SĐT..."
                                className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-gray-600">Mã Đơn</th>
                                        <th className="px-4 py-3 font-medium text-gray-600">Khách Hàng</th>
                                        <th className="px-4 py-3 font-medium text-gray-600">Số Điện Thoại</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Tổng Tiền</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Đã Thanh Toán</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 text-right whitespace-nowrap">Còn Nợ</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 text-center">Ngày Đặt</th>
                                        <th className="px-4 py-3 font-medium text-gray-600 text-right">Thao Tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDebts.length > 0 ? (
                                        filteredDebts.map((debt) => {
                                            const remaining = getRemainingAmount(debt.total_amount, debt.deposit_amount);
                                            const isSettled = remaining === 0;

                                            return (
                                                <tr key={debt.id} className={`${isSettled ? "bg-green-50/30" : ""} border-b hover:bg-gray-50/50 transition-colors`}>
                                                    <td className="px-4 py-3 font-medium">
                                                        <Badge variant="outline" className="font-mono bg-white">
                                                            {debt.order_code}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3">{debt.customer_name}</td>
                                                    <td className="px-4 py-3">{debt.phone_number}</td>
                                                    <td className="px-4 py-3 text-right font-medium">
                                                        {formatCurrency(debt.total_amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-600">
                                                        {formatCurrency(debt.deposit_amount)}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className={`font-semibold ${isSettled ? "text-green-600" : "text-amber-600"}`}>
                                                            {formatCurrency(remaining)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-gray-500 text-xs">
                                                        {debt.order_date}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Button
                                                            variant={isSettled ? "secondary" : "default"}
                                                            size="sm"
                                                            disabled={isSettled}
                                                            onClick={() => handleOpenSettleModal(debt)}
                                                            className={`gap-1 ${isSettled ? "text-green-600 border-none bg-green-100 hover:bg-green-100 opacity-100 cursor-default" : ""}`}
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            {isSettled ? "Đã tất toán" : "Thanh Toán"}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                                                Không tìm thấy công nợ nào phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Settle Debt Modal */}
            {isSettleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-bold">Xác nhận thanh toán công nợ</h2>
                            <p className="text-sm text-gray-500">
                                Khách hàng sẽ thanh toán phần tiền còn lại của đơn hàng.
                            </p>
                        </div>

                        {selectedDebt && (
                            <div className="py-4 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Mã Đơn:</span>
                                    <span className="font-medium">{selectedDebt.order_code}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Khách Hàng:</span>
                                    <span className="font-medium">{selectedDebt.customer_name}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-t pt-3 mt-3">
                                    <span className="text-gray-500">Tổng Tiền:</span>
                                    <span className="font-medium">{formatCurrency(selectedDebt.total_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Đã Thanh Toán (Cọc):</span>
                                    <span className="font-medium">{formatCurrency(selectedDebt.deposit_amount)}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold text-primary border-t pt-3">
                                    <span>Cần Thu Thêm:</span>
                                    <span className="text-amber-600">
                                        {formatCurrency(getRemainingAmount(selectedDebt.total_amount, selectedDebt.deposit_amount))}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setIsSettleModalOpen(false)}>
                                Hủy Bỏ
                            </Button>
                            <Button onClick={handleConfirmSettle}>
                                Xác Nhận Đã Thu
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
