import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NewUser = ({ setActive, editUserData, clearEditUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    userType: "User",
    status: true,
    address: "",
    description: "",
  });

  useEffect(() => {
    if (editUserData) {
      setFormData({
        id: editUserData.id || editUserData._id || editUserData.ID,
        name: editUserData.name || "",
        email: editUserData.email || "",
        contact: editUserData.phone || editUserData.contact || "",
        userType: editUserData.role === "admin" ? "Admin" : "User",
        status: editUserData.status?.toLowerCase() === "active",
        address: editUserData.address || "",
        description: editUserData.description || "",
        password: "",
        confirmPassword: "",
      });
    } else {
      setFormData({
        id: null,
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        contact: "",
        userType: "User",
        status: true,
        address: "",
        description: "",
      });
    }
  }, [editUserData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "contact") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.id && formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.contact.length < 11) {
      toast.error("Phone number must be at least 11 characters long.");
      setLoading(false);
      return;
    }

    const apiData = {
      name: formData.name,
      username: formData.email,
      email: formData.email,
      phone: formData.contact,
      role: formData.userType === "Admin" ? "admin" : "customer",
      status: formData.status ? "active" : "inactive",
      is_active: formData.status ? 1 : 0,
      isActive: formData.status ? 1 : 0,
      active: formData.status ? 1 : 0,
      address: formData.address,
      city: formData.address,
      image: "",
      description: formData.description,
    };

    if (formData.id) {
      apiData.id = formData.id;
      apiData.user_id = formData.id;
    }

    if (formData.password) {
      apiData.password = formData.password;
      if (!formData.id) {
        apiData.password_confirmation = formData.confirmPassword;
      }
    }

    try {
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/users/${formData.id}` : "/api/register";
      const method = isEdit ? "PUT" : "POST";
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      console.log(`Submitting (${isEdit ? "Update" : "Create"}):`, url);

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-User-Id": userId || "",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify(apiData),
      });

      console.log("Submit response status:", response.status);

      if (response.ok) {
        const responseData = await response.json().catch(() => ({}));

        // --- تعديل حاسم هنا ---
        // إذا كان المستخدم جديداً (Register) وكان المطلوب أن يكون Inactive
        // نقوم بإرسال طلب تحديث حالة فوراً بعد الإنشاء لأن السيرفر قد يضع الحالة Active افتراضياً
        if (!isEdit && !formData.status) {
          try {
            const newUserId = responseData.user?.id || responseData.id || responseData.data?.id;
            if (newUserId) {
              await fetch(`/api/users/${newUserId}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Accept": "application/json",
                  "Authorization": `Bearer ${token}`,
                  "X-User-Id": userId || "",
                  "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                  ...apiData,
                  id: newUserId,
                  status: "inactive",
                  is_active: 0,
                  isActive: 0,
                  active: 0,
                  _method: "PUT"
                }),
              });
            }
          } catch (updateErr) {
            console.error("Auto-deactivation failed:", updateErr);
          }
        }

        toast.success(isEdit ? "User updated successfully!" : "User registered successfully!");
        setTimeout(() => {
          if (formData.id) clearEditUser();
          setActive("User List");
        }, 1500);
        return;
      } else if (response.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/"), 2000);
        return;
      } else {
        const data = await response.json().catch(() => ({}));
        let errorMessage = data.message || data.error || `Server error (${response.status})`;

        if (data.errors) {
          const messages = [];
          const errorSource = Array.isArray(data.errors) ? data.errors : Object.values(data.errors);
          errorSource.forEach(err => {
            if (typeof err === "string") messages.push(err);
            else if (err && typeof err === "object") {
              messages.push(err.msg || err.message || err.error || JSON.stringify(err));
            }
          });
          if (messages.length > 0) errorMessage = messages.join(", ");
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-[#04364a] animate-in fade-in duration-500 pt-2">
      <h2 className="text-[28px] font-bold mb-5">{formData.id ? "Edit User" : "Add New User"}</h2>

      <form className="bg-white p-8 rounded-xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100/50" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-6">
          {/* Row 1 */}
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-sm">Name <span className="text-red-500">*</span></label>
            <input
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30"
              type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-sm">Email <span className="text-red-500">*</span></label>
            <input
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30"
              type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-sm">User Type <span className="text-red-500">*</span></label>
            <select
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-white"
              name="userType" value={formData.userType} onChange={handleChange}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-sm">Password <span className="text-red-500">*</span></label>
              <span className="text-[10px] text-gray-400 font-medium italic">Min. 8 characters</span>
            </div>
            <input
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/40"
              type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required={!formData.id}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-sm">Confirm Password <span className="text-red-500">*</span></label>
            <input
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30"
              type="password" name="confirmPassword" placeholder="Repeat Password" value={formData.confirmPassword} onChange={handleChange} required={!formData.id || formData.password}
              autoComplete="new-password"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-sm">Contact Number <span className="text-red-500">*</span></label>
            <input
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30"
              type="text" name="contact" placeholder="e.g. 0123456789" value={formData.contact} onChange={handleChange} required
            />
          </div>

          {/* Row 3 */}
          <div className="flex flex-col">
            <label className="mb-2 font-bold text-sm">Status <span className="text-red-500">*</span></label>
            <div className="flex items-center h-[46px]">
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700 absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap">
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>
          <div className="flex flex-col md:col-span-2">
            <label className="mb-2 font-bold text-sm">Address</label>
            <input
              className="p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30"
              type="text" name="address" placeholder="Residential or Office Address" value={formData.address} onChange={handleChange}
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col mb-8">
          <label className="mb-2 font-bold text-sm">Description</label>
          <textarea
            className="p-3 border border-gray-200 rounded-lg text-sm min-h-[140px] resize-none outline-none focus:border-sky-900/30 bg-[#f8faff]/10"
            name="description" placeholder="Brief description about the user account..." value={formData.description} onChange={handleChange}
          />
        </div>


        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-sky-900 text-white px-10 py-2.5 rounded-lg text-sm font-bold cursor-pointer hover:bg-sky-900/70 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : null}
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewUser;