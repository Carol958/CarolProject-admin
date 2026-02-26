import { useState, useEffect, useRef } from "react";
import {
    FaCog,
    FaChevronLeft,
    FaChevronRight,
    FaSortAmountDown,
    FaSortAmountUp,
    FaSearch,
} from "react-icons/fa";
import { getPendingProviders, approveProvider, rejectProvider } from "../services/adminService";
import toast from "react-hot-toast";
import { useCategories } from "./CategoryContext";

export default function PendingProviders({ setActive, setSelectedProviderDetail }) {
    const dropdownRef = useRef(null);
    const { categories } = useCategories();

    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(true);

    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("desc");
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // Popup state
    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupType, setPopupType] = useState(""); // "approve" or "reject"
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");

    // Fetch pending providers
    useEffect(() => {
        fetchPendingProviders();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPendingProviders = async () => {
        try {
            setLoading(true);

            const response = await getPendingProviders();
            console.log("RAW API RESPONSE:", response);

            const rawData = response.data;
            // Robustly extract the array of providers
            const data = rawData?.data || rawData?.providers || (Array.isArray(rawData) ? rawData : []);

            setProviders(data);
            console.log("EXTRACTED DATA FOR TABLE:", data);
        } catch (error) {
            console.error("Error fetching providers:", error);
            console.error("Error details:", error.response?.data);
            const msg = error.response?.data?.message || "Failed to fetch pending providers";
            toast.error(msg);
            setProviders([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter + Search (Safely check if providers is an array)
    let filteredItems = Array.isArray(providers) ? providers.filter((item) => {
        const name = item.User?.name || item.name || "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    }) : [];

    // Sort by ID
    filteredItems = [...filteredItems].sort((a, b) =>
        sortOrder === "desc" ? b.id - a.id : a.id - b.id
    );

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
    };

    // Handlers
    const handleApprove = (provider) => {
        setSelectedProvider(provider);
        setPopupType("approve");
        setPopupMessage(
            "By Approving this provider account, Services submitted by this provider will remain pending until individually reviewed."
        );
        setShowPopup(true);
        setOpenDropdownId(null);
    };

    const handleReject = (provider) => {
        setSelectedProvider(provider);
        setPopupType("reject");
        setPopupMessage(
            "Rejecting this provider will automatically reject all associated services. This action cannot be undone."
        );
        setShowPopup(true);
        setOpenDropdownId(null);
    };

    const closePopup = () => {
        setShowPopup(false);
        setSelectedProvider(null);
        setPopupType("");
        setRejectionReason("");
    };

    const confirmAction = async () => {
        if (!selectedProvider) return;

        try {
            if (popupType === "approve") {
                await approveProvider(selectedProvider.id);
            } else {
                await rejectProvider(selectedProvider.id, rejectionReason);
            }

            toast.success(`Provider ${popupType === "approve" ? "approved" : "rejected"} successfully`);
            fetchPendingProviders();
            closePopup();
        } catch (error) {
            console.error(`Error ${popupType}ing provider:`, error);
            toast.error(`Failed to ${popupType} provider`);
        }
    };


    return (
        <div className="min-h-[400px] flex flex-col font-sans text-[#333]">

            {/* Header Card */}
            <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-4 shadow-sm border border-gray-100">
                <h2 className="m-0 text-[#04364A] text-xl font-bold">
                    Pending Providers Management
                </h2>
            </div>

            {/* Controls Bar */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center text-sm text-gray-600 font-medium">
                    Show
                    <select
                        className="mx-2 p-1.5 border border-gray-300 rounded outline-none focus:border-gray-500 cursor-pointer"
                        value={itemsPerPage}
                        onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                        {[5, 10, 25, 50].map((val) => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
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
                                <th className="p-4 text-center font-bold text-sm">Name</th>
                                <th className="p-4 text-center font-bold text-sm">Joining Date</th>
                                <th className="p-4 text-center font-bold text-sm">Category</th>
                                <th className="p-4 text-center font-bold text-sm">Services</th>
                                <th className="p-4 text-center font-bold text-sm">Contact Number</th>
                                <th className="p-4 text-center font-bold text-sm">Status</th>
                                <th className="p-4 text-center font-bold text-sm">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-sky-900 font-bold">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="w-8 h-8 border-4 border-sky-900 border-t-transparent rounded-full animate-spin"></div>
                                            Loading providers...
                                        </div>
                                    </td>
                                </tr>
                            ) : currentItems.length > 0 ? (
                                currentItems.map((provider) => (
                                    <tr key={provider.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-center">
                                        <td className="p-4 text-center text-sm font-medium text-gray-700">{provider.name || "N/A"}</td>
                                        <td className="p-4 text-center text-sm text-gray-500 whitespace-nowrap overflow-hidden">
                                            {provider.createdAt
                                                ? new Date(provider.createdAt).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500">
                                            {(() => {
                                                // 1. Look into the Services array
                                                const firstService = provider.Services?.[0] || provider.services?.[0];
                                                if (firstService?.Category?.name) return firstService.Category.name;

                                                // 2. Try direct Category object
                                                if (provider.Category?.name) return provider.Category.name;

                                                // 3. Try matching by ID from context
                                                const catId = provider.categoryId || firstService?.categoryId;
                                                if (catId && categories.length > 0) {
                                                    const matchedCat = categories.find(c => String(c.id) === String(catId));
                                                    return matchedCat ? matchedCat.name : "N/A";
                                                }

                                                return "N/A";
                                            })()}
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500">
                                            {(() => {
                                                const priceInfo = provider.price ? ` (${provider.price_Type || "Fixed"}: ${provider.price})` : "";
                                                const svcName = provider.Service_title?.name || provider.serviceName || provider.service_name;

                                                if (svcName) return svcName + priceInfo;

                                                const svcs = provider.Services || provider.services || [];
                                                if (Array.isArray(svcs) && svcs.length > 0) {
                                                    return svcs.map((s) => s.name || s.title || s.Service_title?.name).join(", ");
                                                }

                                                return provider.price ? `Service Request${priceInfo}` : "N/A";
                                            })()}
                                        </td>
                                        <td className="p-4 text-center text-sm text-gray-500">{provider.phone || "N/A"}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                                Pending
                                            </span>
                                        </td>

                                        <td className="p-4 text-center relative action-menu-container">
                                            <button
                                                onClick={() =>
                                                    setOpenDropdownId(
                                                        openDropdownId === provider.id ? null : provider.id
                                                    )
                                                }
                                                className="p-2 text-gray-500 bg-transparent border-none rounded-full cursor-pointer transition-all hover:bg-gray-100 hover:text-sky-900 group"
                                            >
                                                <FaCog size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                                            </button>

                                            {openDropdownId === provider.id && (
                                                <div
                                                    className="absolute right-1/2 translate-x-1/2 mt-2 w-52 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-10 animate-in fade-in zoom-in duration-150"
                                                    ref={dropdownRef}
                                                >
                                                    <button
                                                        className="flex items-center gap-2 w-full px-4 py-2 hover:bg-sky-50 text-left hover:text-sky-500 font-semibold text-xs border-none bg-transparent cursor-pointer"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedProviderDetail(provider);
                                                            setActive("Provider Details", provider);
                                                            setOpenDropdownId(null);
                                                        }}
                                                    >
                                                        View Provider Details
                                                    </button>

                                                    <div className="flex flex-col border-t">
                                                        <button
                                                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-green-50 text-left hover:text-green-500 cursor-pointer font-semibold text-xs border-none bg-transparent"
                                                            onClick={() => handleApprove(provider)}
                                                        >
                                                            Approve Provider
                                                        </button>
                                                        <button
                                                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-50 text-left hover:text-red-500 cursor-pointer font-semibold text-xs border-none bg-transparent"
                                                            onClick={() => handleReject(provider)}
                                                        >
                                                            Reject Provider
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="p-16 text-center text-gray-400 italic text-sm"
                                    >
                                        No pending providers found.
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
                            Showing {filteredItems.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
                            {Math.min(indexOfLastItem, filteredItems.length)} of{" "}
                            {filteredItems.length} entries
                        </span>

                        <div className="flex items-center text-gray-400">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 cursor-pointer hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronLeft size={10} />
                            </button>

                            <div className="flex gap-1 mx-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                                    <button
                                        key={number}
                                        onClick={() => handlePageChange(number)}
                                        className={`w-8 h-8 rounded text-sm font-bold transition-all cursor-pointer ${currentPage === number
                                            ? "bg-sky-900 text-white shadow-sm hover:bg-sky-950"
                                            : "bg-white text-gray-600 border border-gray-200 hover:border-sky-900 hover:text-sky-900"
                                            }`}
                                    >
                                        {number}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 cursor-pointer hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[100] p-4">
                    <div className="bg-white p-10 rounded-[32px] text-center shadow-2xl max-w-[420px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[#04364A] font-bold text-2xl mb-4">
                            {popupType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                        </h3>

                        <div className="my-6">
                            <p className="text-gray-500 mb-8 leading-relaxed text-sm px-2">
                                {popupMessage}
                            </p>
                        </div>

                        {popupType === "reject" && (
                            <div className="mb-6 text-left">
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Reason for Rejection:</label>
                                <textarea
                                    className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-sky-500 outline-none transition-all resize-none h-24"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Please provide a reason..."
                                ></textarea>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={closePopup}
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer active:scale-95 text-sm ${popupType === "approve"
                                    ? "bg-green-600 hover:bg-green-700 shadow-green-200"
                                    : "bg-red-600 hover:bg-red-700 shadow-red-200"
                                    }`}
                            >
                                {popupType === "approve" ? "Accept" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
