import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Logo1 from "../assets/logofn.png";
import Homie from "../assets/BG.png";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axiosClient.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data));
            navigate("/admin");
        } catch (err) {
            setError(err.response?.data?.message || "Đăng nhập thất bại");
        }
    };

    return (
        <div
            className="h-screen w-screen flex items-center justify-center relative"
            style={{
                backgroundImage: `url(${Homie})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Overlay mờ */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

            {/* Form */}
            <div className="relative z-10 bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                {/* Logo + Title */}
                <div className="flex flex-col items-center mb-8">
                    <img src={Logo1} alt="Logo" className="w-20 h-14 object-cover mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-6 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Mật khẩu</label>
                        <div className="relative"> {/* <-- Đã cố định căn chỉnh con mắt */}
                            <input
                                id="admin-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Nhập mật khẩu"
                                className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition duration-200"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 p-1 rounded-full transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                    >
                        Đăng nhập
                    </button>
                </form>
            </div>
        </div>
    );
}
