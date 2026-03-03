import React, { useState } from "react";
import toast from "react-hot-toast";

const AddNewService = ({ setActive }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        serviceName: "",
        category: "",
        subCategory: "",
        pricingType: "",
        price: "",
        commissionType: "",
        commissionValue: "",
        discount: "",
        status: "Active",
        description: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Mocking API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Service added successfully!");
            setActive("Services List");
        }, 1000);
    };

    return (
        <div className="font-sans text-[#04364a] animate-in fade-in duration-500 pt-2">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-white px-6 py-3 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold m-0 text-[#04364A]">Add New Service</h2>
                </div>
                <button
                    onClick={() => setActive("Services List")}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md flex items-center gap-2 hover:bg-gray-200 transition-colors text-sm font-bold border-none cursor-pointer"
                >
                    &lt; BACK
                </button>
            </div>

            <form className="bg-white p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 mb-8">
                    {/* Row 1 */}
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Service Name <span className="text-red-500">*</span></label>
                        <input
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white"
                            type="text" name="serviceName" placeholder="Service Name" value={formData.serviceName} onChange={handleChange} required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Select Category <span className="text-red-500">*</span></label>
                        <select
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                            name="category" value={formData.category} onChange={handleChange} required
                        >
                            <option value="">Select Category</option>
                            <option value="Programming">Programming</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Select Sub-Category <span className="text-red-500">*</span></label>
                        <select
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                            name="subCategory" value={formData.subCategory} onChange={handleChange} required
                        >
                            <option value="">Select Sub-Category</option>
                            <option value="Web Development">Web Development</option>
                        </select>
                    </div>

                    {/* Row 2 */}
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Pricing Type <span className="text-red-500">*</span></label>
                        <select
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                            name="pricingType" value={formData.pricingType} onChange={handleChange} required
                        >
                            <option value="">Pricing Type</option>
                            <option value="Fixed">Fixed</option>
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Price <span className="text-red-500">*</span></label>
                        <input
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white"
                            type="text" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Commission type <span className="text-red-500">*</span></label>
                        <select
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                            name="commissionType" value={formData.commissionType} onChange={handleChange} required
                        >
                            <option value="">Commission type</option>
                            <option value="Percentage">Percentage</option>
                        </select>
                    </div>

                    {/* Row 3 */}
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Commission value <span className="text-red-500">*</span></label>
                        <input
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white"
                            type="text" name="commissionValue" placeholder="Commission value" value={formData.commissionValue} onChange={handleChange} required
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Discount (%)</label>
                        <input
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white"
                            type="text" name="discount" placeholder="Discount (%)" value={formData.discount} onChange={handleChange}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Statue <span className="text-red-500">*</span></label>
                        <select
                            className="p-3 border border-gray-200 rounded-md text-sm outline-none focus:border-[#04364A] bg-white appearance-none"
                            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', paddingRight: '2.5rem' }}
                            name="status" value={formData.status} onChange={handleChange} required
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Description */}
                <div className="flex flex-col mb-8">
                    <label className="mb-2 font-bold text-xs text-gray-700 uppercase">Description</label>
                    <textarea
                        className="p-4 border border-gray-200 rounded-md text-sm min-h-[160px] resize-none outline-none focus:border-[#04364A] bg-white"
                        name="description" placeholder="Description" value={formData.description} onChange={handleChange}
                    />
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-sky-900 text-white px-12 py-2.5 rounded text-sm font-bold cursor-pointer hover:bg-sky-950 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddNewService;
