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
import toast from "react-hot-toast";

const ServiceList = ({ setActive }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showDeletePopup, setShowDeletePopup] = useState(null);
    const [sortOrder, setSortOrder] = useState("desc");
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [filterAction, setFilterAction] = useState("No Action");

    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Mock data based on the image provided
    const [services, setServices] = useState([
        { id: 1, name: "Petra", category: "Programming", subCategory: "", maxPrice: "Value", discount: "10%", commissionType: "", commissionValue: "", status: "active" },
        { id: 2, name: "Petra", category: "Programming", subCategory: "", maxPrice: "Value", discount: "10%", commissionType: "", commissionValue: "", status: "active" },
        { id: 3, name: "Petra", category: "Programming", subCategory: "", maxPrice: "Value", discount: "10%", commissionType: "", commissionValue: "", status: "active" },
        { id: 4, name: "Petra", category: "Programming", subCategory: "", maxPrice: "Value", discount: "10%", commissionType: "", commissionValue: "", status: "active" },
    ]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu-container')) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    let filteredItems = services.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    const handleDelete = (id) => {
        setServices(services.filter(s => s.id !== id));
        toast.success("Service deleted successfully");
        setShowDeletePopup(null);
    };

    return (
        <div className="min-h-[400px] flex flex-col font-sans text-[#333]">
            {/* Header Card */}
            <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-4 shadow-sm border border-gray-100">
                <h2 className="m-0 text-[#04364A] text-xl font-bold">Service List</h2>
                <button
                    onClick={() => setActive("Add New Service")}
                    className="flex items-center bg-sky-900 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm font-semibold transition-all hover:bg-sky-950 active:scale-95 shadow-sm"
                >
                    <FaPlus className="mr-2" /> Add Service
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
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="ml-2 p-1.5 border border-gray-300 rounded outline-none focus:border-gray-500 cursor-pointer h-10 shadow-sm bg-white text-sm w-24"
                    >
                        <option>ALL</option>
                        <option>Logic</option>
                        <option>Programming</option>
                    </select>

                    <div className="flex group shadow-sm rounded-md overflow-hidden bg-white">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="p-2 px-3 border border-gray-300 border-r-0 outline-none w-48 focus:border-sky-900 transition-colors text-sm h-10"
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
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Name</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Category</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Select Sub Category</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Max Price</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Discount (%)</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Commission type</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Commission value</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Status</th>
                                <th className="p-4 text-center font-bold text-sm whitespace-nowrap">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((item, idx) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors text-center">
                                    <td className="p-4 text-center text-sm font-medium text-gray-700">{item.name}</td>
                                    <td className="p-4 text-center text-sm text-gray-500">{item.category}</td>
                                    <td className="p-4 text-center text-sm text-gray-500">{item.subCategory || "—"}</td>
                                    <td className="p-4 text-center text-sm text-gray-500">{item.maxPrice}</td>
                                    <td className="p-4 text-center text-sm text-gray-500">{item.discount}</td>
                                    <td className="p-4 text-center text-sm text-gray-500">{item.commissionType || "—"}</td>
                                    <td className="p-4 text-center text-sm text-gray-500">{item.commissionValue || "—"}</td>
                                    <td className="p-4 text-center">
                                        <div className="flex justify-center">
                                            <label className="relative inline-block w-10 h-5">
                                                <input
                                                    type="checkbox"
                                                    checked={item.status === 'active'}
                                                    onChange={() => { }}
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
                                                    onClick={() => { }}
                                                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                                                >
                                                    <FaEdit className="text-sky-700" size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowDeletePopup(item);
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
                            ))}
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

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-100 p-4 font-sans">
                    <div className="bg-white p-6 rounded-lg text-center shadow-2xl max-w-[320px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
                        <p className="text-gray-700 mb-6 font-medium text-sm">
                            Are you sure you want to <br /> delete this service?
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                className="px-6 py-1 rounded bg-red-600 text-white font-bold hover:bg-red-700 transition-all cursor-pointer text-xs"
                                onClick={() => handleDelete(showDeletePopup.id)}
                            >
                                Delete
                            </button>
                            <button
                                className="px-6 py-1 rounded bg-white text-gray-600 border border-gray-300 font-bold hover:bg-gray-50 transition-all cursor-pointer text-xs"
                                onClick={() => setShowDeletePopup(null)}
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceList;
