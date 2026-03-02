import { useState, useEffect, useRef } from "react";
import {
    FaCog,
    FaChevronLeft,
    FaChevronRight,
    FaSortAmountDown,
    FaSortAmountUp,
    FaSearch,
} from "react-icons/fa";
import { approveService, rejectService } from "../../services/adminService.js";
import toast from "react-hot-toast";

export default function ProviderServices({
    setActive,
    setSelectedProviderDetail,
    services = [],
    setServices,
    loading,
    error,
    refreshServices
}) {
    const dropdownRef = useRef(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionType, setActionType] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId && !event.target.closest('.action-menu-container')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [openDropdownId]);

    // Reset to page 1 whenever search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    // Filter + Search
    let filteredItems = Array.isArray(services)
        ? services.filter((item) =>
            item?.User?.name
                ?.toLowerCase()
                ?.includes(searchQuery.toLowerCase())
        )
        : [];

    // Sort by ID
    filteredItems = filteredItems.sort((a, b) => {
        const idA = a?.id || 0;
        const idB = b?.id || 0;
        return sortOrder === "desc" ? idB - idA : idA - idB;
    });

    // Pagination
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const indexOfFirstItem = (safeCurrentPage - 1) * itemsPerPage;
    const indexOfLastItem = indexOfFirstItem + itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    const handleConfirmAction = async () => {
        if (!selectedId) return;
        try {
            setActionLoading(true);
            if (actionType === "approve") {
                await approveService(selectedId);
                toast.success("Service approved successfully!");
            } else {
                await rejectService(selectedId, rejectionReason);
                toast.success("Service rejected successfully!");
            }

            setServices((prev) =>
                prev.map((s) =>
                    s.id === selectedId
                        ? { ...s, status: actionType === "approve" ? "Accepted" : "Rejected" }
                        : s
                )
            );
            setModalOpen(false);
            setRejectionReason("");

            if (typeof refreshServices === 'function') {
                setTimeout(() => refreshServices(), 300);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to update service status");
        } finally {
            setActionLoading(false);
        }
    };

    const handleItemsPerPageChange = (value) => {
        const parsed = parseInt(value, 10);
        if (!isNaN(parsed) && parsed >= 1) {
            setItemsPerPage(parsed);
            setCurrentPage(1);
        }
    };

    const getPageNumbers = () => {
        const delta = 2;
        const start = Math.max(1, safeCurrentPage - delta);
        const end = Math.min(totalPages, safeCurrentPage + delta);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
        <div className="min-h-[400px] flex flex-col font-sans text-[#333]">
            {/* Header Card */}
            <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-4 shadow-sm border border-gray-100">
                <h2 className="m-0 text-[#04364A] text-xl font-bold">
                    Pending Service Request
                </h2>
                <button
                    onClick={refreshServices}
                    className="px-4 py-2 bg-sky-50 text-sky-700 rounded-lg text-sm font-bold hover:bg-sky-100 transition-colors border border-sky-100 shadow-sm"
                >
                    Refresh List
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center text-sm text-gray-600 font-medium">
                    Show
                    <input
                        type="number"
                        min="1"
                        max="1000"
                        className="mx-2 w-16 p-1.5 border border-gray-300 rounded outline-none focus:border-sky-900 text-center"
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(e.target.value)}
                    />
                    Entries
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                        className="p-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm h-10 w-10 cursor-pointer"
                        title={sortOrder === "desc" ? "Newest First" : "Oldest First"}
                    >
                        {sortOrder === "desc" ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
                    </button>

                    <div className="flex group shadow-sm rounded-md overflow-hidden bg-white ml-2">
                        <input
                            type="text"
                            placeholder="Search provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 px-3 border border-gray-300 border-r-0 outline-none w-64 focus:border-sky-900 transition-colors text-sm h-10"
                        />
                        <button className="p-2 px-4 border-none bg-sky-900 cursor-pointer text-white hover:bg-sky-950 transition-colors h-10 flex items-center justify-center">
                            <FaSearch size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white rounded-none shadow-sm overflow-hidden border border-gray-200 mb-6 font-sans">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-[#04364A] text-white">
                                <th className="p-4 text-center font-bold text-sm">Provider Name</th>
                                <th className="p-4 text-center font-bold text-sm">Date</th>
                                <th className="p-4 text-center font-bold text-sm">Category</th>
                                <th className="p-4 text-center font-bold text-sm">Sub Category</th>
                                <th className="p-4 text-center font-bold text-sm">Services</th>
                                <th className="p-4 text-center font-bold text-sm">Status</th>
                                <th className="p-4 text-center font-bold text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-[#04364A] text-sm font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-sky-100 border-t-[#04364A] rounded-full animate-spin"></div>
                                            <span>Loading services...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-red-500 italic text-sm">
                                        ⚠️ {error}
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((provider, index) => (
                                    <tr key={provider.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-center">
                                        <td className="p-4 text-center text-sm font-medium text-gray-700">{provider.User?.name}</td>
                                        <td className="p-4 text-center text-sm text-gray-500 whitespace-nowrap overflow-hidden">{provider.User?.createdAt || provider.User?.created_at || "N/A"}</td>
                                        <td className="p-4 text-center text-sm text-gray-500">{provider.Category?.name || "N/A"}</td>
                                        <td className="p-4 text-center text-sm text-gray-500">{provider.Subcategory?.name || "N/A"}</td>
                                        <td className="p-4 text-center text-sm text-gray-500">{provider.Service_title?.name || "N/A"}</td>
                                        <td className="p-4 text-center">
                                            <div className={`inline-block px-3 py-1 rounded-2xl text-[11px] font-bold uppercase ${provider.status === "Accepted" || provider.status === "accepted" ? "bg-green-100 text-green-700" :
                                                provider.status === "Rejected" || provider.status === "rejected" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"
                                                }`}>
                                                {provider.status || "Pending"}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center relative action-menu-container">
                                            <button
                                                onClick={() => setOpenDropdownId(openDropdownId === provider.id ? null : provider.id)}
                                                className="p-2 text-gray-500 bg-transparent border-none rounded-full cursor-pointer transition-all hover:bg-gray-100 hover:text-[#04364A] group"
                                            >
                                                <FaCog size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                                            </button>

                                            {openDropdownId === provider.id && (
                                                <div className={`absolute right-1/2 translate-x-1/2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in duration-150 ${index >= currentItems.length - 2 && currentItems.length > 2 ? "bottom-full mb-2" : "mt-2"
                                                    }`}>
                                                    <button
                                                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-sky-50 text-left hover:text-sky-500 font-semibold text-xs border-none bg-transparent cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProviderDetail(provider);
                                                            setActive("Provider Details");
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        View Service Details
                                                    </button>
                                                    <div className="flex flex-col border-t">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedId(provider.id);
                                                                setSelectedService(provider.Service_title?.name);
                                                                setActionType("approve");
                                                                setModalOpen(true);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-50 text-left hover:text-green-500 font-semibold text-xs border-none bg-transparent cursor-pointer"
                                                        >
                                                            Approve Service
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedId(provider.id);
                                                                setSelectedService(provider.Service_title?.name);
                                                                setActionType("reject");
                                                                setModalOpen(true);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-left hover:text-red-500 font-semibold text-xs border-none bg-transparent cursor-pointer"
                                                        >
                                                            Reject Service
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-gray-400 italic text-sm">
                                        No pending Services found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                {totalPages > 0 && (
                    <div className="flex justify-between items-center px-1 mb-10 text-gray-500">
                        <span className="text-sm font-medium">
                            Showing {filteredItems.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredItems.length)} of {filteredItems.length} entries
                        </span>
                        <div className="flex items-center text-gray-400">
                            <button
                                onClick={() => handlePageChange(safeCurrentPage - 1)}
                                disabled={safeCurrentPage === 1}
                                className="p-2 cursor-pointer hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronLeft size={10} />
                            </button>
                            <div className="flex gap-1 mx-2">
                                {getPageNumbers().map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`w-8 h-8 rounded text-sm font-bold transition-all cursor-pointer ${safeCurrentPage === page
                                            ? "bg-[#04364A] text-white shadow-sm hover:bg-sky-950"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-sky-900 hover:text-sky-900"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handlePageChange(safeCurrentPage + 1)}
                                disabled={safeCurrentPage === totalPages}
                                className="p-2 cursor-pointer hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-100 p-4">
                    <div className="bg-white p-10 rounded-[32px] text-center shadow-2xl max-w-[420px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[#04364A] font-bold text-2xl mb-4">
                            {actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                        </h3>
                        <div className="my-6">
                            <p className="text-gray-500 mb-2 leading-relaxed text-sm px-2">
                                Are you sure you want to {actionType === "approve" ? "approve" : "reject"} this service?
                            </p>
                            <div className="text-center mb-8">
                                <span className="text-sm font-bold text-[#04364A] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                                    Service: {selectedService}
                                </span>
                            </div>
                            {actionType === "reject" && (
                                <div className="space-y-2 mb-6 text-left">
                                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                        Reason for Rejection:
                                    </label>
                                    <textarea
                                        placeholder="Explain why this specific service is being rejected..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all resize-none h-28"
                                    />
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    disabled={actionLoading}
                                    className={`flex-[1.2] py-3 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer active:scale-95 text-sm flex items-center justify-center gap-2 ${actionType === "approve"
                                        ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                                        : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                        } disabled:opacity-50`}
                                >
                                    {actionLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : actionType === "approve" ? "Accept" : "Reject"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
