import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import NewUser from "./pages/NewUser";
import UserList from "./pages/UserList";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          top: 20,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#ffffff",
            color: "#1f2937",
            borderRadius: "16px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            padding: "18px 28px",
            fontSize: "15px",
            fontWeight: "600",
            maxWidth: "500px",
            border: "1px solid rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(10px)",
          },
          success: {
            duration: 4000,
            style: {
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              color: "#166534",
              border: "1px solid #86efac",
            },
            iconTheme: {
              primary: "#22c55e",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
              color: "#991b1b",
              border: "1px solid #fca5a5",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#ffffff",
            },
          },
          loading: {
            style: {
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              color: "#1e40af",
              border: "1px solid #93c5fd",
            },
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="new-user" element={<NewUser />} />
        <Route path="user-list" element={<UserList />} />
      </Routes>
    </>
  );
}

export default App;
