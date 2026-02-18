import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const API_URL = "/api/category";

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const normalizeStatus = (status) => {
        return (
            status === "active" ||
            status === 1 ||
            status === "1" ||
            status === true
        );
    };

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
            const res = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const result = await res.json();
            const data = Array.isArray(result)
                ? result
                : result.data || result.categories || [];

            setCategories(
                data.map((cat) => ({
                    ...cat,
                    id: cat.id || cat.ID || cat.category_id || cat.id_category,
                    active: normalizeStatus(cat.status),
                }))
            );
        } catch (error) {
            console.error("Fetch Categories Error:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const addCategory = async (category) => {
        try {
            const formData = new FormData();
            formData.append("name", category.name);
            formData.append("description", category.description);
            formData.append("status", category.active ? "active" : "inactive");

            if (category.image) {
                formData.append("image", category.image);
            }

            const userId = localStorage.getItem("userId");
            if (userId) formData.append("user_id", userId);

            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

            const res = await fetch(API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: formData,
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            await fetchCategories();
            return true;
        } catch (error) {
            console.error("Add Category Error:", error);
            alert("Add Failed");
            return false;
        }
    };

    const updateCategory = async (updated) => {
        try {
            const formData = new FormData();
            formData.append("name", updated.name);
            formData.append("description", updated.description);
            formData.append("status", updated.active ? "active" : "inactive");

            if (updated.image && updated.image instanceof File) {
                formData.append("image", updated.image);
            }

            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

            // Optimistic update
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === updated.id ? { ...cat, ...updated } : cat
                )
            );

            // Try PUT directly. If the server is Laravel/PHP and fails with FormData + PUT, 
            // the user might need to check if the route accepts POST with _method=PUT.
            // But since the previous POST + _method gave a 404, we are trying PUT directly.
            const res = await fetch(`${API_URL}/${updated.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Accept": "application/json",
                    "ngrok-skip-browser-warning": "true",
                },
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
            }

            await fetchCategories();
            return true;
        } catch (error) {
            console.error("Update Category Error:", error);
            toast.error(error.message || "Update Failed");
            await fetchCategories();
            return false;
        }
    };

    const deleteCategory = async (id) => {
        try {
            const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "ngrok-skip-browser-warning": "true",
                },
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            setCategories((prev) =>
                prev.filter((cat) => cat.id !== id)
            );
        } catch (error) {
            console.error("Delete Category Error:", error);
            alert("Delete Failed");
        }
    };

    return (
        <CategoryContext.Provider
            value={{
                categories,
                fetchCategories,
                addCategory,
                updateCategory,
                deleteCategory,
                loading,
            }}
        >
            {children}
        </CategoryContext.Provider>
    );
};

export const useCategories = () => useContext(CategoryContext);
