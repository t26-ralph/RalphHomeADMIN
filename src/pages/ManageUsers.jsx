import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [confirmDialogDelete, setConfirmDialogDelete] = useState({ open: false, userId: null });
    const [confirmDialogRole, setConfirmDialogRole] = useState({ open: false, userId: null, newRole: "", message: "" });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get("/users");
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRoleChange = (userId, newRole) => {
        const user = users.find(u => u._id === userId);
        let message = "";

        if (user.role === "admin" && newRole === "user") {
            message = "Bạn có chắc chắn muốn chuyển role từ Admin → User? Hạn chế quyền truy cập.";
        } else if (user.role === "user" && newRole === "admin") {
            message = "Bạn có chắc chắn muốn chuyển role từ User → Admin? Người dùng sẽ có quyền quản trị!";
        }

        if (message) {
            setConfirmDialogRole({ open: true, userId, newRole, message });
        } else {
            updateRole(userId, newRole);
        }
    };

    const updateRole = async (userId, role) => {
        try {
            await axiosClient.put(`/users/${userId}/role`, { role });
            fetchUsers();
            setSnackbar({ open: true, message: "Role updated successfully", type: "success" });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Update role failed", type: "error" });
        }
    };

    const confirmRoleChange = () => {
        updateRole(confirmDialogRole.userId, confirmDialogRole.newRole);
        setConfirmDialogRole({ open: false, userId: null, newRole: "", message: "" });
    };

    const handleDeleteUser = (userId) => {
        setConfirmDialogDelete({ open: true, userId });
    };

    const confirmDeleteUser = async () => {
        try {
            await axiosClient.delete(`/users/${confirmDialogDelete.userId}`);
            fetchUsers();
            setSnackbar({ open: true, message: "User deleted successfully", type: "success" });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Delete user failed", type: "error" });
        } finally {
            setConfirmDialogDelete({ open: false, userId: null });
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-2 px-4 border">Name</th>
                            <th className="py-2 px-4 border">Email</th>
                            <th className="py-2 px-4 border">Role</th>
                            <th className="py-2 px-4 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="py-2 px-4 border">{u.name}</td>
                                <td className="py-2 px-4 border">{u.email}</td>
                                <td className="py-2 px-4 border">
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        className="border rounded px-2 py-1"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-2 px-4 border">
                                    <button
                                        onClick={() => handleDeleteUser(u._id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Confirm Delete Dialog */}
            {confirmDialogDelete.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">Xác nhận xóa người dùng</h3>
                        <p className="mb-6">Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDialogDelete({ open: false, userId: null })}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDeleteUser}
                                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Role Change Dialog */}
            {confirmDialogRole.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
                        <h3 className="text-xl font-bold mb-4">Xác nhận thay đổi Role</h3>
                        <p className="mb-6">{confirmDialogRole.message}</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDialogRole({ open: false, userId: null, newRole: "", message: "" })}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmRoleChange}
                                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
        </div>
    );
}
