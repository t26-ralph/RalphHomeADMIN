import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManageHotels from "./ManageHotels";
import ManageRooms from "./ManageRooms";
import ManageBookings from "./ManageBookings";
import ManageUsers from "./ManageUsers";
import ManagePayments from "./ManagePayment";
import StatsPage from "./StatsPage";
import Logo1 from "../assets/logofn.png";

export default function AdminDashboard() {
    const [selectedPage, setSelectedPage] = useState("hotels");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const renderPage = () => {
        switch (selectedPage) {
            case "hotels":
                return <ManageHotels />;
            case "rooms":
                return <ManageRooms />;
            case "bookings":
                return <ManageBookings />;
            case "users":
                return <ManageUsers />;
            case "payments":
                return <ManagePayments />;
            case "stats":
                return <StatsPage />;
            default:
                return <ManageHotels />;
        }
    };

    const menuItems = [
        { key: "hotels", label: "Manage Hotels" },
        { key: "rooms", label: "Manage Rooms" },
        { key: "bookings", label: "Manage Bookings" },
        { key: "users", label: "Manage Users" },
        { key: "payments", label: "Manage Payments" },
        { key: "stats", label: "Stats" },
    ];

    return (
        <div className="flex h-screen w-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-56 bg-white shadow-md flex flex-col h-full">
                <div className="flex items-center justify-center h-20 border-b">
                    <img src={Logo1} alt="Logo" className="w-16 h-12 object-cover" />
                </div>
                <nav className="flex-1 overflow-y-auto mt-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setSelectedPage(item.key)}
                            className={`w-full text-left px-6 py-3 hover:bg-gray-200 transition-colors ${selectedPage === item.key ? "bg-gray-200 font-bold" : ""
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col h-full">
                {/* Header */}
                <header className="flex justify-between items-center bg-white h-20 px-6 shadow flex-shrink-0">
                    <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition-colors font-bold"
                    >
                        Đăng xuất
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">{renderPage()}</main>
            </div>
        </div>
    );
}
