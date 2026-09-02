/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { API_BASE_URL } from "../../../lib/config";
import { showToast } from "@/components/ToastProvider";


// ─── Helpers ────────────────────────────────────────────────
const inputCls =
    "h-9 px-3 border border-border-main rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 bg-white text-xs text-text-main transition-all shadow-sm w-full";
const selectCls =
    "h-9 px-3 border border-border-main rounded-xl outline-none bg-white text-xs text-text-main transition-all shadow-sm w-full appearance-none";
const labelCls = "text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 block";
const sectionCls = "font-extrabold text-xs text-primary border-b border-border-main pb-2 mb-4 uppercase tracking-widest";
const checkCls = "accent-primary w-4 h-4 rounded border-border-main cursor-pointer";

// Stacked Field: label on top, control below
function Field({ label, required, error, children, className }: { label: string; required?: boolean; error?: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`flex flex-col ${className || ""}`}>
            <label className={labelCls}>
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {React.isValidElement(children)
                ? React.cloneElement(children as any, {
                    className: `${(children.props as any).className || ""} ${error ? "!border-red-500 focus:!ring-red-500/20" : ""}`
                })
                : children}
            {error && <span className="text-[10px] text-red-500 mt-1">{error}</span>}
        </div>
    );
}

// Custom PhoneRow: inline horizontal — label | main input | Ext | ext input (matches reference layout)
function PhoneRow({ label, value, ext, required, error, onChange, onExtChange }: { label: string; value: string; ext: string; required?: boolean; error?: string; onChange: (v: string) => void; onExtChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span style={{ minWidth: 72 }} className={`text-[11px] font-bold text-right shrink-0 ${error ? "text-red-500" : "text-slate-500"}`}>
                    {label}:{required && <span className="text-red-500 ml-0.5">*</span>}
                </span>
                <input className={`${inputCls} ${error ? "!border-red-500 focus:!ring-red-500/20" : ""}`} style={{ flex: 1 }} value={value} onChange={e => onChange(e.target.value)} />
                <span className="text-[11px] font-bold text-slate-500 shrink-0 ml-1">Ext:</span>
                <input className={inputCls} style={{ width: 72 }} value={ext} onChange={e => onExtChange(e.target.value)} />
            </div>
            {error && <span className="text-[10px] text-red-500 pl-[80px]">{error}</span>}
        </div>
    );
}

// ─── Default form state ─────────────────────────────────────
const defaultForm = {
    // Original / Core
    name: "", matchCode: "", type: "Commercial", address: "", city: "", state: "", zip: "", phone: "", email: "", status: "Active", primaryExec: "",

    // Type / Settings
    customerType: "Customer", excludeTargetList: false, excludePurge: false,

    // Names
    nameType: "Individual", firstName: "", middleName: "", lastName: "", firmName: "", dba: "",

    // Salutation
    formalSalutation: "", informalSalutation: "", altNameBilling: false,

    // Agency Personnel
    executive: "", representative: "", brokersCustomer: false, broker: "",

    // Business Unit
    division: "Gamaty Insurance Agency", branch: "", department: "",

    // Phone Numbers
    phoneResidence: "", phoneResidenceExt: "", phoneBusiness: "", phoneBusinessExt: "",
    fax: "", faxExt: "", cell: "", cellExt: "", pager: "", pagerExt: "", phoneOther: "", phoneOtherExt: "",

    // Internet
    email2: "", web: "",

    // Address extras
    address2: "", country: "", county: "", latitude: "", longitude: "", altAddressBilling: false,

    // Distribution / Contact
    preferredDistribution: "", preferredMethod: "", marketingSolicitation: "", electronicDelivery: "", notes: "",

    // Business with Agency
    acquisition: "", businessOrigin: "", customerAddedDate: new Date().toISOString().split("T")[0],

    // Referrals
    referralName: "", referralLocation: "",

    // Policy Checks
    autoCheckPolicies: true, checkPersonal: false, checkHealth: false, checkCommercial: false, checkNonPc: false, checkLife: false, checkFinancial: false, checkBenefits: false,

    // Other
    knownSinceYear: "", notation: "",

    // --- NEW FIELDS FROM SCREENSHOTS ---
    // Multiple Entity
    multipleEntityCustomerType: "Standard",
    // International Phone 1
    intlPhone1Type: "", intlPhone1CountryCode: "", intlPhone1Number: "", intlPhone1Ext: "",
    // International Phone 2
    intlPhone2Type: "", intlPhone2CountryCode: "", intlPhone2Number: "", intlPhone2Ext: "",

    // Additional Customer Information (Screenshot 3)
    ssn: "",
    maritalStatus: "",
    educationLevel: "",
    dateOfBirth: "",
    driversLicense: "",
    occupation: "",
    yearEmployed: "",
    agencyBusinessClassification: "",
    businessEntity: "",
    inBusinessSince: "",
    glCode: "",
    federalId: "",
    duns: "",
    naics: "",
    naicsSubDescription: "",
    sic: "",
};

type FormState = typeof defaultForm;

// ─── Whitelisted API payload fields ─────────────────────────
const whitelistedPayloadFields = [
    "match_code", "name", "type", "address", "city", "state", "zip", "phone", "email", "status", "primary_exec",
    "customer_type", "exclude_target_list", "exclude_purge", "name_type", "first_name", "middle_name", "last_name",
    "firm_name", "dba", "formal_salutation", "informal_salutation", "alt_name_billing", "executive", "representative",
    "brokers_customer", "broker", "division", "branch", "department", "phone_residence", "phone_residence_ext",
    "phone_business", "phone_business_ext", "fax", "fax_ext", "cell", "cell_ext", "pager", "pager_ext",
    "phone_other", "phone_other_ext", "email2", "web", "address2", "country", "county", "latitude", "longitude",
    "alt_address_billing", "preferred_distribution", "preferred_method", "marketing_solicitation",
    "electronic_delivery", "notes", "acquisition", "business_origin", "customer_added_date",
    "referral_name", "referral_location", "auto_check_policies", "check_personal", "check_health",
    "check_commercial", "check_non_pc", "check_life", "check_financial", "check_benefits",
    "known_since_year", "notation"
];

// ─── camelCase → snake_case payload builder ─────────────────
function toSnake(key: string) {
    return key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
}

function buildPayload(f: FormState) {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(f)) {
        const snakeKey = toSnake(k);
        if (whitelistedPayloadFields.includes(snakeKey)) {
            out[snakeKey] = v === "" ? null : v;
        }
    }
    // ensure name is never empty
    let computedName = f.nameType === "Business" ? f.firmName || f.name : `${f.firstName} ${f.lastName}`.trim() || f.name;
    if (!computedName) {
        computedName = "Unnamed Customer";
    }
    out.name = computedName;

    // ensure match_code is unique by appending random chars if not provided manually
    let computedMatchCode = f.matchCode;
    if (!computedMatchCode) {
        const baseCode = (f.lastName || computedName || "CUST").replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        computedMatchCode = `${baseCode}${randomSuffix}`;
    }
    out.match_code = computedMatchCode;

    out.status = f.status || "Active";
    out.primary_exec = f.primaryExec || f.executive || "Unassigned";
    out.type = f.type || "Commercial";
    
    // Ensure the primary 'phone' field is populated for the dashboard table
    if (!out.phone) {
        out.phone = f.cell || f.phoneBusiness || f.phoneResidence || f.phoneOther || null;
    }

    return out;
}

// ═══════════════════════════════════════════════════════════
//  PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
export default function NewCustomerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams?.get("edit");
    const [pageLoading, setPageLoading] = useState(!!editId);

    const [f, setF] = useState<FormState>({ ...defaultForm });

    useEffect(() => {
        if (!editId) return;
        const fetchCustomer = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/customers/${editId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const mappedData: any = {};
                    for (const [k, v] of Object.entries(data)) {
                        const camelKey = k.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
                        if (v !== null && v !== undefined) {
                            mappedData[camelKey] = v;
                        }
                    }
                    setF(prev => ({ ...prev, ...mappedData }));
                }
            } catch (err) {
                console.error("Failed to load customer", err);
            } finally {
                setPageLoading(false);
            }
        };
        fetchCustomer();
    }, [editId]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [activeSection, setActiveSection] = useState("Customer Setup");

    // Local lists for grid tables
    const [serviceGroups, setServiceGroups] = useState<any[]>([]);
    const [contacts, setContacts] = useState<any[]>([]);
    const [dependents, setDependents] = useState<any[]>([]);
    const [lossHistory, setLossHistory] = useState<any[]>([]);
    const [crossReferences, setCrossReferences] = useState<any[]>([]);

    // Agency Defined Fields state
    const [agencyDefinedFields, setAgencyDefinedFields] = useState<any[]>([
        { type: "Commercial Lines", field: "Addtl Finance Acc.", answer: "", placeholder: "Alphanumeric (A - Z) (0 - 9); Max length: 80" },
        { type: "Commercial Lines", field: "Contractors License", answer: "", placeholder: "Alphanumeric (A - Z) (0 - 9); Max length: 80" },
        { type: "Commercial Lines", field: "FEIN", answer: "", placeholder: "Text (any character); Max length: 80" },
        { type: "Commercial Lines", field: "Finance Account", answer: "", placeholder: "Alphanumeric (A - Z) (0 - 9); Max length: 80" },
    ]);

    const sections = [
        "Customer Setup",
        "Additional Customer Info",
        "Service Groups",
        "Contacts",
        // "Dependents",
        // "Loss History",
        // "Agency Defined Fields",
        // "Cross References",
        // "Expiration Dates",
        // "Accounting Options",
        // "Benefits Information",
    ];

    const set = (patch: Partial<FormState>) => {
        setF(prev => ({ ...prev, ...patch }));
        if (Object.keys(errors).length > 0) {
            setErrors(prev => {
                const next = { ...prev };
                let changed = false;
                Object.keys(patch).forEach(k => {
                    if (next[k]) {
                        delete next[k];
                        changed = true;
                    }
                });
                return changed ? next : prev;
            });
        }
    };

    // ── Submit ──
    const handleSave = async (andClose: boolean) => {
        setError("");
        setErrors({});

        const newErrors: Record<string, string> = {};

        if (f.nameType === "Business") {
            if (!f.firmName?.trim()) newErrors.firmName = "Company Name is required";
        } else {
            if (!f.firstName?.trim()) newErrors.firstName = "First Name is required";
            if (!f.lastName?.trim()) newErrors.lastName = "Last Name is required";
        }

        if (!f.executive?.trim()) newErrors.executive = "Executive is required";
        if (!f.representative?.trim()) newErrors.representative = "Representative is required";
        if (!f.division?.trim()) newErrors.division = "Division is required";
        if (!f.branch?.trim()) newErrors.branch = "Branch is required";
        if (!f.department?.trim()) newErrors.department = "Department is required";
        if (!f.customerAddedDate?.trim()) newErrors.customerAddedDate = "Customer Added Date is required";

        if (!f.address?.trim()) newErrors.address = "Address is required";
        if (!f.city?.trim()) newErrors.city = "City is required";
        if (!f.state?.trim()) newErrors.state = "State is required";
        if (!f.country?.trim()) newErrors.country = "Country is required";
        if (!f.zip?.trim()) newErrors.zip = "ZIP Code is required";
        if (!f.email?.trim()) newErrors.email = "Email is required";
        if (!f.cell?.trim()) newErrors.cell = "Cell Phone is required";

        if (f.email && !f.email.includes("@")) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setError("Please fill out all required fields in the Customer Setup section.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload(f);
            const isEdit = !!editId;
            const url = isEdit ? `${API_BASE_URL}/api/customers/${editId}` : `${API_BASE_URL}/api/customers/`;
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                let errMsg = "Failed to create customer";
                if (errData && errData.detail) {
                    if (typeof errData.detail === "string") {
                        errMsg = errData.detail;
                    } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
                        errMsg = errData.detail[0].msg || JSON.stringify(errData.detail[0]);
                    } else {
                        errMsg = JSON.stringify(errData.detail);
                    }
                }
                setError(errMsg);
                return;
            }
            if (andClose) {
                router.push(isEdit ? `/agency/customer/${editId}` : "/agency/dashboard");
            } else {
                showToast(isEdit ? "Customer updated successfully!" : "Customer saved successfully!", "success");
                setF({ ...defaultForm });
                setServiceGroups([]);
                setContacts([]);
                setDependents([]);
                setLossHistory([]);
                setCrossReferences([]);
                setAgencyDefinedFields([
                    { type: "Commercial Lines", field: "Addtl Finance Acc.", answer: "", placeholder: "Alphanumeric (A - Z) (0 - 9); Max length: 80" },
                    { type: "Commercial Lines", field: "Contractors License", answer: "", placeholder: "Alphanumeric (A - Z) (0 - 9); Max length: 80" },
                    { type: "Commercial Lines", field: "FEIN", answer: "", placeholder: "Text (any character); Max length: 80" },
                    { type: "Commercial Lines", field: "Finance Account", answer: "", placeholder: "Alphanumeric (A - Z) (0 - 9); Max length: 80" },
                ]);
                setActiveSection("Customer Setup");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while saving the customer.");
        } finally {
            setSaving(false);
        }
    };

    // ── Content Render ──
    const renderSectionContent = () => {
        switch (activeSection) {
            case "Customer Setup":
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto bg-white p-1" style={{ fontSize: "11px" }}>

                        {/* ════════════════ LEFT COLUMN ════════════════ */}
                        <div className="space-y-7">

                            {/* -- Type -- */}
                            <div>
                                <h3 className={sectionCls}>Type <span className="text-red-500">*</span></h3>
                                <div className="flex gap-6">
                                    {["Customer", "Prospect", "Suspect"].map(t => (
                                        <label key={t} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                            <input type="radio" name="customerType" className={checkCls} checked={f.customerType === t} onChange={() => set({ customerType: t })} />
                                            <span>{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* -- Settings -- */}
                            <div>
                                <h3 className={sectionCls}>Settings</h3>
                                <div className="flex flex-col gap-2.5">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                        <input type="checkbox" className={checkCls} checked={f.excludeTargetList} onChange={e => set({ excludeTargetList: e.target.checked })} />
                                        <span>Exclude from target list</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                        <input type="checkbox" className={checkCls} checked={f.excludePurge} onChange={e => set({ excludePurge: e.target.checked })} />
                                        <span>Exclude from Purge</span>
                                    </label>
                                </div>
                            </div>

                            {/* -- Names -- */}
                            <div>
                                <h3 className={sectionCls}>Names <span className="text-red-500">*</span></h3>
                                <div className="flex gap-6 mb-4">
                                    {["Individual", "Family", "Business"].map(t => (
                                        <label key={t} className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                            <input type="radio" name="nameType" className={checkCls} checked={f.nameType === t} onChange={() => set({ nameType: t })} />
                                            <span>{t}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="First Name" required={f.nameType !== "Business"} error={errors.firstName}><input className={inputCls} value={f.firstName} onChange={e => set({ firstName: e.target.value })} /></Field>
                                    {/* <Field label="Middle Name"><input className={inputCls} value={f.middleName} onChange={e => set({ middleName: e.target.value })} /></Field> */}
                                    <Field label="Last Name" required={f.nameType !== "Business"} error={errors.lastName}><input className={inputCls} value={f.lastName} onChange={e => set({ lastName: e.target.value })} /></Field>
                                    <Field label="Company Name" className="col-span-2" required={f.nameType === "Business"} error={errors.firmName}><input className={inputCls} value={f.firmName} onChange={e => set({ firmName: e.target.value })} /></Field>
                                    <Field label="DBA" className="col-span-2"><input className={inputCls} value={f.dba} onChange={e => set({ dba: e.target.value })} /></Field>
                                </div>
                            </div>

                            {/* -- Salutation -- */}
                            <div>
                                <h3 className={sectionCls}>Salutation</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="Formal Salutation"><input className={inputCls} value={f.formalSalutation} onChange={e => set({ formalSalutation: e.target.value })} /></Field>
                                    <Field label="Informal Salutation"><input className={inputCls} value={f.informalSalutation} onChange={e => set({ informalSalutation: e.target.value })} /></Field>
                                    <label className="flex items-center gap-2 cursor-pointer col-span-2 text-xs font-semibold mt-1">
                                        <input type="checkbox" className={checkCls} checked={f.altNameBilling} onChange={e => set({ altNameBilling: e.target.checked })} />
                                        <span>Use alternate name for billing</span>
                                    </label>
                                </div>
                            </div>

                            {/* -- Addresses -- */}
                            <div>
                                <h3 className={sectionCls}>Addresses</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="Address" className="col-span-2" required error={errors.address}><input className={inputCls} value={f.address} onChange={e => set({ address: e.target.value })} /></Field>
                                    <Field label="Address 2" className="col-span-2"><input className={inputCls} value={f.address2} onChange={e => set({ address2: e.target.value })} /></Field>
                                    <Field label="City" required error={errors.city}><input className={inputCls} value={f.city} onChange={e => set({ city: e.target.value })} /></Field>
                                    <Field label="State" required error={errors.state}>
                                        <select className={selectCls} value={f.state} onChange={e => set({ state: e.target.value })}>
                                            <option value="">--</option>
                                            {["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Country" required error={errors.country}>
                                        <select className={selectCls} value={f.country} onChange={e => set({ country: e.target.value })}>
                                            <option value="">--</option>
                                            <option value="US">United States</option>
                                            <option value="CA">Canada</option>
                                            <option value="IN">India</option>
                                            <option value="UK">United Kingdom</option>
                                        </select>
                                    </Field>
                                    <Field label="ZIP Code" required error={errors.zip}><input className={inputCls} value={f.zip} onChange={e => set({ zip: e.target.value })} /></Field>
                                    <Field label="County" className="col-span-2"><input className={inputCls} value={f.county} onChange={e => set({ county: e.target.value })} /></Field>
                                    <Field label="Latitude"><input className={inputCls} value={f.latitude} onChange={e => set({ latitude: e.target.value })} /></Field>
                                    <Field label="Longitude"><input className={inputCls} value={f.longitude} onChange={e => set({ longitude: e.target.value })} /></Field>
                                    <label className="flex items-center gap-2 cursor-pointer col-span-2 text-xs font-semibold mt-1">
                                        <input type="checkbox" className={checkCls} checked={f.altAddressBilling} onChange={e => set({ altAddressBilling: e.target.checked })} />
                                        <span>Use alternate address for billing</span>
                                    </label>
                                </div>
                            </div>

                            {/* -- Distribution -- */}
                            <div>
                                <h3 className={sectionCls}>Distribution</h3>
                                <Field label="Preferred Method of Distribution">
                                    <select className={selectCls} value={f.preferredDistribution} onChange={e => set({ preferredDistribution: e.target.value })}>
                                        <option value="">--</option>
                                        <option value="Mail">Mail</option>
                                        <option value="Email">Email</option>
                                        <option value="Fax">Fax</option>
                                    </select>
                                </Field>
                            </div>

                            {/* -- Contact Preferences -- */}
                            {/* <div>
                                <h3 className={sectionCls}>Contact Preferences</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="Preferred Method">
                                        <select className={selectCls} value={f.preferredMethod} onChange={e => set({ preferredMethod: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="Business Phone">Business Phone</option>
                                            <option value="Cell">Cell</option>
                                            <option value="Customer Address">Customer Address</option>
                                            <option value="Email #1">Email #1</option>
                                            <option value="Email #2">Email #2</option>
                                            <option value="Fax">Fax</option>
                                            <option value="InsurLink">InsurLink</option>
                                            <option value="Intl Phone #1">Intl Phone #1</option>
                                            <option value="Intl Phone #2">Intl Phone #2</option>
                                            <option value="Other">Other</option>
                                            <option value="Pager">Pager</option>
                                            <option value="Residence Phone">Residence Phone</option>
                                            <option value="Text Message">Text Message</option>
                                        </select>
                                    </Field>
                                    <Field label="Marketing / Solicitation">
                                        <select className={selectCls} value={f.marketingSolicitation} onChange={e => set({ marketingSolicitation: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="Do not market/solicit">Do not market/solicit</option>
                                            <option value="Ok to email">Ok to email</option>
                                            <option value="Ok to email and mail">Ok to email and mail</option>
                                            <option value="Ok to mail">Ok to mail</option>
                                        </select>
                                    </Field>
                                    <Field label="Electronic Delivery" className="col-span-2">
                                        <select className={selectCls} value={f.electronicDelivery} onChange={e => set({ electronicDelivery: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="Do not send documents">Do not send documents</option>
                                            <option value="Ok to send documents">Ok to send documents</option>
                                        </select>
                                    </Field>
                                    <Field label="Notes" className="col-span-2">
                                        <input className={inputCls} value={f.notes} onChange={e => set({ notes: e.target.value })} />
                                    </Field>
                                </div>
                            </div> */}

                        </div>

                        {/* ════════════════ RIGHT COLUMN ════════════════ */}
                        <div className="space-y-7">

                            {/* -- Agency Personnel -- */}
                            <div>
                                <h3 className={sectionCls}>Agency Personnel</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="Executive" required error={errors.executive}>
                                        <select className={selectCls} value={f.executive} onChange={e => set({ executive: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="Akva, Jonathan">Akva, Jonathan</option>
                                            <option value="Anatian, Yoav">Anatian, Yoav</option>
                                            <option value="Buckanaga, Shania">Buckanaga, Shania</option>
                                            <option value="Cohen, Judah">Cohen, Judah</option>
                                            <option value="Drucker, Aaron">Drucker, Aaron</option>
                                            <option value="Gamaty, Eidan">Gamaty, Eidan</option>
                                            <option value="Gamaty, Joseph">Gamaty, Joseph</option>
                                            <option value="Gamaty, Michael">Gamaty, Michael</option>
                                            <option value="Gamaty, Moshe">Gamaty, Moshe</option>
                                            <option value="Harel, Eli">Harel, Eli</option>
                                            <option value="HOUSE">HOUSE</option>
                                            <option value="Kraut, Michal">Kraut, Michal</option>
                                            <option value="Service, Customer">Service, Customer</option>
                                            <option value="Short, Linda">Short, Linda</option>
                                            <option value="Solender, Ben">Solender, Ben</option>
                                            <option value="Weiner, Jake">Weiner, Jake</option>
                                        </select>
                                    </Field>
                                    <Field label="Representative" required error={errors.representative}>
                                        <select className={selectCls} value={f.representative} onChange={e => set({ representative: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="Akva, Jonathan">Akva, Jonathan</option>
                                            <option value="Anatian, Yoav">Anatian, Yoav</option>
                                            <option value="Buckanaga, Shania">Buckanaga, Shania</option>
                                            <option value="Cohen, Judah">Cohen, Judah</option>
                                            <option value="CS, Certificates">CS, Certificates</option>
                                            <option value="Drucker, Aaron">Drucker, Aaron</option>
                                            <option value="Gamaty, Eidan">Gamaty, Eidan</option>
                                            <option value="Gamaty, Joseph">Gamaty, Joseph</option>
                                            <option value="Gamaty, Michael">Gamaty, Michael</option>
                                            <option value="Gamaty, Moshe">Gamaty, Moshe</option>
                                            <option value="Harel, Eli">Harel, Eli</option>
                                            <option value="HOUSE">HOUSE</option>
                                            <option value="Johnson, Chalia">Johnson, Chalia</option>
                                            <option value="Kraut, Michal">Kraut, Michal</option>
                                            <option value="Mormytoa, Keila">Mormytoa, Keila</option>
                                            <option value="Parungo, Joana">Parungo, Joana</option>
                                            <option value="Service, Customer">Service, Customer</option>
                                            <option value="Short, Linda">Short, Linda</option>
                                            <option value="Solender, Ben">Solender, Ben</option>
                                            <option value="Weiner, Jake">Weiner, Jake</option>
                                        </select>
                                    </Field>
                                    <div className="col-span-2 flex flex-col gap-2.5 pt-1">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                            <input type="checkbox" className={checkCls} checked={f.brokersCustomer} onChange={e => set({ brokersCustomer: e.target.checked })} />
                                            <span>Broker&apos;s Customer</span>
                                        </label>
                                        <Field label="Broker">
                                            <select className={selectCls} value={f.broker} onChange={e => set({ broker: e.target.value })}>
                                                <option value="">--</option>
                                            </select>
                                        </Field>
                                    </div>
                                </div>
                            </div>

                            {/* -- Business Unit -- */}
                            <div>
                                <h3 className={sectionCls}>Business Unit</h3>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                                    <Field label="Division" required error={errors.division}>
                                        <select className={selectCls} value={f.division} onChange={e => set({ division: e.target.value })}>
                                            <option value="Gamaty Insurance Agency">Gamaty Insurance Agency</option>
                                        </select>
                                    </Field>
                                    <Field label="Branch" required error={errors.branch}>
                                        <select className={selectCls} value={f.branch} onChange={e => set({ branch: e.target.value })}>
                                            <option value=""></option>
                                            <option value="Armar Insurance">Armar Insurance</option>
                                            <option value="CapCo Florida">CapCo Florida</option>
                                            <option value="Capital & Co">Capital & Co</option>
                                            <option value="JMB - DO NOT SERVICE">JMB - DO NOT SERVICE</option>
                                            <option value="Pregill Insurance">Pregill Insurance</option>
                                            <option value="WCFL Insurance Services">WCFL Insurance Services</option>
                                        </select>
                                    </Field>
                                    <Field label="Department" required error={errors.department}>
                                        <select className={selectCls} value={f.department} onChange={e => set({ department: e.target.value })}>
                                            <option value=""> </option>
                                            <option value="Commercial">Commercial</option>
                                            <option value="Health">Health</option>
                                            <option value="Personal">Personal</option>
                                        </select>
                                    </Field>
                                </div>
                            </div>

                            {/* -- Contact Information -- */}
                            <div>
                                <h3 className={sectionCls}>Contact Information</h3>
                                <div className="space-y-5">
                                    <div className="space-y-2.5">
                                        <PhoneRow label="Cell" value={f.cell} ext={f.cellExt} required error={errors.cell} onChange={v => set({ cell: v })} onExtChange={v => set({ cellExt: v })} />
                                        <PhoneRow label="Business" value={f.phoneBusiness} ext={f.phoneBusinessExt} onChange={v => set({ phoneBusiness: v })} onExtChange={v => set({ phoneBusinessExt: v })} />
                                        <PhoneRow label="Other" value={f.phoneOther} ext={f.phoneOtherExt} onChange={v => set({ phoneOther: v })} onExtChange={v => set({ phoneOtherExt: v })} />
                                    </div>
                                    <div className="flex flex-col gap-4 pt-2">
                                        <Field label="Primary Email" required error={errors.email}><input type="email" className={inputCls} value={f.email} onChange={e => set({ email: e.target.value })} /></Field>
                                        <Field label="Alternate Email"><input type="email" className={inputCls} value={f.email2} onChange={e => set({ email2: e.target.value })} /></Field>
                                        <Field label="Website"><input className={inputCls} value={f.web} onChange={e => set({ web: e.target.value })} /></Field>
                                    </div>
                                </div>
                            </div>

                            {/* -- Business with Agency -- */}
                            <div>
                                <h3 className={sectionCls}>Business with Agency</h3>
                                <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                                    <Field label="Acquisition">
                                        <select className={selectCls} value={f.acquisition} onChange={e => set({ acquisition: e.target.value })}>
                                            <option value="">--</option>
                                            <option value="Direct">Direct</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Web">Web</option>
                                        </select>
                                    </Field>
                                    <Field label="Business Origin">
                                        <select className={selectCls} value={f.businessOrigin} onChange={e => set({ businessOrigin: e.target.value })}>
                                            <option value="">--</option>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Call">Call</option>
                                            <option value="Online">Online</option>
                                        </select>
                                    </Field>
                                    <Field label="Customer Added Date" required error={errors.customerAddedDate}>
                                        <input type="date" className={inputCls} value={f.customerAddedDate} onChange={e => set({ customerAddedDate: e.target.value })} />
                                    </Field>
                                </div>
                            </div>

                            {/* -- Referrals -- */}
                            {/* <div>
                                <h3 className={sectionCls}>Referrals</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="Name">
                                        <select className={selectCls} value={f.referralName} onChange={e => set({ referralName: e.target.value })}>
                                            <option value="">--</option>
                                        </select>
                                    </Field>
                                    <Field label="Location">
                                        <select className={selectCls} value={f.referralLocation} onChange={e => set({ referralLocation: e.target.value })}>
                                            <option value="">--</option>
                                        </select>
                                    </Field>
                                </div>
                            </div> */}

                            {/* -- Policy Auto-Check -- */}
                            <div>
                                <h3 className={sectionCls}>Policy Auto-Check</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                                        <input type="checkbox" className={checkCls} checked={f.autoCheckPolicies} onChange={e => set({ autoCheckPolicies: e.target.checked })} />
                                        <span>Automatically check based on active policies</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {([
                                            ["checkPersonal", "Personal"],
                                            ["checkHealth", "Health"],
                                            ["checkCommercial", "Commercial"],
                                            ["checkNonPc", "Non P&C"],
                                            ["checkLife", "Life"],
                                            ["checkFinancial", "Financial Services"],
                                            ["checkBenefits", "Benefits"],
                                        ] as [keyof FormState, string][]).map(([key, label]) => (
                                            <label key={key} className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-secondary/40 border border-transparent transition-all">
                                                <input type="checkbox" className={checkCls} checked={!!f[key]} onChange={e => set({ [key]: e.target.checked } as any)} />
                                                <span className="text-[11px] font-bold text-text-main">{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* -- Known & Notation -- */}
                            {/* <div>
                                <h3 className={sectionCls}>Known & Notation</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                    <Field label="Known Since Year"><input className={inputCls} value={f.knownSinceYear} onChange={e => set({ knownSinceYear: e.target.value })} /></Field>
                                    <Field label="Notation">
                                        <select className={selectCls} value={f.notation} onChange={e => set({ notation: e.target.value })}>
                                            <option value="">--</option>
                                            <option value="VIP">VIP</option>
                                        </select>
                                    </Field>
                                </div>
                            </div> */}

                            {/* -- Multiple Entity -- */}
                            {/* <div>
                                <h3 className={sectionCls}>Multiple Entity Account Information</h3>
                                <Field label="Customer Type">
                                    <select className={selectCls} value={f.multipleEntityCustomerType} onChange={e => set({ multipleEntityCustomerType: e.target.value })}>
                                        <option value="Master/Multiple Entities">Master/Multiple Entities</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Sub-customer/Multiple Entities">Sub-customer/Multiple Entities</option>
                                    </select>
                                </Field>
                            </div> */}

                            {/* -- International Phone 1 & 2 -- */}
                            <div>
                                <h3 className={sectionCls}>International Phone Numbers</h3>
                                <div className="space-y-4">

                                    {/* Intl Phone 1 */}
                                    <div className="border border-border-main/50 rounded-xl p-4 bg-secondary/10">
                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">Number 1</span>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            <Field label="Phone Type">
                                                <select className={selectCls} value={f.intlPhone1Type} onChange={e => set({ intlPhone1Type: e.target.value })}>
                                                    <option value=""> </option>
                                                    <option value="Business">Business</option>
                                                    <option value="Cell">Cell</option>
                                                    <option value="Fax">Fax</option>
                                                    <option value="Other">Other</option>
                                                    <option value="Pager">Pager</option>
                                                    <option value="Residence">Residence</option>
                                                </select>
                                            </Field>
                                            <Field label="Country Code"><input className={inputCls} placeholder="e.g. +1" value={f.intlPhone1CountryCode} onChange={e => set({ intlPhone1CountryCode: e.target.value })} /></Field>
                                            <Field label="Number" className="col-span-2"><input className={inputCls} value={f.intlPhone1Number} onChange={e => set({ intlPhone1Number: e.target.value })} /></Field>
                                            <Field label="Ext"><input className={inputCls} value={f.intlPhone1Ext} onChange={e => set({ intlPhone1Ext: e.target.value })} /></Field>
                                        </div>
                                    </div>

                                    {/* Intl Phone 2 */}
                                    {/* <div className="border border-border-main/50 rounded-xl p-4 bg-secondary/10">
                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-3">Number 2</span>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                            <Field label="Phone Type">
                                                <select className={selectCls} value={f.intlPhone2Type} onChange={e => set({ intlPhone2Type: e.target.value })}>
                                                    <option value=""> </option>
                                                    <option value="Business">Business</option>
                                                    <option value="Cell">Cell</option>
                                                    <option value="Fax">Fax</option>
                                                    <option value="Other">Other</option>
                                                    <option value="Pager">Pager</option>
                                                    <option value="Residence">Residence</option>
                                                </select>
                                            </Field>
                                            <Field label="Country Code"><input className={inputCls} placeholder="e.g. +1" value={f.intlPhone2CountryCode} onChange={e => set({ intlPhone2CountryCode: e.target.value })} /></Field>
                                            <Field label="Number" className="col-span-2"><input className={inputCls} value={f.intlPhone2Number} onChange={e => set({ intlPhone2Number: e.target.value })} /></Field>
                                            <Field label="Ext"><input className={inputCls} value={f.intlPhone2Ext} onChange={e => set({ intlPhone2Ext: e.target.value })} /></Field>
                                        </div>
                                    </div> */}

                                </div>
                            </div>

                        </div>

                    </div>
                );
            case "Additional Customer Info":
                return (
                    <div className="max-w-4xl mx-auto bg-white p-1" style={{ fontSize: "11px" }}>
                        <h3 className={sectionCls}>Additional Customer Information</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            <Field label="SSN"><input className={inputCls} value={f.ssn} onChange={e => set({ ssn: e.target.value })} /></Field>
                            <Field label="Marital Status">
                                <select className={selectCls} value={f.maritalStatus} onChange={e => set({ maritalStatus: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="Single">Single</option>
                                    <option value="Married">Married</option>
                                    <option value="Divorced">Divorced</option>
                                    <option value="Widowed">Widowed</option>
                                </select>
                            </Field>
                            <Field label="Education Level">
                                <select className={selectCls} value={f.educationLevel} onChange={e => set({ educationLevel: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="High School">High School</option>
                                    <option value="Associate Degree">Associate Degree</option>
                                    <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                                    <option value="Master's Degree">Master&apos;s Degree</option>
                                    <option value="Doctorate">Doctorate</option>
                                </select>
                            </Field>
                            <Field label="Date of Birth"><input type="date" className={inputCls} value={f.dateOfBirth} onChange={e => set({ dateOfBirth: e.target.value })} /></Field>
                            <Field label="Drivers License"><input className={inputCls} value={f.driversLicense} onChange={e => set({ driversLicense: e.target.value })} /></Field>
                            <Field label="Occupation"><input className={inputCls} value={f.occupation} onChange={e => set({ occupation: e.target.value })} /></Field>
                            <Field label="Year Employed"><input className={inputCls} value={f.yearEmployed} onChange={e => set({ yearEmployed: e.target.value })} /></Field>
                            <Field label="Agency Business Classification" className="col-span-2">
                                <select className={selectCls} value={f.agencyBusinessClassification} onChange={e => set({ agencyBusinessClassification: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="Agriculture">Agriculture</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Manufacturing">Manufacturing</option>
                                    <option value="Retail Trade">Retail Trade</option>
                                    <option value="Finance & Insurance">Finance & Insurance</option>
                                    <option value="Services">Services</option>
                                </select>
                            </Field>
                            <Field label="Business Entity">
                                <select className={selectCls} value={f.businessEntity} onChange={e => set({ businessEntity: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="Individual">Individual</option>
                                    <option value="Partnership">Partnership</option>
                                    <option value="Corporation">Corporation</option>
                                    <option value="LLC">LLC</option>
                                </select>
                            </Field>
                            <Field label="In Business Since"><input className={inputCls} placeholder="e.g. 2004" value={f.inBusinessSince} onChange={e => set({ inBusinessSince: e.target.value })} /></Field>
                            <Field label="GL Code #"><input className={inputCls} value={f.glCode} onChange={e => set({ glCode: e.target.value })} /></Field>
                            <Field label="Federal ID #"><input className={inputCls} value={f.federalId} onChange={e => set({ federalId: e.target.value })} /></Field>
                            <Field label="DUNS #"><input className={inputCls} value={f.duns} onChange={e => set({ duns: e.target.value })} /></Field>
                            <Field label="NAICS #" className="col-span-2">
                                <select className={selectCls} value={f.naics} onChange={e => set({ naics: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="524126">524126 - Direct Property & Casualty Insurance Carriers</option>
                                    <option value="524210">524210 - Insurance Agencies and Brokerages</option>
                                </select>
                            </Field>
                            <Field label="NAICS Sub-Description" className="col-span-2">
                                <select className={selectCls} value={f.naicsSubDescription} onChange={e => set({ naicsSubDescription: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="Primary Agency">Primary Agency Operations</option>
                                </select>
                            </Field>
                            <Field label="SIC #" className="col-span-2">
                                <select className={selectCls} value={f.sic} onChange={e => set({ sic: e.target.value })}>
                                    <option value="">--</option>
                                    <option value="6411">6411 - Insurance Agents, Brokers & Service</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                );
            case "Service Groups":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Service Groups</h3>
                        <div className="flex items-center gap-2 border-b border-border-main pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const newGroup = {
                                        id: Date.now(),
                                        type: "Standard",
                                        title: "Service Group " + (serviceGroups.length + 1),
                                        name: "Customer Service Team",
                                        businessType: "Commercial",
                                        primary: serviceGroups.length === 0
                                    };
                                    setServiceGroups([...serviceGroups, newGroup]);
                                }}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
                            >
                                + New
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceGroups([])}
                                disabled={serviceGroups.length === 0}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-white border border-border-main text-text-main hover:bg-secondary/60 hover:text-primary transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                Remove All
                            </button>
                        </div>

                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4 w-16">Type</th>
                                        <th className="py-2.5 px-4">Title</th>
                                        <th className="py-2.5 px-4">Name</th>
                                        <th className="py-2.5 px-4">Type of Business</th>
                                        <th className="py-2.5 px-4 text-center">Primary</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serviceGroups.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 font-medium italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        serviceGroups.map((group) => (
                                            <tr key={group.id} className="border-b border-border-main/50 last:border-none hover:bg-secondary/20 transition-all font-semibold">
                                                <td className="py-2 px-4 text-slate-500">{group.type}</td>
                                                <td className="py-2 px-4">{group.title}</td>
                                                <td className="py-2 px-4">{group.name}</td>
                                                <td className="py-2 px-4">{group.businessType}</td>
                                                <td className="py-2 px-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${group.primary ? "bg-success/10 text-success" : "bg-slate-100 text-slate-400"}`}>
                                                        {group.primary ? "Yes" : "No"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Contacts":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Contacts</h3>
                        <div className="flex items-center gap-2 border-b border-border-main pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const newContact = {
                                        id: Date.now(),
                                        name: "Contact " + (contacts.length + 1),
                                        title: "Manager",
                                        responsibilities: "Billing & Claims"
                                    };
                                    setContacts([...contacts, newContact]);
                                }}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
                            >
                                + New
                            </button>
                            <button
                                type="button"
                                onClick={() => setContacts([])}
                                disabled={contacts.length === 0}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-white border border-border-main text-text-main hover:bg-secondary/60 hover:text-primary transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                Remove All
                            </button>
                        </div>

                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Name <span className="text-red-600">*</span></th>
                                        <th className="py-2.5 px-4">Title</th>
                                        <th className="py-2.5 px-4">Responsibilities</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contacts.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400 font-medium italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        contacts.map((contact) => (
                                            <tr key={contact.id} className="border-b border-border-main/50 last:border-none hover:bg-secondary/20 transition-all font-semibold">
                                                <td className="py-2 px-4">{contact.name}</td>
                                                <td className="py-2 px-4">{contact.title}</td>
                                                <td className="py-2 px-4">{contact.responsibilities}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Dependents":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Dependents</h3>
                        <div className="flex items-center gap-2 border-b border-border-main pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const newDep = {
                                        id: Date.now(),
                                        first: "Dependent",
                                        last: "Lastname " + (dependents.length + 1),
                                        relationship: "Spouse"
                                    };
                                    setDependents([...dependents, newDep]);
                                }}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
                            >
                                + New
                            </button>
                            <button
                                type="button"
                                onClick={() => setDependents([])}
                                disabled={dependents.length === 0}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-white border border-border-main text-text-main hover:bg-secondary/60 hover:text-primary transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                Remove All
                            </button>
                        </div>

                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">First</th>
                                        <th className="py-2.5 px-4">Last <span className="text-red-600">*</span></th>
                                        <th className="py-2.5 px-4">Relationship</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dependents.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-12 text-center text-slate-400 font-medium italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        dependents.map((dep) => (
                                            <tr key={dep.id} className="border-b border-border-main/50 last:border-none hover:bg-secondary/20 transition-all font-semibold">
                                                <td className="py-2 px-4">{dep.first}</td>
                                                <td className="py-2 px-4">{dep.last}</td>
                                                <td className="py-2 px-4">{dep.relationship}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Loss History":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Loss History</h3>
                        <div className="flex items-center gap-2 border-b border-border-main pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const newLoss = {
                                        id: Date.now(),
                                        company: "Carrier Co",
                                        dateOfLoss: new Date().toISOString().split("T")[0],
                                        status: "Closed",
                                        kindOfLoss: "Water Damage"
                                    };
                                    setLossHistory([...lossHistory, newLoss]);
                                }}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
                            >
                                + New
                            </button>
                            <button
                                type="button"
                                onClick={() => setLossHistory([])}
                                disabled={lossHistory.length === 0}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-white border border-border-main text-text-main hover:bg-secondary/60 hover:text-primary transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                Remove All
                            </button>
                        </div>

                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Company <span className="text-red-600">*</span></th>
                                        <th className="py-2.5 px-4">Date of loss</th>
                                        <th className="py-2.5 px-4">Status</th>
                                        <th className="py-2.5 px-4">Kind of loss</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lossHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        lossHistory.map((loss) => (
                                            <tr key={loss.id} className="border-b border-border-main/50 last:border-none hover:bg-secondary/20 transition-all font-semibold">
                                                <td className="py-2 px-4">{loss.company}</td>
                                                <td className="py-2 px-4">{loss.dateOfLoss}</td>
                                                <td className="py-2 px-4">{loss.status}</td>
                                                <td className="py-2 px-4">{loss.kindOfLoss}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Agency Defined Fields":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Agency Defined Fields</h3>

                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Type of Business</th>
                                        <th className="py-2.5 px-4">Agency Defined Field</th>
                                        <th className="py-2.5 px-4 w-1/2">Answer</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {agencyDefinedFields.map((field, idx) => (
                                        <tr key={idx} className="border-b border-border-main/50 last:border-none hover:bg-secondary/20 transition-all font-semibold">
                                            <td className="py-3 px-4 text-slate-500">{field.type}</td>
                                            <td className="py-3 px-4 text-primary">{field.field}</td>
                                            <td className="py-3 px-4">
                                                <input
                                                    type="text"
                                                    className={inputCls}
                                                    placeholder={field.placeholder}
                                                    value={field.answer}
                                                    onChange={(e) => {
                                                        const updated = [...agencyDefinedFields];
                                                        updated[idx].answer = e.target.value;
                                                        setAgencyDefinedFields(updated);
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Cross References":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Cross References</h3>
                        <div className="flex items-center gap-2 border-b border-border-main pb-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const newRef = {
                                        id: Date.now(),
                                        type: "Parent Company",
                                        crossReference: "Ref Customer " + (crossReferences.length + 1)
                                    };
                                    setCrossReferences([...crossReferences, newRef]);
                                }}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-primary text-white hover:bg-primary/95 transition-all shadow-sm cursor-pointer"
                            >
                                + New
                            </button>
                            <button
                                type="button"
                                onClick={() => setCrossReferences([])}
                                disabled={crossReferences.length === 0}
                                className="h-7 px-3 text-[10px] font-bold rounded-lg bg-white border border-border-main text-text-main hover:bg-secondary/60 hover:text-primary transition-all shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                Remove All
                            </button>
                        </div>

                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Type <span className="text-red-600">*</span></th>
                                        <th className="py-2.5 px-4">Cross Reference <span className="text-red-600">*</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {crossReferences.length === 0 ? (
                                        <tr>
                                            <td colSpan={2} className="py-12 text-center text-slate-400 font-medium italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        crossReferences.map((ref) => (
                                            <tr key={ref.id} className="border-b border-border-main/50 last:border-none hover:bg-secondary/20 transition-all font-semibold">
                                                <td className="py-2 px-4">{ref.type}</td>
                                                <td className="py-2 px-4">{ref.crossReference}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Expiration Dates":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Expiration Dates</h3>
                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Date Description</th>
                                        <th className="py-2.5 px-4">Expiration Date</th>
                                        <th className="py-2.5 px-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-slate-400 font-medium italic">
                                            There are no records found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Accounting Options":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Accounting Options</h3>
                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Option Name</th>
                                        <th className="py-2.5 px-4">Setting Value</th>
                                        <th className="py-2.5 px-4">Last Modified</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center text-slate-400 font-medium italic">
                                            There are no records found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case "Benefits Information":
                return (
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <h3 className={sectionCls}>Benefits Information</h3>
                        <div className="border border-border-main rounded-xl overflow-hidden shadow-xs">
                            <table className="premium-table">
                                <thead className="bg-secondary/40 border-b border-border-main text-slate-400 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-2.5 px-4">Benefit Type</th>
                                        <th className="py-2.5 px-4">Carrier</th>
                                        <th className="py-2.5 px-4">Coverage Amount</th>
                                        <th className="py-2.5 px-4">Active</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-slate-400 font-medium italic">
                                            There are no records found.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-main/70 rounded-2xl bg-secondary/10">
                        <h4 className="font-extrabold text-xs text-primary mb-1 uppercase tracking-wider">{activeSection}</h4>
                        <p className="text-xs text-slate-400 max-w-sm mt-1">No additional settings or records are defined for this section in the customer folder.</p>
                    </div>
                );
        }
    };

    // ═══════════════════════════════════════════════════════════
    //  RENDER
    // ═══════════════════════════════════════════════════════════
    return (
        <div className="flex flex-col bg-bg-base h-screen overflow-hidden font-sans select-none text-text-main">

            {/* Breadcrumbs Sub-band */}
            <div className="bg-white border-b border-border-main h-10 flex items-center justify-between px-6 shrink-0 select-none">
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                    <span>Customer</span>
                    <span className="text-slate-300 font-medium">/</span>
                    <span className="text-primary">Customer Setup (New)</span>
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    {f.division || "Gamaty Insurance Agency"}
                </span>
            </div>

            {/* Title Bar */}
            <div className="bg-white border-b border-border-main px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className="page-title">
                        {editId ? "Edit Customer Properties" : "New Customer Setup"}
                    </h1>
                </div>
                <div className="text-xs text-slate-400 font-bold tracking-wider">
                    v1.0.0
                </div>
            </div>

            {/* Actions Toolbar */}
            <div className="bg-white border-b border-border-main px-6 py-3 flex items-center gap-2.5 shrink-0 shadow-sm">
                <button
                    type="submit"
                    form="customer-form"
                    disabled={saving}
                    className="h-8 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] border shadow-sm bg-white border-border-main text-text-main hover:bg-secondary/60 hover:text-primary"
                >
                    {editId ? "Update Folder" : "Save Folder"}
                </button>
                <button
                    type="submit"
                    form="customer-form"
                    disabled={saving}
                    className="h-8 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] border shadow-sm bg-primary border-primary text-white shadow-primary/20 hover:bg-primary/95"
                >
                    {editId ? "Update and Close" : "Save and Close"}
                </button>
                <button
                    type="button"
                    onClick={() => router.push("/agency/dashboard")}
                    disabled={saving}
                    className="h-8 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] border shadow-sm bg-white border-border-main text-text-main hover:bg-secondary/60 hover:text-primary"
                >
                    Exit Folder
                </button>
                <button
                    type="button"
                    onClick={() => set({ status: "Inactive" })}
                    disabled={saving}
                    className="h-8 px-3.5 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98] border shadow-sm bg-white border-border-main text-text-main hover:bg-secondary/60 hover:text-primary"
                >
                    Make Inactive
                </button>
            </div>

            {/* Global Error Feedback Card */}
            {error && (
                <div className="bg-danger/5 border-b border-danger/20 text-danger px-6 py-3 flex items-center gap-3 shrink-0 animate-in slide-in-from-top-2 duration-200">
                    <Info className="size-5 text-danger shrink-0" />
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-danger">Validation Error</p>
                        <p className="text-[11px] font-semibold text-danger/80">{error}</p>
                    </div>
                </div>
            )}

            {/* Flex Container for Sidebar + Form Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Form Sections Sidebar */}
                <div className="w-64 bg-white border-r border-border-main flex flex-col shrink-0 select-none">
                    <div className="px-5 py-4 border-b border-border-main bg-secondary/35 shrink-0">
                        <span className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400">Form Sections</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {sections.map(sec => {
                            const isActive = activeSection === sec;
                            return (
                                <button
                                    key={sec}
                                    type="button"
                                    onClick={() => setActiveSection(sec)}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-between group ${isActive
                                        ? "bg-primary text-white font-bold shadow-md shadow-primary/25"
                                        : "text-text-main hover:bg-secondary/55 hover:text-primary border border-transparent hover:border-border-main/50"
                                        }`}
                                >
                                    <span>{sec}</span>
                                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Form Content Area */}
                <form
                    id="customer-form"
                    onSubmit={(e: any) => {
                        e.preventDefault();
                        const submitter = e.nativeEvent.submitter;
                        const isClose = submitter?.innerText.includes("Close");
                        handleSave(isClose);
                    }}
                    className="flex-1 overflow-y-auto p-6 md:p-8 bg-bg-base"
                >
                    <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-border-main p-6 md:p-8 shadow-sm">
                        {renderSectionContent()}
                    </div>
                </form>
            </div>

        </div>
    );
}
