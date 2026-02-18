import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSubcategories } from "./SubcategoryContext";
import { useCategories } from "./CategoryContext";
import toast from 'react-hot-toast';

export default function AddNewSubcategory({ setActive, editId }) {
    const navigate = useNavigate();
    const { id: paramId } = useParams();
    const id = editId || paramId;
    const { subcategories, addSubcategory, updateSubcategory } = useSubcategories();
    const { categories } = useCategories();

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        status: "active",
        description: "",
        image: null
    });
    const [imageName, setImageName] = useState("No file chosen");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(id);

    useEffect(() => {
        if (isEditMode && subcategories.length > 0) {
            const subToEdit = subcategories.find(s => s.id === parseInt(id));
            if (subToEdit) {
                setFormData({
                    name: subToEdit.name || "",
                    categoryId: subToEdit.categoryId || "",
                    status: subToEdit.status || "active",
                    description: subToEdit.description || "",
                    image: null
                });
                if (subToEdit.image) {
                    setImageName(typeof subToEdit.image === 'string' ? subToEdit.image : "No file chosen");
                }
            }
        }
    }, [id, isEditMode, subcategories]);

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
        if (!formData.name.trim()) newErrors.name = "Subcategory name required";
        if (!formData.categoryId) newErrors.categoryId = "Category selection required";
        if (!isEditMode && !formData.image) newErrors.image = "Image required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await updateSubcategory({ ...formData, id: parseInt(id) });
                toast.success('Subcategory updated successfully!');
            } else {
                await addSubcategory(formData);
                toast.success('Subcategory added successfully!');
            }
            setActive ? setActive("Sub Category List") : navigate(-1);
        } catch (err) {
            setErrors({ submit: err.message });
            toast.error(err.message || 'Operation failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-sans text-[#04364a] animate-in fade-in duration-500 pt-2">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-[28px] font-bold">{isEditMode ? "Edit Subcategory" : "Add New Subcategory"}</h2>
                <button
                    onClick={() => setActive ? setActive("Sub Category List") : navigate(-1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm font-bold border-none cursor-pointer font-sans"
                >
                    <i className="fa-solid fa-arrow-left"></i> Back
                </button>
            </div>

            <form className="bg-white p-8 rounded-xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.1)] border border-gray-100/50" onSubmit={handleSave}>
                <div className="space-y-6">
                    {/* Name Field */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Subcategory Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/30 font-sans"
                            placeholder="Enter subcategory name"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name}</p>}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Parent Category <span className="text-red-500">*</span></label>
                        <select
                            value={formData.categoryId}
                            onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-white font-sans"
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.category_name || cat.name}</option>
                            ))}
                        </select>
                        {errors.categoryId && <p className="text-red-500 text-xs mt-1 font-medium">{errors.categoryId}</p>}
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
                        {errors.image && <p className="text-red-500 text-xs mt-1 font-medium">{errors.image}</p>}
                    </div>

                    {/* Status Field */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Status <span className="text-red-500">*</span></label>
                        <select
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-white font-sans"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className="block mb-2 font-bold text-sm">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            rows="4"
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-sky-900/30 bg-[#f8faff]/10 resize-none font-sans"
                            placeholder="Brief description about this subcategory..."
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-8 mt-4 border-t border-gray-50">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-sky-900 text-white px-10 py-3 rounded-lg text-sm font-bold cursor-pointer hover:bg-sky-900/90 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-sky-900/10 font-sans"
                    >
                        {loading ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : <i className="fa-solid fa-floppy-disk"></i>}
                        {loading ? "Saving..." : (isEditMode ? "Update Subcategory" : "Save Subcategory")}
                    </button>
                </div>
            </form>
        </div>
    );
}
