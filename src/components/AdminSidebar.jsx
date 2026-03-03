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
import { TbCategory2 } from "react-icons/tb";
import { FaExclamation } from "react-icons/fa";
import toast from "react-hot-toast";

const Sidebar = ({ active, setActive }) => {
  const [openSystemUsers, setOpenSystemUsers] = useState(false);
  const [openCategoryManagement, setOpenCategoryManagement] = useState(false);
  const [openProvidersManagement, setOpenProvidersManagement] = useState(false);
  const [openServiceManagement, setOpenServiceManagement] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "admin@example.com";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
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
              <TbCategory2 className="text-lg" />
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

          {/* Providers Management (Dropdown) */}
          <div>
            <button
              onClick={() => setOpenProvidersManagement(!openProvidersManagement)}
              className={`flex items-center w-full px-4 py-2 rounded-md hover:bg-[#64CCC5] hover:text-white transition-colors cursor-pointer ${active === "Pending Services" || active === "Pending Providers" || active === "Provider Details" ? "bg-[#64CCC5]/50" : ""}`}
            >
              <FaUsersCog className="text-lg" />
              <span className="flex-1 ms-3 text-sm font-medium text-left">Providers Management</span>
              {openProvidersManagement ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
            </button>

            {openProvidersManagement && (
              <ul className="mt-1 ms-6 space-y-1 text-sm">
                <li>
                  <div
                    onClick={() => setActive("Pending Services")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "Pending Services" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • Pending Services
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => setActive("Pending Providers")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "Pending Providers" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • Pending Providers
                  </div>
                </li>
              </ul>
            )}
          </div>

          {/* Service Management (Dropdown) */}
          <div>
            <button
              onClick={() => setOpenServiceManagement(!openServiceManagement)}
              className={`flex items-center w-full px-4 py-2 rounded-md hover:bg-[#64CCC5] hover:text-white transition-colors cursor-pointer ${active === "Services List" || active === "Add New Service" ? "bg-[#64CCC5]/50" : ""}`}
            >
              <MdOutlineEventAvailable className="text-lg" />
              <span className="flex-1 ms-3 text-sm font-medium text-left">Service Management</span>
              {openServiceManagement ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
            </button>

            {openServiceManagement && (
              <ul className="mt-1 ms-6 space-y-1 text-sm">
                <li>
                  <div
                    onClick={() => setActive("Services List")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "Services List" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • Services List
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => setActive("Add New Service")}
                    className={`block px-2 py-1 rounded-md hover:bg-[#64CCC5]/80 cursor-pointer transition-colors ${active === "Add New Service" ? "font-bold text-[#64CCC5]" : ""}`}
                  >
                    • Add New Service
                  </div>
                </li>
              </ul>
            )}
          </div>

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

          {[
            { name: "Booking Management", icon: <FaList className="text-lg" /> },
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

        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full py-2 text-center rounded-md hover:bg-red-500/20 text-white hover:text-red-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            Logout
            <FiLogOut />
          </button>
        </div>

      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[32px] text-center shadow-2xl max-w-[400px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
            {/* Warning Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border-4 border-white shadow-sm">
                <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-red-500 text-2xl font-bold">!</span>
                </div>
              </div>
            </div>

            <h3 className="text-[#04364A] font-bold text-2xl mb-3">Sign Out?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed font-medium">
              Are you sure you want to log out of your account?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 rounded-2xl bg-[#F1F4F9] text-[#04364A] font-bold hover:bg-gray-200 transition-all cursor-pointer text-sm uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3.5 rounded-2xl bg-[#04364A] text-white font-bold hover:bg-[#032d3d] transition-all shadow-lg active:scale-95 cursor-pointer text-sm uppercase tracking-wider"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
