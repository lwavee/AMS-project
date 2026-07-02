"use client";
import React, { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useParams, useRouter } from "next/navigation";
import {
  X, Printer, CheckSquare, Square, MinusSquare, PlusSquare, FileText, Loader2
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

interface TreeNode {
  id: string;
  label: string;
  type: "folder" | "file";
  children?: TreeNode[];
  formType?: string;
  certNumber?: string;
  certDbId?: string;
  documentData?: any;
  holderData?: any;
  isMaster?: boolean;
}

export default function PrintOptionsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  // Left panel state
  const [printOption, setPrintOption] = useState("formOnly");
  const [separatePdf, setSeparatePdf] = useState(false);

  // Tree state
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]));
  const [checkedNodes, setCheckedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Fetch Data ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const [custRes, certRes, docRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!custRes.ok) throw new Error("Failed to load customer");
      setCustomer(await custRes.json());

      let allDocuments: any[] = [];
      if (docRes && docRes.ok) allDocuments = await docRes.json();

      if (certRes.ok) {
        const certData = await certRes.json();
        const year = new Date().getFullYear();
        
        const formattedCerts = await Promise.all(
          certData.map(async (c: any) => {
            const certDbId = String(c.id);
            const certNumber = `${year}${certDbId.padStart(2, '0')}`;
            let holderChildren: TreeNode[] = [];
            
            try {
              const hRes = await fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates/${certDbId}/holders`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              if (hRes.ok) {
                const holders = await hRes.json();
                holderChildren = holders.map((h: any) => {
                  const hId = `holder-${h.id}`;
                  const hDocs = allDocuments.filter(d => d.ref_num === hId);
                  const hChildren: TreeNode[] = hDocs.map(d => ({
                    id: `doc-${d.id}`, label: d.file_name, type: "file", documentData: d, formType: "Certificates"
                  }));
                  return {
                    id: hId,
                    label: [h.name, h.address, [h.city, h.state, h.zip].filter(Boolean).join(', ')].filter(Boolean).join(', '),
                    type: hChildren.length > 0 ? "folder" : "file",
                    children: hChildren.length > 0 ? hChildren : undefined,
                    holderData: h
                  };
                });
              }
            } catch (_) {}

            const certNodeId = `cert-file-master-${c.id}`;
            const certDocs = allDocuments.filter(d => d.ref_num === certNodeId);
            const docChildren: TreeNode[] = certDocs.map(d => ({
              id: `doc-${d.id}`, label: d.file_name, type: "file", documentData: d, formType: "Certificates"
            }));

            return {
              id: certNodeId,
              label: c.description || certNumber,
              type: "folder" as const,
              isMaster: true,
              certNumber,
              certDbId,
              children: [...holderChildren, ...docChildren],
            };
          })
        );
        setTreeData(formattedCerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [customerId, router]);

  useEffect(() => {
    document.title = "eForm Manager Print Options";
    fetchData();
  }, [fetchData]);

  // ── Tree Logic ──
  const toggleExpand = (id: string) => {
    const next = new Set(expandedNodes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedNodes(next);
  };

  const getAllDescendantIds = (nodes: TreeNode[]): string[] => {
    let ids: string[] = [];
    for (const n of nodes) {
      ids.push(n.id);
      if (n.children) ids = ids.concat(getAllDescendantIds(n.children));
    }
    return ids;
  };

  const toggleCheck = (node: TreeNode) => {
    const next = new Set(checkedNodes);
    const isChecked = next.has(node.id);
    
    // Toggle current node
    if (isChecked) next.delete(node.id);
    else next.add(node.id);

    // If folder, toggle all children to match
    if (node.children) {
      const descendantIds = getAllDescendantIds(node.children);
      for (const id of descendantIds) {
        if (isChecked) next.delete(id);
        else next.add(id);
      }
    }

    setCheckedNodes(next);
  };

  // ── PDF Generation Logic ──
  const getSelectedItems = () => {
    const items: { type: "master" | "holder", url: string, name: string, id: string, attachments: TreeNode[] }[] = [];
    
    // If "allMasterHolder" is selected, we pretend all Masters and Holders are checked
    const isAllChecked = printOption === "allMasterHolder";

    const traverse = (nodes: TreeNode[], parentMaster?: TreeNode) => {
      for (const n of nodes) {
        const shouldInclude = isAllChecked || checkedNodes.has(n.id);
        
        if (shouldInclude) {
          if (n.isMaster) {
            const params = new URLSearchParams({ customerId, masterDesc: n.label });
            const attachments = n.children?.filter(c => c.id.startsWith("doc-") && (isAllChecked || checkedNodes.has(c.id))) || [];
            items.push({
              type: "master", id: n.id, name: n.label, url: `/acord-form.html?${params.toString()}`, attachments
            });
          } else if (n.id.startsWith("holder-") && parentMaster) {
            const h = n.holderData;
            const params = new URLSearchParams({
              customerId,
              holderName: h.name || '',
              holderAddress: h.address || '',
              holderAddress2: h.address2 || '',
              holderCity: h.city || '',
              holderState: h.state || '',
              holderZip: h.zip || '',
              holderDesc: h.desc_of_ops || '',
              holderIssueDate: h.issue_date || '',
              holderNoticeDays: String(h.written_notice_days ?? 10),
              masterDesc: parentMaster.label,
              additionalInsured: JSON.stringify(h.additional_insured || {}),
              waiverSubrogation: JSON.stringify(h.waiver_subrogation || {}),
            });
            const attachments = n.children?.filter(c => c.id.startsWith("doc-") && (isAllChecked || checkedNodes.has(c.id))) || [];
            items.push({
              type: "holder", id: n.id, name: n.label, url: `/acord-form.html?${params.toString()}`, attachments
            });
          }
        }
        if (n.children) traverse(n.children, n.isMaster ? n : parentMaster);
      }
    };
    traverse(treeData);
    return items;
  };

  const getHtmlFromIframe = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.width = "850px";
      iframe.style.height = "1100px";
      iframe.src = url;
      
      iframe.onload = async () => {
        try {
          const doc = iframe.contentDocument;
          if (!doc) throw new Error("No iframe document");
          // Wait for JS in acord-form to finish populating
          await new Promise(r => setTimeout(r, 1000)); 
          
          // Convert all img src to base64 so CustomJS can render them
          const imgs = doc.querySelectorAll('img');
          for (const img of Array.from(imgs)) {
            if (img.src && !img.src.startsWith('data:')) {
              try {
                const imgRes = await fetch(img.src);
                const blob = await imgRes.blob();
                const base64 = await new Promise<string>((res) => {
                  const reader = new FileReader();
                  reader.onloadend = () => res(reader.result as string);
                  reader.readAsDataURL(blob);
                });
                img.src = base64;
              } catch (e) {
                console.error("Failed to convert img to base64", e);
              }
            }
          }

          const html = doc.documentElement.outerHTML;
          document.body.removeChild(iframe);
          resolve(html);
        } catch (err) {
          document.body.removeChild(iframe);
          reject(err);
        }
      };
      document.body.appendChild(iframe);
    });
  };

  const fetchPdfBuffer = async (html: string): Promise<ArrayBuffer> => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/pdf/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ html })
    });
    if (!res.ok) throw new Error(`Backend API Error: ${res.statusText}`);
    return await res.arrayBuffer();
  };

  const fetchAttachmentBuffer = async (docId: string): Promise<{ buffer: ArrayBuffer, type: string }> => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/documents/${docId}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch attachment");
    return {
      buffer: await res.arrayBuffer(),
      type: res.headers.get("content-type") || "application/pdf"
    };
  };

  const processItemIntoPdf = async (item: any, targetPdf: PDFDocument, includeAttachments: boolean) => {
    // 1. Get HTML & Convert to PDF
    const html = await getHtmlFromIframe(item.url);
    const formPdfBuffer = await fetchPdfBuffer(html);
    
    // 2. Load Form PDF and copy pages
    const formPdf = await PDFDocument.load(formPdfBuffer);
    const copiedPages = await targetPdf.copyPages(formPdf, formPdf.getPageIndices());
    copiedPages.forEach(page => targetPdf.addPage(page));

    // 3. Attachments
    if (includeAttachments && item.attachments.length > 0) {
      for (const att of item.attachments) {
        try {
          const { buffer, type } = await fetchAttachmentBuffer(att.documentData.id);
          if (type.includes("pdf")) {
            const attPdf = await PDFDocument.load(buffer);
            const attPages = await targetPdf.copyPages(attPdf, attPdf.getPageIndices());
            attPages.forEach(page => targetPdf.addPage(page));
          } else if (type.includes("image")) {
            let image;
            if (type.includes("png")) image = await targetPdf.embedPng(buffer);
            else image = await targetPdf.embedJpg(buffer);
            
            const page = targetPdf.addPage([image.width, image.height]);
            page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
          }
        } catch (e) {
          console.error("Failed to include attachment", e);
        }
      }
    }
  };

  const handleSavePdf = async () => {
    const items = getSelectedItems();
    if (items.length === 0) return alert("Please select at least one form to print.");
    
    setIsProcessing(true);
    const includeAttachments = printOption === "overflow";

    try {
      if (separatePdf) {
        // Generate separate PDFs
        for (const item of items) {
          const pdf = await PDFDocument.create();
          await processItemIntoPdf(item, pdf, includeAttachments);
          const pdfBytes = await pdf.save();
          const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${item.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else {
        // Combined PDF
        const combinedPdf = await PDFDocument.create();
        for (const item of items) {
          await processItemIntoPdf(item, combinedPdf, includeAttachments);
        }
        const pdfBytes = await combinedPdf.save();
        const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Combined_Certificates_${customer?.name?.replace(/[^a-z0-9]/gi, '_') || 'Customer'}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      // Auto close after successful Save
      setTimeout(() => window.close(), 1000);
      
    } catch (err) {
      console.error(err);
      alert("Error generating PDF. Check console for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    const items = getSelectedItems();
    if (items.length === 0) return alert("Please select at least one form to print.");
    
    // For native print, open all URLs in a single hidden iframe separated by page breaks
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) return alert("Popup blocked!");
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Forms</title>
          <style>
            body { margin: 0; padding: 0; }
            iframe { width: 100%; height: 1100px; border: none; display: block; }
            .page-break { page-break-after: always; }
          </style>
        </head>
        <body>
          ${items.map((item, idx) => `
            <iframe src="${window.location.origin}${item.url}"></iframe>
            ${idx < items.length - 1 ? '<div class="page-break"></div>' : ''}
          `).join('')}
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
                // Also close the parent print-options window
                window.opener?.close();
              }, 1500); // give iframes time to load
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => {
      return (
        <div key={node.id}>
          <div className="flex items-center gap-1.5 py-1" style={{ paddingLeft: `${depth * 16}px` }}>
            {node.type === "folder" ? (
              <button onClick={() => toggleExpand(node.id)} className="w-4 h-4 shrink-0 flex items-center justify-center border border-border-main bg-white hover:bg-secondary/50 rounded-sm">
                {expandedNodes.has(node.id) ? <MinusSquare size={12} /> : <PlusSquare size={12} />}
              </button>
            ) : (
              <span className="w-4 h-4 shrink-0 inline-block border-l border-b border-dotted border-border-main translate-x-1 -translate-y-1"></span>
            )}
            <input 
              type="checkbox" 
              checked={checkedNodes.has(node.id) || printOption === "allMasterHolder"} 
              disabled={printOption === "allMasterHolder"}
              onChange={() => toggleCheck(node)} 
              className="w-3.5 h-3.5 shrink-0 accent-primary rounded-sm cursor-pointer disabled:opacity-50" 
            />
            <span className="truncate" title={node.label}>{node.label}</span>
          </div>
          {node.type === "folder" && expandedNodes.has(node.id) && node.children && (
            <div className="border-l border-dotted border-border-main ml-2 flex flex-col">
              {renderTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-screen bg-bg-base font-sans overflow-hidden select-none relative">
      
      {/* ── Processing Overlay ── */}
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary mb-3" />
          <p className="text-sm font-bold text-text-main">Generating PDFs...</p>
          <p className="text-xs text-text-muted mt-1">Please wait, this may take a moment.</p>
        </div>
      )}

      {/* ── Modern Form Header ── */}
      <div className="bg-white border-b border-border-main px-6 py-4 flex justify-between items-center shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-base font-extrabold text-text-main tracking-tight flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">360</span>
            eForm Manager Print Options
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.close()} className="h-8 w-8 flex items-center justify-center hover:bg-red-50 text-text-muted hover:text-red-600 rounded-xl transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 p-6 flex gap-6 overflow-hidden min-h-0 bg-slate-50/50">
        
        {/* LEFT COLUMN - OPTIONS */}
        <div className="w-[320px] flex flex-col gap-6 overflow-y-auto custom-scrollbar shrink-0">
          
          {/* Print Selection Options */}
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest border-b border-border-main/50 pb-2">Print Selection Options</h3>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer mt-1">
              <input type="radio" name="printOpt" checked={printOption === "formOnly"} onChange={() => setPrintOption("formOnly")} className="accent-primary w-4 h-4" />
              Form Only
            </label>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
              <input type="radio" name="printOpt" checked={printOption === "overflow"} onChange={() => setPrintOption("overflow")} className="accent-primary w-4 h-4" />
              Form, Overflow Pages, and Attachments
            </label>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
              <input type="radio" name="printOpt" checked={printOption === "allMasterHolder"} onChange={() => setPrintOption("allMasterHolder")} className="accent-primary w-4 h-4" />
              All Master and Holder
            </label>
          </div>

          {/* Grouping Options */}
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-3">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest border-b border-border-main/50 pb-2">Grouping Options</h3>
            <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer mt-1">
              <input type="checkbox" checked={separatePdf} onChange={e => setSeparatePdf(e.target.checked)} className="accent-primary w-4 h-4 rounded" />
              Create separate PDF file(s)
            </label>
          </div>

          {/* Quick Select Options (Commented out per user request) */}
          {/*
          <div className="bg-white border border-border-main p-5 rounded-2xl shadow-sm flex flex-col gap-4">
            <h3 className="text-[11px] font-bold text-text-muted uppercase tracking-widest border-b border-border-main/50 pb-2">Quick Select Options</h3>
            
            <div className="border border-border-main rounded-xl p-3 bg-bg-base/50 flex flex-col gap-2">
              <span className="text-[12px] font-semibold text-text-muted">Based on Form Changed Date(s)</span>
              <div className="flex items-center gap-2 mt-1">
                <label className="text-[12px] font-bold text-text-main w-10">From:</label>
                <input type="date" className="flex-1 text-[12px] font-semibold bg-white border border-border-main rounded-lg px-2 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[12px] font-bold text-text-main w-10">To:</label>
                <input type="date" className="flex-1 text-[12px] font-semibold bg-white border border-border-main rounded-lg px-2 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex flex-col gap-2.5 mt-1">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
                <input type="checkbox" className="accent-primary w-4 h-4 rounded" />
                All Unprinted
              </label>
              <label className="flex items-center gap-2 text-[13px] font-semibold text-text-main cursor-pointer">
                <input type="checkbox" className="accent-primary w-4 h-4 rounded" />
                Certificates Only
              </label>
            </div>
            
            <button className="self-start mt-2 h-8 px-4 flex items-center justify-center border border-border-main bg-white hover:bg-secondary/60 text-text-muted rounded-xl transition-all cursor-pointer">
              <span className="text-[16px]">🔄</span>
            </button>
          </div>
          */}

        </div>

        {/* RIGHT COLUMN - TREE */}
        <div className="flex-1 bg-white border border-border-main rounded-2xl shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            
            <div className="flex flex-col text-[13px] font-medium text-text-main whitespace-nowrap">
              
              {/* Root */}
              <div className="flex items-center gap-1.5 py-1 mb-1 border-b border-border-main/50 pb-2">
                <button onClick={() => toggleExpand("root")} className="w-4 h-4 flex items-center justify-center border border-border-main bg-white hover:bg-secondary/50 rounded-sm">
                  {expandedNodes.has("root") ? <MinusSquare size={12} /> : <PlusSquare size={12} />}
                </button>
                <input 
                  type="checkbox" 
                  checked={printOption === "allMasterHolder" || (checkedNodes.size > 0 && checkedNodes.size >= treeData.length)}
                  disabled={printOption === "allMasterHolder"}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allIds = getAllDescendantIds(treeData);
                      setCheckedNodes(new Set(allIds));
                    } else {
                      setCheckedNodes(new Set());
                    }
                  }}
                  className="w-3.5 h-3.5 accent-primary rounded-sm cursor-pointer disabled:opacity-50" 
                />
                <span className="font-bold">Certificate, Last 2 year(s)</span>
              </div>
              
              {/* Children of Root */}
              {expandedNodes.has("root") && (
                <div className="ml-2 border-l border-dotted border-border-main pl-2 flex flex-col gap-0.5 py-1">
                  {loading ? (
                    <div className="text-text-muted text-xs p-2 flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" /> Loading forms...
                    </div>
                  ) : treeData.length > 0 ? (
                    renderTree(treeData)
                  ) : (
                    <div className="text-text-muted text-xs p-2">No certificates found.</div>
                  )}
                </div>
              )}
            </div>
            
          </div>
        </div>

      </div>

      {/* ── Footer Actions ── */}
      <div className="bg-white border-t border-border-main px-6 py-4 flex items-center justify-between shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.04)] z-10">
        <span className="text-[12px] font-bold text-red-600">Ready</span>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="h-8 px-8 bg-white border border-border-main hover:bg-secondary/50 text-text-main text-xs font-bold rounded-xl transition-all cursor-pointer">
            Print
          </button>
          <button onClick={handleSavePdf} disabled={isProcessing} className="h-8 px-8 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white shadow-sm shadow-primary/20 text-xs font-bold rounded-xl transition-all cursor-pointer">
            Save as PDF
          </button>
          <button onClick={() => window.close()} className="h-8 px-6 bg-white border border-border-main hover:bg-red-50 text-text-muted hover:text-red-600 text-xs font-bold rounded-xl transition-all cursor-pointer">
            Cancel
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-text-muted font-semibold">Gamaty Insurance Agency LLC</span>
          <div className="w-px h-4 bg-border-main" />
          <span className="text-[11px] font-bold text-primary">AOR</span>
        </div>
      </div>
      
    </div>
  );
}