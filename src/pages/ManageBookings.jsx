import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ManageBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, bookingId: null });

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const res = await axiosClient.get("/bookings", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const sortedBookings = [...(res.data || [])].sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                setBookings(sortedBookings);
            } catch (err) {
                setError(err.response?.data?.message || "Không thể tải bookings");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const formatDate = (dateStr) =>
        dateStr ? new Date(dateStr).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "N/A";

    const getStatusColor = (status) => {
        switch (status) {
            case "Confirmed":
                return "text-green-600";
            case "Cancelled":
                return "text-red-600";
            case "Pending":
                return "text-orange-500";
            default:
                return "text-gray-500";
        }
    };

    const getPaymentColor = (paymentStatus) => {
        switch (paymentStatus) {
            case "Paid":
                return "text-green-600";
            case "Unpaid":
                return "text-gray-500";
            case "Deposit":
                return "text-yellow-500";
            default:
                return "text-gray-500";
        }
    };

    const handlePaymentChange = async (id, value) => {
        try {
            const token = localStorage.getItem("token");
            const booking = bookings.find((b) => b._id === id);

            if (booking.paymentStatus === "Paid" && value === "Unpaid") {
                setSnackbar({ open: true, message: "Không thể đổi Paid → Unpaid", type: "error" });
                return;
            }

            await axiosClient.put(
                `/bookings/${id}`,
                { paymentStatus: value },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setBookings((prev) =>
                prev.map((b) =>
                    b._id === id ? { ...b, paymentStatus: value, status: value === "Paid" ? "Confirmed" : b.status } : b
                )
            );

            setSnackbar({ open: true, message: `PaymentStatus đã được cập nhật`, type: "success" });
        } catch (err) {
            console.log(err);
            setSnackbar({ open: true, message: `Cập nhật paymentStatus thất bại`, type: "error" });
        }
    };

    const handleStatusChange = async (id, value) => {
        const booking = bookings.find((b) => b._id === id);
        if (booking.paymentStatus === "Paid") {
            setSnackbar({ open: true, message: "Booking đã thanh toán, không thể đổi status", type: "warning" });
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const updatedData = value === "Cancelled" ? { status: value, paymentStatus: "Unpaid" } : { status: value };
            await axiosClient.put(`/bookings/${id}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBookings((prev) => prev.map((b) => (b._id === id ? { ...b, status: value } : b)));
            setSnackbar({ open: true, message: `Status đã được cập nhật thành ${value}`, type: "success" });
        } catch (err) {
            console.log(err);
            setSnackbar({ open: true, message: "Cập nhật status thất bại", type: "error" });
        }
    };

    const handleConfirmPayment = () => {
        handlePaymentChange(confirmDialog.bookingId, "Paid");
        setConfirmDialog({ open: false, bookingId: null });
    };

    if (loading)
        return (
            <div className="flex justify-center mt-8">
                <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
            </div>
        );

    if (error)
        return <p className="text-red-600 text-center mt-8 font-bold text-lg">{error}</p>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Manage Bookings</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border">User</th>
                            <th className="py-2 px-4 border">Hotel</th>
                            <th className="py-2 px-4 border">Room</th>
                            <th className="py-2 px-4 border">Create At</th>
                            <th className="py-2 px-4 border">Check In</th>
                            <th className="py-2 px-4 border">Check Out</th>
                            <th className="py-2 px-4 border">Status</th>
                            <th className="py-2 px-4 border">Payment Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b._id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border">{b.user?.name || "N/A"}</td>
                                <td className="py-2 px-4 border">{b.hotel?.name || "N/A"}</td>
                                <td className="py-2 px-4 border">{b.room?.name || "N/A"}</td>
                                <td className="py-2 px-4 border">{formatDate(b.createdAt)}</td>
                                <td className="py-2 px-4 border">{formatDate(b.checkInDate)}</td>
                                <td className="py-2 px-4 border">{formatDate(b.checkOutDate)}</td>

                                <td className="py-2 px-4 border items-center">
                                    <div className="flex justify-center items-center border-4">
                                        {b.paymentStatus === "Paid" ? (
                                            <span className={`${getStatusColor(b.status)} font-bold`}>{b.status}</span>
                                        ) : (
                                            <select
                                                value={b.status || "Pending"}
                                                onChange={(e) => handleStatusChange(b._id, e.target.value)}
                                                className={`font-bold ${getStatusColor(b.status)} text-center`}
                                            >
                                                <option value="Pending" className="text-orange-500">
                                                    Pending
                                                </option>
                                                <option value="Confirmed" className="text-green-600">
                                                    Confirmed
                                                </option>
                                                <option value="Cancelled" className="text-red-600">
                                                    Cancelled
                                                </option>
                                            </select>
                                        )}
                                    </div>
                                </td>

                                <td className="py-2 px-4 border items-center">
                                    <div className="flex justify-center border rounded-sm">
                                        <select
                                            value={b.paymentStatus || "Unpaid"}
                                            onChange={(e) => handlePaymentChange(b._id, e.target.value)}
                                            className={`font-bold ${getPaymentColor(b.paymentStatus)} text-center`}
                                        >
                                            {/* Đã thanh toán đủ */}
                                            <option value="Paid" className="text-green-600">
                                                Paid
                                            </option>

                                            {/* Đã cọc */}
                                            <option value="Deposit" className="text-yellow-500">
                                                DepositPaid
                                            </option>

                                            {/* Chỉ để hiển thị – không cho chọn */}
                                            <option value="Unpaid" className="text-gray-500" disabled>
                                                Unpaid
                                            </option>
                                        </select>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Snackbar */}
            {snackbar.open && (
                <div
                    className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md text-white ${snackbar.type === "success"
                            ? "bg-green-500"
                            : snackbar.type === "error"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                        }`}
                >
                    {snackbar.message}
                </div>
            )}

            {/* Confirm Dialog */}
            {confirmDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">Xác nhận thanh toán</h3>
                        <p className="mb-6">
                            Bạn có chắc chắn muốn chuyển trạng thái thanh toán sang Paid? Điều này sẽ đồng bộ với Payment.
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDialog({ open: false, bookingId: null })}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
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
