  /* eslint-disable */
  "use client";

  import React, { useState, useEffect, useCallback, useRef } from "react";
  import { useRouter, useParams } from "next/navigation";
  import { API_BASE_URL } from "../../../../../lib/config";
import { confirmDialog, showToast } from "@/components/ToastProvider";
  import Acord25Form from "../../../../../services/pdf/Acord25Form";
  import Header from "../../../../../components/Header";
  import RightDrawer from "../../../../../components/RightDrawer";
  import {
    FileSignature,
    Search,
    Trash2,
    ChevronRight,
    ChevronDown,
    FolderClosed,
    FolderOpen,
    FileText,
    File,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Save,
    Copy,
    Paperclip,
    Printer,
    Plus,
    Minus,
    Edit3,
    Download,
    UploadCloud,
    FilePlus,
    Activity,
    MoreHorizontal,
    MoreVertical,
    Mail,
    Maximize2,
    Minimize2,
    PanelLeftClose,
    PanelLeftOpen,
    ArrowUpDown,
    ArrowLeftRight,
    Landmark,
    Bell,
    CreditCard,
    ShieldCheck,
    FileSpreadsheet,
    Clock,
    FileX,
    Calendar,
    Zap,
    Eye,
    EyeOff,
  } from "lucide-react";

  // ─── Tab definitions matching Sterling AMS eForms Manager ──────────────────────────
  const EFORM_TABS = [
    "All Forms",
    "Applications",
    "AutoId Cards",
    "Binders",
    "Cancellations",
    "Certificates",
    "EPI",
    "Change Requests",
    "Loss Notices",
  ] as const;

  type EFormTab = typeof EFORM_TABS[number];

  const TAB_ICONS: Record<EFormTab, React.ElementType> = {
    "All Forms": FileText,
    "Applications": FileText,
    "AutoId Cards": CreditCard,
    "Binders": FileText,
    "Cancellations": FileX,
    "Certificates": ShieldCheck,
    "EPI": FileSpreadsheet,
    "Change Requests": Clock,
    "Loss Notices": AlertTriangle,
  };

  // ─── Mock tree node structure ────────────────────────────────────────────────
  interface TreeNode {
    id: string;
    label: string;
    type: "folder" | "file";
    children?: TreeNode[];
    formType?: string;
    certNumber?: string;  // formatted display number e.g. "202605"
    certDbId?: string;    // raw numeric DB id e.g. "5"
    masterData?: any;
    isMaster?: boolean;
    documentData?: any;
    holderData?: {
      name: string;
      address: string;
      address2: string;
      city: string;
      state: string;
      zip: string;
      desc_of_ops: string;
      issue_date: string;
      written_notice_days: number;
      dbId: number;
      additional_insured?: Record<string, string>;
      waiver_subrogation?: Record<string, string>;
    };
  }

  // ─── Tree View Component ─────────────────────────────────────────────────────
  function TreeItem({
    node,
    depth = 0,
    selected,
    onSelect,
    onAddEditHolder,
    onCopyMaster,
    onDeleteMaster,
    onUpdateMaster,
    onEditMaster,
    onOpenAttachments,
    onDeleteHolder,
    onDeleteHolderAttachments,
    onDeleteDocument,
  }: {
    node: TreeNode;
    depth?: number;
    selected: string | null;
    onSelect: (id: string) => void;
    onAddEditHolder?: (id: string) => void;
    onCopyMaster?: (id: string) => void;
    onDeleteMaster?: (id: string) => void;
    onUpdateMaster?: (id: string) => void;
    onEditMaster?: (id: string) => void;
    onOpenAttachments?: (id: string) => void;
    onDeleteHolder?: (id: string) => void;
    onDeleteHolderAttachments?: (id: string) => void;
    onDeleteDocument?: (id: string | number) => void;
  }) {
  const [expanded, setExpanded] = useState(true);
  const isFolder = node.type === "folder";
  const isSelected = selected === node.id;
  
  // Menu logic
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const isMaster = node.id.startsWith("cert-file-master-");
  const isHolder = node.id.startsWith("holder-");
  const isDoc = node.id.startsWith("doc-");
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!menuOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      
      const popupHeight = 240; // approx height of 7-item menu
      const popupWidth = 192;  // w-48 = 192px

      let top = rect.bottom + 4;
      // If bottom space is insufficient (< 240px), flip UPWARDS above the button
      if (windowHeight - rect.bottom < popupHeight && rect.top > popupHeight) {
        top = rect.top - popupHeight;
      }

      let left = rect.left;
      // If right space is tight, align to right side of button or viewport
      if (rect.left + popupWidth > windowWidth - 10) {
        left = windowWidth - popupWidth - 12;
      }
      if (left < 10) left = 10;

      setMenuCoords({ top, left });
    }
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        btnRef.current && !btnRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    function handleScroll() {
      if (menuOpen) setMenuOpen(false);
    }
    function handleWindowBlur() {
      if (menuOpen) setMenuOpen(false);
    }
    
    if (menuOpen) {
      window.addEventListener("mousedown", handleClickOutside, true);
      window.addEventListener("click", handleClickOutside, true);
      window.addEventListener("pointerdown", handleClickOutside, true);
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("blur", handleWindowBlur);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("pointerdown", handleClickOutside, true);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [menuOpen]);

  return (
    <div>
      <div className="relative group">
        <div
          className={`
            w-full flex items-center justify-between gap-1.5 px-2 py-1 text-xs font-medium rounded-lg
            transition-all duration-150 text-left my-0.5
            ${isSelected
              ? "bg-[#eae1d2] text-[#2d2a26] font-bold border border-[#d6c7b2]"
              : "text-[#2d2a26] hover:bg-[#f6f2ec]"
            }
          `}
          style={{ paddingLeft: `${6 + depth * 14}px` }}
        >
          <div 
            className="flex flex-1 items-center gap-1.5 truncate cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (isFolder) setExpanded(!expanded);
              onSelect(node.id);
            }}
          >
            {isFolder ? (
              expanded ? (
                <>
                  <ChevronDown size={13} className="shrink-0 text-[#8c827a]" />
                  <FolderOpen size={15} className="shrink-0 text-[#d4a373] fill-[#fdf6ec]" />
                </>
              ) : (
                <>
                  <ChevronRight size={13} className="shrink-0 text-[#8c827a]" />
                  <FolderClosed size={15} className="shrink-0 text-[#d4a373] fill-[#fdf6ec]" />
                </>
              )
            ) : (
              <>
                <span className="w-[13px] shrink-0" />
                <FileText size={15} className="shrink-0 text-[#70665d]" />
              </>
            )}
            <span className="truncate">{node.label}</span>
          </div>
          
          {(isMaster || isHolder || isDoc) && (
            <button 
              ref={btnRef}
              className={`p-1 rounded hover:bg-[#d6c7b2] ${menuOpen ? 'bg-[#d6c7b2]' : 'opacity-80 group-hover:opacity-100'} transition-opacity cursor-pointer shrink-0`}
              onClick={toggleMenu}
              title="Options"
            >
              <MoreVertical size={13} className="text-[#6b5e52]" />
            </button>
          )}
        </div>

        {/* Holder Context Menu: Delete Holder (first), Delete Attachments (second) */}
        {isHolder && menuOpen && (
          <div 
            ref={menuRef}
            style={{ position: 'fixed', top: `${menuCoords.top}px`, left: `${menuCoords.left}px`, zIndex: 9999 }}
            className="bg-white border border-slate-200 shadow-2xl rounded-xl py-1 w-44 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100"
          >
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
              onClick={() => {
                setMenuOpen(false);
                if (onDeleteHolder) onDeleteHolder(node.id);
              }}
            >
              <Trash2 size={13} className="text-red-500" />
              <span>Delete Holder</span>
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
              onClick={() => {
                setMenuOpen(false);
                if (onDeleteHolderAttachments) onDeleteHolderAttachments(node.id);
              }}
            >
              <Trash2 size={13} className="text-red-500" />
              <span>Delete Attachments</span>
            </button>
          </div>
        )}

        {/* Attachment Context Menu: Delete Attachment */}
        {isDoc && menuOpen && (
          <div 
            ref={menuRef}
            style={{ position: 'fixed', top: `${menuCoords.top}px`, left: `${menuCoords.left}px`, zIndex: 9999 }}
            className="bg-white border border-slate-200 shadow-2xl rounded-xl py-1 w-44 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100"
          >
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 cursor-pointer flex items-center gap-2"
              onClick={() => {
                setMenuOpen(false);
                if (onDeleteDocument && node.documentData?.id) {
                  onDeleteDocument(node.documentData.id);
                }
              }}
            >
              <Trash2 size={13} className="text-red-500" />
              <span>Delete Attachment</span>
            </button>
          </div>
        )}
        
        {isMaster && menuOpen && (
          <div 
            ref={menuRef}
            style={{ position: 'fixed', top: `${menuCoords.top}px`, left: `${menuCoords.left}px`, zIndex: 9999 }}
            className="bg-white border border-slate-200 shadow-2xl rounded-xl py-1 w-48 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100"
          >
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                if (onAddEditHolder) onAddEditHolder(node.id);
              }}
            >
              Add/Edit Holder
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                if (onCopyMaster) onCopyMaster(node.id);
              }}
            >
              Copy
            </button>
            <button className="w-full text-left px-3 py-1.5 hover:bg-slate-100 cursor-pointer">Renew</button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                if (onUpdateMaster) onUpdateMaster(node.id);
              }}
            >
              Update Master Cert
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                if (onOpenAttachments) onOpenAttachments(node.id);
              }}
            >
              Attachments
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-red-600 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                if (onDeleteMaster) onDeleteMaster(node.id);
              }}
            >
              Delete
            </button>
            <button 
              className="w-full text-left px-3 py-1.5 hover:bg-slate-100 text-red-600 cursor-pointer"
              onClick={() => {
                setMenuOpen(false);
                if (onEditMaster) onEditMaster(node.id);
              }}
            >
              Edit Master
            </button>
          </div>
        )}
      </div>
      {isFolder && expanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
              onAddEditHolder={onAddEditHolder}
              onCopyMaster={onCopyMaster}
              onDeleteMaster={onDeleteMaster}
              onUpdateMaster={onUpdateMaster}
              onEditMaster={onEditMaster}
              onOpenAttachments={onOpenAttachments}
              onDeleteHolder={onDeleteHolder}
              onDeleteHolderAttachments={onDeleteHolderAttachments}
              onDeleteDocument={onDeleteDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AuthenticatedDocumentPreview({ url, fileName }: { url: string; fileName: string }) {
  const isExternal = url.startsWith('http') && !url.includes(API_BASE_URL.replace(/^https?:\/\//, ''));
  const [objectUrl, setObjectUrl] = useState<string | null>(isExternal ? url : null);
  const [loading, setLoading] = useState(!isExternal);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isExternal) return;
    
    let active = true;
    let objUrl: string | null = null;
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        // Only add authorization header if it's our own API to avoid CORS preflight failures on external storage
        const res = await fetch(url.startsWith('/') ? `${API_BASE_URL}${url}` : url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          if (res.status === 401) throw new Error("Unauthorized access. Please log in again.");
          throw new Error(`Failed to load document (Status: ${res.status})`);
        }
        const blob = await res.blob();
        objUrl = URL.createObjectURL(blob);
        if (active) {
          setObjectUrl(objUrl);
          setLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchDoc();
    return () => {
      active = false;
      if (objUrl) URL.revokeObjectURL(objUrl);
    };
  }, [url, isExternal]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-full bg-slate-50/50">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 min-h-full bg-slate-50/50 text-center">
        <div className="flex flex-col items-center gap-3">
          <AlertTriangle size={28} className="text-danger" />
          <p className="font-bold text-sm text-text-main">Failed to Load Preview</p>
          <p className="text-xs text-slate-400 max-w-sm">{error}</p>
        </div>
      </div>
    );
  }

  const ext = fileName.toLowerCase().split('.').pop() || '';
  if (ext === 'pdf') {
    return <iframe src={`/pdf-viewer.html?file=${encodeURIComponent(objectUrl!)}`} className="w-full h-full border-none bg-white" />;
  } else if (['jpeg', 'jpg', 'gif', 'png'].includes(ext)) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-100">
        <img src={objectUrl!} alt={fileName} className="max-w-full max-h-full object-contain shadow-md" />
      </div>
    );
  } else {
    return (
      <div className="flex-1 flex items-center justify-center min-h-full bg-slate-50/50">
        <div className="text-center space-y-4 p-8">
          <div className="h-20 w-20 rounded-3xl bg-white border border-border-main shadow-sm flex items-center justify-center mx-auto">
            <FileSignature size={32} className="text-primary/40" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-text-main tracking-tight">{fileName}</h3>
            <p className="text-[13px] text-text-muted mt-1.5">No preview available for this file type.</p>
            <a href={objectUrl!} download={fileName} className="inline-block mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all">
              Download File
            </a>
          </div>
        </div>
      </div>
    );
  }
}

// Helper: Find limit1 for a specific coverage name (case-insensitive, partial match)
function findLimit(glCoverages: any[], ...names: string[]): string {
  for (const name of names) {
    const found = glCoverages.find(c => {
      const dbCov = (c.coverage || '').toLowerCase();
      const search = name.toLowerCase();
      // Match exact or include (e.g., "fire damage" in "fire damage")
      return dbCov.includes(search) || search.includes(dbCov);
    });
    if (found && found.limit1 && String(found.limit1).trim() !== '') {
      const raw = String(found.limit1).replace(/,/g, '').replace(/\$/g, '');
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return '$ ' + found.limit1;
    }
  }
  return '';
}

// Helper: Find limit2 for a specific coverage name (case-insensitive, partial match)
function findLimit2(glCoverages: any[], ...names: string[]): string {
  for (const name of names) {
    const found = glCoverages.find(c => {
      const dbCov = (c.coverage || '').toLowerCase();
      const search = name.toLowerCase();
      return dbCov.includes(search) || search.includes(dbCov);
    });
    if (found && found.limit2 && String(found.limit2).trim() !== '') {
      const raw = String(found.limit2).replace(/,/g, '').replace(/\$/g, '');
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return '$ ' + found.limit2;
    }
  }
  return '';
}

// Helper: Safely format a raw limit value
function formatLimit(val: any): string {
  if (val && String(val).trim() !== '') {
    const raw = String(val).replace(/,/g, '').replace(/\$/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      return '$ ' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$ ' + val;
  }
  return '';
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EFORMS MANAGER PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function EFormsManagerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [policies, setPolicies] = useState<any[]>([]);
  const [glCoverages, setGlCoverages] = useState<any[]>([]);
  const [glPolicyNo, setGlPolicyNo] = useState<string>('');
  const [glEffDate, setGlEffDate] = useState<string>('');
  const [glExpDate, setGlExpDate] = useState<string>('');
  const [umbCoverages, setUmbCoverages] = useState<any[]>([]);
  const [umbPolicyNo, setUmbPolicyNo] = useState<string>('');
  const [umbEffDate, setUmbEffDate] = useState<string>('');
  const [umbExpDate, setUmbExpDate] = useState<string>('');
  const [wcPart2, setWcPart2] = useState<any>(null);
  const [wcPolicyNo, setWcPolicyNo] = useState<string>('');
  const [wcEffDate, setWcEffDate] = useState<string>('');
  const [wcExpDate, setWcExpDate] = useState<string>('');
  const [baCoverages, setBaCoverages] = useState<any[]>([]);
  const [autoPolicyNo, setAutoPolicyNo] = useState<string>('');
  const [autoEffDate, setAutoEffDate] = useState<string>('');
  const [autoExpDate, setAutoExpDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [policyCoveragesMap, setPolicyCoveragesMap] = useState<Record<string, { effDate: string, expDate: string, insurerName: string, gl: any[], umb: any[], wc: any, ba: any[] }>>({});
  const [activeTab, setActiveTab] = useState<EFormTab>("Certificates");
  const [selectedPolicy, setSelectedPolicy] = useState<string>("");
  const [selectedEffDate, setSelectedEffDate] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createdCertificates, setCreatedCertificates] = useState<any[]>([]);

  // ── Attachment Modal State ──
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [attachmentContextNode, setAttachmentContextNode] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentDescription, setAttachmentDescription] = useState("");
  const [attachmentCategory, setAttachmentCategory] = useState("Master");
  const [isUploading, setIsUploading] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [showTreePanel, setShowTreePanel] = useState(true);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const zoomMenuRef = useRef<HTMLDivElement>(null);

  // Close zoom dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (zoomMenuRef.current && !zoomMenuRef.current.contains(e.target as Node)) {
        setZoomDropdownOpen(false);
      }
    };
    if (zoomDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [zoomDropdownOpen]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = () => {
    const panel = document.getElementById("eform-preview-panel");
    if (!panel) return;

    if (!document.fullscreenElement && !isFullscreen) {
      if (panel.requestFullscreen) {
        panel.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // ── Edit Form State ──
  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [editedFields, setEditedFields] = useState<Record<string, string>>({});
  // Stable iframe key: only changes when node or edit mode STARTS (not on every field edit)
  const [iframeKey, setIframeKey] = useState<string>('');
  // Ref to the acord-form iframe for postMessage communication
  const acordIframeRef = useRef<HTMLIFrameElement | null>(null);
  // After creating a master certificate, this holds the node ID to auto-select once fetchData refreshes
  const pendingSelectRef = useRef<string | null>(null);

  useEffect(() => {
    let masterCertId: string | null = null;
    if (selectedNode && selectedNode.startsWith("cert-file-master-")) {
      masterCertId = selectedNode.replace("cert-file-master-", "");
    } else if (selectedNode && selectedNode.startsWith("holder-")) {
      const parentCert = createdCertificates.find(c => 
        c.children && c.children.some((child: any) => child.id === selectedNode)
      );
      if (parentCert) {
        masterCertId = parentCert.id.replace("cert-file-master-", "");
      }
    }

    if (masterCertId) {
      const token = localStorage.getItem("token");
      fetch(`${API_BASE_URL}/api/eforms/${masterCertId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.overrides) setOverrides(data.overrides);
        else setOverrides({});
        setEditedFields({});
        setIsEditing(false);
        setIframeKey(selectedNode + '_view_' + Date.now());
      })
      .catch(err => {
        console.error("Failed to fetch overrides", err);
        setOverrides({});
        setEditedFields({});
        setIsEditing(false);
        setIframeKey(selectedNode + '_view_' + Date.now());
      });
    } else {
      setOverrides({});
      setEditedFields({});
      setIsEditing(false);
      setIframeKey('');
    }
  }, [selectedNode, createdCertificates]);

  // Listen for FIELD_EDITED messages from the iframe (no re-key on field edit)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'FIELD_EDITED' && e.data?.fieldId !== undefined) {
        setEditedFields(prev => ({ ...prev, [e.data.fieldId]: e.data.value ?? '' }));
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleFieldChange = (fieldId: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveOverrides = async () => {
    if (!selectedNode) return;
    const id = selectedNode.replace("cert-file-master-", "");
    const token = localStorage.getItem("token");
    // Merge current overrides with newly edited fields
    const mergedOverrides = { ...overrides, ...editedFields };
    try {
      const res = await fetch(`${API_BASE_URL}/api/eforms/${id}/override`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ overrides: mergedOverrides })
      });
      if (res.ok) {
        setOverrides(mergedOverrides);
        setEditedFields({});
        // Exit edit mode WITHOUT reloading iframe: send postMessage to iframe
        setIsEditing(false);
        // Notify iframe to exit edit mode gracefully (no re-key)
        acordIframeRef.current?.contentWindow?.postMessage({ type: 'EXIT_EDIT_MODE' }, '*');
      }
    } catch (e) {
      console.error("Failed to save overrides", e);
    }
  };

  const handleCancelEdit = () => {
    setEditedFields({});
    setIsEditing(false);
    // Reload iframe to discard unsaved changes
    setIframeKey(prev => prev.replace(/_edit_.*|_view_.*/, '') + '_view_' + Date.now());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setAttachmentFile(e.dataTransfer.files[0]);
      setAttachmentContextNode("");
      setAttachmentCategory("Master");
      setAttachmentModalOpen(true);
    }
  };


  // ── Fetch customer and policies (Instant Cache + 1-shot API sync) ──
  const fetchData = useCallback(async () => {
    const cacheKey = `cached_eforms_${customerId}`;
    
    // Fast-path: display cached eForms data immediately if available (0ms load time)
    try {
      const cachedStr = sessionStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached && cached.customer) {
          setCustomer(cached.customer);
          if (cached.policies) setPolicies(cached.policies);
          if (cached.policyCoveragesMap) setPolicyCoveragesMap(cached.policyCoveragesMap);
          if (cached.createdCertificates) setCreatedCertificates(cached.createdCertificates);
          setLoading(false);
        } else {
          setLoading(true);
        }
      } else {
        setLoading(true);
      }
    } catch {
      setLoading(true);
    }

    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [custRes, bundleRes, certRes, docRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/coverages-bundle`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (custRes.status === 401) {
        router.push("/login");
        return;
      }
      if (!custRes.ok) throw new Error("Failed to load customer");

      const custData = await custRes.json();
      setCustomer(custData);

      let bundleData: any = {};
      if (bundleRes.ok) {
        const bundle = await bundleRes.json();
        bundleData = bundle;
        const formatted = bundle.policies || [];
        setPolicies(formatted);
        if (formatted.length > 0) {
          setSelectedPolicy(formatted[0].policyNum);
          setSelectedEffDate(
            `${formatted[0].effDate || "N/A"}, ${formatted[0].status || "Active"}, ${formatted[0].type || ""}`
          );
        }

        if (bundle.firstGl) {
          setGlCoverages(bundle.firstGl.coverages || []);
          setGlPolicyNo(bundle.firstGl.policyNo || '');
          setGlEffDate(bundle.firstGl.effDate || '');
          setGlExpDate(bundle.firstGl.expDate || '');
        }
        if (bundle.firstUmb) {
          setUmbCoverages(bundle.firstUmb.coverages || []);
          setUmbPolicyNo(bundle.firstUmb.policyNo || '');
          setUmbEffDate(bundle.firstUmb.effDate || '');
          setUmbExpDate(bundle.firstUmb.expDate || '');
        }
        if (bundle.firstWc) {
          setWcPart2(bundle.firstWc.part2 || null);
          setWcPolicyNo(bundle.firstWc.policyNo || '');
          setWcEffDate(bundle.firstWc.effDate || '');
          setWcExpDate(bundle.firstWc.expDate || '');
        }
        if (bundle.firstBa) {
          setBaCoverages(bundle.firstBa.coverages || []);
          setAutoPolicyNo(bundle.firstBa.policyNo || '');
          setAutoEffDate(bundle.firstBa.effDate || '');
          setAutoExpDate(bundle.firstBa.expDate || '');
        }

        setPolicyCoveragesMap(bundle.policyCoveragesMap || {});
      }

      let allDocuments: any[] = [];
      if (docRes && docRes.ok) {
        allDocuments = await docRes.json();
      }

      let formattedCerts: any[] = [];
      if (certRes.ok) {
        const certData = await certRes.json();
        const year = new Date().getFullYear();
        // Zero extra HTTP calls: holders are pre-joined in each cert!
        formattedCerts = certData.map((c: any) => {
          const certDbId = String(c.id);
          const certNumber = `${year}${certDbId.padStart(2, '0')}`;
          const holders = c.holders || [];

          const holderChildren: TreeNode[] = holders.map((h: any) => {
            const hId = `holder-${h.id}`;
            const hDocs = allDocuments.filter(d => d.ref_num === hId);
            const hChildren: TreeNode[] = hDocs.map(d => ({
              id: `doc-${d.id}`,
              label: d.file_name,
              type: "file",
              documentData: d,
              formType: "Certificates"
            }));

            return {
              id: hId,
              label: [
                h.name,
                h.address,
                [h.city, h.state, h.zip].filter(Boolean).join(', ')
              ].filter(Boolean).join(', '),
              type: hChildren.length > 0 ? "folder" : "file",
              children: hChildren.length > 0 ? hChildren : undefined,
              formType: "Certificates",
              holderData: {
                name: h.name || '',
                address: h.address || '',
                address2: h.address2 || '',
                city: h.city || '',
                state: h.state || '',
                zip: h.zip || '',
                desc_of_ops: h.desc_of_ops || '',
                issue_date: h.issue_date || '',
                written_notice_days: h.written_notice_days ?? 10,
                dbId: h.id,
                additional_insured: h.additional_insured || {},
                waiver_subrogation: h.waiver_subrogation || {},
              },
            };
          });

          const certNodeId = `cert-file-master-${c.id}`;
          const certDocs = allDocuments.filter(d => d.ref_num === certNodeId);
          const docChildren: TreeNode[] = certDocs.map(d => ({
            id: `doc-${d.id}`,
            label: d.file_name,
            type: "file",
            documentData: d,
            formType: "Certificates"
          }));

          return {
            id: certNodeId,
            label: c.description || certNumber,
            type: "folder" as const,
            formType: "Certificates",
            isMaster: true,
            masterData: c,
            certNumber,
            certDbId,
            children: [...holderChildren, ...docChildren],
          };
        });

        setCreatedCertificates(formattedCerts);

        // ── Auto-select a newly-created master certificate if one is pending ──
        if (pendingSelectRef.current) {
          const targetId = pendingSelectRef.current;
          pendingSelectRef.current = null;
          const found = formattedCerts.find((c: any) => c.id === targetId);
          if (found) {
            setActiveTab("Certificates");
            setSelectedNode(targetId);
          } else {
            // Fallback: select the last certificate (most recently created)
            const last = formattedCerts[formattedCerts.length - 1];
            if (last) {
              setActiveTab("Certificates");
              setSelectedNode(last.id);
            }
          }
        }
      }

      // Save fresh payload to session cache for instant future loads
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          customer: custData,
          policies: bundleData.policies || [],
          policyCoveragesMap: bundleData.policyCoveragesMap || {},
          createdCertificates: formattedCerts
        }));
      } catch {}

    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [customerId, router]);

  const handleCopyMaster = async (nodeId: string) => {
    const certDbId = nodeId.replace("cert-file-master-", "");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 1. Fetch the certificate to copy
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch certificates");
      const certs = await res.json();
      const certToCopy = certs.find((c: any) => String(c.id) === certDbId);

      if (!certToCopy) {
        showToast("Certificate not found", "error");
        return;
      }

      // 2. Create the new certificate copy
      const newCertData = {
        description: certToCopy.description ? `${certToCopy.description} (Copy)` : "Copy of Certificate",
        form_type: certToCopy.form_type,
        form_data: certToCopy.form_data
      };

      const createRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newCertData)
      });

      if (!createRes.ok) throw new Error("Failed to create copy");
      const createdCert = await createRes.json();
      const newCertDbId = createdCert.id;

      // 3. Fetch all holders from the original certificate
      const holdersRes = await fetch(
        `${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}/holders`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (holdersRes.ok) {
        const holders = await holdersRes.json();
        // 4. Copy each holder into the new certificate
        await Promise.all(
          holders.map((h: any) =>
            fetch(
              `${API_BASE_URL}/api/customers/${customerId}/certificates/${newCertDbId}/holders`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                  name: h.name,
                  contact: h.contact,
                  address: h.address,
                  address2: h.address2,
                  city: h.city,
                  state: h.state,
                  zip: h.zip,
                  email: h.email,
                  fax: h.fax,
                  fax_ext: h.fax_ext,
                  issue_date: h.issue_date,
                  written_notice_days: h.written_notice_days,
                  desc_of_ops: h.desc_of_ops,
                  same_as_master: h.same_as_master,
                  note: h.note,
                  print_note: h.print_note,
                  job_type: h.job_type,
                  job_num: h.job_num,
                  project_end_date: h.project_end_date,
                  licensed: h.licensed,
                  bonded: h.bonded,
                  write_to_list: h.write_to_list,
                  distribution_method: h.distribution_method,
                  name_selection: h.name_selection,
                  additional_insured: h.additional_insured || {},
                  waiver_subrogation: h.waiver_subrogation || {},
                }),
              }
            )
          )
        );
      }

      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("Error copying certificate", "error");
    }
  };

  const handleDeleteMaster = async (nodeId: string) => {
    if (!(await confirmDialog("Are you sure you want to delete this master certificate?", "Delete Certificate"))) return;
    const certDbId = nodeId.replace("cert-file-master-", "");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete certificate");
      
      await fetchData();
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting certificate", "error");
    }
  };

  const handleDeleteHolder = async (nodeId: string) => {
    if (!(await confirmDialog("Are you sure you want to delete this certificate holder?", "Delete Holder"))) return;
    const holderDbId = nodeId.replace("holder-", "");
    const parentCert = createdCertificates.find(c => 
      c.children && c.children.some((child: any) => child.id === nodeId)
    );
    const certDbId = parentCert ? parentCert.id.replace("cert-file-master-", "") : null;
    if (!certDbId) {
      showToast("Certificate for this holder not found", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}/holders/${holderDbId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete certificate holder");

      showToast("Certificate holder deleted successfully", "success");
      await fetchData();
      if (selectedNode === nodeId) {
        setSelectedNode(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting certificate holder", "error");
    }
  };

  const handleDeleteHolderAttachments = async (nodeId: string) => {
    if (!(await confirmDialog("Are you sure you want to delete all attachments for this holder?", "Delete Attachments"))) return;

    const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const n of nodes) {
        if (n.id === id) return n;
        if (n.children) {
          const found = findNode(n.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const holderNode = findNode(createdCertificates, nodeId);
    const attachments = holderNode?.children || [];
    if (attachments.length === 0) {
      showToast("No attachments found for this holder", "info");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      for (const att of attachments) {
        if (att.documentData?.id) {
          await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents/${att.documentData.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }

      showToast("Attachments deleted successfully", "success");
      await fetchData();
      if (selectedNode && selectedNode.startsWith("doc-")) {
        setSelectedNode(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting attachments", "error");
    }
  };

  const handleDeleteDocument = async (docId: string | number) => {
    if (!(await confirmDialog("Are you sure you want to delete this attachment?", "Delete Attachment"))) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete attachment");

      showToast("Attachment deleted successfully", "success");
      await fetchData();
      if (selectedNode === `doc-${docId}`) {
        setSelectedNode(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting attachment", "error");
    }
  };

  const handleUpdateMaster = (nodeId: string) => {
    const certDbId = nodeId.replace("cert-file-master-", "");
    window.open(
      `/agency/customer/${customerId}/eforms-manager/new-certificate?certDbId=${certDbId}`,
      '_blank',
      'width=1050,height=800,menubar=no,toolbar=no'
    );
  };

  const handleOpenInterests = (id: string) => {
    const certDbId = id.replace("cert-file-master-", "");
    const year = new Date().getFullYear();
    const certNumber = `${year}${certDbId.padStart(2, '0')}`;
    const cert = createdCertificates.find(c => String(c.certDbId) === certDbId || c.id === id);
    const certNum = cert?.certNumber || certNumber;
    window.open(
      `/agency/customer/${customerId}/eforms-manager/add-edit-holder?certId=${certNum}&certDbId=${certDbId}`,
      '_blank',
      'width=1150,height=850,menubar=no,toolbar=no'
    );
  };

  const handleOpenAttachments = (nodeId: string) => {
    setAttachmentContextNode(nodeId);
    setAttachmentCategory(nodeId.startsWith("cert-file-master-") ? "Master" : "Holder");
    setAttachmentFile(null);
    setAttachmentDescription("");
    setAttachmentModalOpen(true);
  };

  const handleUploadAttachment = async () => {
    if (!attachmentFile) {
      showToast("Please select a file to attach.", "warning");
      return;
    }
    setIsUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const formData = new FormData();
      formData.append("file", attachmentFile);
      formData.append("action", "eForms Attachment");
      formData.append("description", attachmentDescription);
      formData.append("refNum", attachmentContextNode || "");
      formData.append("category", attachmentCategory);

      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        throw new Error("Failed to upload document");
      }

      showToast("Attachment uploaded successfully to live server.", "success");
      setAttachmentModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("Error uploading attachment.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchData();
  }, [customerId, fetchData]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CREATE_CERTIFICATE') {
        // Store the target node ID so fetchData can auto-select it after refresh
        const dbId = String(event.data.payload.id);
        pendingSelectRef.current = `cert-file-master-${dbId}`;
        // Refresh from backend so the new cert has full data (masterData, isMaster, etc.)
        fetchData();
      } else if (event.data?.type === 'UPDATE_CERTIFICATE') {
        fetchData();
      } else if (event.data?.type === 'FIELD_EDITED') {
        setEditedFields(prev => ({ ...prev, [event.data.fieldId]: event.data.value }));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [fetchData]);

  // ── Build tree data: Master > Holder > Attachment ──
  const buildTree = (): TreeNode[] => {
    if (!customer) return [];
    return createdCertificates;
  };

  const treeData = buildTree();

  // ── Filter tree by active tab ──
  const filterTree = (nodes: TreeNode[], _tab: EFormTab): TreeNode[] => {
    return nodes;
  };

  const displayTree = filterTree(treeData, activeTab);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-bg-base font-sans">
        <div className="bg-white/80 backdrop-blur-xl border-b border-border-main h-12 px-4 flex items-center gap-3 shrink-0">
          <FileSignature size={18} className="text-primary" />
          <span className="font-bold text-sm text-text-main">eForms Manager</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={28} />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">
              Loading eForms Manager...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !customer) {
    return (
      <div className="flex flex-col h-screen bg-bg-base font-sans">
        <div className="bg-white border-b border-border-main h-12 px-4 flex items-center gap-3 shrink-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle size={28} className="text-danger" />
            <p className="font-bold text-sm text-text-main">Failed to Load</p>
            <p className="text-xs text-slate-400">{error || "Customer not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const customerName =
    customer.firm_name ||
    customer.firmName ||
    customer.company_name ||
    customer.companyName ||
    customer.dba ||
    customer.name ||
    [customer.first_name, customer.last_name].filter(Boolean).join(" ") ||
    "Unknown";

  const renderActionButtons = () => {
    switch (activeTab) {
      case "All Forms":
        return (
          <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
            <Trash2 size={13} />
            Delete
          </button>
        );
      case "Applications":
      case "Loss Notices":
        return (
          <>
            <button
              onClick={() => {
                if (activeTab === "Applications") {
                  window.open(`/agency/customer/${customerId}/eforms-manager/new-application`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
                } else if (activeTab === "Loss Notices") {
                  window.open(`/agency/customer/${customerId}/eforms-manager/new-loss-notice`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
                }
              }}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              <Trash2 size={13} /> Delete
            </button>
          </>
        );
      case "AutoId Cards":
        return (
          <>
            <button
              onClick={() => {
                if (activeTab === "AutoId Cards") {
                  window.open(`/agency/customer/${customerId}/eforms-manager/new-autoid`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no');
                }
              }}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
              New & Email
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
              New & Print
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              <Trash2 size={13} /> Delete
            </button>
          </>
        );
      case "Binders":
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-binder`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-3.5 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"><Copy size={13} /> Copy</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Cancel</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Extend</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Replaced by Policy</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Update</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Replace</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Interests</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </div>
        );
      case "Certificates": {
        const isMaster = selectedNode?.startsWith("cert-file-master-");
        if (isMaster) {
          return (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-certificate`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
                className="h-8 px-3.5 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
              >
                <Plus size={14} /> New Cert Liab
              </button>
              <button
                onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-cert-prop`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
                className="h-8 px-3.5 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
              >
                <Plus size={14} /> New Cert Prop
              </button>
              <button
                onClick={() => selectedNode && handleCopyMaster(selectedNode)}
                className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Copy size={13} /> Copy
              </button>
              <button
                onClick={() => selectedNode && handleUpdateMaster(selectedNode)}
                className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Update
              </button>
              <button
                onClick={() => selectedNode && handleOpenInterests(selectedNode)}
                className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Interests
              </button>
              <button
                onClick={() => {
                  if (selectedNode) {
                    const certDbId = selectedNode.replace("cert-file-master-", "");
                    const cert = createdCertificates.find(c => c.id === selectedNode);
                    const certNum = cert?.certNumber || certDbId;
                    window.open(
                      `/agency/customer/${customerId}/eforms-manager/distribute-certificates?certDbId=${certDbId}&certNum=${certNum}`,
                      '_blank',
                      'width=1150,height=820,menubar=no,toolbar=no'
                    );
                  }
                }}
                className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Distribute Certificates
              </button>
              <button
                onClick={() => selectedNode && handleDeleteMaster(selectedNode)}
                className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          );
        }

        return (
          <>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-certificate`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New Cert Liab
            </button>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-cert-prop`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New Cert Prop
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </>
        );
      }
      case "EPI":
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-epi`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"><Copy size={13} /> Copy</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Update</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Replace</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Interests</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">Distribute EPI</button>
            <button className="h-8 px-3 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </div>
        );
      case "Change Requests":
        return (
          <>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-change-request`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"><Copy size={13} /> Copy</button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
          </>
        );
      case "Cancellations":
        return (
          <>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-cancellation`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-primary/20"
            >
              <Plus size={14} /> New
            </button>
            <button
              onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-email`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
              className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              New & Email
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-secondary/60 text-text-muted hover:text-primary font-bold text-xs rounded-xl transition-all cursor-pointer">
              New & Print
            </button>
            <button className="h-8 px-4 flex items-center gap-1.5 border border-border-main bg-white hover:bg-red-50 text-text-muted hover:text-red-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
              <Trash2 size={13} /> Delete
            </button>
          </>
        );
      default:
        return null;
    }
  };

  // ─── Main Render ───────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50' : 'h-screen'} bg-[#f5f1eb] font-sans select-none overflow-hidden text-[#2d2a26]`}>

      {/* ── Top Header (Commented Out) ── */}
      {/* <header className="bg-white border-b border-[#e5ddd5] px-6 py-2.5 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#9A8B7A] flex items-center justify-center text-white shadow-xs">
            <Landmark size={22} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-[#2d2a26] leading-tight">Sterling AMS</span>
            <span className="text-[11px] text-[#8c827a] font-medium leading-tight">Insurance Agency</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 ml-8 text-xs text-[#8c827a]">
            <button onClick={() => router.push('/agency/dashboard')} className="hover:text-[#2d2a26] cursor-pointer">Agency</button>
            <ChevronRight size={12} className="text-[#b5aca2]" />
            <button onClick={() => router.push(`/agency/customer/${customerId}`)} className="hover:text-[#2d2a26] cursor-pointer">Customer</button>
            <ChevronRight size={12} className="text-[#b5aca2]" />
            <span className="hover:text-[#2d2a26] cursor-pointer" onClick={() => router.push(`/agency/customer/${customerId}`)}>{customerName}</span>
            <ChevronRight size={12} className="text-[#b5aca2]" />
            <span className="font-bold text-[#2d2a26]">eForms Manager</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[#e5ddd5] rounded-xl text-xs text-[#8c827a] w-72 shadow-2xs">
            <Search size={14} className="text-[#a89d91]" />
            <input
              type="text"
              placeholder="Search customers, policies, documents..."
              className="w-full bg-transparent border-none outline-none text-[#2d2a26] text-xs placeholder:text-[#a89d91]"
            />
            <span className="text-[10px] bg-[#f5f1eb] text-[#8c827a] px-1.5 py-0.5 rounded font-mono border border-[#e5ddd5] shrink-0">Ctrl + K</span>
          </div>

          <div className="relative">
            <button
              onClick={() => showToast("3 new notifications", "info")}
              className="h-9 w-9 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#faf8f5] text-[#2d2a26] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>
          </div>

          <button
            onClick={() => router.push("/agency/agency-profile")}
            className="h-9 w-9 rounded-full bg-[#9A8B7A] text-white flex items-center justify-center font-bold text-sm shadow-2xs cursor-pointer uppercase"
            title="Profile"
          >
            {customerName ? customerName.charAt(0) : "S"}
          </button>
        </div>
      </header> */}

      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ── Main Content Area ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f5f1eb] p-3 md:p-4">

        {/* ─ Modern Floating eForms Card ─ */}
        <div className="bg-white border border-[#e5ddd5] rounded-3xl flex flex-col flex-1 shrink-0 shadow-sm overflow-hidden min-h-0">

          {/* Card Header Action Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-6 py-3.5 border-b border-[#f0ece5] gap-4 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[#f7f4ee] border border-[#ebe5dc] flex items-center justify-center text-[#9A8B7A] shrink-0 shadow-2xs">
                <Landmark size={24} className="stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-extrabold text-lg text-[#2d2a26] tracking-tight truncate">
                    {customerName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0]">
                    Active
                  </span>
                </div>
                <p className="text-xs text-[#70665d] font-medium mt-0.5 truncate">
                  Policy #{selectedPolicy || policies[0]?.policyNum || "8767"} | Effective: {selectedEffDate ? selectedEffDate.split(',')[0].replace(' - NBS', '').trim() : (policies[0]?.effDate || "2026-09-04")} | NBS New business
                </p>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={handleSaveOverrides}
                className="h-8 px-4 flex items-center gap-1.5 bg-[#9A8B7A] hover:bg-[#8a6f4d] text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                title="Save Changes"
              >
                <Save size={13} />
                <span>Save</span>
              </button>

              <button
                title="Email Forms"
                onClick={() => {
                  window.open(
                    `/agency/customer/${customerId}/eforms-manager/email-options?selected=${encodeURIComponent(selectedNode || "")}`,
                    "_blank",
                    "width=920,height=680,menubar=no,toolbar=no,location=no,status=no"
                  );
                }}
                className="h-8 px-3.5 flex items-center gap-1.5 bg-white border border-[#e5ddd5] hover:bg-[#faf8f5] text-[#2d2a26] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Mail size={13} />
                <span>Email Forms</span>
              </button>

              <button
                title="Print Forms"
                onClick={() => {
                  window.open(
                    `/agency/customer/${customerId}/eforms-manager/print-options?selected=${encodeURIComponent(selectedNode || "")}`,
                    "_blank",
                    "width=850,height=600,menubar=no,toolbar=no,location=no,status=no"
                  );
                }}
                className="h-8 px-3.5 flex items-center gap-1.5 bg-white border border-[#e5ddd5] hover:bg-[#faf8f5] text-[#2d2a26] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Forms</span>
              </button>

              {/* Edit Form Toggle if applicable */}
              {(selectedNode?.startsWith("cert-file-master-")) && (
                <>
                  <div className="h-5 w-px bg-[#e5ddd5] mx-0.5" />
                  {!isEditing ? (
                    <button
                      title="Edit Form"
                      onClick={() => {
                        setIsEditing(true);
                        setIframeKey(selectedNode + '_edit_' + Date.now());
                      }}
                      className="h-8 px-3.5 flex items-center gap-1.5 bg-white border border-[#e5ddd5] hover:bg-[#faf8f5] text-[#2d2a26] font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span className="hidden sm:inline">Edit Form</span>
                    </button>
                  ) : (
                    <>
                      <button
                        title="Cancel Editing"
                        onClick={handleCancelEdit}
                        className="h-8 px-3 flex items-center gap-1.5 border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        <span className="hidden sm:inline">Cancel</span>
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Horizontal Category Tabs (Commented Out) */}
          {/* <div className="px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-[#f0ece5] custom-scrollbar bg-white">
            {EFORM_TABS.map((tab) => {
              const Icon = TAB_ICONS[tab] || FileText;
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    h-8 px-3.5 flex items-center gap-2 text-xs whitespace-nowrap transition-all cursor-pointer rounded-xl shrink-0
                    ${isActive
                      ? "bg-[#eae3d5] border border-[#d3c5b2] text-[#2d2a26] font-bold shadow-2xs"
                      : "text-[#70665d] hover:text-[#2d2a26] hover:bg-[#f6f2ec] font-semibold"
                    }
                  `}
                >
                  <Icon size={14} className={isActive ? "text-[#2d2a26]" : "text-[#8c827a]"} />
                  <span>{tab}</span>
                </button>
              );
            })}
          </div> */}

          {/* ── Main Content Split: Left Panel + Right Panel ── */}
          <div className="flex flex-1 min-h-0 overflow-hidden relative">

            {/* ── Left Panel: Customer/Policy selectors + Tree ── */}
            <div className={`shrink-0 border-r border-[#f0ece5] bg-white flex flex-col h-full transition-all duration-300 overflow-hidden ${showTreePanel ? "w-[305px]" : "w-0 border-r-0"}`}>

              {/* Filters Section */}
              <div className="p-3.5 flex flex-col gap-2.5 border-b border-[#f0ece5] bg-white">

                {/* Top Action Buttons */}
                {activeTab === "Certificates" ? (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* + New Cert Liab */}
                    <button
                      onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-certificate`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
                      className="h-8 px-3.5 flex items-center gap-1.5 bg-[#8c7a6b] hover:bg-[#7b6b5d] text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Plus size={14} className="stroke-[2.2]" />
                      <span>New Cert Liab</span>
                    </button>

                    {/* + New Cert Prop */}
                    <button
                      onClick={() => window.open(`/agency/customer/${customerId}/eforms-manager/new-cert-prop`, '_blank', 'width=1050,height=800,menubar=no,toolbar=no')}
                      className="h-8 px-3.5 flex items-center gap-1.5 bg-[#8c7a6b] hover:bg-[#7b6b5d] text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Plus size={14} className="stroke-[2.2]" />
                      <span>New Cert Prop</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={async () => {
                        if (selectedNode) {
                          if (selectedNode.startsWith("cert-file-master-")) {
                            handleDeleteMaster(selectedNode);
                          } else if (selectedNode.startsWith("holder-")) {
                            handleDeleteHolder(selectedNode);
                          } else if (selectedNode.startsWith("doc-")) {
                            const docDbId = selectedNode.replace("doc-", "");
                            handleDeleteDocument(docDbId);
                          } else {
                            showToast("Selected item removed", "success");
                          }
                        } else {
                          showToast("Please select an item from the tree to delete.", "info");
                        }
                      }}
                      className="h-8 px-3.5 flex items-center gap-1.5 border border-[#d6cfc7] bg-white hover:bg-[#faf7f4] text-[#4a453e] font-semibold text-xs rounded-full transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Trash2 size={13} className="text-[#5c544c]" />
                      <span>Delete</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={async () => {
                        if (selectedNode) {
                          const confirmed = await confirmDialog("Are you sure you want to delete this selected item?", "Delete Item");
                          if (confirmed) {
                            if (selectedNode.startsWith("cert-file-master-")) {
                              handleDeleteMaster(selectedNode);
                            } else {
                              showToast("Selected item removed", "success");
                            }
                          }
                        } else {
                          showToast("Please select an item from the tree to delete.", "info");
                        }
                      }}
                      className="h-8 px-3.5 flex items-center gap-1.5 border border-[#d6cfc7] bg-white hover:bg-[#faf7f4] text-[#4a453e] font-semibold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                    >
                      <Trash2 size={13} className="text-[#5c544c]" />
                      <span>Delete</span>
                    </button>

                    {/* Contextual actions for active tabs */}
                    {(activeTab === "Applications" || activeTab === "Loss Notices" || activeTab === "AutoId Cards" || activeTab === "Binders" || activeTab === "Cancellations") && (
                      <button
                        onClick={() => {
                          if (activeTab === "Applications") window.open(`/agency/customer/${customerId}/eforms-manager/new-application`, '_blank', 'width=1050,height=800');
                          else if (activeTab === "Loss Notices") window.open(`/agency/customer/${customerId}/eforms-manager/new-loss-notice`, '_blank', 'width=1050,height=800');
                          else if (activeTab === "AutoId Cards") window.open(`/agency/customer/${customerId}/eforms-manager/new-autoid`, '_blank', 'width=1050,height=800');
                          else if (activeTab === "Binders") window.open(`/agency/customer/${customerId}/eforms-manager/new-binder`, '_blank', 'width=1050,height=800');
                          else if (activeTab === "Cancellations") window.open(`/agency/customer/${customerId}/eforms-manager/new-cancellation`, '_blank', 'width=1050,height=800');
                        }}
                        className="h-8 px-3.5 flex items-center gap-1.5 bg-[#8c7a6b] hover:bg-[#7b6b5d] text-white font-semibold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                      >
                        <Plus size={14} className="stroke-[2.2]" />
                        <span>New</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Customer field (Commented Out) */}
                {/* <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#8c827a] uppercase tracking-wider">CUSTOMER</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={customerName}
                      readOnly
                      className="flex-1 text-xs font-semibold text-[#2d2a26] bg-[#faf8f5] border border-[#e5ddd5] rounded-xl px-2.5 py-1.5 outline-none truncate"
                    />
                    <button className="h-7 w-7 rounded-lg bg-white border border-[#e5ddd5] hover:bg-[#faf8f5] flex items-center justify-center text-[#8c827a] hover:text-[#2d2a26] transition-colors cursor-pointer shrink-0">
                      <Search size={13} />
                    </button>
                  </div>
                </div> */}

                {/* Policy # dropdown (Commented Out) */}
                {/* <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#8c827a] uppercase tracking-wider">POLICY #</label>
                  <div className="relative">
                    <select
                      value={selectedPolicy}
                      onChange={(e) => setSelectedPolicy(e.target.value)}
                      className="w-full text-xs font-semibold text-[#2d2a26] bg-white border border-[#e5ddd5] rounded-xl px-2.5 py-1.5 pr-7 outline-none focus:border-[#9A8B7A] cursor-pointer truncate appearance-none"
                      title={selectedPolicy}
                    >
                      {policies.map((p) => (
                        <option key={p.id} value={p.policyNum}>
                          {p.policyNum}{p.type ? `, ${p.type}` : ""}{p.status ? `, ${p.status}` : ""}{p.term ? `, ${p.term}` : "12 Months"}
                        </option>
                      ))}
                      {policies.length === 0 && (
                        <option value="">8767, New business, Active, 12 Months</option>
                      )}
                    </select>
                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8c827a] pointer-events-none" />
                  </div>
                </div> */}

                {/* Eff Date field (Commented Out) */}
                {/* <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-[#8c827a] uppercase tracking-wider">EFFECTIVE DATE</label>
                  <div className="flex items-center gap-2 bg-white border border-[#e5ddd5] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2d2a26]">
                    <Calendar size={14} className="text-[#8c827a] shrink-0" />
                    <span className="truncate">
                      {selectedEffDate ? selectedEffDate.split(',')[0].trim() : (policies[0]?.effDate || "2026-09-04")} - NBS
                    </span>
                  </div>
                </div> */}
              </div>

              {/* Tree View */}
              <div 
                className={`flex-1 overflow-y-auto p-2 transition-colors custom-scrollbar ${
                  isDragging ? "bg-amber-50/50 border-2 border-dashed border-[#9A8B7A]" : "bg-white"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {displayTree.length > 0 ? (
                  displayTree.map((node) => (
                    <TreeItem
                      key={node.id}
                      node={node}
                      selected={selectedNode}
                      onSelect={setSelectedNode}
                      onCopyMaster={handleCopyMaster}
                      onDeleteMaster={handleDeleteMaster}
                      onUpdateMaster={handleUpdateMaster}
                      onOpenAttachments={handleOpenAttachments}
                      onAddEditHolder={handleOpenInterests}
                      onDeleteHolder={handleDeleteHolder}
                      onDeleteHolderAttachments={handleDeleteHolderAttachments}
                      onDeleteDocument={handleDeleteDocument}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <FileText size={24} className="text-[#d8cdbd] mb-2" />
                    <p className="text-xs font-bold text-[#8c827a]">No forms found</p>
                    <p className="text-[10px] text-[#a89d91] mt-1">
                      No eForms available for this filter.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Right Panel: Form preview area ── */}
            <div 
              className={`flex-1 flex flex-col bg-[#faf8f5]/40 overflow-hidden relative ${
                isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''
              }`} 
              id="eform-preview-panel"
            >

              {/* Preview Header Bar */}
              <div className="px-6 py-3 border-b border-[#f0ece5] flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-[#f7f4ee] border border-[#ebe5dc] flex items-center justify-center text-[#9A8B7A] shrink-0">
                    <FileSignature size={18} />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-[#2d2a26] tracking-tight">eForms Preview</h2>
                    <p className="text-xs text-[#8c827a] font-normal hidden sm:block">
                      Select a certificate holder from the tree to preview the ACORD form with holder details.
                    </p>
                  </div>
                </div>

                {/* Zoom Controls & Fullscreen */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-[#e5ddd5] rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                      className="h-7 px-2.5 flex items-center justify-center text-[#6b5e52] hover:bg-[#faf8f5] text-xs font-bold transition-colors cursor-pointer"
                      title="Zoom Out"
                    >
                      <Minus size={13} />
                    </button>

                    <div className="relative" ref={zoomMenuRef}>
                      <button
                        onClick={() => setZoomDropdownOpen(prev => !prev)}
                        className="px-2.5 text-xs font-semibold text-[#2d2a26] border-x border-[#e5ddd5] h-7 flex items-center justify-center select-none hover:bg-[#faf8f5] transition-colors cursor-pointer gap-1"
                        title="Select Zoom Level"
                      >
                        <span>{zoomLevel}%</span>
                        <ChevronDown size={11} className={`text-[#8c827a] transition-transform ${zoomDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {zoomDropdownOpen && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-24 bg-white border border-[#e5ddd5] rounded-xl shadow-xl py-1 z-50 text-xs font-semibold text-[#2d2a26] animate-in fade-in zoom-in-95 duration-100">
                          {[50, 75, 90, 100, 125, 150, 200].map((val) => (
                            <button
                              key={val}
                              onClick={() => {
                                setZoomLevel(val);
                                setZoomDropdownOpen(false);
                              }}
                              className={`w-full text-center py-1.5 px-2 hover:bg-[#f5f1eb] cursor-pointer transition-colors ${
                                zoomLevel === val ? 'text-[#9A8B7A] font-bold bg-[#faf8f5]' : ''
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setZoomLevel(prev => Math.min(200, prev + 10))}
                      className="h-7 px-2.5 flex items-center justify-center text-[#6b5e52] hover:bg-[#faf8f5] text-xs font-bold transition-colors cursor-pointer"
                      title="Zoom In"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <button
                    onClick={handleToggleFullscreen}
                    className="h-7 w-7 rounded-full border border-[#e5ddd5] bg-white hover:bg-[#faf8f5] flex items-center justify-center text-[#6b5e52] shadow-2xs transition-colors cursor-pointer ml-1"
                    title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  </button>
                </div>
              </div>

              {/* Scrollable Viewport with Zoom Scale Applied */}
              <div 
                className="flex-1 overflow-auto flex flex-col items-center justify-start bg-slate-50/50 p-2 sm:p-4 relative" 
                id="eform-zoom-viewport"
              >
                <div 
                  style={{ 
                    zoom: `${zoomLevel}%`,
                    transformOrigin: 'top center',
                  }}
                  className="w-full h-full flex-1 flex flex-col items-center justify-start transition-all duration-100"
                >
              {(() => {
                // Find if the selected node is a holder node by searching the tree
                const findNodeById = (nodes: TreeNode[], id: string): TreeNode | null => {
                  for (const n of nodes) {
                    if (n.id === id) return n;
                    if (n.children) {
                      const found = findNodeById(n.children, id);
                      if (found) return found;
                    }
                  }
                  return null;
                };
                const selected = selectedNode ? findNodeById(treeData, selectedNode) : null;
                const isHolderNode = selected?.holderData != null;
                const isMasterNode = selectedNode?.startsWith("cert-file-master-");
                
                // Identify the relevant certificate
                let activeCert: any = null;
                if (isHolderNode) {
                  const parentCertNode = treeData.find(c => 
                    c.children && c.children.some((child: any) => child.id === selectedNode)
                  );
                  activeCert = parentCertNode?.masterData;
                } else if (isMasterNode) {
                  activeCert = selected?.masterData;
                }

                // Resolve coverages from policyCoveragesMap based on rowSelections
                const rowSelections = activeCert?.form_data?.rowSelections || {};
                
                // 0: General Liability
                const glSelectedPol = rowSelections[0];
                const glMap = glSelectedPol ? policyCoveragesMap[glSelectedPol] : null;
                const localGlCoverages = glMap?.gl || [];
                const localGlPolicyNo = glSelectedPol || '';
                const localGlEffDate = glMap?.effDate || '';
                const localGlExpDate = glMap?.expDate || '';

                // 1: Automobile
                const autoSelectedPol = rowSelections[1];
                const autoMap = autoSelectedPol ? policyCoveragesMap[autoSelectedPol] : null;
                const localBaCoverages = autoMap?.ba || [];
                const localAutoPolicyNo = autoSelectedPol || '';
                const localAutoEffDate = autoMap?.effDate || '';
                const localAutoExpDate = autoMap?.expDate || '';

                // 7: Umbrella
                const umbSelectedPol = rowSelections[7];
                const umbMap = umbSelectedPol ? policyCoveragesMap[umbSelectedPol] : null;
                const localUmbCoverages = umbMap?.umb || [];
                const localUmbPolicyNo = umbSelectedPol || '';
                const localUmbEffDate = umbMap?.effDate || '';
                const localUmbExpDate = umbMap?.expDate || '';

                // 4: Workers Comp
                const wcSelectedPol = rowSelections[4];
                const wcMap = wcSelectedPol ? policyCoveragesMap[wcSelectedPol] : null;
                const localWcPart2 = wcMap?.wc || null;
                const localWcPolicyNo = wcSelectedPol || '';
                const localWcEffDate = wcMap?.effDate || '';
                const localWcExpDate = wcMap?.expDate || '';

                const glLimits = {
                  eachOccurrence:     findLimit(localGlCoverages, "each occurrence"),
                  damagePremises:     findLimit(localGlCoverages, "fire damage", "damage to rented"),
                  medExp:             findLimit(localGlCoverages, "medical expense", "med exp"),
                  personalAdv:        findLimit(localGlCoverages, "personal & advertising", "personal & adv"),
                  generalAggregate:   findLimit(localGlCoverages, "general aggregate"),
                  productsCompOp:     findLimit(localGlCoverages, "products/completed", "products - comp"),
                };
                
                const umbLimits = {
                  eachOccurrence: localUmbCoverages.length > 0 ? formatLimit(localUmbCoverages[0].limit2) : '',
                  aggregate:      localUmbCoverages.length > 0 ? formatLimit(localUmbCoverages[0].limit1) : '',
                };

                const wcLimits = {
                  eachAccident:       localWcPart2 ? formatLimit(localWcPart2.eachAccidentLimit) : '',
                  diseaseEaEmployee:  localWcPart2 ? formatLimit(localWcPart2.diseaseEachEmployee) : '',
                  diseasePolicyLimit: localWcPart2 ? formatLimit(localWcPart2.diseasePolicyLimit) : '',
                };

                const baLimits = {
                  combinedSingleLimit: findLimit(localBaCoverages, "combined single limit"),
                  bodilyInjuryPerson: findLimit(localBaCoverages, "bodily injury"),
                  bodilyInjuryAccident: findLimit2(localBaCoverages, "bodily injury"),
                  propertyDamage: findLimit(localBaCoverages, "property damage", "property danage"),
                };

                // Assign INSR LTR letters A/B/C/D sequentially without grouping (GL -> Umbrella -> Auto -> WC)
                const insrMapping = (() => {
                  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
                  let currentLetterIdx = 0;
                  const insurerList: { name: string, letter: string }[] = [];
                  
                  const assignNextLetter = (insurerName: string) => {
                    if (currentLetterIdx >= letters.length) return '';
                    const letter = letters[currentLetterIdx++];
                    insurerList.push({ name: (insurerName || 'Unknown Insurer').trim(), letter });
                    return letter;
                  };

                  const gl = glSelectedPol ? assignNextLetter(glMap?.insurerName || 'Unknown GL Insurer') : '';
                  const auto = autoSelectedPol ? assignNextLetter(autoMap?.insurerName || 'Unknown Auto Insurer') : '';
                  const umb = umbSelectedPol ? assignNextLetter(umbMap?.insurerName || 'Unknown Umb Insurer') : '';
                  const wc = wcSelectedPol ? assignNextLetter(wcMap?.insurerName || 'Unknown WC Insurer') : '';

                  return { gl, auto, umb, wc, insurers: insurerList };
                })();

                const commonCustomerParams = {
                  insuredName: customer?.name || '',
                  insuredAddress: customer?.address || '',
                  insuredAddress2: customer?.address2 || '',
                  insuredCity: customer?.city || '',
                  insuredState: customer?.state || '',
                  insuredZip: customer?.zip || '',
                  contactName: customer?.contact_person?.name || '',
                  contactPhone: customer?.contact_person?.phone || '',
                  contactEmail: customer?.contact_person?.email || '',
                  contactFax: customer?.contact_person?.fax || '',
                  apiUrl: API_BASE_URL,
                };

                const dynamicInsurerParams = {
                  insurerA: insrMapping.insurers[0]?.name || '',
                  insurerB: insrMapping.insurers[1]?.name || '',
                  insurerC: insrMapping.insurers[2]?.name || '',
                  insurerD: insrMapping.insurers[3]?.name || '',
                  insurerE: insrMapping.insurers[4]?.name || '',
                  insurerF: insrMapping.insurers[5]?.name || '',
                };

                if (isHolderNode && selected?.holderData) {
                  const h = selected.holderData;
                  // Find parent certificate node to get its description
                  const parentCert = createdCertificates.find(c => 
                    c.children && c.children.some((child: any) => child.id === selectedNode)
                  );
                  const masterDesc = parentCert?.label || '';
                  const params = new URLSearchParams({
                    customerId: customerId || '',
                    ...commonCustomerParams,
                    holderName: h.name,
                    holderAddress: h.address,
                    holderAddress2: h.address2,
                    holderCity: h.city,
                    holderState: h.state,
                    holderZip: h.zip,
                    holderDesc: h.desc_of_ops,
                    holderIssueDate: h.issue_date,
                    holderNoticeDays: String(h.written_notice_days),
                    masterDesc: masterDesc,
                    additionalInsured: JSON.stringify(h.additional_insured || {}),
                    waiverSubrogation: JSON.stringify(h.waiver_subrogation || {}),
                    glPolicyNo: localGlPolicyNo,
                    glEffDate: localGlEffDate,
                    glExpDate: localGlExpDate,
                    autoPolicyNo: localAutoPolicyNo,
                    autoEffDate: localAutoEffDate,
                    autoExpDate: localAutoExpDate,
                    umbPolicyNo: localUmbPolicyNo,
                    umbEffDate: localUmbEffDate,
                    umbExpDate: localUmbExpDate,
                    wcPolicyNo: localWcPolicyNo,
                    wcEffDate: localWcEffDate,
                    wcExpDate: localWcExpDate,
                    ...dynamicInsurerParams,
                    glInsrLtr: insrMapping.gl,
                    autoInsrLtr: insrMapping.auto,
                    umbInsrLtr: insrMapping.umb,
                    wcInsrLtr: insrMapping.wc,
                    glLimitEachOcc: glLimits.eachOccurrence,
                    glLimitDamage: glLimits.damagePremises,
                    glLimitMedExp: glLimits.medExp,
                    glLimitPersonalAdv: glLimits.personalAdv,
                    glLimitGenAgg: glLimits.generalAggregate,
                    glLimitProductsComp: glLimits.productsCompOp,
                    umbLimitEachOcc: umbLimits.eachOccurrence,
                    umbLimitAgg: umbLimits.aggregate,
                    wcLimitEachAcc: wcLimits.eachAccident,
                    wcLimitDiseaseEaEmp: wcLimits.diseaseEaEmployee,
                    wcLimitDiseasePol: wcLimits.diseasePolicyLimit,
                    baLimitCombinedSingle: baLimits.combinedSingleLimit,
                    baLimitBodilyInjuryPerson: baLimits.bodilyInjuryPerson,
                    baLimitBodilyInjuryAccident: baLimits.bodilyInjuryAccident,
                    baLimitPropertyDamage: baLimits.propertyDamage,
                    overrides: JSON.stringify(overrides),
                  });
                  return <iframe key={params.toString()} src={`/acord-form.html?${params.toString()}`} className="w-full h-full border-none bg-white" />;
                } else if (isMasterNode) {
                  // Find the certificate description
                  const masterDesc = activeCert?.label || '';
                  const params = new URLSearchParams({
                    customerId: customerId || '',
                    ...commonCustomerParams,
                    masterDesc: masterDesc,
                    glPolicyNo: localGlPolicyNo,
                    glEffDate: localGlEffDate,
                    glExpDate: localGlExpDate,
                    autoPolicyNo: localAutoPolicyNo,
                    autoEffDate: localAutoEffDate,
                    autoExpDate: localAutoExpDate,
                    umbPolicyNo: localUmbPolicyNo,
                    umbEffDate: localUmbEffDate,
                    umbExpDate: localUmbExpDate,
                    wcPolicyNo: localWcPolicyNo,
                    wcEffDate: localWcEffDate,
                    wcExpDate: localWcExpDate,
                    ...dynamicInsurerParams,
                    glInsrLtr: insrMapping.gl,
                    autoInsrLtr: insrMapping.auto,
                    umbInsrLtr: insrMapping.umb,
                    wcInsrLtr: insrMapping.wc,
                    glLimitEachOcc: glLimits.eachOccurrence,
                    glLimitDamage: glLimits.damagePremises,
                    glLimitMedExp: glLimits.medExp,
                    glLimitPersonalAdv: glLimits.personalAdv,
                    glLimitGenAgg: glLimits.generalAggregate,
                    glLimitProductsComp: glLimits.productsCompOp,
                    umbLimitEachOcc: umbLimits.eachOccurrence,
                    umbLimitAgg: umbLimits.aggregate,
                    wcLimitEachAcc: wcLimits.eachAccident,
                    wcLimitDiseaseEaEmp: wcLimits.diseaseEaEmployee,
                    wcLimitDiseasePol: wcLimits.diseasePolicyLimit,
                    baLimitCombinedSingle: baLimits.combinedSingleLimit,
                    baLimitBodilyInjuryPerson: baLimits.bodilyInjuryPerson,
                    baLimitBodilyInjuryAccident: baLimits.bodilyInjuryAccident,
                    baLimitPropertyDamage: baLimits.propertyDamage,
                    isEditing: isEditing ? 'true' : 'false',
                    overrides: JSON.stringify(overrides),
                  });
                  return <iframe
                    key={iframeKey || (selectedNode + (isEditing ? '_edit' : '_view'))}
                    ref={acordIframeRef}
                    src={`/acord-form.html?${params.toString()}`}
                    className="w-full h-full border-none bg-white"
                  />;
                } else if (selectedNode?.startsWith("cert-file")) {
                  return <Acord25Form 
                    customer={customer} 
                    policies={policies} 
                    glCoverages={glCoverages} 
                    umbCoverages={umbCoverages} 
                    wcPart2={wcPart2} 
                    baCoverages={baCoverages} 
                    isEditing={isEditing}
                    overrides={{...overrides, ...editedFields}}
                    onFieldChange={handleFieldChange}
                  />;
                } else if (selectedNode?.startsWith("doc-") && selected) {
                  const docData = selected.documentData;
                  if (docData && docData.id) {
                    return <AuthenticatedDocumentPreview url={`/api/customers/${customerId}/documents/${docData.id}/download`} fileName={docData.file_name} />;
                  }
                } else {
                  return (
                    <div className="flex-1 flex flex-col p-6 items-center justify-center bg-white">
                      <div className="w-full h-full border-2 border-dashed border-[#ebe5dc] rounded-2xl flex flex-col items-center justify-center p-8 bg-[#faf8f5]/40 text-center">
                        
                        {/* Stylized Document & Magnifying Glass Graphic */}
                        <div className="relative mb-5 flex items-center justify-center">
                          <div className="w-24 h-28 bg-white border border-[#e5ddd5] rounded-xl shadow-md flex flex-col p-3 gap-2 relative">
                            <div className="w-10 h-2 bg-[#f0ece5] rounded" />
                            <div className="w-full h-1.5 bg-[#f5f1eb] rounded" />
                            <div className="w-full h-1.5 bg-[#f5f1eb] rounded" />
                            <div className="w-3/4 h-1.5 bg-[#f5f1eb] rounded" />
                            <div className="w-full h-1.5 bg-[#f5f1eb] rounded" />
                            <div className="w-1/2 h-1.5 bg-[#f5f1eb] rounded" />
                          </div>
                          {/* Magnifying Glass Overlay */}
                          <div className="absolute -bottom-2 -right-3 w-14 h-14 rounded-full bg-white border-2 border-[#e5ddd5] shadow-lg flex items-center justify-center">
                            <Search size={24} className="text-[#9A8B7A] stroke-[2.5]" />
                          </div>
                        </div>

                        {/* Heading & Subtitle */}
                        <h3 className="text-xl font-extrabold text-[#2d2a26] tracking-tight">eForms Preview</h3>
                        <p className="text-xs text-[#8c827a] max-w-sm mt-1.5 mb-10 leading-relaxed">
                          Select a certificate holder from the tree to preview the ACORD form with holder details.
                        </p>

                        {/* 4 Feature Highlights */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full">
                          {/* 1. View eForms */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
                              <FileText size={18} />
                            </div>
                            <span className="text-xs font-bold text-[#2d2a26]">View eForms</span>
                            <span className="text-[11px] text-[#8c827a]">PDF Preview</span>
                          </div>

                          {/* 2. Certificate Holders */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                              <ShieldCheck size={18} />
                            </div>
                            <span className="text-xs font-bold text-[#2d2a26]">Certificate Holders</span>
                            <span className="text-[11px] text-[#8c827a]">with Details</span>
                          </div>

                          {/* 3. Easy Navigation */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-11 h-11 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 shadow-2xs">
                              <Eye size={18} />
                            </div>
                            <span className="text-xs font-bold text-[#2d2a26]">Easy Navigation</span>
                            <span className="text-[11px] text-[#8c827a]">Tree Structure</span>
                          </div>

                          {/* 4. Fast & Secure */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2 shadow-2xs">
                              <Zap size={18} />
                            </div>
                            <span className="text-xs font-bold text-[#2d2a26]">Fast & Secure</span>
                            <span className="text-[11px] text-[#8c827a]">Document Access</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                }
              })()}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Attachment Modal ── */}
        {attachmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-slate-50/50">
                <h2 className="text-sm font-extrabold text-text-main flex items-center gap-2">
                  <Paperclip size={16} className="text-primary" />
                  Attach Document
                </h2>
                <button 
                  onClick={() => setAttachmentModalOpen(false)}
                  className="text-text-muted hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Minus size={18} />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Attach To</label>
                  <select
                    className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                    value={attachmentContextNode || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAttachmentContextNode(val);
                      setAttachmentCategory(val.startsWith("cert-file-master-") ? "Master" : "Holder");
                    }}
                  >
                    <option value="" disabled>Select Master or Holder...</option>
                    {createdCertificates.map(master => (
                      <optgroup key={master.id} label={`Master: ${master.label}`}>
                        <option value={master.id}>{master.label} (Master)</option>
                        {master.children?.filter((c: any) => c.id.startsWith("holder-")).map((holder: any) => (
                          <option key={holder.id} value={holder.id}>
                            Holder: {holder.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Document File</label>
                  <div className="relative border-2 border-dashed border-border-main rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-primary/50 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setAttachmentFile(e.target.files[0]);
                        }
                      }}
                    />
                    <UploadCloud size={28} className="text-slate-300 group-hover:text-primary transition-colors mb-2" />
                    {attachmentFile ? (
                      <p className="text-[13px] font-bold text-primary truncate max-w-[200px]">{attachmentFile.name}</p>
                    ) : (
                      <>
                        <p className="text-[13px] font-bold text-text-main">Drop file here or browse</p>
                        <p className="text-[11px] text-text-muted mt-1">PDF, DOC, DOCX, JPG, PNG</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-widest">Description</label>
                  <input
                    type="text"
                    value={attachmentDescription}
                    onChange={(e) => setAttachmentDescription(e.target.value)}
                    placeholder="Enter document description..."
                    className="w-full text-[13px] font-semibold text-text-main bg-white border border-border-main rounded-xl px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border-main bg-slate-50/50 flex items-center justify-end gap-3">
                <button
                  onClick={() => setAttachmentModalOpen(false)}
                  className="px-4 py-1.5 text-xs font-bold text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadAttachment}
                  disabled={isUploading || !attachmentFile || !attachmentContextNode}
                  className="px-5 py-2 flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-primary/20 cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={14} />
                      Attach
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}