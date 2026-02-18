import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaSearch, FaTrash, FaCog, FaEdit, FaChevronLeft, FaChevronRight, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import toast from "react-hot-toast";

const UserList = ({ setActive, setEditUser }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState("desc"); // "desc" for newest first, "asc" for oldest first

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const storedToken = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const token = storedToken ? storedToken.trim() : null;
      const userId = localStorage.getItem("userId");
      const url = "/api/users";

      console.log("--- Fetching Users ---");
      console.log("Token exists:", !!token);
      console.log("User Context ID:", userId);

      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-User-Id": userId || "",
          "ngrok-skip-browser-warning": "true",
        },
      });

      console.log("Response Status:", response.status);

      if (response.ok) {
        const data = await response.json();
        let rawUsers = Array.isArray(data) ? data : (data.users || data.data || []);

        setUsers(rawUsers.map(u => ({
          ...u,
          id: u.id || u._id || u.user_id || u.ID,
          status: (u.status === "active" || u.is_active || u.isActive) ? "active" : "inactive"
        })));
      } else if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.clear();
        setTimeout(() => navigate("/"), 2000);
      } else if (response.status === 403) {
        const errorData = await response.json().catch(() => ({}));
        console.error("403 Error Details:", errorData);
        if (errorData.message?.toLowerCase().includes("context")) {
          toast.error("Session sync error. Logging out for fix...");
          localStorage.clear();
          setTimeout(() => navigate("/"), 2000);
        } else {
          toast.error(errorData.message || "Access Forbidden (403)");
        }
      } else {
        throw new Error(`Server Error: ${response.status}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error(error.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu-container')) {
        setOpenActionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset to first page when searching or changing entries count
  useEffect(() => {
    setCurrentPage(1);
  }, [search, itemsPerPage]);

  const filteredUsers = users
    .filter(user => {
      if (filterStatus === "all") return true;
      return user.status?.toLowerCase() === filterStatus;
    })
    .filter(
      (user) =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.phone?.includes(search) || user.contact?.includes(search)
    );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const idA = parseInt(a.id) || 0;
    const idB = parseInt(b.id) || 0;

    if (sortOrder === "desc") {
      return idB - idA;
    } else {
      return idA - idB;
    }
  });

  // Pagination Logic
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setOpenActionId(null);
    }
  };

  const handleStatusChange = async (user) => {
    const newStatus = user.status?.toLowerCase() === "active" ? "inactive" : "active";
    // Optimistic update
    const updatedUsers = users.map((u) =>
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    setUsers(updatedUsers);

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const payload = {
        ...user,
        phone: user.phone || user.contact,
        status: newStatus,
        role: user.role || "customer"
      };

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-User-Id": localStorage.getItem("userId") || "",
          "X-Requested-With": "XMLHttpRequest",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(payload),
      });

      console.log("Update status response:", response.status);

      if (response.status === 401) {
        toast.error("Session expired or token is inactive. Please log in again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Status update error response:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `Update failed (${response.status})`);
      }
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.message || "Failed to update status. Reverting...");
      fetchUsers();
    }
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
      });

      console.log("Delete user response:", response.status);

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userToDelete.id));
        toast.success("User deleted successfully");
      } else if (response.status === 401) {
        toast.error("Session expired. Please log in again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/"), 2000);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error (${response.status})`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Delete failed: " + error.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setUserToDelete(null);
  };

  const handleEdit = (user) => {
    setEditUser(user);
  };

  return (
    <div className="min-h-[400px] flex flex-col font-sans text-[#333]">
      <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-4 shadow-sm border border-gray-100">
        <h2 className="m-0 text-[#04364A] text-xl font-bold">System Users Management</h2>
        <button
          className="flex items-center bg-sky-900 text-white border-none px-4 py-2 rounded-md cursor-pointer text-sm font-semibold transition-all hover:bg-sky-950 active:scale-95 shadow-sm"
          onClick={() => setActive("New User")}
        >
          <FaPlus style={{ marginRight: "8px" }} /> Add new system user
        </button>
      </div>

      <div className="flex justify-between items-center mb-6 px-1">
        <div className="flex items-center text-sm text-gray-600 font-medium">
          Show
          <select
            className="mx-2 p-1.5 border border-gray-300 rounded outline-none focus:border-gray-500 cursor-pointer"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
            className="p-2 bg-white border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center shadow-sm h-10"
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
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 px-3 border border-gray-300 border-r-0 outline-none w-64 focus:border-sky-900 transition-colors text-sm h-10"
            />
            <button className="p-2 px-4 border-none bg-sky-900 cursor-pointer text-white hover:bg-sky-950 transition-colors h-10 flex items-center justify-center">
              <FaSearch size={14} />
            </button>
          </div>
        </div>
      </div>

      {loading && !users.length ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-sky-900 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-medium animate-pulse">Fetching users...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="bg-white rounded-none shadow-sm overflow-hidden border border-gray-200 mb-6 font-sans">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="bg-[#04364A] text-white">
                  <th className="w-1/4 p-4 text-center font-bold text-sm">Name</th>
                  <th className="w-1/3 p-4 text-center font-bold text-sm">Contact Number</th>
                  <th className="w-1/5 p-4 text-center font-bold text-sm">Status</th>
                  <th className="w-1/5 p-4 text-center font-bold text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((user, idx) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="p-4 text-center text-sm font-medium text-gray-700">
                        <div className="truncate px-2" title={user.name}>{user.name}</div>
                      </td>
                      <td className="p-4 text-center text-sm text-gray-500 whitespace-nowrap overflow-hidden">
                        {user.phone || user.contact || "—"}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center">
                          <label className="relative inline-block w-10 h-5">
                            <input
                              type="checkbox"
                              checked={user.status?.toLowerCase() === "active"}
                              onChange={() => handleStatusChange(user)}
                              className="opacity-0 w-0 h-0 peer"
                            />
                            <span className="absolute cursor-pointer bg-gray-200 rounded-full inset-0 transition-all duration-300 before:absolute before:content-[''] before:h-4 before:w-4 before:left-0.5 before:bottom-0.5 before:bg-white before:transition-all before:duration-300 before:rounded-full peer-checked:bg-green-600 peer-checked:before:translate-x-5 shadow-sm"></span>
                          </label>
                        </div>
                      </td>
                      <td className="p-4 text-center relative action-menu-container">
                        <button
                          className="p-2 text-gray-500 bg-transparent border-none rounded-full cursor-pointer transition-all hover:bg-gray-100 hover:text-sky-900 group"
                          onClick={() => setOpenActionId(openActionId === user.id ? null : user.id)}
                        >
                          <FaCog size={18} className="group-hover:rotate-45 transition-transform duration-300" />
                        </button>
                        {openActionId === user.id && (
                          <div className={`absolute right-1/2 translate-x-1/2 ${idx === currentItems.length - 1 && currentItems.length > 1 ? 'bottom-full mb-1' : 'top-full z-10'} w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-150`}>
                            <button
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                              onClick={() => {
                                handleEdit(user);
                                setOpenActionId(null);
                              }}
                            >
                              <FaEdit size={12} className="text-sky-700" /> Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                              onClick={() => {
                                handleDelete(user);
                                setOpenActionId(null);
                              }}
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
                      {search ? "No matches for your search query." : "User directory is empty."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-1 mb-10">
            <span className="text-sm text-gray-500 font-medium">
              Showing {sortedUsers.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, sortedUsers.length)} of {sortedUsers.length} entries
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

      {showConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center shadow-2xl max-w-sm w-full mx-4 border border-gray-50 animate-in zoom-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">
              <FaTrash />
            </div>
            <h3 className="text-gray-900 font-black text-xl mb-3">Security Alert</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">You are about to permanently delete <span className="font-bold text-gray-800">@{userToDelete?.username || userToDelete?.name}</span>. Are you absolutely certain?</p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-100 cursor-pointer active:scale-95"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
