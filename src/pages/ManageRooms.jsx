import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ManageRooms() {
    const [rooms, setRooms] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentRoom, setCurrentRoom] = useState({
        name: "",
        price: "",
        maxPeople: "",
        description: "",
        available: true,
        hotelId: "",
        images: []
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({ open: false, roomId: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    // LOADING STATES
    const [loadingList, setLoadingList] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);
    const truncateWords = (text, maxWords = 50) => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ") + "...";
    };
    useEffect(() => {
        fetchRooms();
        fetchHotels();
    }, []);

    const fetchRooms = async () => {
        try { 
            setLoadingList(true);
            const res = await axiosClient.get("/rooms"); 
            setRooms(res.data); 
        }
        catch (err) { 
            console.error(err); 
        } finally{
            setLoadingList(false);
        }
    };

    const fetchHotels = async () => {
        try { const res = await axiosClient.get("/hotels"); setHotels(res.data); }
        catch (err) { console.error(err); }
    };

    const handleOpenDialog = (room) => {
        setCurrentRoom(room || { name: "", price: "", maxPeople: "", description: "", available: true, hotelId: "", images: [] });
        setImageFiles([]);
        setImagesToDelete([]);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentRoom({ name: "", price: "", maxPeople: "", description: "", available: true, hotelId: "", images: [] });
        setImageFiles([]);
        setImagesToDelete([]);
    };

    const handleSaveRoom = async () => {
        try {
            setLoadingSave(true);
            const formData = new FormData();
            formData.append("name", currentRoom.name);
            formData.append("price", currentRoom.price);
            formData.append("maxPeople", currentRoom.maxPeople);
            formData.append("description", currentRoom.description);
            formData.append("available", currentRoom.available);
            formData.append("hotelId", currentRoom.hotelId);

            imageFiles.forEach(file => formData.append("images", file));
            imagesToDelete.forEach(img => formData.append("imagesToDelete", img));

            const token = localStorage.getItem("token");
            if (currentRoom._id) {
                await axiosClient.put(`/rooms/${currentRoom._id}`, formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
                setSnackbar({ open: true, message: "Cập nhật phòng thành công!", severity: "success" });
            } else {
                await axiosClient.post("/rooms", formData, { headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` } });
                setSnackbar({ open: true, message: "Thêm phòng mới thành công!", severity: "success" });
            }

            fetchRooms();
            handleCloseDialog();
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Thao tác thất bại, kiểm tra backend!", severity: "error" });
        } finally {
            setLoadingSave(false);
        }
    };

    const handleDeleteRoom = (id) => setConfirmDeleteDialog({ open: true, roomId: id });

    const confirmDeleteRoom = async () => {
        try {
            setLoadingDelete(true);
            await axiosClient.delete(`/rooms/${confirmDeleteDialog.roomId}`);
            fetchRooms();
            setSnackbar({ open: true, message: "Xóa phòng thành công", severity: "success" });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Xóa phòng thất bại", severity: "error" });
        } finally {
            setLoadingDelete(false);
            setConfirmDeleteDialog({ open: false, roomId: null });
        }
    };

    const markImageForDelete = (img) => {
        setImagesToDelete(prev => prev.includes(img) ? prev.filter(i => i !== img) : [...prev, img]);
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Rooms</h1>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                onClick={() => handleOpenDialog()}
            >
                Add Room
            </button>

            {loadingList ? (
                <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 bg-gray-200 animate-pulse rounded" />
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border">Hotel</th>
                                <th className="py-2 px-4 border">Name</th>
                                <th className="py-2 px-4 border">Price</th>
                                <th className="py-2 px-4 border">Max People</th>
                                <th className="py-2 px-4 border">Description</th>
                                <th className="py-2 px-4 border">Available</th>
                                <th className="py-2 px-4 border">Images</th>
                                <th className="py-2 px-4 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room._id}>
                                    <td className="py-2 px-4 border">{room.hotel?.name || "N/A"}</td>
                                    <td className="py-2 px-4 border">{room.name}</td>
                                    <td className="py-2 px-4 border">{room.price}</td>
                                    <td className="py-2 px-4 border">{room.maxPeople}</td>
                                    <td className="py-2 px-4 border text-sm">
                                        {truncateWords(room.description, 30)}
                                    </td>
                                    <td className="py-2 px-4 border text-center">
                                        {room.available ? "Yes" : "No"}
                                    </td>
                                    <td className="py-2 px-4 border text-center">
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {room.images?.map((img, idx) => (
                                                <img key={idx} src={img} loading="lazy" className="w-14 h-10 object-cover rounded" />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border text-center">
                                        <button
                                            className="px-2 py-1 mr-2 border rounded"
                                            onClick={() => handleOpenDialog(room)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="px-2 py-1 border rounded text-red-600"
                                            onClick={() => handleDeleteRoom(room._id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Dialog */}
            {openDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{currentRoom._id ? "Edit Room" : "Add Room"}</h2>
                        <div className="space-y-3">
                            <select
                                className="w-full border rounded px-2 py-1"
                                value={currentRoom.hotelId}
                                onChange={e => setCurrentRoom({ ...currentRoom, hotelId: e.target.value })}
                            >
                                <option value="">Select Hotel</option>
                                {hotels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                            </select>
                            <input
                                type="text" placeholder="Room Name" className="w-full border rounded px-2 py-1"
                                value={currentRoom.name} onChange={e => setCurrentRoom({ ...currentRoom, name: e.target.value })}
                            />
                            <input
                                type="number" placeholder="Price" className="w-full border rounded px-2 py-1"
                                value={currentRoom.price} onChange={e => setCurrentRoom({ ...currentRoom, price: e.target.value })}
                            />
                            <input
                                type="number" placeholder="Max People" className="w-full border rounded px-2 py-1"
                                value={currentRoom.maxPeople} onChange={e => setCurrentRoom({ ...currentRoom, maxPeople: e.target.value })}
                            />
                            <textarea
                                placeholder="Description" className="w-full border rounded px-2 py-1 line-clamp-3"
                                rows={3} value={currentRoom.description} onChange={e => setCurrentRoom({ ...currentRoom, description: e.target.value })}
                            ></textarea>
                            <select
                                className="w-full border rounded px-2 py-1"
                                value={currentRoom.available}
                                onChange={e => setCurrentRoom({ ...currentRoom, available: e.target.value === 'true' })}
                            >
                                <option value="true">Available</option>
                                <option value="false">Unavailable</option>
                            </select>

                            {currentRoom.images?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {currentRoom.images.map((img, idx) => (
                                        <div key={idx} className="relative">
                                            <img
                                                src={img} alt="room" className={`w-16 h-12 object-cover rounded ${imagesToDelete.includes(img) ? "opacity-50 border-2 border-red-600" : "border"}`}
                                            />
                                            <button
                                                className="absolute top-0 right-0 bg-white rounded-full p-1"
                                                onClick={() => markImageForDelete(img)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <input
                                type="file" multiple accept="image/*"
                                onChange={e => setImageFiles(Array.from(e.target.files))}
                                className="w-full"
                            />
                        </div>

                        <div className="flex justify-end mt-4 gap-2">
                            <button 
                            className="px-4 py-2 border rounded" 
                            onClick={handleCloseDialog}>
                                Cancel</button>
                            <button
                                onClick={handleSaveRoom}
                                disabled={loadingSave}
                                className={`px-4 py-2 text-white rounded 
                                ${loadingSave ? "bg-gray-400" : "bg-blue-600"}`}
                            >
                                {loadingSave ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete */}
            {confirmDeleteDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-4">Are you sure you want to delete this room? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <button 
                            className="px-4 py-2 border rounded" 
                            onClick={() => setConfirmDeleteDialog({ open: false, roomId: null })}
                            >Cancel</button>
                            <button
                                onClick={confirmDeleteRoom}
                                disabled={loadingDelete}
                                className={`px-4 py-2 text-white rounded 
                                ${loadingDelete ? "bg-gray-400" : "bg-red-600"}`}
                            >
                                {loadingDelete ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.open && (
                <div className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${snackbar.severity === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                    {snackbar.message}
                </div>
            )}
        </div>
    );
}
