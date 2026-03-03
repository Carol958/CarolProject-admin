import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Sidebar from "../components/AdminSidebar";
import UserList from "./UserList";
import NewUser from "./NewUser";
import CategoryList from "./CategoryList";
import AddNewCategory from "./AddNewCategory";
import EditCategory from "./EditCategory";
import { CategoryProvider } from "./CategoryContext";
import SubcategoryList from "./SubcategoryList";
import AddNewSubcategory from "./AddNewSubcategory";
import { SubcategoryProvider } from "./SubcategoryContext";
import ProviderServices from "./provider/ProviderServices";
import ProviderDetails from "./provider/ProviderDetails";
import ServiceList from "./provider/ServiceList";
import AddNewService from "./provider/AddNewService";
import PendingProviders from "./PendingProviders";
import ErrorBoundary from "../components/ErrorBoundary";
import { getPendingServices } from "../services/adminService";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [active, setActiveState] = useState("Dashboard");
  const [previousActive, setPreviousActive] = useState("Dashboard");

  useEffect(() => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to access the dashboard");
      navigate("/");
    }
  }, [navigate]);
  const [editUserData, setEditUserData] = useState(null);
  const [editSubcategoryId, setEditSubcategoryId] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState(null);

  // Provider & Services State
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [selectedProviderDetail, setSelectedProviderDetail] = useState(null);

  const fetchServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);
      const res = await getPendingServices();
      // axios returns response in res.data
      const data = res.data?.services || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setServices(data);
    } catch (err) {
      console.error("Error fetching services:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load services. Please try again.";
      setServicesError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setServicesLoading(false);
    }
  };

  useEffect(() => {
    if (active === "Pending Services") {
      fetchServices();
    }
  }, [active]);

  const setActive = (state, data = null) => {
    if (active !== "Provider Details") {
      setPreviousActive(active);
    }
    setActiveState(state);
    if (state === "Edit Subcategory") {
      setEditSubcategoryId(data);
    } else if (state === "Add New Subcategory") {
      setEditSubcategoryId(null);
    } else if (state === "Edit Category") {
      setEditCategoryData(data);
    } else if (state === "Add New Category") {
      setEditCategoryData(null);
    }
  };

  const handleSetEditUser = (user) => {
    setEditUserData(user);
    setActive("New User");
  };

  const handleClearEditUser = () => {
    setEditUserData(null);
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar active={active} setActive={setActive} />

      <div className="flex-1 p-[30px] text-[#04364A] font-sans box-border">
        {active === "Dashboard" && <Dashboard />}
        {active === "User List" && (
          <UserList
            key={active}
            setActive={setActive}
            setEditUser={handleSetEditUser}
          />
        )}
        {active === "New User" && (
          <NewUser
            setActive={setActive}
            editUserData={editUserData}
            clearEditUser={handleClearEditUser}
          />
        )}
        <CategoryProvider>
          {active === "Pending Services" && (
            <ErrorBoundary>
              <ProviderServices
                setActive={setActive}
                setSelectedProviderDetail={setSelectedProviderDetail}
                services={services}
                setServices={setServices}
                loading={servicesLoading}
                error={servicesError}
                refreshServices={fetchServices}
              />
            </ErrorBoundary>
          )}
          {active === "Pending Providers" && (
            <ErrorBoundary>
              <PendingProviders
                setActive={setActive}
                setSelectedProviderDetail={setSelectedProviderDetail}
              />
            </ErrorBoundary>
          )}
          {active === "Provider Details" && (
            <ErrorBoundary>
              <ProviderDetails
                provider={selectedProviderDetail}
                onBack={() => setActive(previousActive)}
              />
            </ErrorBoundary>
          )}

          {active === "Category" && <CategoryList setActive={setActive} />}
          {active === "Add New Category" && <AddNewCategory setActive={setActive} />}
          {active === "Edit Category" && <EditCategory setActive={setActive} category={editCategoryData} />}

          <SubcategoryProvider>
            {active === "Sub Category List" && <SubcategoryList setActive={setActive} />}
            {(active === "Add New Subcategory" || active === "Edit Subcategory") && (
              <AddNewSubcategory setActive={setActive} editId={editSubcategoryId} />
            )}
            {active === "Services List" && <ServiceList setActive={setActive} />}
            {active === "Add New Service" && <AddNewService setActive={setActive} />}
          </SubcategoryProvider>
        </CategoryProvider>
      </div>
    </div>
  );
};



const Dashboard = () => (
  <>
    <h1>Dashboard</h1>
    <p>Overview of the platform.</p>
    <div className="flex gap-5 mt-5">
      <div className="bg-[#176B87] text-[#DAFFFB] p-5 rounded-[10px] w-[200px] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-[#64CCC5] hover:text-[#04364A]">
        Card 1
      </div>
      <div className="bg-[#176B87] text-[#DAFFFB] p-5 rounded-[10px] w-[200px] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-[#64CCC5] hover:text-[#04364A]">
        Card 2
      </div>
    </div>
  </>
);

export default AdminDashboard;
