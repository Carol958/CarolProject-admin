import React, { useState, useEffect } from "react";
import {
    FaTrash,
    FaEdit,
    FaCog,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaPlus,
    FaSortAmountDown,
    FaSortAmountUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCategories } from "./CategoryContext";
import toast from "react-hot-toast";

export default function CategoryList({ setActive }) {
    const navigate = useNavigate();
    const { categories, updateCategory, deleteCategory, loading } = useCategories();

    const [filterStatus, setFilterStatus] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(null);
    const [sortOrder, setSortOrder] = useState("desc");

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu-container')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openEditPage = (item) => {
        if (setActive) {
            setActive("Edit Category", item);
        } else {
            navigate("/customer/editcategory", { state: { category: item } });
        }
        setOpenDropdownId(null);
    };

    let filteredItems = [...categories]
        .filter(
            (item) =>
                filterStatus === "all" ||
                (filterStatus === "active" ? item.active : !item.active)
        )
        .filter((item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

    filteredItems = [...filteredItems].sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return sortOrder === "desc" ? idB - idA : idA - idB;
    });

    const totalEntries = filteredItems.length;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;

    const handlePageChange = (pageNumber) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        setOpenDropdownId(null);
    };

    const toggleStatus = async (item) => {
        const updatedItem = { ...item, active: !item.active };
        try {
            const success = await updateCategory(updatedItem);
            if (success) {
                toast.success(`Category status updated to ${updatedItem.active ? "active" : "inactive"}`);
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="min-h-[400px] flex flex-col font-sans text-[#333]">
            {/* Header Card */}
            <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-4 shadow-sm border border-gray-100">
                <h2 className="m-0 text-[#04364A] text-xl font-bold">Category Management</h2>
                <button
                    onClick={() => setActive ? setActive("Add New Category") : navigate("/customer/addnewcategory")}
                    className="flex items-center bg-sky-900 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm font-semibold transition-all hover:bg-sky-950 active:scale-95 shadow-sm"
                >
                    <FaPlus style={{ marginRight: "8px" }} /> Add New Category
                </button>
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
                            placeholder="Search categories..."
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
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="w-10 h-10 border-4 border-gray-100 border-t-sky-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400 font-medium animate-pulse">Fetching categories...</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col">
                    <div className="bg-white rounded-none shadow-sm overflow-hidden border border-gray-200 mb-6 font-sans">
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr className="bg-[#04364A] text-white">
                                    <th className="w-1/4 p-4 text-center font-bold text-sm">Name</th>
                                    <th className="w-1/3 p-4 text-center font-bold text-sm">Description</th>
                                    <th className="w-16 p-4 text-center font-bold text-sm">Status</th>
                                    <th className="w-16 p-4 text-center font-bold text-sm">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.length > 0 ? (
                                    currentItems.map((item, idx) => (
                                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-center">
                                            <td className="p-4 text-center text-sm font-medium text-gray-700">
                                                <div className="truncate px-2" title={item.name}>{item.name}</div>
                                            </td>
                                            <td className="p-4 text-center text-sm text-gray-500 italic whitespace-nowrap overflow-hidden">
                                                <div className="truncate px-2" title={item.description || "No description"}>
                                                    {item.description || "No description"}
                                                </div>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center">
                                                    <label className="relative inline-block w-10 h-5">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.active}
                                                            onChange={() => toggleStatus(item)}
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
                                                        setOpenDropdownId(openDropdownId === item.id ? null : item.id);
                                                    }}
                                                    className="p-2 text-gray-500 bg-transparent border-none rounded-full cursor-pointer transition-all hover:bg-gray-100 hover:text-sky-900 group"
                                                >
                                                    <FaCog size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                                                </button>
                                                {openDropdownId === item.id && (
                                                    <div className={`absolute right-1/2 translate-x-1/2 ${idx === currentItems.length - 1 && currentItems.length > 1 ? 'bottom-full mb-1' : 'top-full z-10'} w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150`}>
                                                        <button
                                                            onClick={() => openEditPage(item)}
                                                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                                                        >
                                                            <FaEdit className="text-sky-700" size={12} /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeletePopup(item)}
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
                                        <td colSpan="4" className="p-16 text-center text-gray-400 italic text-sm">
                                            {searchQuery ? "No matches for your search query." : "Category directory is empty."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="flex justify-between items-center px-1 mb-10 text-gray-500">
                        <span className="text-sm font-medium">
                            Showing {totalEntries > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, totalEntries)} of {totalEntries} entries
                        </span>

                        {totalPages > 0 && (
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
                        )}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-sm w-full mx-4 border border-gray-50 animate-in zoom-in slide-in-from-bottom-4 duration-300">
                        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
                            <FaTrash />
                        </div>
                        <h3 className="text-gray-900 font-black text-xl mb-3">Security Alert</h3>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            You are about to permanently delete <span className="font-bold text-gray-800">
                                {showDeletePopup?.name}
                            </span>. Are you absolutely certain?
                        </p>
                        <div className="flex gap-4">
                            <button
                                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors cursor-pointer border-none shadow-sm"
                                onClick={() => setShowDeletePopup(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 cursor-pointer active:scale-95 border-none"
                                onClick={async () => {
                                    await deleteCategory(showDeletePopup.id);
                                    toast.success(`Category "${showDeletePopup.name}" deleted successfully`);
                                    setShowDeletePopup(null);
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
