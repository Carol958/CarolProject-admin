import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaList,
  FaMoneyBillWave,
  FaUsersCog,
} from "react-icons/fa";
import { MdAdminPanelSettings, MdManageAccounts, MdOutlineEventAvailable } from "react-icons/md";
import { IoChevronDown, IoChevronUp, IoHome } from "react-icons/io5";
import { FiLogOut, FiMenu } from "react-icons/fi";
import toast from "react-hot-toast";

const Sidebar = ({ active, setActive }) => {
  const [openSystemUsers, setOpenSystemUsers] = useState(false);
  const [openCategoryManagement, setOpenCategoryManagement] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("adminToken");
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      {/* Toggle Button for Mobile */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 bg-[#04364A] p-2 rounded-md text-white"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FiMenu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-60 bg-[#04364A] text-white flex flex-col transform
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0 sm:static sm:h-auto font-sans shrink-0
        `}
      >
        {/* User Info */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#DAFFFB] flex items-center justify-center">
            <span className="font-bold text-[#64CCC5] text-xl">
              {userInitial}
            </span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-white truncate max-w-[160px]">{userEmail}</span>
            <span className="text-[10px] bg-[#032d3d] text-[#64CCC5] px-2 py-0.5 rounded w-fit mt-1">Admin</span>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 text-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {/* Main */}
          <div
            onClick={() => setActive("Dashboard")}
            className={`flex items-center px-4 py-2 rounded-md hover:bg-[#64CCC5] hover:text-white transition-colors cursor-pointer ${active === "Dashboard" ? "bg-[#64CCC5] text-white" : ""}`}
          >
            <IoHome className="text-lg" />
            <span className="flex-1 ms-3 whitespace-nowrap text-sm font-medium">Main</span>
          </div>

          {/* Category Management (Dropdown) */}
          <div>
            <button
              onClick={() => setOpenCategoryManagement(!openCategoryManagement)}
              className={`flex items-center w-full px-4 py-2 rounded-md hover:bg-[#64CCC5] hover:text-white transition-colors cursor-pointer ${active === "Category" || active === "Sub Category" ? "bg-[#64CCC5]/50" : ""}`}
            >
              <FaUsersCog className="text-lg" />
              <span className="flex-1 ms-3 text-sm font-medium text-left">Category Management</span>
              {openCategoryManagement ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
            </button>

            {openCategoryManagement && (
              <ul className="mt-1 ms-6 space-y-1 text-sm">
                <li>
                  <div
                    onClick={() => setActive("Category")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "Category" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • Category
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => setActive("Sub Category List")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "Sub Category List" || active === "Add New Subcategory" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • Sub Category
                  </div>
                </li>
              </ul>
            )}
          </div>

          {[
            { name: "Service Management", icon: <MdOutlineEventAvailable className="text-lg" /> },
            { name: "Booking Management", icon: <FaList className="text-lg" /> },
            { name: "Providers Management", icon: <FaUsersCog className="text-lg" /> },
            { name: "Payout", icon: <FaMoneyBillWave className="text-lg" /> },
            { name: "Customer Management", icon: <MdManageAccounts className="text-lg" /> },
          ].map((link, idx) => (
            <div
              key={idx}
              className="flex items-center px-4 py-2 rounded-md hover:bg-[#64CCC5] hover:text-white transition-colors cursor-pointer"
            >
              {link.icon}
              <span className="flex-1 ms-3 text-sm font-medium">{link.name}</span>
            </div>
          ))}

          {/* System Users Management (Dropdown) */}
          <div>
            <button
              onClick={() => setOpenSystemUsers(!openSystemUsers)}
              className={`flex items-center w-full px-4 py-2 rounded-md hover:bg-[#64CCC5] hover:text-white transition-colors cursor-pointer ${active === "User List" || active === "New User" ? "bg-[#64CCC5]/50" : ""}`}
            >
              <MdAdminPanelSettings className="text-lg" />
              <span className="flex-1 ms-3 text-sm font-medium text-left">System Users</span>
              {openSystemUsers ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
            </button>

            {openSystemUsers && (
              <ul className="mt-1 ms-6 space-y-1 text-sm">
                <li>
                  <div
                    onClick={() => setActive("User List")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "User List" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • User List
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => setActive("New User")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "New User" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • New User
                  </div>
                </li>
              </ul>
            )}
          </div>

        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full py-2 text-center rounded-md hover:bg-red-500/20 text-white hover:text-red-500 transition-colors flex items-center justify-center gap-2"
          >
            Logout
            <FiLogOut />
          </button>
        </div>

      </aside>
    </>
  );
};

export default Sidebar;
