import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

export default function ManageHotels() {
    const [hotels, setHotels] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentHotel, setCurrentHotel] = useState({
        name: "",
        address: "",
        city: "",
        description: "",
        coverImage: "",
        images: [],
    });
    const [coverFile, setCoverFile] = useState(null);
    const [imageFiles, setImageFiles] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, hotelId: null });
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const truncateWords = (text, maxWords = 50) => {
        if (!text) return "";
        const words = text.split(" ");
        if (words.length <= maxWords) return text;
        return words.slice(0, maxWords).join(" ") + "...";
    };
    const [loadingList, setLoadingList] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        if (snackbar.open) {
            const timer = setTimeout(() => {
                setSnackbar((prev) => ({ ...prev, open: false }));
            }, 3000); // 3000ms = 3 giây

            return () => clearTimeout(timer);
        }
    }, [snackbar.open]);

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            setLoadingList(true);
            const res = await axiosClient.get("/hotels");
            setHotels(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingList(false);
        }
    };


    const handleOpenDialog = (hotel = { name: "", address: "", city: "", description: "", images: [] }) => {
        setCurrentHotel(hotel);
        setCoverFile(null);
        setImageFiles([]);
        setImagesToDelete([]);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentHotel({ name: "", address: "", city: "", description: "", images: [] });
        setCoverFile(null);
        setImageFiles([]);
        setImagesToDelete([]);
    };

    const handleDeleteExistingImage = (imgUrl) => {
        setImagesToDelete((prev) => [...prev, imgUrl.split("/").pop().split(".")[0]]);
        setCurrentHotel((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== imgUrl),
        }));
    };

    const handleDeleteCoverImage = () => {
        if (currentHotel.coverImage) {
            setImagesToDelete((prev) => [...prev, currentHotel.coverImage.split("/").pop().split(".")[0]]);
            setCurrentHotel((prev) => ({ ...prev, coverImage: "" }));
        }
    };

    const handleSaveHotel = async () => {
        try {
            setLoadingSave(true);
            const formData = new FormData();
            formData.append("name", currentHotel.name);
            formData.append("address", currentHotel.address);
            formData.append("city", currentHotel.city);
            formData.append("description", currentHotel.description);

            if (coverFile) formData.append("coverImage", coverFile);
            imageFiles.forEach((file) => formData.append("images", file));
            imagesToDelete.forEach((imgId) => formData.append("imagesToDelete", imgId));

            if (currentHotel._id) {
                await axiosClient.put(`/hotels/${currentHotel._id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSnackbar({ open: true, message: "Cập nhật hotel thành công!", severity: "success" });
            } else {
                await axiosClient.post("/hotels", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                setSnackbar({ open: true, message: "Thêm hotel thành công!", severity: "success" });
            }
            fetchHotels();
            handleCloseDialog();
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Thao tác thất bại, kiểm tra backend!", severity: "error" });
        }finally{
            setLoadingSave(false);
        }
    };

    const handleDeleteHotel = (id) => {
        setConfirmDialog({ open: true, hotelId: id });
    };

    const confirmDeleteHotel = async () => {
        try {
            setLoadingDelete(true);
            await axiosClient.delete(`/hotels/${confirmDialog.hotelId}`);
            setSnackbar({ open: true, message: "Xóa hotel thành công!", severity: "success" });
            fetchHotels();
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: "Xóa hotel thất bại!", severity: "error" });
        } finally {
            setLoadingDelete(false);
            setConfirmDialog({ open: false, hotelId: null });
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Manage Hotels</h1>
            <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
                onClick={() => handleOpenDialog()}
            >
                Add Hotel
            </button>

            <div className="overflow-x-auto">
                {loadingList ? (
                    <div className="text-center py-10 text-gray-500">
                        Đang tải danh sách khách sạn...
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border rounded shadow">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 border text-left">Name</th>
                                        <th className="py-2 px-4 border text-left">City</th>
                                        <th className="py-2 px-4 border text-left">Address</th>
                                        <th className="py-2 px-4 border text-left">Description</th>
                                        <th className="py-2 px-4 border text-center">Cover Image</th>
                                        <th className="py-2 px-4 border text-center">Gallery</th>
                                        <th className="py-2 px-4 border text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hotels.map((hotel) => (
                                        <tr key={hotel._id} className="hover:bg-gray-50">
                                            <td className="py-2 px-4">{hotel.name}</td>
                                            <td className="py-2 px-4">{hotel.city}</td>
                                            <td className="py-2 px-4">{hotel.address}</td>
                                            <td
                                                className="py-2 px-4 text-sm text-gray-700 cursor-help"
                                                title={hotel.description}
                                            >
                                                {truncateWords(hotel.description, 30)}
                                            </td>

                                            <td className="py-2 px-4 text-center">
                                                {hotel.coverImage && (
                                                    <img
                                                        src={hotel.coverImage}
                                                        alt="cover"
                                                        className="w-24 h-16 object-cover rounded"
                                                    />
                                                )}
                                            </td>
                                            <td className="py-2 px-4 border text-center">
                                                <div className="flex justify-center flex-wrap gap-1">
                                                    {hotel.images?.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt="hotel"
                                                            className="w-16 h-12 object-cover rounded"
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-2 px-4 border text-center">
                                                <button
                                                    className="px-2 py-1 mr-1 border rounded hover:bg-gray-100"
                                                    onClick={() => handleOpenDialog(hotel)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="px-2 py-1 border rounded text-red-600 hover:bg-red-100"
                                                    onClick={() => handleDeleteHotel(hotel._id)}
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

            </div>

            {/* Dialog thêm/sửa hotel */}
            {openDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">{currentHotel._id ? "Edit Hotel" : "Add Hotel"}</h2>

                        <input
                            type="text"
                            placeholder="Name"
                            value={currentHotel.name}
                            onChange={(e) => setCurrentHotel({ ...currentHotel, name: e.target.value })}
                            className="w-full border rounded px-3 py-2 mb-2"
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={currentHotel.city}
                            onChange={(e) => setCurrentHotel({ ...currentHotel, city: e.target.value })}
                            className="w-full border rounded px-3 py-2 mb-2"
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={currentHotel.address}
                            onChange={(e) => setCurrentHotel({ ...currentHotel, address: e.target.value })}
                            className="w-full border rounded px-3 py-2 mb-2"
                        />
                        <textarea
                            placeholder="Description"
                            value={currentHotel.description}
                            onChange={(e) => setCurrentHotel({ ...currentHotel, description: e.target.value })}
                            className="w-full border rounded px-3 py-2 mb-2 resize-none h-20"
                        />

                        <p className="font-semibold mt-2 mb-1">Cover Image</p>
                        {currentHotel.coverImage && (
                            <div className="flex items-center mb-2">
                                <img src={currentHotel.coverImage} alt="cover" className="w-20 h-16 object-cover mr-2" />
                                <button
                                    className="text-red-600 px-2 py-1 border rounded hover:bg-red-100"
                                    onClick={handleDeleteCoverImage}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />

                        <p className="font-semibold mt-2 mb-1">Gallery Images</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {currentHotel.images?.map((img, idx) => (
                                <div key={idx} className="relative">
                                    <img src={img} alt="gallery" className="w-14 h-12 object-cover" />
                                    <button
                                        onClick={() => handleDeleteExistingImage(img)}
                                        className="absolute bottom-0 right-0 text-red-600 bg-white rounded-full px-1 text-sm"
                                    >
                                        X
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" accept="image/*" multiple onChange={(e) => setImageFiles(Array.from(e.target.files))} />

                        <div className="flex justify-end gap-2 mt-4">
                            <button onClick={handleCloseDialog} className="px-4 py-2 border rounded hover:bg-gray-100">
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveHotel}
                                disabled={loadingSave}
                                className={`px-4 py-2 text-white rounded 
                                    ${loadingSave ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                                {loadingSave ? "Saving..." : "Save"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Dialog xóa hotel */}
            {confirmDialog.open && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h3 className="text-xl font-bold mb-4">Xác nhận xóa hotel</h3>
                        <p className="mb-6">Bạn có chắc chắn muốn xóa hotel này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setConfirmDialog({ open: false, hotelId: null })}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={confirmDeleteHotel}
                                disabled={loadingDelete}
                                className={`px-4 py-2 text-white rounded 
                                    ${loadingDelete ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
                            >
                                {loadingDelete ? "Đang xóa..." : "Xác nhận"}
                            </button>

                        </div>
                    </div>
                </div>
            )}

            {/* Snackbar */}
            {snackbar.open && (
                <div
                    className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-md text-white ${snackbar.severity === "success"
                            ? "bg-green-500"
                            : snackbar.severity === "error"
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
