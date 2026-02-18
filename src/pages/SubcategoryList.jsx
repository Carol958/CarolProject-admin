import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSubcategories } from "./SubcategoryContext";
import { useCategories } from "./CategoryContext";
import { FaPlus, FaSearch, FaTrash, FaCog, FaEdit, FaChevronLeft, FaChevronRight, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import toast from "react-hot-toast";

export default function SubcategoryList({ setActive }) {
    const navigate = useNavigate();
    const { subcategories, deleteSubcategory, updateSubcategory, loading: subLoading } = useSubcategories();
    const { categories, loading: catLoading } = useCategories();
    const loading = subLoading || catLoading;
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState("desc");
    const [modalOpen, setModalOpen] = useState(null);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu-container')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getCategoryName = (id) => {
        const category = categories.find(cat => cat.id === parseInt(id));
        return category ? (category.category_name || category.name) : "Unknown";
    };

    const filteredSubcategories = subcategories
        .filter(sub => {
            if (filterStatus === "all") return true;
            return sub.status === filterStatus;
        })
        .filter(sub =>
            sub.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const sortedSubcategories = [...filteredSubcategories].sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return sortOrder === "desc" ? idB - idA : idA - idB;
    });

    const totalEntries = sortedSubcategories.length;
    const entriesCount = parseInt(entriesPerPage) || 10;
    const totalPages = Math.ceil(totalEntries / entriesCount) || 1;

    const startIndex = (currentPage - 1) * entriesCount;
    const currentEntries = sortedSubcategories.slice(startIndex, startIndex + entriesCount);

    return (
        <div className="min-h-[400px] flex flex-col font-sans text-[#333]">
            {/* Header Card */}
            <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-4 shadow-sm border border-gray-100">
                <h2 className="m-0 text-[#04364A] text-xl font-bold">Subcategory Management</h2>
                <button
                    onClick={() => setActive ? setActive("Add New Subcategory") : navigate("/customer/subcategory-add")}
                    className="flex items-center bg-sky-900 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm font-semibold transition-all hover:bg-sky-950 active:scale-95 shadow-sm"
                >
                    <FaPlus style={{ marginRight: "8px" }} /> Add New Subcategory
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center text-sm text-gray-600 font-medium">
                    Show
                    <select
                        className="mx-2 p-1.5 border border-gray-300 rounded outline-none focus:border-gray-500 cursor-pointer"
                        value={entriesPerPage}
                        onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    >
                        {[5, 10, 25, 50].map(val => (
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

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="ml-2 p-1.5 border border-gray-300 rounded outline-none focus:border-gray-500 cursor-pointer h-10 shadow-sm bg-white text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>

                    <div className="flex group shadow-sm rounded-md overflow-hidden bg-white">
                        <input
                            type="text"
                            placeholder="Search subcategories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 px-3 border border-gray-300 border-r-0 outline-none w-64 focus:border-sky-900 transition-colors text-sm h-10"
                        />
                        <button className="p-2 px-4 border-none bg-sky-900 cursor-pointer text-white hover:bg-sky-950 transition-colors h-10 flex items-center justify-center">
                            <FaSearch size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-sky-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-medium animate-pulse">Fetching subcategories...</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="bg-white rounded-none shadow-sm overflow-hidden border border-gray-200 mb-6 font-sans">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr className="bg-[#04364A] text-white">
                                    <th className="w-1/4 p-4 text-center font-bold text-sm">Name</th>
                                    <th className="w-1/4 p-4 text-center font-bold text-sm">Description</th>
                                    <th className="w-1/5 p-4 text-center font-bold text-sm">Category</th>
                                    <th className="w-16 p-4 text-center font-bold text-sm">Status</th>
                                    <th className="w-16 p-4 text-center font-bold text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEntries.length > 0 ? (
                                    currentEntries.map((sub, idx) => (
                                        <tr key={sub.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-center text-sm font-medium text-gray-700">
                                                <div className="truncate px-2" title={sub.name}>{sub.name}</div>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-500 italic whitespace-nowrap overflow-hidden">
                                                <div className="truncate px-2" title={sub.description || "No description"}>
                                                    {sub.description || "No description"}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-xs font-bold">
                                                    {getCategoryName(sub.categoryId)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    <label className="relative inline-block w-10 h-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={sub.status === 'active'}
                                                            onChange={async () => {
                                                                const newStatus = sub.status === 'active' ? 'inactive' : 'active';
                                                                try {
                                                                    await updateSubcategory({
                                                                        ...sub,
                                                                        status: newStatus
                                                                    });
                                                                    toast.success(`Subcategory status updated to ${newStatus}`);
                                                                } catch (err) {
                                                                    console.error("Failed to toggle status:", err);
                                                                    toast.error("Failed to update status.");
                                                                }
                                                            }}
                                                            className="opacity-0 w-0 h-0 peer"
                                                        />
                                                        <span className="absolute cursor-pointer bg-gray-200 rounded-full inset-0 transition-all duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-green-600 peer-checked:before:translate-x-5 shadow-sm"></span>
                                                    </label>
                                                </div>
                                            </td>
                                            <td className="p-4 text-center relative action-menu-container">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === sub.id ? null : sub.id);
                                                    }}
                                                    className="p-2 text-gray-500 bg-transparent border-none rounded-full cursor-pointer transition-all hover:bg-gray-100 hover:text-sky-900 group"
                                                >
                                                    <FaCog size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                                                </button>

                                                {openDropdownId === sub.id && (
                                                    <div className={`absolute right-1/2 translate-x-1/2 ${idx === currentEntries.length - 1 && currentEntries.length > 1 ? 'bottom-full mb-1' : 'top-full z-10'} w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150`}>
                                                        <button
                                                            onClick={() => {
                                                                if (setActive) {
                                                                    setActive("Edit Subcategory", sub.id);
                                                                } else {
                                                                    navigate(`/customer/subcategory-edit/${sub.id}`);
                                                                }
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                                                        >
                                                            <FaEdit size={12} className="text-sky-700" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setModalOpen(sub.id);
                                                                setOpenDropdownId(null);
                                                            }}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                                                        >
                                                            <FaTrash size={12} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-16 text-center text-gray-400 italic text-sm">
                                            {searchTerm ? "No matches for your search query." : "Subcategory directory is empty."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex justify-between items-center px-1 mb-10 text-gray-500">
                        <span className="text-sm font-medium">
                            Showing {totalEntries > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + entriesCount, totalEntries)} of {totalEntries} entries
                        </span>

                        {totalPages > 0 && (
                            <div className="flex items-center text-gray-400">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="p-2 cursor-pointer hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaChevronLeft size={10} />
                                </button>

                                <div className="flex gap-1 mx-2">
                                    {[...Array(totalPages)].map((_, idx) => (
                                        <button
                                            key={idx + 1}
                                            onClick={() => setCurrentPage(idx + 1)}
                                            className={`w-8 h-8 rounded text-sm font-bold transition-all cursor-pointer ${currentPage === idx + 1
                                                ? "bg-sky-900 text-white shadow-sm hover:bg-sky-950"
                                                : "bg-white text-gray-600 border border-gray-200 hover:border-sky-900 hover:text-sky-900"
                                                }`}
                                        >
                                            {idx + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    className="p-2 cursor-pointer hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    <FaChevronRight size={10} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Security Alert Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full mx-4 border border-gray-50 animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
                            <FaTrash />
                        </div>
                        <h3 className="text-gray-900 font-black text-xl mb-3">Security Alert</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            You are about to permanently delete <span className="font-bold text-gray-800">
                                @{subcategories.find(s => s.id === modalOpen)?.name}
                            </span>. Are you absolutely certain?
                        </p>
                        <div className="flex gap-4">
                            <button
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors cursor-pointer border-none shadow-sm"
                                onClick={() => setModalOpen(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 cursor-pointer active:scale-95 border-none"
                                onClick={() => {
                                    deleteSubcategory(modalOpen);
                                    setModalOpen(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

