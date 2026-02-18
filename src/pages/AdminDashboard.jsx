import { useState } from "react";
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

const AdminDashboard = () => {
  const [active, setActiveState] = useState("Dashboard");
  const [editUserData, setEditUserData] = useState(null);
  const [editSubcategoryId, setEditSubcategoryId] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState(null);

  const setActive = (state, data = null) => {
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
          {active === "Category" && <CategoryList setActive={setActive} />}
          {active === "Add New Category" && <AddNewCategory setActive={setActive} />}
          {active === "Edit Category" && <EditCategory setActive={setActive} category={editCategoryData} />}

          <SubcategoryProvider>
            {active === "Sub Category List" && <SubcategoryList setActive={setActive} />}
            {(active === "Add New Subcategory" || active === "Edit Subcategory") && (
              <AddNewSubcategory setActive={setActive} editId={editSubcategoryId} />
            )}
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
