/* eslint-disable */
"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info, Plus, Trash2, CheckCircle2, FileText, ChevronDown, ArrowLeft, MapPin, Loader2, Sparkles, X } from "lucide-react";
import { API_BASE_URL } from "../../../lib/config";
import { showToast } from "@/components/ToastProvider";

// Complete US State & Territory codes and names
const STATE_CODE_TO_NAME: Record<string, string> = {
  AA: "Armed Forces Americas",
  AE: "Armed Forces Europe",
  AK: "Alaska",
  AL: "Alabama",
  AP: "Armed Forces Pacific",
  AR: "Arkansas",
  AS: "American Samoa",
  AZ: "Arizona",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DC: "District of Columbia",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  GU: "Guam",
  HI: "Hawaii",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  MA: "Massachusetts",
  MD: "Maryland",
  ME: "Maine",
  MI: "Michigan",
  MN: "Minnesota",
  MO: "Missouri",
  MP: "Northern Mariana Islands",
  MS: "Mississippi",
  MT: "Montana",
  NC: "North Carolina",
  ND: "North Dakota",
  NE: "Nebraska",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NV: "Nevada",
  NY: "New York",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  PR: "Puerto Rico",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VA: "Virginia",
  VI: "Virgin Islands",
  VT: "Vermont",
  WA: "Washington",
  WI: "Wisconsin",
  WV: "West Virginia",
  WY: "Wyoming",
};

const STATE_NAME_TO_CODE: Record<string, string> = Object.entries(STATE_CODE_TO_NAME).reduce(
  (acc, [code, name]) => {
    acc[name.toLowerCase()] = code;
    acc[code.toLowerCase()] = code;
    return acc;
  },
  {} as Record<string, string>
);

const US_STATES = Object.keys(STATE_CODE_TO_NAME).sort();

function findStateCode(val: string): string {
  if (!val) return "";
  const clean = val.trim();
  if (clean.length === 2) return clean.toUpperCase();
  return STATE_NAME_TO_CODE[clean.toLowerCase()] || clean.toUpperCase();
}

// ─── Sterling Style Tokens ───────────────────────────────────
const inputCls =
    "h-[40px] px-3.5 border border-[#D1D5DB] rounded bg-white text-sm text-[#1F2937] placeholder-[#9CA3AF] transition-colors outline-none focus:border-[#7A6F64] focus:ring-1 focus:ring-[#7A6F64] w-full disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]";

const selectCls =
    "h-[40px] px-3.5 border border-[#D1D5DB] rounded bg-white text-sm text-[#1F2937] transition-colors outline-none focus:border-[#7A6F64] focus:ring-1 focus:ring-[#7A6F64] w-full bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_10px_center] bg-no-repeat pr-9 appearance-none";

const checkCls =
    "accent-[#7A6F64] w-[18px] h-[18px] rounded border-[#D1D5DB] cursor-pointer shrink-0";

// Clean Sterling Card with solid taupe header and expandable accordion dropdown
function SectionCard({
    title,
    children,
    isOpen = true,
    onToggle,
    className = ""
}: {
    title: string;
    children: React.ReactNode;
    isOpen?: boolean;
    onToggle?: () => void;
    className?: string;
}) {
    return (
        <div className={`bg-white border border-[#D9D5D0] rounded shadow-sm overflow-hidden transition-all duration-200 ${className}`}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full bg-[#7A6F64] hover:bg-[#6e6358] active:bg-[#63594e] text-white px-6 py-3.5 font-semibold text-[15px] tracking-wide flex items-center justify-between cursor-pointer transition-colors text-left select-none"
            >
                <span>{title}</span>
                <ChevronDown
                    className={`size-5 text-white/90 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>
            {isOpen && (
                <div className="p-6 sm:p-8 space-y-4 bg-white animate-in slide-in-from-top-1 fade-in duration-200">
                    {children}
                </div>
            )}
        </div>
    );
}

// Clean Form Row (Label on Left, Control on Right matching Sterling Form)
function FormRow({
    label,
    required,
    error,
    children,
    className = ""
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5 border-b border-[#F3F4F6] last:border-b-0 ${className}`}>
            <label className="sm:col-span-5 text-sm font-medium text-[#1F2937]">
                {label}{required && <span className="text-red-500 ml-1 font-bold">*</span>}
            </label>
            <div className="sm:col-span-7 flex flex-col">
                {React.isValidElement(children)
                    ? React.cloneElement(children as any, {
                        className: `${(children.props as any).className || ""} ${error ? "!border-red-500 focus:!ring-red-500/20 focus:!border-red-500" : ""
                            }`
                    })
                    : children}
                {error && <span className="text-xs text-red-600 font-medium mt-1">{error}</span>}
            </div>
        </div>
    );
}

// Helper to format US phone numbers: (123) 456-7890
function formatUSPhone(val: string): string {
    if (!val) return "";
    let digits = val.replace(/\D/g, "");
    if (digits.length > 10 && digits.startsWith("1")) {
        digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    if (!digits) return "";
    if (digits.length < 4) return `(${digits}`;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

// Inline Phone Row matching Sterling Form layout
function PhoneRow({
    label,
    value,
    required,
    error,
    onChange,
}: {
    label: string;
    value: string;
    ext?: string;
    required?: boolean;
    error?: string;
    onChange: (v: string) => void;
    onExtChange?: (v: string) => void;
}) {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = formatUSPhone(raw);
        onChange(formatted);
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5 border-b border-[#F3F4F6] last:border-b-0">
            <label className={`sm:col-span-5 text-sm font-medium ${error ? "text-red-600 font-semibold" : "text-[#1F2937]"}`}>
                {label}:{required && <span className="text-red-500 ml-1 font-bold">*</span>}
            </label>
            <div className="sm:col-span-7 flex flex-col">
                <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    className={`h-[40px] px-3.5 border border-[#D1D5DB] rounded bg-white text-sm text-[#1F2937] placeholder-[#9CA3AF] transition-colors outline-none focus:border-[#7A6F64] focus:ring-1 focus:ring-[#7A6F64] w-full ${error ? "!border-red-500 focus:!ring-red-500/20 focus:!border-red-500" : ""}`}
                    value={formatUSPhone(value || "")}
                    onChange={handlePhoneChange}
                />
                {error && <span className="text-xs text-red-600 font-medium mt-1">{error}</span>}
            </div>
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
    division: "CapCo Insurance Agency", branch: "", department: "",

    // Phone Numbers
    phoneResidence: "", phoneResidenceExt: "", phoneBusiness: "", phoneBusinessExt: "",
    fax: "", faxExt: "", cell: "", cellExt: "", pager: "", pagerExt: "", phoneOther: "", phoneOtherExt: "",

    // Internet
    email2: "", web: "",

    // Address extras
    address2: "", country: "US", county: "", latitude: "", longitude: "", altAddressBilling: false,

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

    // Multiple Entity
    multipleEntityCustomerType: "Standard",
    // International Phone 1
    intlPhone1Type: "", intlPhone1CountryCode: "", intlPhone1Number: "", intlPhone1Ext: "",
    // International Phone 2
    intlPhone2Type: "", intlPhone2CountryCode: "", intlPhone2Number: "", intlPhone2Ext: "",

    // Additional Customer Information
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
    out.country = f.country || "US";
    out.customer_added_date = f.customerAddedDate || new Date().toISOString().split("T")[0];

    // Ensure the primary 'phone' field is populated for the dashboard table
    if (!out.phone) {
        out.phone = f.cell || f.phoneBusiness || f.phoneResidence || f.phoneOther || null;
    }

    return out;
}

// ═══════════════════════════════════════════════════════════
//  PAGE COMPONENT (Clean Single Page Form)
// ═══════════════════════════════════════════════════════════
function NewCustomerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams?.get("edit");
    const [currentEditId, setCurrentEditId] = useState<string | null>(editId || null);
    const [pageLoading, setPageLoading] = useState(!!editId);

    const [f, setF] = useState<FormState>({ ...defaultForm });

    useEffect(() => {
        if (editId) {
            setCurrentEditId(editId);
        }
    }, [editId]);

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

    // Collapsible sections state
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        "Application Information": true,
        "Addresses": false,
        "Agency Personnel & Business Unit": false,
        "Contact Information": false,
        "Business with Agency & Policy Checks": false,
        "Additional Customer Information": false,
        "Service Groups": false,
        "Contacts": false,
    });

    const toggleSection = (title: string) => {
        setOpenSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }));
    };

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

    // ── Smarty Address Autocomplete ──
    const addressInputRef = useRef<HTMLInputElement>(null);
    const suggestionRef = useRef<HTMLDivElement>(null);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);

    const handleAddressSearch = async (value: string) => {
        set({ address: value });
        if (value.length < 3) {
            setAddressSuggestions([]);
            setShowSuggestions(false);
            return;
        }
        setAddressLoading(true);
        try {
            const res = await fetch(`/api/address/autocomplete?search=${encodeURIComponent(value)}`);
            const data = await res.json();
            setAddressSuggestions(data.suggestions || []);
            setShowSuggestions(true);
        } catch (err) {
            console.error("Address search error:", err);
        } finally {
            setAddressLoading(false);
        }
    };

    const handleSelectSuggestion = (suggestion: any) => {
        const stateCode = findStateCode(suggestion.state || "");
        const streetAddress = `${suggestion.street_line || ""}`.trim();

        set({
            address: streetAddress,
            address2: suggestion.secondary || "",
            city: suggestion.city || "",
            zip: suggestion.zipcode || "",
            state: stateCode,
            country: "US"
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next.address;
            delete next.city;
            delete next.state;
            delete next.zip;
            delete next.country;
            return next;
        });
        setAddressSuggestions([]);
        setShowSuggestions(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                suggestionRef.current &&
                !suggestionRef.current.contains(e.target as Node) &&
                addressInputRef.current &&
                !addressInputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        // if (!f.representative?.trim()) newErrors.representative = "Representative is required";
        if (!f.division?.trim()) newErrors.division = "Division is required";
        if (!f.branch?.trim()) newErrors.branch = "Branch is required";
        if (!f.department?.trim()) newErrors.department = "Department is required";
        // if (!f.customerAddedDate?.trim()) newErrors.customerAddedDate = "Customer Added Date is required";

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
            setError("Please fill out all required fields before submitting.");
            setOpenSections(prev => ({
                ...prev,
                "Application Information": prev["Application Information"] || !!(newErrors.firmName || newErrors.firstName || newErrors.lastName),
                "Addresses": prev["Addresses"] || !!(newErrors.address || newErrors.city || newErrors.state || newErrors.country || newErrors.zip),
                "Agency Personnel & Business Unit": prev["Agency Personnel & Business Unit"] || !!(newErrors.executive || newErrors.representative || newErrors.division || newErrors.branch || newErrors.department),
                "Contact Information": prev["Contact Information"] || !!(newErrors.cell || newErrors.email),
                "Business with Agency & Policy Checks": prev["Business with Agency & Policy Checks"] || !!newErrors.customerAddedDate,
            }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload(f);
            const isEdit = !!currentEditId;
            const url = isEdit ? `${API_BASE_URL}/api/customers/${currentEditId}` : `${API_BASE_URL}/api/customers/`;
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
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            const data = await res.json().catch(() => ({}));
            const customerId = data?.id || data?._id || currentEditId || editId;

            if (andClose) {
                showToast(isEdit ? "Customer updated successfully!" : "Customer created successfully!", "success");
                if (customerId) {
                    router.push(`/agency/customer/${customerId}`);
                } else {
                    router.push("/agency/dashboard");
                }
            } else {
                showToast(isEdit ? "Customer updated successfully!" : "Customer saved successfully!", "success");
                if (!isEdit && customerId) {
                    setCurrentEditId(String(customerId));
                    window.history.replaceState(null, "", `/agency/new-customer?edit=${customerId}`);
                }
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while saving the customer.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSaving(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#7A6F64] mb-3"></div>
                <p className="text-sm font-semibold text-[#7A6F64]">Loading customer data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F7F6F4] text-[#1F2937] py-8 px-4 sm:px-6 lg:px-8 font-sans">

            {/* Top Breadcrumb & Title Section */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-2">
                    <span className="font-medium text-[#4B5563]">Customer</span>
                    <span className="text-[#D9D5D0]">/</span>
                    <span className="text-[#7A6F64] font-semibold">{editId ? "Edit Customer Properties" : "New Customer Setup"}</span>
                </div>
                <div className="flex items-center justify-between border-b border-[#E5E2DE] pb-4">
                    <div className="flex items-center gap-3.5">
                        <button
                            type="button"
                            onClick={() => router.push("/agency/dashboard")}
                            className="size-9 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#D9D5D0] flex items-center justify-center text-[#7A6F64] hover:text-[#2d2a26] transition-all shadow-xs cursor-pointer shrink-0 group active:scale-95"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft className="size-4.5 transition-transform group-hover:-translate-x-0.5" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">
                                {editId ? "Edit Customer Properties" : "New Customer Setup"}
                            </h1>
                            <p className="text-xs text-[#6B7280] mt-1">
                                Complete customer profile, contact information, and business unit details.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Validation Error Feedback Alert */}
                {error && (
                    <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded text-[#991B1B] p-4 mt-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
                        <Info className="size-5 text-[#DC2626] shrink-0" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#991B1B]">Validation Error</p>
                            <p className="text-xs font-medium text-[#B91C1C] mt-0.5">{error}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Single Page Form */}
            <form id="customer-form" onSubmit={(e: any) => { e.preventDefault(); }} className="max-w-4xl mx-auto space-y-8">

                {/* ── CARD 1: Application Information ── */}
                <SectionCard
                    title="Application Information"
                    isOpen={openSections["Application Information"]}
                    onToggle={() => toggleSection("Application Information")}
                >
                    {/* Customer Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5 border-b border-[#F3F4F6]">
                        <label className="sm:col-span-5 text-sm font-medium text-[#1F2937]">
                            Customer Type <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-7 flex flex-wrap gap-6">
                            {["Customer", "Prospect", "Suspect"].map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                    <input
                                        type="radio"
                                        name="customerType"
                                        className={checkCls}
                                        checked={f.customerType === t}
                                        onChange={() => set({ customerType: t })}
                                    />
                                    <span>{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Settings (Commented Out) */}
                    {/* <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5 border-b border-[#F3F4F6]">
                        <label className="sm:col-span-5 text-sm font-medium text-[#1F2937]">
                            Settings
                        </label>
                        <div className="sm:col-span-7 flex flex-wrap gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                <input
                                    type="checkbox"
                                    className={checkCls}
                                    checked={f.excludeTargetList}
                                    onChange={e => set({ excludeTargetList: e.target.checked })}
                                />
                                <span>Exclude from target list</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                <input
                                    type="checkbox"
                                    className={checkCls}
                                    checked={f.excludePurge}
                                    onChange={e => set({ excludePurge: e.target.checked })}
                                />
                                <span>Exclude from Purge</span>
                            </label>
                        </div>
                    </div> */}

                    {/* Entity Classification */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5 border-b border-[#F3F4F6]">
                        <label className="sm:col-span-5 text-sm font-medium text-[#1F2937]">
                            Entity Classification <span className="text-red-500 font-bold">*</span>
                        </label>
                        <div className="sm:col-span-7 flex flex-wrap gap-6">
                            {["Individual", "Business"].map(t => (
                                <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                    <input
                                        type="radio"
                                        name="nameType"
                                        className={checkCls}
                                        checked={f.nameType === t}
                                        onChange={() => set({ nameType: t })}
                                    />
                                    <span>{t}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* First Name & Last Name (or Company Name) */}
                    <FormRow label="First Name" required={f.nameType !== "Business"} error={errors.firstName}>
                        <input className={inputCls} value={f.firstName} onChange={e => set({ firstName: e.target.value })} />
                    </FormRow>

                    <FormRow label="Last Name" required={f.nameType !== "Business"} error={errors.lastName}>
                        <input className={inputCls} value={f.lastName} onChange={e => set({ lastName: e.target.value })} />
                    </FormRow>

                    <FormRow label="Company Name" required={f.nameType === "Business"} error={errors.firmName}>
                        <input className={inputCls} value={f.firmName} onChange={e => set({ firmName: e.target.value })} />
                    </FormRow>

                    {/*
                    <FormRow label="DBA">
                        <input className={inputCls} value={f.dba} onChange={e => set({ dba: e.target.value })} />
                    </FormRow>

                    <FormRow label="Formal Salutation">
                        <input className={inputCls} value={f.formalSalutation} onChange={e => set({ formalSalutation: e.target.value })} />
                    </FormRow>

                    <FormRow label="Informal Salutation">
                        <input className={inputCls} value={f.informalSalutation} onChange={e => set({ informalSalutation: e.target.value })} />
                    </FormRow>

                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5">
                        <div className="sm:col-start-6 sm:col-span-7">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                <input
                                    type="checkbox"
                                    className={checkCls}
                                    checked={f.altNameBilling}
                                    onChange={e => set({ altNameBilling: e.target.checked })}
                                />
                                <span>Use alternate name for billing</span>
                            </label>
                        </div>
                    </div>
                    */}
                </SectionCard>

                {/* ── CARD 2: Addresses ── */}
                <SectionCard
                    title="Addresses"
                    isOpen={openSections["Addresses"]}
                    onToggle={() => toggleSection("Addresses")}
                >
                    <FormRow label="Address" required error={errors.address}>
                        <div className="relative">
                            <input
                                ref={addressInputRef}
                                type="text"
                                value={f.address}
                                onChange={(e) => handleAddressSearch(e.target.value)}
                                className={inputCls}
                                placeholder="Start typing address..."
                                autoComplete="off"
                            />

                            {/* Loading */}
                            {addressLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Searching...</div>
                            )}

                            {/* Dropdown */}
                            {showSuggestions && addressSuggestions.length > 0 && (
                                <div
                                    ref={suggestionRef}
                                    className="absolute z-50 w-full bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-60 overflow-y-auto"
                                >
                                    {addressSuggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            onMouseDown={() => handleSelectSuggestion(suggestion)}
                                            className="px-4 py-3 hover:bg-[#f5f2ef] cursor-pointer text-sm border-b border-gray-100 last:border-0"
                                        >
                                            <span className="font-medium">{suggestion.street_line} {suggestion.secondary}</span>
                                            <span className="text-gray-500 ml-1">{suggestion.city}, {suggestion.state} {suggestion.zipcode}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormRow>

                    <FormRow label="Address 2">
                        <input className={inputCls} value={f.address2} onChange={e => set({ address2: e.target.value })} />
                    </FormRow>

                    <FormRow label="City" required error={errors.city}>
                        <input className={inputCls} value={f.city} onChange={e => set({ city: e.target.value })} />
                    </FormRow>

                    <FormRow label="State" required error={errors.state}>
                        <select
                            className={selectCls}
                            value={findStateCode(f.state) || f.state}
                            onChange={e => {
                                set({ state: e.target.value });
                                if (errors.state) {
                                    setErrors(prev => {
                                        const next = { ...prev };
                                        delete next.state;
                                        return next;
                                    });
                                }
                            }}
                        >
                            <option value="">-- Select State --</option>
                            {US_STATES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                            {f.state && !US_STATES.includes(f.state) && !US_STATES.includes(findStateCode(f.state)) && (
                                <option value={f.state}>{f.state}</option>
                            )}
                        </select>
                    </FormRow>

                    <FormRow label="Country" required error={errors.country}>
                        <select
                            className={`${selectCls} disabled:bg-[#F3F4F6] disabled:text-[#4B5563] disabled:cursor-not-allowed`}
                            value={f.country || "US"}
                            disabled
                        >
                            <option value="US">US</option>
                        </select>
                    </FormRow>

                    <FormRow label="ZIP Code" required error={errors.zip}>
                        <input className={inputCls} value={f.zip} onChange={e => set({ zip: e.target.value })} />
                    </FormRow>

                    {/*
                    <FormRow label="County">
                        <input className={inputCls} value={f.county} onChange={e => set({ county: e.target.value })} />
                    </FormRow>

                    <FormRow label="Latitude">
                        <input className={inputCls} value={f.latitude} onChange={e => set({ latitude: e.target.value })} />
                    </FormRow>

                    <FormRow label="Longitude">
                        <input className={inputCls} value={f.longitude} onChange={e => set({ longitude: e.target.value })} />
                    </FormRow>

                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5">
                        <div className="sm:col-start-6 sm:col-span-7">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                <input
                                    type="checkbox"
                                    className={checkCls}
                                    checked={f.altAddressBilling}
                                    onChange={e => set({ altAddressBilling: e.target.checked })}
                                />
                                <span>Use alternate address for billing</span>
                            </label>
                        </div>
                    </div>
                    */}
                </SectionCard>

                {/* ── CARD 3: Agency Personnel & Business Unit ── */}
                <SectionCard
                    title="Agency Personnel & Business Unit"
                    isOpen={openSections["Agency Personnel & Business Unit"]}
                    onToggle={() => toggleSection("Agency Personnel & Business Unit")}
                >
                    <FormRow label="Executive" required error={errors.executive}>
                        <select className={selectCls} value={f.executive} onChange={e => set({ executive: e.target.value })}>
                            <option value="">Select Executive</option>
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
                    </FormRow>

                    {/* Representative (Commented Out) */}
                    {/* <FormRow label="Representative" required error={errors.representative}>
                        <select className={selectCls} value={f.representative} onChange={e => set({ representative: e.target.value })}>
                            <option value="">Select Representative</option>
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
                    </FormRow> */}

                    {/*
                    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-3 py-2.5 border-b border-[#F3F4F6]">
                        <div className="sm:col-start-6 sm:col-span-7">
                            <label className="flex items-center gap-2 cursor-pointer text-sm text-[#1F2937]">
                                <input
                                    type="checkbox"
                                    className={checkCls}
                                    checked={f.brokersCustomer}
                                    onChange={e => set({ brokersCustomer: e.target.checked })}
                                />
                                <span>Broker&apos;s Customer</span>
                            </label>
                        </div>
                    </div>

                    <FormRow label="Broker">
                        <select className={selectCls} value={f.broker} onChange={e => set({ broker: e.target.value })}>
                            <option value="">-- None --</option>
                        </select>
                    </FormRow>
                    */}

                    <FormRow label="Division" required error={errors.division}>
                        <select className={selectCls} value={f.division} onChange={e => set({ division: e.target.value })}>
                            <option value="CapCo Insurance Agency">CapCo Insurance Agency</option>
                        </select>
                    </FormRow>

                    <FormRow label="Branch" required error={errors.branch}>
                        <select className={selectCls} value={f.branch} onChange={e => set({ branch: e.target.value })}>
                            <option value="">Select Branch</option>
                            <option value="Armar Insurance">Armar Insurance</option>
                            <option value="CapCo Florida">CapCo Florida</option>
                            <option value="Capital & Co">Capital & Co</option>
                            <option value="JMB - DO NOT SERVICE">JMB - DO NOT SERVICE</option>
                            <option value="Pregill Insurance">Pregill Insurance</option>
                            <option value="WCFL Insurance Services">WCFL Insurance Services</option>
                        </select>
                    </FormRow>

                    <FormRow label="Department" required error={errors.department}>
                        <select className={selectCls} value={f.department} onChange={e => set({ department: e.target.value })}>
                            <option value="">Select Department</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Health">Health</option>
                            <option value="Personal">Personal</option>
                        </select>
                    </FormRow>
                </SectionCard>

                {/* ── CARD 4: Contact Information ── */}
                <SectionCard
                    title="Contact Information"
                    isOpen={openSections["Contact Information"]}
                    onToggle={() => toggleSection("Contact Information")}
                >
                    <PhoneRow
                        label="Cell Phone"
                        value={f.cell}
                        ext={f.cellExt}
                        required
                        error={errors.cell}
                        onChange={v => set({ cell: v })}
                        onExtChange={v => set({ cellExt: v })}
                    />
                    {/*
                    <PhoneRow
                        label="Business Phone"
                        value={f.phoneBusiness}
                        ext={f.phoneBusinessExt}
                        onChange={v => set({ phoneBusiness: v })}
                        onExtChange={v => set({ phoneBusinessExt: v })}
                    />
                    <PhoneRow
                        label="Other Phone"
                        value={f.phoneOther}
                        ext={f.phoneOtherExt}
                        onChange={v => set({ phoneOther: v })}
                        onExtChange={v => set({ phoneOtherExt: v })}
                    />
                    */}

                    <FormRow label="Primary Email" required error={errors.email}>
                        <input type="email" className={inputCls} value={f.email} onChange={e => set({ email: e.target.value })} />
                    </FormRow>

                    {/*
                    <FormRow label="Alternate Email">
                        <input type="email" className={inputCls} value={f.email2} onChange={e => set({ email2: e.target.value })} />
                    </FormRow>

                    <FormRow label="Website">
                        <input className={inputCls} value={f.web} onChange={e => set({ web: e.target.value })} />
                    </FormRow>

                    <FormRow label="Preferred Method of Distribution">
                        <select className={selectCls} value={f.preferredDistribution} onChange={e => set({ preferredDistribution: e.target.value })}>
                            <option value="">-- Select Method --</option>
                            <option value="Mail">Mail</option>
                            <option value="Email">Email</option>
                            <option value="Fax">Fax</option>
                        </select>
                    </FormRow>
                    */}
                </SectionCard>

                {/* ── CARD 5: Business with Agency & Policy Checks (Commented Out) ── */}
                {/* <SectionCard
                    title="Business with Agency & Policy Checks"
                    isOpen={openSections["Business with Agency & Policy Checks"]}
                    onToggle={() => toggleSection("Business with Agency & Policy Checks")}
                >
                    <FormRow label="Acquisition">
                        <select className={selectCls} value={f.acquisition} onChange={e => set({ acquisition: e.target.value })}>
                            <option value="">-- Select Acquisition --</option>
                            <option value="Direct">Direct</option>
                            <option value="Referral">Referral</option>
                            <option value="Web">Web</option>
                        </select>
                    </FormRow>

                    <FormRow label="Business Origin">
                        <select className={selectCls} value={f.businessOrigin} onChange={e => set({ businessOrigin: e.target.value })}>
                            <option value="">-- Select Origin --</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Call">Call</option>
                            <option value="Online">Online</option>
                        </select>
                    </FormRow>

                    <FormRow label="Customer Added Date" required error={errors.customerAddedDate}>
                        <input type="date" className={inputCls} value={f.customerAddedDate} onChange={e => set({ customerAddedDate: e.target.value })} />
                    </FormRow>

                    <div className="py-3 border-b border-[#F3F4F6] space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#1F2937]">
                            <input
                                type="checkbox"
                                className={checkCls}
                                checked={f.autoCheckPolicies}
                                onChange={e => set({ autoCheckPolicies: e.target.checked })}
                            />
                            <span>Automatically check based on active policies</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                            {([
                                ["checkPersonal", "Personal"],
                                ["checkHealth", "Health"],
                                ["checkCommercial", "Commercial"],
                                ["checkNonPc", "Non P&C"],
                                ["checkLife", "Life"],
                                ["checkFinancial", "Financial Services"],
                                ["checkBenefits", "Benefits"],
                            ] as [keyof FormState, string][]).map(([key, label]) => (
                                <label key={key} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-[#F9FAFB] transition-colors">
                                    <input
                                        type="checkbox"
                                        className={checkCls}
                                        checked={!!f[key]}
                                        onChange={e => set({ [key]: e.target.checked } as any)}
                                    />
                                    <span className="text-xs sm:text-sm text-[#1F2937] font-medium">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 space-y-3">
                        <label className="text-sm font-semibold text-[#1F2937] block">International Phone 1</label>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F9FAFB] p-4 rounded border border-[#E5E2DE]">
                            <div>
                                <span className="text-xs text-[#6B7280] block mb-1">Type</span>
                                <select className={selectCls} value={f.intlPhone1Type} onChange={e => set({ intlPhone1Type: e.target.value })}>
                                    <option value=""> </option>
                                    <option value="Business">Business</option>
                                    <option value="Cell">Cell</option>
                                    <option value="Fax">Fax</option>
                                    <option value="Other">Other</option>
                                    <option value="Pager">Pager</option>
                                    <option value="Residence">Residence</option>
                                </select>
                            </div>
                            <div>
                                <span className="text-xs text-[#6B7280] block mb-1">Country Code</span>
                                <input className={inputCls} placeholder="e.g. +1" value={f.intlPhone1CountryCode} onChange={e => set({ intlPhone1CountryCode: e.target.value })} />
                            </div>
                            <div className="sm:col-span-2">
                                <span className="text-xs text-[#6B7280] block mb-1">Number & Ext</span>
                                <div className="flex items-center gap-2">
                                    <input className={inputCls} placeholder="Phone number" value={f.intlPhone1Number} onChange={e => set({ intlPhone1Number: e.target.value })} />
                                    <input className={`${inputCls} w-20 text-center`} placeholder="Ext" value={f.intlPhone1Ext} onChange={e => set({ intlPhone1Ext: e.target.value })} />
                                </div>
                            </div>
                        </div>
                    </div>
                </SectionCard> */}

                {/* ── CARD 6: Additional Customer Information (Commented Out) ── */}
                {/* <SectionCard
                    title="Additional Customer Information"
                    isOpen={openSections["Additional Customer Information"]}
                    onToggle={() => toggleSection("Additional Customer Information")}
                >
                    <FormRow label="SSN">
                        <input className={inputCls} value={f.ssn} onChange={e => set({ ssn: e.target.value })} />
                    </FormRow>

                    <FormRow label="Marital Status">
                        <select className={selectCls} value={f.maritalStatus} onChange={e => set({ maritalStatus: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </FormRow>

                    <FormRow label="Education Level">
                        <select className={selectCls} value={f.educationLevel} onChange={e => set({ educationLevel: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="High School">High School</option>
                            <option value="Associate Degree">Associate Degree</option>
                            <option value="Bachelor's Degree">Bachelor&apos;s Degree</option>
                            <option value="Master's Degree">Master&apos;s Degree</option>
                            <option value="Doctorate">Doctorate</option>
                        </select>
                    </FormRow>

                    <FormRow label="Date of Birth">
                        <input type="date" className={inputCls} value={f.dateOfBirth} onChange={e => set({ dateOfBirth: e.target.value })} />
                    </FormRow>

                    <FormRow label="Drivers License">
                        <input className={inputCls} value={f.driversLicense} onChange={e => set({ driversLicense: e.target.value })} />
                    </FormRow>

                    <FormRow label="Occupation">
                        <input className={inputCls} value={f.occupation} onChange={e => set({ occupation: e.target.value })} />
                    </FormRow>

                    <FormRow label="Year Employed">
                        <input className={inputCls} value={f.yearEmployed} onChange={e => set({ yearEmployed: e.target.value })} />
                    </FormRow>

                    <FormRow label="Agency Business Classification">
                        <select className={selectCls} value={f.agencyBusinessClassification} onChange={e => set({ agencyBusinessClassification: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="Agriculture">Agriculture</option>
                            <option value="Construction">Construction</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Retail Trade">Retail Trade</option>
                            <option value="Finance & Insurance">Finance & Insurance</option>
                            <option value="Services">Services</option>
                        </select>
                    </FormRow>

                    <FormRow label="Business Entity">
                        <select className={selectCls} value={f.businessEntity} onChange={e => set({ businessEntity: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="Individual">Individual</option>
                            <option value="Partnership">Partnership</option>
                            <option value="Corporation">Corporation</option>
                            <option value="LLC">LLC</option>
                        </select>
                    </FormRow>

                    <FormRow label="In Business Since">
                        <input className={inputCls} placeholder="e.g. 2004" value={f.inBusinessSince} onChange={e => set({ inBusinessSince: e.target.value })} />
                    </FormRow>

                    <FormRow label="GL Code #">
                        <input className={inputCls} value={f.glCode} onChange={e => set({ glCode: e.target.value })} />
                    </FormRow>

                    <FormRow label="Federal ID #">
                        <input className={inputCls} value={f.federalId} onChange={e => set({ federalId: e.target.value })} />
                    </FormRow>

                    <FormRow label="DUNS #">
                        <input className={inputCls} value={f.duns} onChange={e => set({ duns: e.target.value })} />
                    </FormRow>

                    <FormRow label="NAICS #">
                        <select className={selectCls} value={f.naics} onChange={e => set({ naics: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="524126">524126 - Direct Property & Casualty Insurance Carriers</option>
                            <option value="524210">524210 - Insurance Agencies and Brokerages</option>
                        </select>
                    </FormRow>

                    <FormRow label="NAICS Sub-Description">
                        <select className={selectCls} value={f.naicsSubDescription} onChange={e => set({ naicsSubDescription: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="Primary Agency">Primary Agency Operations</option>
                        </select>
                    </FormRow>

                    <FormRow label="SIC #">
                        <select className={selectCls} value={f.sic} onChange={e => set({ sic: e.target.value })}>
                            <option value="">-- Select --</option>
                            <option value="6411">6411 - Insurance Agents, Brokers & Service</option>
                        </select>
                    </FormRow>
                </SectionCard> */}

                {/* ── CARD 7: Service Groups (Commented Out) ── */}
                {/* <SectionCard
                    title="Service Groups"
                    isOpen={openSections["Service Groups"]}
                    onToggle={() => toggleSection("Service Groups")}
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E2DE]">
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
                                className="h-9 px-4 text-xs font-semibold rounded bg-[#7A6F64] hover:bg-[#5A4F44] text-white transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                                <Plus className="size-3.5" />
                                <span>New Group</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setServiceGroups([])}
                                disabled={serviceGroups.length === 0}
                                className="h-9 px-4 text-xs font-semibold rounded bg-white border border-[#D9D5D0] text-[#4B5563] hover:bg-[#FAFAF9] hover:text-[#1F2937] transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <Trash2 className="size-3.5" />
                                <span>Remove All</span>
                            </button>
                        </div>

                        <div className="border border-[#D9D5D0] rounded overflow-hidden shadow-xs bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#FAFAF9] border-b border-[#E5E2DE] text-[#4B5563] text-xs font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4 w-24">Type</th>
                                        <th className="py-3 px-4">Title</th>
                                        <th className="py-3 px-4">Name</th>
                                        <th className="py-3 px-4">Type of Business</th>
                                        <th className="py-3 px-4 text-center w-24">Primary</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E2DE] text-sm text-[#1F2937]">
                                    {serviceGroups.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-[#6B7280] italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        serviceGroups.map((group) => (
                                            <tr key={group.id} className="hover:bg-[#F7F6F4] transition-colors">
                                                <td className="py-3 px-4 text-[#6B7280] font-medium">{group.type}</td>
                                                <td className="py-3 px-4 font-medium">{group.title}</td>
                                                <td className="py-3 px-4">{group.name}</td>
                                                <td className="py-3 px-4">{group.businessType}</td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${group.primary ? "bg-[#7A6F64]/10 text-[#7A6F64] border border-[#7A6F64]/20" : "bg-[#F3F4F6] text-[#6B7280]"
                                                        }`}>
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
                </SectionCard> */}

                {/* ── CARD 8: Contacts (Commented Out) ── */}
                {/* <SectionCard
                    title="Contacts"
                    isOpen={openSections["Contacts"]}
                    onToggle={() => toggleSection("Contacts")}
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 pb-3 border-b border-[#E5E2DE]">
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
                                className="h-9 px-4 text-xs font-semibold rounded bg-[#7A6F64] hover:bg-[#5A4F44] text-white transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                            >
                                <Plus className="size-3.5" />
                                <span>New Contact</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setContacts([])}
                                disabled={contacts.length === 0}
                                className="h-9 px-4 text-xs font-semibold rounded bg-white border border-[#D9D5D0] text-[#4B5563] hover:bg-[#FAFAF9] hover:text-[#1F2937] transition-colors shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <Trash2 className="size-3.5" />
                                <span>Remove All</span>
                            </button>
                        </div>

                        <div className="border border-[#D9D5D0] rounded overflow-hidden shadow-xs bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#FAFAF9] border-b border-[#E5E2DE] text-[#4B5563] text-xs font-semibold uppercase tracking-wider">
                                    <tr>
                                        <th className="py-3 px-4">Name <span className="text-red-600">*</span></th>
                                        <th className="py-3 px-4">Title</th>
                                        <th className="py-3 px-4">Responsibilities</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E5E2DE] text-sm text-[#1F2937]">
                                    {contacts.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="py-10 text-center text-[#6B7280] italic">
                                                There are no records found.
                                            </td>
                                        </tr>
                                    ) : (
                                        contacts.map((contact) => (
                                            <tr key={contact.id} className="hover:bg-[#F7F6F4] transition-colors">
                                                <td className="py-3 px-4 font-semibold text-[#1F2937]">{contact.name}</td>
                                                <td className="py-3 px-4 text-[#4B5563]">{contact.title}</td>
                                                <td className="py-3 px-4 text-[#4B5563]">{contact.responsibilities}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </SectionCard> */}

                {/* ── CARD 9: Bottom Actions (Exact Sterling 3-button layout matching Screenshot 3) ── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-16 border-t border-[#D9D5D0]">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Return to Dashboard (= Exit Folder) */}
                        <button
                            type="button"
                            onClick={() => router.push("/agency/dashboard")}
                            className="w-full sm:w-auto h-11 px-5 text-sm font-medium rounded border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-xs cursor-pointer"
                        >
                            Exit To Folder
                        </button>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        {/* Save Folder */}
                        <button
                            type="button"
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="w-full sm:w-auto h-11 px-5 text-sm font-medium rounded border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span>Save Folder</span>
                        </button>

                        {/* Save And Close */}
                        <button
                            type="button"
                            onClick={() => handleSave(true)}
                            disabled={saving}
                            className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded bg-[#7A6F64] hover:bg-[#5A4F44] text-white transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
                        >
                            <CheckCircle2 className="size-4" />
                            <span>{saving ? "Saving..." : "Save And Close"}</span>
                        </button>
                    </div>
                </div>

            </form>

        </div>
    );
}

export default function NewCustomerPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-pulse text-[#7A6F64] font-semibold text-sm">Loading customer data...</div></div>}>
            <NewCustomerContent />
        </Suspense>
    );
}
