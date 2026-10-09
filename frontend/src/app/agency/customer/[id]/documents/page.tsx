/* eslint-disable */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { confirmDialog, showToast } from "@/components/ToastProvider";
import {
  FileText,
  ArrowLeft,
  Upload,
  CloudUpload,
  Info,
  Folder,
  CheckSquare,
  ArrowUpDown,
  Loader2,
  Trash2,
  Eye,
  X,
  FileArchive,
  Image as ImageIcon,
  File as FileIcon
} from "lucide-react";

export default function CustomerDocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [mounted, setMounted] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [docLoading, setDocLoading] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [docAction, setDocAction] = useState("Upload");
  const [docDescription, setDocDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Fetch Customer Data ──
  const fetchCustomer = useCallback(async () => {
    if (!customerId) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCustomer(data);
      }
    } catch (err) {
      console.error("Failed to load customer profile:", err);
    }
  }, [customerId]);

  // ── Fetch Documents ──
  const loadDocuments = useCallback(async () => {
    if (!customerId) return;
    setDocLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((d: any) => ({
          id: d.id,
          fileName: d.file_name,
          action: d.action || "Upload",
          description: d.description || "",
          fileSize: d.file_size ? `${(d.file_size / 1024 / 1024).toFixed(2)} MB` : "—",
          ext: d.file_ext,
          url: d.file_url ? `${API_BASE_URL}${d.file_url}` : null,
          createdAt: d.created_at ? new Date(d.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"
        }));
        setDocuments(formatted);
      }
    } catch (e) {
      console.error("Error loading documents", e);
    } finally {
      setDocLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchCustomer();
    loadDocuments();
  }, [fetchCustomer, loadDocuments]);

  // ── Upload Handlers ──
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setPendingFile(files[0]);
      setShowDocModal(true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setPendingFile(files[0]);
      setShowDocModal(true);
    }
  };

  const handleSaveDocument = async () => {
    if (!pendingFile) return;
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", pendingFile);
      formData.append("action", docAction);
      formData.append("description", docDescription);

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        showToast("Document uploaded successfully", "success");
        setShowDocModal(false);
        setPendingFile(null);
        setDocDescription("");
        setDocAction("Upload");
        if (fileInputRef.current) fileInputRef.current.value = "";
        loadDocuments();
      } else {
        showToast("Failed to upload document", "error");
      }
    } catch (e) {
      console.error("Error uploading document", e);
      showToast("Error uploading document", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string | number) => {
    if (!(await confirmDialog("Are you sure you want to delete this document?", "Delete Document"))) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Document deleted successfully", "success");
        loadDocuments();
      } else {
        showToast("Failed to delete document", "error");
      }
    } catch (e) {
      console.error("Error deleting document", e);
      showToast("Error deleting document", "error");
    }
  };

  const customerName =
    customer?.type === "Commercial"
      ? customer?.company_name || "Customer"
      : `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim() ||
        customer?.company_name ||
        "Customer";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2d2a26] pb-16 font-sans">
      {/* ── Top Header / Breadcrumb Bar ── */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5ddd5] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/agency/customer/${customerId}`)}
              className="h-9 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#F5EDE5] text-[#9A8B7A] border border-[#e5ddd5] flex items-center gap-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Profile</span>
            </button>
            <div className="h-5 w-px bg-[#e5ddd5]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#8c827a]">
                Customer:
              </span>
              <span className="text-sm font-extrabold text-[#1f1d1a]">
                {customerName}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#9A8B7A] border border-[#e5ddd5]">
                ID: {customerId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={14} className="stroke-[2.5]" />
              Upload New File
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-6">
        <div className="bg-white border border-[#e5ddd5] rounded-2xl p-6 shadow-sm w-full space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#f0ece6]">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 border border-[#DBEAFE] shadow-2xs">
                <FileText size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-[#1f1d1a]">
                  Uploaded Documents ({documents.length})
                </h1>
                <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                  Upload and manage customer documents securely
                </p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Upload size={14} className="stroke-[2.5]" />
              Upload New File
            </button>
          </div>

          {/* Grid 2-columns (Dropzone left, Info cards right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left 70% - Drag & Drop Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
              onDrop={handleFileDrop}
              className={`lg:col-span-8 border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden bg-[#FAF8F5] ${
                isDragOver ? "border-[#9A8B7A] bg-[#9A8B7A]/5 scale-[0.99]" : "border-[#e5ddd5] hover:border-[#9A8B7A]"
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Cloud Icon & Floating File Type Icons Arc */}
              <div className="relative mb-3 flex items-center justify-center w-full max-w-[280px] h-20">
                <svg className="absolute w-full h-14 top-2 text-[#e5ddd5]" viewBox="0 0 280 50" fill="none">
                  <path d="M 25 40 Q 140 0 255 40" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                </svg>

                <div className="absolute left-3 top-6 h-7 w-7 rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                  PDF
                </div>
                <div className="absolute left-14 top-1 h-7 w-7 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                  DOC
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative z-10 h-14 w-14 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shadow-xs cursor-pointer hover:scale-105 transition-transform"
                >
                  <CloudUpload size={26} className="stroke-[2.2]" />
                </div>
                <div className="absolute right-14 top-1 h-7 w-7 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] text-[#16A34A] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                  PNG
                </div>
                <div className="absolute right-3 top-6 h-7 w-7 rounded-full bg-[#FAF5FF] border border-[#F3E8FF] text-[#9333EA] flex items-center justify-center text-[9px] font-extrabold shadow-2xs">
                  ZIP
                </div>
              </div>

              <p className="text-sm font-bold text-[#1f1d1a]">
                Drag & drop files here
              </p>
              <p className="text-xs text-[#6b5e52] mt-0.5 font-medium">
                or click to browse from your device
              </p>

              <div className="flex items-center gap-1.5 text-[11px] text-[#8c827a] font-medium mt-1.5">
                <Info size={13} className="text-[#9A8B7A]" />
                <span>Supports PDF, DOCX, PNG (Max size: 10MB per file)</span>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-9 px-5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 mt-4 cursor-pointer"
              >
                <Folder size={14} />
                Browse Files
              </button>
            </div>

            {/* Right 30% - Subjective Lines */}
            <div className="lg:col-span-4 flex flex-col gap-4 justify-between">
              <div className="bg-white border border-[#e5ddd5] rounded-2xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-[#F5EDE5] text-[#9A8B7A] flex items-center justify-center shrink-0 border border-[#e5ddd5]/60">
                    <FileText size={15} />
                  </div>
                  <h4 className="text-xs font-extrabold text-[#1f1d1a]">Subjective Lines</h4>
                </div>

                <div className="bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-3 flex items-start gap-2.5">
                  <CheckSquare size={16} className="text-[#059669] shrink-0 mt-0.5 fill-[#059669] text-white rounded" />
                  <span className="text-[11px] font-medium text-[#065F46] leading-relaxed">
                    1 year of loss runs required, valued within 60 days of inception.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Table */}
          <div className="border border-[#e5ddd5] rounded-2xl overflow-hidden mt-6 bg-white shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF7F2] text-[#6b5e52] font-semibold border-b border-[#e5ddd5]">
                <tr>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Filename <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Category <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Description <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52]">
                    Uploaded On <ArrowUpDown size={11} className="inline ml-1 text-[#9A8B7A]" />
                  </th>
                  <th className="px-4 py-3.5 font-bold text-[#6b5e52] text-center">
                    Manage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5ddd5]">
                {docLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-[#6b5e52]">
                      <Loader2 className="animate-spin text-[#9A8B7A] mx-auto size-5 mb-1" />
                      Loading files...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <FileText size={34} className="text-[#c4b5a5] stroke-[1.5] mb-2" />
                        <p className="text-sm font-bold text-[#2d2a26]">No documents uploaded yet</p>
                        <p className="text-xs text-[#8c827a] mt-0.5 font-medium">Upload files to keep customer documents organized and accessible.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-[#FAF8F5] transition-colors group">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white border border-[#e5ddd5] flex items-center justify-center text-[#9A8B7A] shrink-0 shadow-2xs group-hover:border-[#9A8B7A] group-hover:text-[#9A8B7A] transition-colors">
                            {doc.fileName?.toLowerCase().endsWith('.pdf') ? <FileText size={15} /> :
                              doc.fileName?.toLowerCase().match(/\.(jpg|jpeg|png)$/) ? <ImageIcon size={15} /> :
                                doc.fileName?.toLowerCase().endsWith('.zip') ? <FileArchive size={15} /> :
                                  <FileIcon size={15} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[#2d2a26] text-xs max-w-[200px] truncate" title={doc.fileName}>
                              {doc.fileName || "Document"}
                            </span>
                            {doc.ext && <span className="text-[9px] uppercase tracking-wider text-[#9A8B7A] font-bold">{doc.ext.replace('.', '')}</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[#6b5e52]">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                          doc.action === 'Policy Attachment' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          doc.action === 'Loss Runs' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          doc.action === 'Signed Binder' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-[#f5f1eb] text-[#6b5e52] border-[#e5ddd5]'
                        }`}>
                          {doc.action || "Upload"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[#6b5e52] max-w-[200px] truncate font-medium text-[11px]" title={doc.description}>
                        {doc.description || "—"}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-[#6b5e52] text-[11px]">
                        {doc.createdAt}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          {doc.url && (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-[#6b5e52] hover:text-[#9A8B7A] hover:bg-white border border-transparent hover:border-[#e5ddd5] hover:shadow-2xs transition-all"
                              title="View Document"
                            >
                              <Eye size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-1.5 rounded-lg text-[#6b5e52] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── Document Upload Modal ── */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2d2a26]/40 backdrop-blur-sm p-4">
          <div className="bg-[#FAF8F5] rounded-3xl shadow-2xl w-full max-w-md border border-[#e5ddd5] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-white border-b border-[#e5ddd5] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[#f5f1eb] text-[#9A8B7A] flex items-center justify-center">
                  <CloudUpload size={16} />
                </div>
                <h3 className="text-sm font-extrabold text-[#2d2a26]">
                  Upload Document
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setPendingFile(null);
                  setDocDescription("");
                  setDocAction("Upload");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-[#9A8B7A] hover:text-[#2d2a26] transition-colors p-1 rounded-full hover:bg-[#f5f1eb] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-3.5 bg-white border border-[#e5ddd5] rounded-2xl flex items-center gap-3 shadow-2xs">
                <div className="h-10 w-10 bg-[#f5f1eb] rounded-xl flex items-center justify-center text-[#9A8B7A] shrink-0">
                  <FileText size={20} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-[#2d2a26] truncate">{pendingFile?.name}</span>
                  <span className="text-[10px] font-bold text-[#9A8B7A] uppercase tracking-wider">
                    {(pendingFile?.size ? (pendingFile.size / 1024 / 1024).toFixed(2) : "0.00")} MB
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b5e52] mb-1.5 ml-1">Action / Category</label>
                  <select
                    value={docAction}
                    onChange={(e) => setDocAction(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#e5ddd5] rounded-xl text-xs font-bold text-[#2d2a26] outline-none focus:border-[#9A8B7A] focus:ring-4 focus:ring-[#9A8B7A]/10 bg-white transition-all shadow-2xs cursor-pointer appearance-none"
                  >
                    <option value="Upload">Standard Upload</option>
                    <option value="Policy Attachment">Policy Attachment</option>
                    <option value="Customer File">Customer File</option>
                    <option value="Loss Runs">Loss Runs</option>
                    <option value="Signed Binder">Signed Binder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6b5e52] mb-1.5 ml-1">Document Description</label>
                  <input
                    type="text"
                    value={docDescription}
                    onChange={(e) => setDocDescription(e.target.value)}
                    placeholder="E.g. 2026 Loss Runs for GL Policy"
                    className="w-full px-4 py-2.5 border border-[#e5ddd5] rounded-xl text-xs font-semibold text-[#2d2a26] outline-none focus:border-[#9A8B7A] focus:ring-4 focus:ring-[#9A8B7A]/10 bg-white transition-all shadow-2xs placeholder:text-[#e5ddd5]"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-[#e5ddd5] flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowDocModal(false);
                  setPendingFile(null);
                  setDocDescription("");
                  setDocAction("Upload");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                disabled={isUploading}
                className="px-5 py-2.5 border border-[#e5ddd5] rounded-xl text-xs font-bold text-[#6b5e52] hover:bg-[#f5f1eb] hover:text-[#2d2a26] transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDocument}
                disabled={isUploading}
                className="px-6 py-2.5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload size={14} />
                    Confirm Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
