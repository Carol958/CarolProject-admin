import { createContext, useContext, useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = "/api";

const SubcategoryContext = createContext();

export const SubcategoryProvider = ({ children }) => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const getAuthHeader = async () => {
        const token = localStorage.getItem("adminToken");
        return {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json",
            "ngrok-skip-browser-warning": "true"
        };
    }

    const fetchSubcategories = useCallback(async () => {
        setLoading(true);
        try {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_BASE_URL}/subcategory`, {
                headers: authHeaders
            });

            const contentType = res.headers.get("content-type");
            if (!res.ok) {
                if (res.status === 401) {
                    toast.error("Session expired. Please log in again.");
                    return;
                }
                throw new Error(`Fetch failed: ${res.status}`);
            }

            const result = await res.json();
            const rawData = Array.isArray(result) ? result : result.subcategories || result.data || [];
            const data = rawData.map(sub => ({
                ...sub,
                id: sub.id || sub.ID || sub.subcategory_id || sub.id_subcategory
            }));
            setSubcategories(data);
        } catch (error) {
            console.error("Fetch Subcategories Error:", error);
            toast.error("Failed to load subcategories. Please check your connection.");
            setSubcategories([]);
        } finally {
            setLoading(false);
        }
    }, []);


    useEffect(() => { fetchSubcategories(); }, [fetchSubcategories]);

    const addSubcategory = async (subcategory) => {
        try {
            const authHeaders = await getAuthHeader();
            const { "Content-Type": _, ...headersWithoutContentType } = authHeaders;

            const formData = new FormData();
            formData.append("name", subcategory.name);
            formData.append("categoryId", subcategory.categoryId);
            if (subcategory.status) formData.append("status", subcategory.status);
            if (subcategory.description) formData.append("description", subcategory.description);
            if (subcategory.image) formData.append("image", subcategory.image);

            const res = await fetch(`${API_BASE_URL}/subcategory`, {
                method: "POST",
                headers: headersWithoutContentType,
                body: formData
            });


            if (res.status === 401) {
                localStorage.removeItem("adminToken");
                toast.error("Session expired. Please log in again.");
                setTimeout(() => window.location.href = "/", 2000);
                throw new Error("Session expired");
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Add failed (${res.status})`);
            }

            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Add failed: Response was not JSON");
            }

            const newSub = await res.json();
            setSubcategories(prev => [...prev, newSub]);
            return { success: true, data: newSub };
        } catch (error) {
            console.error("Add Subcategory Error:", error);
            throw error;
        }
    };

    const updateSubcategory = async (updated) => {
        try {
            const authHeaders = await getAuthHeader();
            const hasNewImage = updated.image && (updated.image instanceof File || updated.image instanceof Blob);

            let res;
            if (hasNewImage) {
                // Use FormData (POST + _method=PUT) for image uploads
                const { "Content-Type": _, ...headersWithoutContentType } = authHeaders;
                const formData = new FormData();
                formData.append("_method", "PUT");
                formData.append("name", updated.name);
                formData.append("categoryId", updated.categoryId);
                formData.append("category_id", updated.categoryId);
                formData.append("status", updated.status);
                formData.append("description", updated.description || "");
                formData.append("image", updated.image);

                res = await fetch(`${API_BASE_URL}/subcategory/${updated.id}`, {
                    method: "POST",
                    headers: headersWithoutContentType,
                    body: formData
                });
            } else {
                // Use JSON (PUT) for simple updates - more reliable for persistence
                const payload = {
                    name: updated.name,
                    categoryId: updated.categoryId,
                    category_id: updated.categoryId,
                    status: updated.status,
                    description: updated.description || ""
                };

                console.log("Updating subcategory with payload:", payload);

                res = await fetch(`${API_BASE_URL}/subcategory/${updated.id}`, {
                    method: "PUT",
                    headers: {
                        ...authHeaders,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (res.status === 401) {
                localStorage.removeItem("adminToken");
                toast.error("Session expired. Please log in again.");
                setTimeout(() => window.location.href = "/", 2000);
                throw new Error("Session expired");
            }

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Update failed response:", errorText);
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: errorText };
                }
                throw new Error(errorData.message || `Update failed (${res.status})`);
            }

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const updatedSub = await res.json();
                const fullUpdatedSub = { ...updated, ...(updatedSub.data || updatedSub) };
                setSubcategories(prev => prev.map(sub => sub.id === updated.id ? fullUpdatedSub : sub));
                return { success: true, data: fullUpdatedSub };
            } else {
                // If response is not JSON, update locally
                setSubcategories(prev => prev.map(sub => sub.id === updated.id ? { ...sub, ...updated } : sub));
                return { success: true };
            }
        } catch (error) {
            console.error("Update Subcategory Error:", error);
            throw error;
        }
    };


    const deleteSubcategory = async (id) => {
        try {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_BASE_URL}/subcategory/${id}`, {
                method: "DELETE",
                headers: authHeaders
            });

            if (res.status === 401) {
                localStorage.removeItem("adminToken");
                toast.error("Session expired. Please log in again.");
                setTimeout(() => window.location.href = "/", 2000);
                return;
            }

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Delete failed");
            }

            setSubcategories(prev => prev.filter(sub => sub.id !== id));
            toast.success("Subcategory deleted successfully");
        } catch (error) {
            console.error("Delete Subcategory Error:", error);
            toast.error(error.message || "Failed to delete subcategory.");
        }
    };

    return (
        <SubcategoryContext.Provider value={{ subcategories, fetchSubcategories, addSubcategory, updateSubcategory, deleteSubcategory, loading }}>
            {children}
        </SubcategoryContext.Provider>
    );
};

export const useSubcategories = () => useContext(SubcategoryContext);
