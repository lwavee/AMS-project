/* eslint-disable */
"use client";
import React, { useEffect, useState, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import { useParams, useRouter } from "next/navigation";
import { showToast } from "@/components/ToastProvider";
import {
  X, Printer, CheckSquare, Square, MinusSquare, PlusSquare, FileText, Loader2
} from "lucide-react";
import { PDFDocument } from "pdf-lib";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
  masterData?: any;
}

// Helper: Find limit1 for a specific coverage name (case-insensitive, partial match)
function findLimit(glCoverages: any[], ...names: string[]): string {
  for (const name of names) {
    const found = glCoverages.find(c => c.coverage?.toLowerCase().includes(name.toLowerCase()));
    if (found && found.limit1 && String(found.limit1).trim() !== '') {
      const raw = String(found.limit1).replace(/,/g, '');
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
    const found = glCoverages.find(c => c.coverage?.toLowerCase().includes(name.toLowerCase()));
    if (found && found.limit2 && String(found.limit2).trim() !== '') {
      const raw = String(found.limit2).replace(/,/g, '');
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

export default function PrintOptionsPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<any>(null);

  const [printOption, setPrintOption] = useState("formOnly");
  const [separatePdf, setSeparatePdf] = useState(false);
  
  // Coverages state
  const [policyCoveragesMap, setPolicyCoveragesMap] = useState<Record<string, { effDate: string, expDate: string, insurerName: string, gl: any[], umb: any[], wc: any, ba: any[] }>>({});

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

      const [custRes, certRes, docRes, polRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/customers/${customerId}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/certificates`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/documents`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!custRes.ok) throw new Error("Failed to load customer");
      setCustomer(await custRes.json());

      if (polRes.ok) {
        const polData = await polRes.json();
        
        let glResultsAll: any[][] = [];
        let umbResultsAll: any[][] = [];
        let wcResultsAll: any[] = [];
        let baResultsAll: any[][] = [];

        // Fetch limits for GL, Umbrella, and WC just like in eforms-manager
        try {
          const fetchPromises = polData.map((p: any) => 
            fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${p.id}/general-liability`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(async res => {
              if (!res.ok || res.status === 204) return [];
              try { return await res.json(); } catch { return []; }
            })
          );
          const results = await Promise.all(fetchPromises);
          glResultsAll = results;
        } catch (e) { console.error("GL Error", e); }
        
        try {
          const umbPromises = polData.map((p: any) => 
            fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${p.id}/umbrella`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(async res => {
              if (!res.ok || res.status === 204) return [];
              try { return await res.json(); } catch { return []; }
            })
          );
          const umbResults = await Promise.all(umbPromises);
          umbResultsAll = umbResults;
        } catch (e) { console.error("Umb Error", e); }
        
        try {
          const wcPromises = polData.map((p: any) => 
            fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${p.id}/workers-comp/part2`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(async res => {
              if (!res.ok || res.status === 204) return null;
              try { return await res.json(); } catch { return null; }
            })
          );
          const wcResults = await Promise.all(wcPromises);
          wcResultsAll = wcResults;
        } catch (e) { console.error("WC Error", e); }

        try {
          const baPromises = polData.map((p: any) => 
            fetch(`${API_BASE_URL}/api/customers/${customerId}/policies/${p.id}/business-auto`, {
              headers: { Authorization: `Bearer ${token}` }
            }).then(async res => {
              if (!res.ok || res.status === 204) return [];
              try { return await res.json(); } catch { return []; }
            })
          );
          const baResults = await Promise.all(baPromises);
          baResultsAll = baResults;
        } catch (e) { console.error("BA Error", e); }
        
        const pMap: Record<string, { effDate: string, expDate: string, insurerName: string, gl: any[], umb: any[], wc: any, ba: any[] }> = {};
        polData.forEach((p: any, i: number) => {
          if (p.policy_num) {
            pMap[p.policy_num] = {
              effDate: p.eff_date || '',
              expDate: p.exp_date || '',
              insurerName: p.writing_company || p.parent_company || p.company || '',
              gl: glResultsAll[i] || [],
              umb: umbResultsAll[i] || [],
              wc: wcResultsAll[i] || null,
              ba: baResultsAll[i] || []
            };
          }
        });
        setPolicyCoveragesMap(pMap);
      }

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
              masterData: c,
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
          const activeCert = n.isMaster ? n.masterData : parentMaster?.masterData;

          if (activeCert) {
            const rowSelections = activeCert.form_data?.rowSelections || {};
            
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

            const dynamicInsurerParams = {
              insurerA: insrMapping.insurers[0]?.name || '',
              insurerB: insrMapping.insurers[1]?.name || '',
              insurerC: insrMapping.insurers[2]?.name || '',
              insurerD: insrMapping.insurers[3]?.name || '',
              insurerE: insrMapping.insurers[4]?.name || '',
              insurerF: insrMapping.insurers[5]?.name || '',
            };

            const limitsObj = {
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
            };

            if (n.isMaster) {
              const params = new URLSearchParams({ customerId, masterDesc: n.label || "", ...limitsObj });
              const attachments = n.children?.filter(c => c.id.startsWith("doc-") && (isAllChecked || checkedNodes.has(c.id))) || [];
              items.push({
                type: "master", id: n.id, name: n.label || "Master", url: `/acord-form.html?${params.toString()}`, attachments
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
                masterDesc: parentMaster?.label || "",
                additionalInsured: JSON.stringify(h.additional_insured || {}),
                waiverSubrogation: JSON.stringify(h.waiver_subrogation || {}),
                ...limitsObj
              });
              const attachments = n.children?.filter(c => c.id.startsWith("doc-") && (isAllChecked || checkedNodes.has(c.id))) || [];
              items.push({
                type: "holder", id: n.id, name: n.label || "Holder", url: `/acord-form.html?${params.toString()}`, attachments
              });
            }
          }

        }
        if (n.children) traverse(n.children, n.isMaster ? n : parentMaster);
      }
    };
    traverse(treeData);
    return items;
  };

  const getPdfBufferFromIframe = async (url: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "850px";
      iframe.style.height = "1100px";
      iframe.src = url;

      let isFinished = false;

      const finishIframe = async () => {
        if (isFinished) return;
        isFinished = true;
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!doc || !doc.body) throw new Error("Iframe document not accessible");

          const imgs = Array.from(doc.querySelectorAll("img"));
          await Promise.all(
            imgs.map(
              (img) =>
                new Promise((res) => {
                  if (img.complete) return res(null);
                  img.onload = () => res(null);
                  img.onerror = () => res(null);
                })
            )
          );

          const canvas = await html2canvas(doc.body, {
            scale: 2,
            useCORS: true,
            logging: false,
            width: 850,
            windowWidth: 850,
          });

          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          const pdf = new jsPDF({
            orientation: "portrait",
            unit: "pt",
            format: "letter",
          });
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

          const pdfArrayBuffer = pdf.output("arraybuffer");

          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          resolve(pdfArrayBuffer);
        } catch (err) {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          reject(err);
        }
      };

      const onMessage = (e: MessageEvent) => {
        if (e.data?.type === "ACORD_FORM_READY") {
          window.removeEventListener("message", onMessage);
          setTimeout(finishIframe, 300);
        }
      };

      window.addEventListener("message", onMessage);

      setTimeout(() => {
        window.removeEventListener("message", onMessage);
        finishIframe();
      }, 3500);

      document.body.appendChild(iframe);
    });
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
    // 1. Convert form iframe directly to PDF ArrayBuffer via client-side html2canvas & jsPDF
    const formPdfBuffer = await getPdfBufferFromIframe(item.url);
    
    // 2. Load Form PDF and copy pages
    const formPdf = await PDFDocument.load(formPdfBuffer);
    const copiedPages = await targetPdf.copyPages(formPdf, formPdf.getPageIndices());
    copiedPages.forEach((page: any) => targetPdf.addPage(page));

    // 3. Attachments
    if (includeAttachments && item.attachments.length > 0) {
      for (const att of item.attachments) {
        try {
          const { buffer, type } = await fetchAttachmentBuffer(att.documentData.id);
          if (type.includes("pdf")) {
            const attPdf = await PDFDocument.load(buffer);
            const attPages = await targetPdf.copyPages(attPdf, attPdf.getPageIndices());
            attPages.forEach((page: any) => targetPdf.addPage(page));
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
    console.log("handleSavePdf -> items:", items);
    
    if (items.length === 0) { showToast("Please select at least one form to print.", "warning"); return; }
    
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
      showToast("Error generating PDF. Check console for details.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = async () => {
    const items = getSelectedItems();
    console.log("handlePrint -> items:", items);
    
    if (items.length === 0) { showToast("Please select at least one form to print.", "warning"); return; }
    
    // For native print, open all URLs in a single hidden iframe separated by page breaks
    const printWindow = window.open("", "_blank", "width=850,height=1100");
    if (!printWindow) { showToast("Popup blocked!", "error"); return; }
    
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
              }, 3500); // give iframes plenty of time to load data
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