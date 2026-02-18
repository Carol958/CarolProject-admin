import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCategories } from "./CategoryContext";
import { toast } from "react-hot-toast";

export default function EditCategory({ setActive, category: propCategory }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { updateCategory } = useCategories();

    const category = propCategory || location.state?.category;

    const [formData, setFormData] = useState({
        name: category?.name || "",
        description: category?.description || "",
        active: category?.active ? "active" : "inactive",
        image: category?.image || null,
    });
    const [imageName, setImageName] = useState(category?.image && typeof category.image === 'string' ? category.image : "No file chosen");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!category) {
            if (setActive) {
                setActive("Category");
            } else {
                navigate("/customer/providermanagement");
            }
        }
    }, [category, navigate, setActive]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImageName(file.name);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Category name required";
        if (!formData.description.trim()) newErrors.description = "Description required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const success = await updateCategory({
                ...category,
                name: formData.name,
                description: formData.description,
                active: formData.active === "active",
                image: formData.image,
            });

            if (success) {
                toast.success(`Category "${formData.name}" updated successfully`);
                if (setActive) {
                    setActive("Category");
                } else {
                    navigate(-1);
                }
            } else {
                toast.error("Failed to update category.");
            }
        } catch (err) {
            toast.error("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!category) return null;

    return (
        <div className="font-sans text-[#04364a] animate-in fade-in duration-500 pt-2">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[28px] font-bold">Edit Category</h2>
                <button
                    onClick={() => setActive ? setActive("Category") : navigate(-1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm font-bold border-none cursor-pointer font-sans"
                >
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
            </div>

            <form className="bg-white p-8 rounded-xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100/50" onSubmit={handleSave}>
                <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Category Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30 font-sans"
                            placeholder="Enter category name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                    </div>

                    {/* New Image Upload Style */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Image <span className="text-red-500">*</span></label>
                        <div className="flex items-center w-full border border-gray-200 rounded-lg overflow-hidden bg-[#f8faff]/30">
                            <div className="flex-1 px-3 text-sm text-gray-500 font-sans truncate">
                                {imageName}
                            </div>
                            <label className="bg-sky-900 text-white px-6 py-3 text-sm font-bold cursor-pointer hover:bg-sky-950 transition-colors font-sans whitespace-nowrap">
                                Upload
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    {/* Status Field */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Status <span className="text-red-500">*</span></label>
                        <select
                            value={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.value })}
                            className="w-full p-3 border border-gray-200 bg-white rounded-lg text-sm outline-none focus:border-sky-900/30 font-sans"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Description <span className="text-red-500">*</span></label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/10 resize-none font-sans"
                            placeholder="Edit category description..."
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                    </div>
                </div>

                <div className="flex justify-end pt-8 mt-4 border-t border-gray-50">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-sky-900 text-white px-10 py-3 rounded-lg text-sm font-bold cursor-pointer hover:bg-sky-900/90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-sky-900/10 font-sans"
                    >
                        {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <i className="fa-solid fa-floppy-disk"></i>}
                        {loading ? "Updating..." : "Update Category"}
                    </button>
                </div>
            </form>
        </div>
    );
}
