import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ManagePayments() {
    const STATUS_LABEL = {
        Pending: "Pending",
        Paid: "Paid",
        Deposit: "DepositPaid",
        Unpaid: "Unpaid",
    };

    const STATUS_COLOR = {
        Pending: "text-orange-500",
        Paid: "text-green-500",
        Deposit: "text-yellow-500",
        Unpaid: "text-gray-500",
    };
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, paymentId: null, value: "" });
    const formatDateTime = (date) =>
        date
            ? new Date(date).toLocaleString("vi-VN", {
                timeZone: "Asia/Ho_Chi_Minh",
            })
            : "—";
    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const res = await axiosClient.get("/payments", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const sortedPayments = [...res.data].sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            setPayments(sortedPayments);
        } catch (err) {
            setError(err.response?.data?.message || "Không thể tải payments");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);
    const getStatusColor = (status) => {
        return STATUS_COLOR[status] || "text-gray-500";
    };

    const updatePaymentStatus = async (paymentId, value) => {
        try {
            const token = localStorage.getItem("token");

            await axiosClient.put(
                `/payments/${paymentId}`,
                { status: value },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🔥 RELOAD DỮ LIỆU MỚI NHẤT TỪ BACKEND
            await fetchPayments();

            setSnackbar({
                open: true,
                message: "Cập nhật trạng thái thanh toán thành công!",
                type: "success",
            });
        } catch (err) {
            console.error("Update payment failed:", err);
            setSnackbar({
                open: true,
                message: "Cập nhật trạng thái thất bại!",
                type: "error",
            });
        }
    };

    const handleStatusChange = (paymentId, value) => {
        const payment = payments.find((p) => p._id === paymentId);

        // Chặn Paid → Unpaid hoặc cảnh báo Unpaid → Paid
        if ((payment.status === "Paid" && value === "Unpaid") || (payment.status === "Unpaid" && value === "Paid")) {
            setConfirmDialog({ open: true, paymentId, value });
            return;
        }

        updatePaymentStatus(paymentId, value);
    };

    const handleConfirmChange = () => {
        updatePaymentStatus(confirmDialog.paymentId, confirmDialog.value);
        setConfirmDialog({ open: false, paymentId: null, value: "" });
    };

    if (loading)
        return (
            <div className="flex justify-center mt-8">
                <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            </div>
        );

    if (error) return <p className="text-red-600 text-center mt-8 font-bold text-lg">{error}</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Manage Payments</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border">User</th>
                            <th className="py-2 px-4 border">Booking ID</th>                       
                            <th className="py-2 px-4 border">Amount</th>
                            <th className="py-2 px-4 border">Method</th>
                            <th className="py-2 px-4 border">Paid At</th>
                            <th className="py-2 px-4 border">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payments.map((p) => (
                            <tr key={p._id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border">{p.user?.name || "N/A"}</td>
                                <td className="py-2 px-4 border">{p.booking?._id || "N/A"}</td>
                                <td className="py-2 px-4 border text-center">{p.amount?.toLocaleString("vi-VN")} ₫</td>
                                <td className="py-2 px-4 border text-center">{p.method || "N/A"}</td>
                                <td className="py-2 px-4 border text-sm text-gray-600 text-center">
                                    {["Paid", "Deposit"].includes(p.status)
                                        ? formatDateTime(p.paidAt)
                                        : "—"}
                                </td>
                                <td className="py-2 px-4 border text-center">
                                    <select
                                        value={p.status}
                                        onChange={(e) => handleStatusChange(p._id, e.target.value)}
                                        className={`font-bold ${getStatusColor(p.status)} border rounded px-2 py-1`}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Deposit">Deposit</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Snackbar */}
            {snackbar.open && (
                <div
                    className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md text-white ${snackbar.type === "success" ? "bg-green-500" : snackbar.type === "error" ? "bg-red-500" : "bg-yellow-500"
                        }`}
                >
                    {snackbar.message}
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">Xác nhận thay đổi trạng thái</h3>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn thay đổi trạng thái thanh toán? Hành động này sẽ cập nhật cả booking tương ứng.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDialog({ open: false, paymentId: null, value: "" })}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmChange}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
