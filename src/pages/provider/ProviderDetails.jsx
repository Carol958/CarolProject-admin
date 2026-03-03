import { useState } from "react";
import {
    FaUserCircle,
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaChevronDown,
    FaCheck,
    FaTimes,
    FaInbox,
    FaArrowLeft
} from "react-icons/fa";
import { getImageUrl, handleImageError, cleanImageName } from "../../utils/imageHelper";
import { approveService, rejectService, getProviderDetails, getProviderServices, approveProvider, rejectProvider } from "../../services/adminService.js";
import toast from "react-hot-toast";
import { useEffect } from "react";

export default function ProviderDetails({ provider = {}, onBack }) {

    const [openFilterDropdown, setOpenFilterDropdown] = useState(false);
    const [openActionDropdown, setOpenActionDropdown] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [actionType, setActionType] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [statusFilter, setStatusFilter] = useState("All");

    const [selectedService, setSelectedService] = useState(null);

    const [showServicePopup, setShowServicePopup] = useState(false);
    const [servicePopupType, setServicePopupType] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [showProviderPopup, setShowProviderPopup] = useState(false);
    const [providerPopupType, setProviderPopupType] = useState("");
    const [providerData, setProviderData] = useState(provider || {});
    const [services, setServices] = useState([]);


    useEffect(() => {
        const fetchDetails = async () => {
            const providerId = provider?.userid || provider?.User?.id;

            if (!providerId) return;

            try {
                setLoading(true);
                const [detailsRes, servicesRes] = await Promise.all([
                    getProviderDetails(providerId),
                    getProviderServices(providerId)
                ]);

                const pInfo = detailsRes.data.provider || detailsRes.data.data || detailsRes.data;
                const pServices = servicesRes.data.services || servicesRes.data.data || (Array.isArray(servicesRes.data) ? servicesRes.data : []);

                setProviderData(pInfo);
                setServices(pServices);
            } catch (err) {
                console.error("Error fetching provider details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [provider]);

    const refreshDetails = async () => {
        const providerId = provider?.userid || provider?.User?.id;
        if (!providerId) return;
        try {
            const [detailsRes, servicesRes] = await Promise.all([
                getProviderDetails(providerId),
                getProviderServices(providerId)
            ]);
            const pInfo = detailsRes.data.provider || detailsRes.data.data || detailsRes.data;
            const pServices = servicesRes.data.services || servicesRes.data.data || (Array.isArray(servicesRes.data) ? servicesRes.data : []);
            setProviderData(pInfo);
            setServices(pServices);
        } catch (err) { console.error(err); }
    };


    const handleServiceAccept = (service) => {
        setSelectedService(service);
        setServicePopupType("approve");
        setShowServicePopup(true);
    };

    const handleServiceReject = (service) => {
        setSelectedService(service);
        setServicePopupType("reject");
        setShowServicePopup(true);
    };

    const handleProviderAccept = () => {
        setProviderPopupType("approve");
        setShowProviderPopup(true);
    };

    const handleProviderReject = () => {
        setProviderPopupType("reject");
        setShowProviderPopup(true);
    };

    const confirmProviderAction = async () => {
        try {
            setActionLoading(true);
            const pId = providerData.id || provider?.id;
            if (providerPopupType === "approve") {
                await approveProvider(pId);
                toast.success("Provider approved successfully");
            } else {
                await rejectProvider(pId, rejectionReason);
                toast.success("Provider rejected successfully");
            }
            setShowProviderPopup(false);
            setRejectionReason("");
            if (onBack) onBack();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to update provider status");
        } finally {
            setActionLoading(false);
        }
    };

    const confirmServiceAction = async () => {
        if (!selectedService) return;

        try {
            setActionLoading(true);
            if (servicePopupType === "approve") {
                await approveService(selectedService.id);
                toast.success("Service approved successfully!");
            } else {
                await rejectService(selectedService.id, rejectionReason);
                toast.success("Service rejected successfully!");
            }

            setServices(prev =>
                prev.map(service =>
                    service.id === selectedService.id
                        ? { ...service, status: servicePopupType === "approve" ? "Accepted" : "Rejected" }
                        : service
                )
            );
            setShowServicePopup(false);
            setRejectionReason("");
            setSelectedService(null);
            setTimeout(() => refreshDetails(), 300);
        } catch (err) {
            toast.error(err.response?.data?.message || err.message || "Failed to update service status");
        } finally {
            setActionLoading(false);
        }
    };

    const closeServicePopup = () => {
        setShowServicePopup(false);
        setRejectionReason("");
        setSelectedService(null);
    };



    const safeParseImages = (imagesData) => {
        if (!imagesData) return [];
        if (Array.isArray(imagesData)) return imagesData;
        if (typeof imagesData !== 'string') return [imagesData];

        let currentData = imagesData.trim();

        try {
            if (currentData.startsWith('""') && currentData.endsWith('""')) {
                currentData = currentData.slice(1, -1);
            }

            let parsed = JSON.parse(currentData);

            if (typeof parsed === 'string') {
                try {
                    const secondParse = JSON.parse(parsed);
                    if (Array.isArray(secondParse)) parsed = secondParse;
                } catch (e) { }
            }

            if (Array.isArray(parsed)) {
                return parsed.map(img => cleanImageName(img)).filter(img => img);
            }

            const cleaned = cleanImageName(String(parsed));
            return cleaned ? [cleaned] : [];

        } catch (e) {
            let raw = currentData;
            raw = raw.replace(/^\[|\]$/g, '');
            const parts = raw.split(',');
            return parts
                .map(p => cleanImageName(p))
                .filter(p => p && p !== "null" && p !== "undefined");
        }
    };



    const confirmBulkAction = async () => {
        const pendingServices = services.filter(s => (s.status || "").toLowerCase() === "pending");
        if (pendingServices.length === 0) {
            toast.error("No pending services to process");
            setModalOpen(false);
            return;
        }

        try {
            setActionLoading(true);
            const isApprove = actionType === "acceptAll";

            const promises = pendingServices.map(s =>
                isApprove
                    ? approveService(s.id)
                    : rejectService(s.id, rejectionReason)
            );

            await Promise.all(promises);

            toast.success(`All pending services ${isApprove ? "approved" : "rejected"} successfully!`);

            setServices(prev =>
                prev.map(service =>
                    (service.status || "").toLowerCase() === "pending"
                        ? {
                            ...service,
                            status: isApprove ? "Accepted" : "Rejected"
                        }
                        : service
                )
            );
            setModalOpen(false);
            setRejectionReason("");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Bulk action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredServices = (services || []).filter(svc => {
        if (statusFilter === "All") return true;
        const sStatus = (svc.status || "").toLowerCase();
        const fStatus = statusFilter.toLowerCase();
        return sStatus === fStatus;
    });



    return (
        <div className="p-0 relative font-sans">
            {loading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
                    <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-900 rounded-full animate-spin mb-4"></div>
                    <p className="text-sky-900 font-bold animate-pulse">Loading Provider Details...</p>
                </div>
            )}

            {/* Header Card */}
            <div className="flex justify-between items-center bg-white p-4 px-5 rounded-lg mb-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-[#04364A] m-0">Provider Details</h2>

                <div className="flex items-center gap-3">
                    {/* Provider Action Buttons */}
                    {(providerData.status === "pending" || (typeof providerData.status === "string" && providerData.status.toLowerCase() === "pending")) && (
                        <div className="flex gap-2 border-r border-gray-200 pr-3 mr-2">
                            <button
                                onClick={handleProviderAccept}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-xs shadow-sm"
                            >
                                Accept Provider
                            </button>
                            <button
                                onClick={handleProviderReject}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold text-xs shadow-sm"
                            >
                                Reject Provider
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Top Cards */}
            <div className="flex flex-wrap gap-4" style={{ marginBottom: "30px" }}>
                {/* Provider Profile Card (Left) */}
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-md border border-sky-100 min-w-[280px] hover:border-sky-200 transition-all duration-300 font-sans text-center">
                    <div className="flex items-center gap-2 mb-4 border-b border-sky-50 pb-3">
                        <div className="p-2 bg-sky-50 rounded-lg text-sky-600 shadow-sm capitalize">
                            <FaUserCircle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-sky-900 leading-tight">Provider Profile</h3>
                        </div>
                    </div>

                    <div className="flex flex-col items-center mb-2">
                        <div className="relative p-1 rounded-full bg-linear-to-tr from-sky-400 via-sky-100 to-sky-50 shadow-sm mb-2">
                            <img
                                src={(providerData.image || providerData.User?.image || providerData.image_url) ? getImageUrl(providerData.image || providerData.User?.image || providerData.image_url) : "https://cdn-icons-png.flaticon.com/512/8847/8847419.png"}
                                alt="Profile"
                                className="w-20 h-20 object-cover rounded-full border-2 border-white shadow-inner"
                                onError={handleImageError}
                            />
                        </div>
                        <div className="text-center mb-2">
                            <span className="block text-[10px] uppercase tracking-widest font-bold text-sky-900/30 mb-0.5">Full Name</span>
                            <span className="text-sm font-bold text-sky-950">{providerData.name || "Provider Name"}</span>
                        </div>
                    </div>

                    <div className=" text-left">
                        <div className="flex justify-between items-center px-2.5 rounded-xl bg-sky-50/30 hover:bg-sky-50 transition-colors border border-transparent hover:border-sky-100">
                            <span className="text-[13px] font-bold uppercase text-sky-900/50 tracking-wide">Registered On</span>
                            <span className="text-xs font-bold text-sky-950">{providerData.createdAt?.split('T')[0] || "N/A"}</span>
                        </div>
                        <div className="flex justify-between items-center p-2.5 rounded-xl bg-sky-50/30 hover:bg-sky-50 transition-colors border border-transparent hover:border-sky-100">
                            <span className="text-[13px] font-bold uppercase text-sky-900/50 tracking-wide">Account Status</span>
                            <span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${providerData.status === "Accepted" || providerData.status === "accepted" || providerData.status === "active" ? "bg-green-50 text-green-600 border-green-100" :
                                    providerData.status === "Rejected" || providerData.status === "rejected" ? "bg-red-50 text-red-600 border-red-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}>
                                    <span className={`w-1 h-1 rounded-full mr-1.5 ${providerData.status === "Accepted" || providerData.status === "accepted" || providerData.status === "active" ? "bg-green-400" :
                                        providerData.status === "Rejected" || providerData.status === "rejected" ? "bg-red-400" :
                                            "bg-amber-400 animate-pulse"
                                        }`}></span>
                                    {providerData.status || "Pending"}
                                </span>
                            </span>
                        </div>
                        <div className="flex justify-between items-center px-2.5 rounded-xl bg-sky-50/30 hover:bg-sky-50 transition-colors border border-transparent hover:border-sky-100">
                            <span className="text-[13px] font-bold uppercase text-sky-900/50 tracking-wide">City</span>
                            <span className="text-xs font-bold text-sky-950">{providerData.city || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Contact Information Card (Right) */}
                <div className="flex-1 bg-white p-4 rounded-2xl shadow-md border border-sky-100 min-w-[280px] hover:border-sky-200 transition-all duration-300 font-sans flex flex-col">
                    <div className="flex items-center gap-2 mb-4 border-b border-sky-50 pb-3">
                        <div className="p-2 bg-sky-50 rounded-lg text-sky-600 shadow-sm capitalize">
                            <FaPhoneAlt size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-sky-900 leading-tight">Contact Info</h3>
                        </div>
                    </div>

                    <div className="grid gap-3 grow">
                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all shadow-sm">
                                <FaPhoneAlt size={14} />
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest font-bold text-sky-900/50">Contact Number</span>
                                <span className="text-xs font-bold text-sky-950">{providerData.phone || "N/A"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all shadow-sm">
                                <FaEnvelope size={14} />
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest font-bold text-sky-900/50">Email Address</span>
                                <span className="text-xs font-bold text-sky-950 break-all">{providerData.email || "N/A"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 group">
                            <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-all shadow-sm">
                                <FaMapMarkerAlt size={14} />
                            </div>
                            <div>
                                <span className="block text-[9px] uppercase tracking-widest font-bold text-sky-900/50">Address</span>
                                <span className="text-xs font-bold text-sky-950">{providerData.address || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg text-sky-900 font-bold flex items-center gap-1">
                        Requested Services <span>({filteredServices.length})</span>
                    </h3>
                    <div className="h-5 w-px bg-gray-300 mx-1"></div>
                    <button
                        onClick={() => setOpenFilterDropdown(!openFilterDropdown)}
                        className="text-sky-900 hover:text-sky-900/70 transition-colors"
                    >
                        <i className="fa-solid fa-filter text-lg"></i>
                    </button>
                    {openFilterDropdown && (
                        <div className="absolute mt-[160px] ml-[200px] w-36 bg-white border rounded-lg shadow-lg z-10 overflow-hidden">
                            {["All", "Pending", "Accepted", "Rejected"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setOpenFilterDropdown(false);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-sky-50 text-sky-900 font-medium border-none bg-transparent cursor-pointer"
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setActionType("acceptAll");
                            setModalOpen(true);
                        }}
                        disabled={filteredServices.length === 0}
                        className="px-4 py-1.5 bg-[#04364A] text-white rounded-lg hover:bg-sky-900 transition font-bold text-xs shadow-sm border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Accept All
                    </button>
                    <button
                        onClick={() => {
                            setActionType("rejectAll");
                            setModalOpen(true);
                        }}
                        disabled={filteredServices.length === 0}
                        className="px-4 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-bold text-xs shadow-sm border border-red-100 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Reject All
                    </button>
                </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10 mt-4">
                {filteredServices.length > 0 ? (
                    filteredServices.map((svc) => (
                        <div key={svc.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-inner">
                                        <FaInbox size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sky-950 text-sm leading-tight group-hover:text-sky-600 transition-colors">
                                            {svc.Service_title?.name}
                                        </h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{svc.Category?.name}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${svc.status === "Accepted" || svc.status === "accepted" ? "bg-green-50 text-green-600 border-green-100" :
                                    svc.status === "Rejected" || svc.status === "rejected" ? "bg-red-50 text-red-600 border-red-100" :
                                        "bg-amber-50 text-amber-600 border-amber-100"
                                    }`}>
                                    {svc.status || "Pending"}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center text-[11px] p-2 rounded-lg bg-gray-50/50">
                                    <span className="text-gray-400 font-medium">Sub Category</span>
                                    <span className="text-sky-900 font-bold">{svc.Subcategory?.name || "N/A"}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] p-2 rounded-lg bg-gray-50/50">
                                    <span className="text-gray-400 font-medium">Requested On</span>
                                    <span className="text-sky-900 font-bold">{svc.createdAt?.split('T')[0] || "N/A"}</span>
                                </div>
                            </div>

                            {/* Service Images */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-2 border-t border-gray-50 mt-2">
                                {safeParseImages(svc.images || svc.User_service_image || []).length > 0 ? (
                                    safeParseImages(svc.images || svc.User_service_image || []).map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={getImageUrl(img)}
                                            alt="Svc"
                                            className="w-14 h-14 rounded-lg object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform"
                                            onError={handleImageError}
                                        />
                                    ))
                                ) : (
                                    <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 italic text-[8px] text-gray-300">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {(svc.status === "pending" || svc.status === "Pending") && (
                                <div className="flex gap-2 mt-4 pt-3 border-t border-gray-50">
                                    <button
                                        onClick={() => handleServiceAccept(svc)}
                                        className="flex-1 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition font-bold text-[10px] border border-green-100"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleServiceReject(svc)}
                                        className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition font-bold text-[10px] border border-red-100"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <FaInbox size={40} className="mx-auto text-gray-200 mb-3" />
                        <p className="text-gray-400 font-bold italic">No Requested services found.</p>
                    </div>
                )}
            </div>

            {/* Modals & Popups */}
            {/* ... Modal code remains similarly styled ... */}
            {showServicePopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[110] p-4">
                    <div className="bg-white p-10 rounded-[32px] text-center shadow-2xl max-w-[420px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[#04364A] font-bold text-2xl mb-4">
                            {servicePopupType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                        </h3>
                        <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                            Are you sure you want to {servicePopupType === "approve" ? "approve" : "reject"} the service: <span className="font-bold text-[#04364A]">{selectedService?.Service_title?.name}</span>?
                        </p>
                        {servicePopupType === "reject" && (
                            <div className="space-y-2 mb-6 text-left">
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                    Reason for Rejection:
                                </label>
                                <textarea
                                    placeholder="Explain why this specific service is being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all resize-none h-28"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 mt-8">
                            <button onClick={closeServicePopup} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer text-sm">Cancel</button>
                            <button
                                onClick={confirmServiceAction}
                                disabled={actionLoading}
                                className={`flex-[1.2] py-3 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer active:scale-95 text-sm flex items-center justify-center gap-2 ${servicePopupType === "approve"
                                    ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                                    : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                    } disabled:opacity-50`}
                            >
                                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (servicePopupType === "approve" ? "Accept" : "Reject")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showProviderPopup && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[110] p-4">
                    <div className="bg-white p-10 rounded-[32px] text-center shadow-2xl max-w-[420px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-[#04364A] font-bold text-2xl mb-4">
                            {providerPopupType === "approve" ? "Accept Provider" : "Reject Provider"}
                        </h3>
                        <p className="text-gray-500 mb-6 leading-relaxed text-sm">
                            Are you sure you want to {providerPopupType === "approve" ? "accept" : "reject"} <span className="font-bold text-[#04364A]">{providerData.name}</span> as a registered provider?
                        </p>
                        {providerPopupType === "reject" && (
                            <div className="space-y-2 mb-6 text-left">
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                    Reason for Rejection:
                                </label>
                                <textarea
                                    placeholder="Explain why this provider is being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all resize-none h-28"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowProviderPopup(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer text-sm">Cancel</button>
                            <button
                                onClick={confirmProviderAction}
                                disabled={actionLoading}
                                className={`flex-[1.2] py-3 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer active:scale-95 text-sm flex items-center justify-center gap-2 ${providerPopupType === "approve"
                                    ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                                    : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                    } disabled:opacity-50`}
                            >
                                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (providerPopupType === "approve" ? "Confirm Accept" : "Confirm Reject")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {modalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center z-[110] p-4">
                    <div className="bg-white p-10 rounded-[32px] text-center shadow-2xl max-w-[420px] w-full border border-gray-100 animate-in zoom-in-95 duration-200">
                        <h3 className="text-sky-900 font-bold text-2xl mb-4">
                            {actionType === "acceptAll" ? "Accept All Pending" : "Reject All Pending"}
                        </h3>
                        <p className="text-gray-500 mb-6 leading-relaxed text-sm px-6">
                            Are you sure you want to {actionType === "acceptAll" ? "approve" : "reject"} ALL currently pending services for this provider?
                        </p>
                        {actionType === "rejectAll" && (
                            <div className="space-y-2 mb-6 text-left">
                                <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                                    Reason for Bulk Rejection:
                                </label>
                                <textarea
                                    placeholder="Explain why these services are being rejected..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full border border-gray-200 p-3 rounded-xl text-sm focus:border-red-500 outline-none transition-all resize-none h-28"
                                />
                            </div>
                        )}
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all cursor-pointer text-sm">Cancel</button>
                            <button
                                onClick={confirmBulkAction}
                                disabled={actionLoading}
                                className={`flex-[1.2] py-3 rounded-xl font-bold text-white transition-all shadow-lg cursor-pointer active:scale-95 text-sm flex items-center justify-center gap-2 ${actionType === "acceptAll"
                                    ? "bg-sky-900 hover:bg-sky-950 shadow-sky-100"
                                    : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                    } disabled:opacity-50`}
                            >
                                {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Confirm Action"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
