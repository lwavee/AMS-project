/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../lib/config";
import {
  Info,
  CheckCircle2,
  ChevronDown,
  ArrowLeft,
  Layers,
} from "lucide-react";
import {
  INSURANCE_PARENT_COMPANIES,
  INSURANCE_WRITING_COMPANIES,
  BROKERAGE_PARENT_COMPANIES,
  BROKERAGE_WRITING_COMPANIES,
} from "@/lib/insuranceCompanies";

// ─── Style Tokens ───────────────────────────────────────────
const inputCls =
  "h-[40px] px-3.5 border border-[#D1D5DB] rounded bg-white text-sm text-[#1F2937] placeholder-[#9CA3AF] transition-colors outline-none focus:border-[#7A6F64] focus:ring-1 focus:ring-[#7A6F64] w-full disabled:bg-[#F3F4F6] disabled:text-[#9CA3AF]";

const selectCls =
  "h-[40px] px-3.5 border border-[#D1D5DB] rounded bg-white text-sm text-[#1F2937] transition-colors outline-none focus:border-[#7A6F64] focus:ring-1 focus:ring-[#7A6F64] w-full bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%231F2937%22%20d%3D%22M5.293%207.293a1%201%200%20011.414%200L10%2010.586l3.293-3.293a1%201%200%20111.414%201.414l-4%204a1%201%200%2001-1.414%200l-4-4a1%201%200%20010-1.414z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px] bg-[right_10px_center] bg-no-repeat pr-9 appearance-none";

const checkCls =
  "accent-[#7A6F64] w-[18px] h-[18px] rounded border-[#D1D5DB] cursor-pointer shrink-0";

function SectionCard({
  title,
  children,
  isOpen = true,
  onToggle,
  className = "",
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
          className={`size-5 text-white/90 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
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

function FormRow({
  label,
  required,
  error,
  children,
  className = "",
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
            className: `${(children.props as any).className || ""} ${error ? "!border-red-500 focus:!ring-red-500/20 focus:!border-red-500" : ""}`
          })
          : children}
        {error && <span className="text-xs text-red-600 font-medium mt-1">{error}</span>}
      </div>
    </div>
  );
}

export default function NewSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Customer state loaded from API
  const [customerName, setCustomerName] = useState("Loading...");
  const [execDefault, setExecDefault] = useState("");
  const [repDefault, setRepDefault] = useState("");
  const [divisionDefault, setDivisionDefault] = useState("");

  // Form Fields State - Quote ID replaces Policy Number!
  const [quoteId, setQuoteId] = useState("");
  const [subEffDate, setSubEffDate] = useState("");

  const [effDate, setEffDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [isContinuous, setIsContinuous] = useState(false);
  const [isNotRenewable, setIsNotRenewable] = useState(false);
  const [issueState, setIssueState] = useState("FL");
  const [submissionStatus, setSubmissionStatus] = useState("Quoted");
  const [isReinsurance, setIsReinsurance] = useState(false);
  const [term, setTerm] = useState("12");

  const [businessType, setBusinessType] = useState("Commercial Lines");
  const [transaction, setTransaction] = useState("New submission");
  const [description, setDescription] = useState("New commercial quote submission");

  const [companyType, setCompanyType] = useState("Insurance");
  const [parentCompany, setParentCompany] = useState("Progressive");
  const [writingCompany, setWritingCompany] = useState("Progressive Casualty");

  const [division, setDivision] = useState("");
  const [branch, setBranch] = useState("");
  const [department, setDepartment] = useState("");

  const [billMethod, setBillMethod] = useState("Direct bill");
  const [payPlan, setPayPlan] = useState("Full Payment");

  const [executive, setExecutive] = useState("");
  const [representative, setRepresentative] = useState("");
  const [broker, setBroker] = useState("");
  const [totalPremium, setTotalPremium] = useState("");

  // Options
  const [includeNotes, setIncludeNotes] = useState(false);
  const [excludeLines, setExcludeLines] = useState(false);

  // Defaults Checkboxes
  const [defaultInsured, setDefaultInsured] = useState(true);
  const [defaultCoInsured, setDefaultCoInsured] = useState(true);
  const [defaultDba, setDefaultDba] = useState(true);
  const [defaultContacts, setDefaultContacts] = useState(true);

  // Notification / UI State
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Section Accordion State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Customer & Submission": true,
    "Submission Specifications": true,
    "Company Setup": true,
    "Billing & Agency Personnel": true,
  });

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Prepopulate Submission ID if empty
  useEffect(() => {
    if (!quoteId) {
      const rnd = Math.floor(1000 + Math.random() * 9000);
      setQuoteId(`SUB-${new Date().getFullYear()}-${rnd}`);
    }
    const today = new Date().toISOString().split("T")[0];
    if (!effDate) {
      setEffDate(today);
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setExpDate(nextYear.toISOString().split("T")[0]);
    }
  }, []);

  // Sync writing company when parent company or company type changes
  useEffect(() => {
    if (companyType === "Insurance") {
      const companies = (INSURANCE_WRITING_COMPANIES as any)[parentCompany];
      if (companies && companies.length > 0) {
        setWritingCompany(companies[0]);
      } else {
        setWritingCompany(parentCompany);
      }
    } else if (companyType === "Brokerage") {
      const companies = (BROKERAGE_WRITING_COMPANIES as any)[parentCompany];
      if (companies && companies.length > 0) {
        setWritingCompany(companies[0]);
      } else {
        setWritingCompany(parentCompany);
      }
    } else {
      setWritingCompany("Progressive Casualty");
    }
  }, [parentCompany, companyType]);

  // Fetch Customer details to prefill fields
  useEffect(() => {
    if (!customerId) return;
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const custName =
            data.firm_name ||
            data.firmName ||
            data.name ||
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            "Unknown Customer";
          setCustomerName(custName);
          if (data.executive) {
            setExecutive(data.executive);
            setExecDefault(data.executive);
          } else {
            setExecutive("Anatian, Yoav");
          }
          if (data.representative) {
            setRepresentative(data.representative);
            setRepDefault(data.representative);
          } else {
            setRepresentative("Parungao, Joana");
          }
          setDivision(data.division || "Gamaty Insurance Agency");
          setDivisionDefault(data.division || "Gamaty Insurance Agency");
          setBranch(data.branch || "Capital & Co");
          setDepartment(data.department || "Commercial");
        } else {
          setCustomerName("Unknown Customer");
          setExecutive("Anatian, Yoav");
          setRepresentative("Parungao, Joana");
        }
      } catch (err) {
        setCustomerName("Mock Customer");
        setExecutive("Anatian, Yoav");
        setRepresentative("Parungao, Joana");
      }
    };
    fetchCustomer();
  }, [customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!quoteId.trim()) {
      setError("Quote ID is required.");
      return;
    }
    if (!effDate) {
      setError("Effective Date is required.");
      return;
    }

    setIsLoading(true);

    const payload = {
      quote_id: quoteId.trim(),
      status: submissionStatus || "Quoted",
      term: term ? `${term} Months` : "12 Months",
      type: businessType,
      company: parentCompany,
      description: description || transaction,
      eff_date: effDate,
      exp_date: expDate || "Continuous",

      submission_id: quoteId.trim(),
      sub_eff_date: subEffDate || effDate,
      is_continuous: isContinuous,
      is_not_renewable: isNotRenewable,
      issue_state: issueState,
      carrier_status: "Active",
      is_reinsurance: isReinsurance,
      business_type: businessType,
      transaction: transaction,
      company_type: companyType,
      parent_company: parentCompany,
      writing_company: writingCompany,
      division: division,
      branch: branch,
      department: department,
      bill_method: billMethod,
      pay_plan: payPlan || null,
      executive: executive || null,
      representative: representative || null,
      broker: broker || null,
      total_premium: totalPremium || null,
      premium: totalPremium || null,
      include_notes: includeNotes,
      exclude_lines: excludeLines,
      default_insured: defaultInsured,
      default_co_insured: defaultCoInsured,
      default_dba: defaultDba,
      default_contacts: defaultContacts,
      lobs: [
        {
          type: businessType === "Commercial Lines" ? "General Liability" : "Personal Auto",
          description: description || "Primary Submission Coverage",
          application: "ACORD 125/126",
          writingCompany: writingCompany,
          statePlan: issueState,
          sort: "1",
          premium: totalPremium || "$0.00",
        },
      ],
    };

    try {
      const token = localStorage.getItem("token");
      let createdSubmission: any = null;
      let newSubId: any = null;

      try {
        const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          createdSubmission = await res.json();
          newSubId = createdSubmission?.id || createdSubmission?._id;
        }
      } catch (err) {
        console.warn("Backend save failed, saving to local cache", err);
      }

      // Generate local ID fallback if backend was unavailable
      if (!newSubId) {
        newSubId = `sub-${Date.now()}`;
        createdSubmission = {
          ...payload,
          id: newSubId,
          created_date: new Date().toISOString(),
        };
      }

      // Update localStorage cache
      const formattedSubmission = {
        id: (newSubId || "").toString(),
        quoteId: createdSubmission.quote_id || quoteId.trim(),
        quote_id: createdSubmission.quote_id || quoteId.trim(),
        status: createdSubmission.status || submissionStatus,
        term: createdSubmission.term || "12 Months",
        type: createdSubmission.type || businessType,
        lobs: createdSubmission.lobs || payload.lobs,
        company: createdSubmission.company || parentCompany,
        writing_company: createdSubmission.writing_company || writingCompany,
        total_premium: createdSubmission.total_premium || totalPremium,
        premium: createdSubmission.total_premium || totalPremium,
        description: createdSubmission.description || description,
        effDate: createdSubmission.eff_date || effDate,
        expDate: createdSubmission.exp_date || expDate,
        createdDate: new Date().toLocaleDateString(),
      };

      const currentSubmissionsStr = localStorage.getItem(`submissions_${customerId}`);
      const submissionsList = currentSubmissionsStr ? JSON.parse(currentSubmissionsStr) : [];
      submissionsList.unshift(formattedSubmission);
      localStorage.setItem(`submissions_${customerId}`, JSON.stringify(submissionsList));

      window.dispatchEvent(new Event("storage"));
      setSuccess(true);

      const submissionUrl = `/agency/customer/${customerId}/submission/${newSubId}`;
      const customerSubmissionsUrl = `/agency/customer/${customerId}/submissions`;

      // Open newly created submission detail page in a new window
      window.open(submissionUrl, "_blank", "width=1320,height=860,resizable=yes,scrollbars=yes");

      if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = customerSubmissionsUrl;
          window.opener.focus();
        } catch (e) { }
        try {
          window.close();
        } catch (e) { }
      } else {
        router.push(customerSubmissionsUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create submission.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined" && window.opener && !window.opener.closed) {
      window.close();
    } else {
      router.push(`/agency/customer/${customerId}/submissions`);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1F2937] p-4 sm:p-8 font-sans">
      {/* ── Top Header Navigation ── */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-2 font-medium">
          <span className="hover:text-[#1F2937] cursor-pointer" onClick={handleCancel}>
            {customerName}
          </span>
          <span>/</span>
          <span className="text-[#7A6F64] font-semibold">New Submission Setup</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#E5E2DE] pb-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={handleCancel}
              className="size-9 rounded-full bg-white hover:bg-[#FAF8F5] border border-[#D9D5D0] flex items-center justify-center text-[#7A6F64] hover:text-[#2d2a26] transition-all shadow-xs cursor-pointer shrink-0 group active:scale-95"
              title="Back"
            >
              <ArrowLeft className="size-4.5 transition-transform group-hover:-translate-x-0.5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">
                Add New Submission
              </h1>
              <p className="text-xs text-[#6B7280] mt-1">
                Enter quote specifications, company setup, and underwriting details for {customerName}.
              </p>
            </div>
          </div>
        </div>

        {/* ── Descriptive Instruction Box ── */}
        <div className="bg-white border border-[#D9D5D0] rounded p-4 mt-4 flex gap-3.5 items-start shadow-xs">
          <Info className="size-5 text-[#7A6F64] shrink-0 mt-0.5" />
          <div className="text-xs text-[#6B7280] space-y-1 font-medium">
            <p className="font-bold text-[#1F2937]">Enter the Quote & Submission Information to create a new Submission.</p>
            <p>Specify the Quote ID, effective dates, and line of business. When approved, this quote can be directly converted and bound into an active policy.</p>
          </div>
        </div>

        {/* Success Feedback Alert */}
        {success && (
          <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded text-[#166534] p-4 mt-4 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="size-5 text-[#16A34A] shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#166534]">Submission Created Successfully</p>
              <p className="text-xs font-medium text-[#15803D] mt-0.5">Opening quote details and closing window...</p>
            </div>
          </div>
        )}

        {/* Error Feedback Alert */}
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
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">

        {/* ── CARD 1: Customer & Submission ── */}
        <SectionCard
          title="Customer & Submission"
          isOpen={openSections["Customer & Submission"]}
          onToggle={() => toggleSection("Customer & Submission")}
        >
          <FormRow label="Customer Name">
            <input
              type="text"
              value={customerName}
              disabled
              className={inputCls}
            />
          </FormRow>

          <FormRow label="Submission ID" required>
            <input
              type="text"
              required
              placeholder="e.g. SUB-2026-001"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              className={inputCls + " font-bold text-[#1F2937]"}
            />
          </FormRow>

          <FormRow label="Division">
            <input
              type="text"
              value={division}
              disabled
              placeholder="Loading..."
              className={inputCls}
            />
          </FormRow>

          <FormRow label="Branch">
            <input
              type="text"
              value={branch}
              disabled
              placeholder="Loading..."
              className={inputCls}
            />
          </FormRow>

          <FormRow label="Department">
            <input
              type="text"
              value={department}
              disabled
              placeholder="Loading..."
              className={inputCls}
            />
          </FormRow>
        </SectionCard>

        {/* ── CARD 2: Submission Specifications ── */}
        <SectionCard
          title="Submission Specifications"
          isOpen={openSections["Submission Specifications"]}
          onToggle={() => toggleSection("Submission Specifications")}
        >
          <FormRow label="Submission Status" required>
            <select
              value={submissionStatus}
              onChange={(e) => setSubmissionStatus(e.target.value)}
              className={selectCls}
            >
              <option value="Submitted">Submitted</option>
              <option value="In Process">In Process</option>
              <option value="Quoted">Quoted</option>
              <option value="Bound">Bound</option>
              <option value="Declined">Declined</option>
              <option value="Lost">Lost</option>
            </select>
          </FormRow>

          <FormRow label="Effective Date" required>
            <div className="flex items-center gap-2">
              <input
                type="date"
                required
                value={effDate}
                onChange={(e) => {
                  const newEffDate = e.target.value;
                  setEffDate(newEffDate);
                  if (newEffDate) {
                    const dateObj = new Date(newEffDate);
                    dateObj.setFullYear(dateObj.getFullYear() + 1);
                    setExpDate(dateObj.toISOString().split("T")[0]);
                  } else {
                    setExpDate("");
                  }
                }}
                className={inputCls}
              />
            </div>
          </FormRow>

          <FormRow label="Expiration Date">
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                disabled={isContinuous}
                className={inputCls}
              />
              <label className="flex items-center gap-1.5 text-xs text-[#4B5563] cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={isContinuous}
                  onChange={(e) => {
                    setIsContinuous(e.target.checked);
                    if (e.target.checked) setExpDate("");
                  }}
                  className={checkCls}
                />
                <span>Continuous</span>
              </label>
            </div>
          </FormRow>

          <FormRow label="Term">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="12"
                className={inputCls + " w-24"}
              />
              <span className="text-xs text-[#6B7280] font-medium">Months</span>
            </div>
          </FormRow>

          <FormRow label="Issue State">
            <select
              value={issueState}
              onChange={(e) => setIssueState(e.target.value)}
              className={selectCls + " w-32"}
            >
              <option value="FL">FL - Florida</option>
              <option value="CA">CA - California</option>
              <option value="TX">TX - Texas</option>
              <option value="NY">NY - New York</option>
              <option value="GA">GA - Georgia</option>
              <option value="NC">NC - North Carolina</option>
              <option value="NJ">NJ - New Jersey</option>
              <option value="PA">PA - Pennsylvania</option>
              <option value="OH">OH - Ohio</option>
              <option value="IL">IL - Illinois</option>
            </select>
          </FormRow>

          <FormRow label="Type of Business">
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className={selectCls}
            >
              <option value="Commercial Lines">Commercial Lines</option>
              <option value="Personal Lines">Personal Lines</option>
              <option value="Health">Health</option>
              <option value="Life">Life</option>
              <option value="Benefits">Benefits</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Non Property & Casualty">Non Property & Casualty</option>
            </select>
          </FormRow>

          <FormRow label="Transaction">
            <select
              value={transaction}
              onChange={(e) => setTransaction(e.target.value)}
              className={selectCls}
            >
              <option value="New submission">New submission</option>
              <option value="Renewal quote">Renewal quote</option>
              <option value="Remarket">Remarket</option>
              <option value="Rewrite quote">Rewrite quote</option>
            </select>
          </FormRow>

          <FormRow label="Description">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Commercial General Liability Submission"
              className={inputCls}
            />
          </FormRow>
        </SectionCard>

        {/* ── CARD 3: Company Setup ── */}
        <SectionCard
          title="Company Setup"
          isOpen={openSections["Company Setup"]}
          onToggle={() => toggleSection("Company Setup")}
        >
          <FormRow label="Company Type">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-[#1F2937] cursor-pointer">
                <input
                  type="radio"
                  name="companyType"
                  value="Insurance"
                  checked={companyType === "Insurance"}
                  onChange={() => {
                    setCompanyType("Insurance");
                    setParentCompany(INSURANCE_PARENT_COMPANIES[0]);
                  }}
                  className="accent-[#7A6F64]"
                />
                Insurance Company
              </label>
              <label className="flex items-center gap-2 text-sm text-[#1F2937] cursor-pointer">
                <input
                  type="radio"
                  name="companyType"
                  value="Brokerage"
                  checked={companyType === "Brokerage"}
                  onChange={() => {
                    setCompanyType("Brokerage");
                    setParentCompany(BROKERAGE_PARENT_COMPANIES[0]);
                  }}
                  className="accent-[#7A6F64]"
                />
                Brokerage Company
              </label>
            </div>
          </FormRow>

          <FormRow label="Parent Company">
            <select
              value={parentCompany}
              onChange={(e) => setParentCompany(e.target.value)}
              className={selectCls}
            >
              {(companyType === "Insurance"
                ? INSURANCE_PARENT_COMPANIES
                : BROKERAGE_PARENT_COMPANIES
              ).map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow label="Writing Company">
            <select
              value={writingCompany}
              onChange={(e) => setWritingCompany(e.target.value)}
              className={selectCls}
            >
              {((companyType === "Insurance"
                ? (INSURANCE_WRITING_COMPANIES as any)[parentCompany]
                : (BROKERAGE_WRITING_COMPANIES as any)[parentCompany]) || [parentCompany]).map(
                (wComp: string) => (
                  <option key={wComp} value={wComp}>
                    {wComp}
                  </option>
                )
              )}
            </select>
          </FormRow>
        </SectionCard>

        {/* ── CARD 4: Billing & Agency Personnel ── */}
        <SectionCard
          title="Billing & Agency Personnel"
          isOpen={openSections["Billing & Agency Personnel"]}
          onToggle={() => toggleSection("Billing & Agency Personnel")}
        >
          <FormRow label="Bill Method">
            <select
              value={billMethod}
              onChange={(e) => setBillMethod(e.target.value)}
              className={selectCls}
            >
              <option value="Direct bill">Direct bill</option>
              <option value="Agency bill">Agency bill</option>
            </select>
          </FormRow>

          <FormRow label="Pay Plan">
            <select
              value={payPlan}
              onChange={(e) => setPayPlan(e.target.value)}
              className={selectCls}
            >
              <option value="Full Payment">Full Payment</option>
              <option value="Annual">Annual</option>
              <option value="Semi-Annual">Semi-Annual</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Monthly EFT">Monthly EFT</option>
              <option value="10 Pay">10 Pay</option>
            </select>
          </FormRow>

          <FormRow label="Executive">
            <select
              value={executive}
              onChange={(e) => setExecutive(e.target.value)}
              className={selectCls}
            >
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

          <FormRow label="Representative">
            <select
              value={representative}
              onChange={(e) => setRepresentative(e.target.value)}
              className={selectCls}
            >
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
              <option value="Montoya, Keila">Montoya, Keila</option>
              <option value="Parungao, Joana">Parungao, Joana</option>
              <option value="Service, Customer">Service, Customer</option>
              <option value="Short, Linda">Short, Linda</option>
              <option value="Solender, Ben">Solender, Ben</option>
              <option value="Weiner, Jake">Weiner, Jake</option>
            </select>
          </FormRow>

          <FormRow label="Broker">
            <select
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className={selectCls}
            >
              <option value="">-- None --</option>
              <option value="Broker, External">Broker, External</option>
            </select>
          </FormRow>

          <FormRow label="Estimated Premium $">
            <div className="relative flex items-center w-full">
              <span className="absolute left-3.5 text-sm font-semibold text-[#6B7280] pointer-events-none">$</span>
              <input
                type="text"
                value={totalPremium}
                onChange={(e) => setTotalPremium(e.target.value.replace(/^\$/, ""))}
                placeholder="0.00"
                className={inputCls + " pl-7 font-medium"}
              />
            </div>
          </FormRow>
        </SectionCard>

        {/* ── Bottom Actions ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-16 border-t border-[#D9D5D0]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto h-11 px-5 text-sm font-medium rounded border border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full sm:w-auto h-11 px-6 text-sm font-semibold rounded bg-[#7A6F64] hover:bg-[#5A4F44] text-white transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
            >
              <CheckCircle2 className="size-4" />
              <span>{isLoading ? "Processing..." : "OK"}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
