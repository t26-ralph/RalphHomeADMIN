import { useEffect, useState } from "react";
import statsApi from "../api/statsApi";
import CountUp from "react-countup";
import { Box, Card, CardContent, Typography, CircularProgress, Divider, useTheme, List, ListItem, ListItemText } from "@mui/material";

import PeopleIcon from '@mui/icons-material/PeopleOutlined';
import ListAltIcon from '@mui/icons-material/ListAltOutlined';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyOutlined';
import HotelIcon from '@mui/icons-material/HotelOutlined';
import StarIcon from '@mui/icons-material/StarOutlined';
import PieChartIcon from '@mui/icons-material/PieChartOutlined';
const StatCard = ({ title, value, IconComponent, color, isPercent }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                flex: "1 1 280px",
                minHeight: 180,
                m: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: 6,
                borderRadius: 2,
                backgroundColor: theme.palette.background.paper,
                transition: "all .3s",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: 12,
                },
            }}
        >
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography color="text.secondary" fontWeight={600}>
                        {title}
                    </Typography>

                    <Box
                        sx={{
                            bgcolor: theme.palette[color]?.main,
                            color: "#fff",
                            borderRadius: "50%",
                            p: 1.2,
                        }}
                    >
                        <IconComponent />
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h3" fontWeight={700}>
                    <CountUp
                        end={value}
                        duration={1.2}
                        formattingFn={(val) =>
                            isPercent
                                ? `${val}%`
                                : title === "Doanh thu"
                                    ? new Intl.NumberFormat("vi-VN").format(val) + " ₫"
                                    : new Intl.NumberFormat("vi-VN").format(val)
                        }
                    />
                </Typography>
            </CardContent>
        </Card>
    );
};
export default function StatsPage() {
    const theme = useTheme();
    const now = new Date();

    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const res = await statsApi.getDashboard({ month, year });

                setStats({
                    totalUsers: res.data?.totalUsers || 0,
                    totalBookings: res.data?.totalBookings || 0,
                    totalRevenue: res.data?.revenue || 0,
                    totalRooms: res.data?.totalRooms || 0,
                    occupancyRate: res.data?.occupancyRate || 0,
                    topRooms: res.data?.topRooms || [],
                    hasData: res.data?.hasData ?? true,
                });
            } catch {
                setError("Không thể tải dữ liệu thống kê");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [month, year]);

    if (loading)
        return (
            <Box mt={10} display="flex" justifyContent="center">
                <CircularProgress color="success" />
            </Box>
        );

    if (error)
        return (
            <Typography color="error" textAlign="center">
                {error}
            </Typography>
        );

    const statCards = [
        { title: "Tổng người dùng", value: stats.totalUsers, IconComponent: PeopleIcon, color: "primary" },
        { title: "Tổng đơn đặt phòng", value: stats.totalBookings, IconComponent: ListAltIcon, color: "success" },
        { title: "Doanh thu", value: stats.totalRevenue, IconComponent: AttachMoneyIcon, color: "warning" },
        { title: "Tổng phòng", value: stats.totalRooms, IconComponent: HotelIcon, color: "info" },
        { title: "Tỷ lệ lấp đầy", value: stats.occupancyRate, IconComponent: PieChartIcon, color: "error", isPercent: true },
    ];

    return (
        <Box p={4} minHeight="100vh" bgcolor={theme.palette.background.default}>
            {/* TIÊU ĐỀ */}
            <Typography variant="h4" textAlign="center" fontWeight={700}>
                STAT PAGE
            </Typography>

            {/* BỘ LỌC */}
            <Box display="flex" justifyContent="center" gap={2} mb={4}>
                <select value={month} onChange={(e) => setMonth(+e.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Tháng {i + 1}
                        </option>
                    ))}
                </select>

                <select value={year} onChange={(e) => setYear(+e.target.value)}>
                    {[2023, 2024, 2025].map((y) => (
                        <option key={y} value={y}>
                            Năm {y}
                        </option>
                    ))}
                </select>
            </Box>
            <Typography textAlign="center" color="text.secondary" mb={3}>
                Thống kê cho tháng {month}/{year}
            </Typography>

            {!stats.hasData && (
                <Box
                    sx={{
                        mt: 4,
                        p: 4,
                        borderRadius: 2,
                        backgroundColor: theme.palette.grey[100],
                        textAlign: "center",
                    }}
                >
                    <Typography variant="h6" color="text.secondary">
                        Không có dữ liệu kinh doanh trong tháng {month} năm {year}
                    </Typography>
                </Box>
            )}

            {/* CARD THỐNG KÊ */}
            {stats.hasData && (
                <Box display="flex" justifyContent="center" flexWrap="wrap">
                    {statCards.map(stat => (
                        <StatCard key={stat.title} {...stat} />
                    ))}
                </Box>
            )}

            {/* PHÒNG BÁN CHẠY */}
            {stats.hasData &&(
                <Box mt={5}>
                    <Typography variant="h5" fontWeight={600} mb={2}>
                        Phòng Bán Chạy
                    </Typography>

                    <Box display="flex" flexWrap="wrap">
                        {stats.topRooms.length === 0 ? (
                            <Typography>Không có dữ liệu</Typography>
                        ) : (
                            stats.topRooms.map((room, index) => (
                                <Card
                                    key={room._id}
                                    sx={{
                                        minWidth: 260,
                                        m: 1,
                                        p: 2,
                                        boxShadow: 4,
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography fontWeight={600}>
                                        ⭐ {room.roomInfo?.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Khách sạn: {room.roomInfo?.hotel?.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        Lượt đặt: {room.count}
                                    </Typography>
                                </Card>
                            ))
                        )}
                    </Box>
                </Box>
            )}
        </Box>
    );
}
