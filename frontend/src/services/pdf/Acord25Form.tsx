/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

interface GlCoverage {
  coverage: string;
  limit1: string;
  limit2?: string;
  premium?: string;
}

interface Acord25FormProps {
  customer: any;
  policies: any[];
  glCoverages?: GlCoverage[];
  umbCoverages?: GlCoverage[];
  wcPart2?: any;
  baCoverages?: any[];
}

// Helper: Find limit1 for a specific coverage name (case-insensitive, partial match)
function findLimit(glCoverages: GlCoverage[], ...names: string[]): string {
  for (const name of names) {
    const found = glCoverages.find(c => {
      const dbCov = (c.coverage || '').toLowerCase();
      const search = name.toLowerCase();
      return dbCov.includes(search) || search.includes(dbCov);
    });
    if (found && found.limit1 && String(found.limit1).trim() !== '') {
      // Format as dollar amount
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
      // Format as dollar amount
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

// Helper: Safely format a raw limit value for exact umbrella matches
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

export default function Acord25Form({ customer, policies, glCoverages = [], umbCoverages = [], wcPart2, baCoverages = [] }: Acord25FormProps) {
  const customerName = customer 
    ? (customer.name || [customer.first_name, customer.last_name].filter(Boolean).join(" "))
    : "KH Interiors, Inc.";

  const customerAddress = customer
    ? `${customer.address || customer.street || '15009 SE 94th Ave.'}\n${customer.city || 'Clackamas'}, ${customer.state || 'OR'} ${customer.zip || customer.zip_code || '97015'}`
    : "15009 SE 94th Ave.\nClackamas, OR 97015";

  // Mock some limits and insurers for the visual
  const insurers = [
    { letter: "A", name: "US Specialty Insurance Company", naic: "29599" },
    { letter: "B", name: "AmGuard Insurance Company", naic: "42390" },
    { letter: "C", name: "Scottsdale Insurance Company", naic: "41297" },
    { letter: "D", name: "SAIF Corp", naic: "22195" },
    { letter: "E", name: "Mt. Hawley Insurance Co.", naic: "37974" },
  ];

  // Map policies to table rows
  const activePolicies = policies.filter(p => p.status === 'Active').slice(0, 5);

  // ── Resolve the 6 standard ACORD 25 GL limit rows from real coverage data ──
  const glLimits = {
    eachOccurrence:     findLimit(glCoverages, "each occurrence"),
    damagePremises:     findLimit(glCoverages, "fire damage", "damage to rented"),
    medExp:             findLimit(glCoverages, "medical expense", "med exp"),
    personalAdv:        findLimit(glCoverages, "personal & advertising", "personal & adv", "personal and advertising"),
    generalAggregate:   findLimit(glCoverages, "general aggregate"),
    productsCompOp:     findLimit(glCoverages, "products/completed", "products - comp", "products comp"),
  };

  // ── Resolve the 4 standard ACORD 25 Auto limit rows from real coverage data ──
  const baLimits = {
    combinedSingleLimit: findLimit(baCoverages, "combined single limit"),
    bodilyInjuryPerson: findLimit(baCoverages, "bodily injury"),
    bodilyInjuryAccident: findLimit2(baCoverages, "bodily injury"),
    propertyDamage: findLimit(baCoverages, "property damage", "property danage"),
  };

  return (
    <div className="w-full max-w-[850px] mx-auto bg-white border border-black p-4 text-black font-sans text-[10px] leading-tight select-none shadow-lg my-4 scale-[0.9] origin-top">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className="w-[120px] font-serif italic font-bold text-2xl">ACORD<span className="text-sm align-super">&reg;</span></div>
        <div className="flex-1 text-center font-bold text-[18px]">CERTIFICATE OF LIABILITY INSURANCE</div>
        <div className="w-[120px] border border-black p-1 text-center">
          <div className="text-[8px] font-bold">DATE (MM/DD/YYYY)</div>
          <div className="font-bold text-[12px] mt-1">
            {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="border border-black p-1 text-[8px] font-bold text-justify mb-2">
        THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY AND CONFERS NO RIGHTS UPON THE CERTIFICATE HOLDER. THIS CERTIFICATE DOES NOT AFFIRMATIVELY OR NEGATIVELY AMEND, EXTEND OR ALTER THE COVERAGE AFFORDED BY THE POLICIES BELOW. THIS CERTIFICATE OF INSURANCE DOES NOT CONSTITUTE A CONTRACT BETWEEN THE ISSUING INSURER(S), AUTHORIZED REPRESENTATIVE OR PRODUCER, AND THE CERTIFICATE HOLDER.
        <hr className="border-black my-1" />
        IMPORTANT: If the certificate holder is an ADDITIONAL INSURED, the policy(ies) must be endorsed. If SUBROGATION IS WAIVED, subject to the terms and conditions of the policy, certain policies may require an endorsement. A statement on this certificate does not confer rights to the certificate holder in lieu of such endorsement(s).
      </div>

      {/* Producer & Insured / Contacts & Insurers */}
      <div className="grid grid-cols-[1fr_1fr] border border-black mb-2">
        {/* Left Column */}
        <div className="border-r border-black flex flex-col">
          <div className="p-1 border-b border-black flex-1">
            <div className="font-bold text-[8px] mb-1">PRODUCER</div>
            <div>Gamaty Insurance Agency LLC</div>
            <div>5455 Wilshire Blvd</div>
            <div>Suite 1816</div>
            <div>Los Angeles, CA 90036</div>
          </div>
          <div className="p-1 flex-1">
            <div className="font-bold text-[8px] mb-1">INSURED</div>
            <div className="font-bold">{customerName}</div>
            <div className="whitespace-pre-wrap">{customerAddress}</div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col">
          <div className="border-b border-black">
            <div className="flex border-b border-black p-1">
              <div className="w-[50px] font-bold text-[8px]">CONTACT<br/>NAME:</div>
              <div className="flex-1">{customer?.contact_person?.name || "Jake Weiner"}</div>
            </div>
            <div className="flex border-b border-black p-1">
              <div className="flex-1 flex">
                <span className="font-bold text-[8px] mr-1">PHONE<br/>(A/C, No, Ext):</span>
                <span>{customer?.contact_person?.phone || "(310) 492-2007"}</span>
              </div>
              <div className="flex-1 flex border-l border-black pl-1">
                <span className="font-bold text-[8px] mr-1">FAX<br/>(A/C, No):</span>
                <span>{customer?.contact_person?.fax || "(310) 525-5292"}</span>
              </div>
            </div>
            <div className="flex p-1">
              <div className="font-bold text-[8px] mr-1">E-MAIL<br/>ADDRESS:</div>
              <div className="flex-1">{customer?.contact_person?.email || "Jake@capcoinsurance.com"}</div>
            </div>
          </div>

          <div>
            <div className="bg-gray-200 text-center font-bold text-[9px] border-b border-black p-0.5">INSURER(S) AFFORDING COVERAGE</div>
            <div className="grid grid-cols-[1fr_60px] text-[9px]">
              <div className="border-r border-black font-bold p-0.5 bg-gray-100 text-center"></div>
              <div className="font-bold p-0.5 text-center bg-gray-100">NAIC #</div>
              
              {insurers.map((ins, idx) => (
                <React.Fragment key={ins.letter}>
                  <div className={`border-r border-t border-black p-0.5 flex`}>
                    <span className="font-bold w-[60px]">INSURER {ins.letter}:</span>
                    <span>{ins.name}</span>
                  </div>
                  <div className="border-t border-black p-0.5 text-center">{ins.naic}</div>
                </React.Fragment>
              ))}
              <div className="border-r border-t border-black p-0.5 flex">
                <span className="font-bold w-[60px]">INSURER F:</span>
              </div>
              <div className="border-t border-black p-0.5 text-center"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Coverages Header */}
      <div className="flex font-bold text-[10px] mb-1">
        <div className="w-[200px]">COVERAGES</div>
        <div className="flex-1 text-center">CERTIFICATE NUMBER: CL2581202834</div>
        <div className="w-[200px] text-right">REVISION NUMBER:</div>
      </div>
      <div className="border border-black p-1 text-[8px] font-bold text-justify mb-1">
        THIS IS TO CERTIFY THAT THE POLICIES OF INSURANCE LISTED BELOW HAVE BEEN ISSUED TO THE INSURED NAMED ABOVE FOR THE POLICY PERIOD INDICATED. NOTWITHSTANDING ANY REQUIREMENT, TERM OR CONDITION OF ANY CONTRACT OR OTHER DOCUMENT WITH RESPECT TO WHICH THIS CERTIFICATE MAY BE ISSUED OR MAY PERTAIN, THE INSURANCE AFFORDED BY THE POLICIES DESCRIBED HEREIN IS SUBJECT TO ALL THE TERMS, EXCLUSIONS AND CONDITIONS OF SUCH POLICIES. LIMITS SHOWN MAY HAVE BEEN REDUCED BY PAID CLAIMS.
      </div>

      {/* Coverages Table */}
      <div className="border border-black">
        {/* Table Header */}
        <div className="grid grid-cols-[20px_1fr_25px_25px_120px_60px_60px_180px] border-b border-black bg-gray-100 font-bold text-[8px] text-center divide-x divide-black">
          <div className="p-0.5">INSR<br/>LTR</div>
          <div className="p-0.5">TYPE OF INSURANCE</div>
          <div className="p-0.5 leading-[0.8] flex flex-col justify-end">ADDL<br/>INSD</div>
          <div className="p-0.5 leading-[0.8] flex flex-col justify-end">SUBR<br/>WVD</div>
          <div className="p-0.5 flex items-end justify-center">POLICY NUMBER</div>
          <div className="p-0.5 leading-[0.8] flex flex-col justify-end">POLICY EFF<br/>(MM/DD/YYYY)</div>
          <div className="p-0.5 leading-[0.8] flex flex-col justify-end">POLICY EXP<br/>(MM/DD/YYYY)</div>
          <div className="p-0.5 flex items-end justify-center">LIMITS</div>
        </div>

        {/* Dynamic Rows based on active policies */}
        {activePolicies.map((policy, index) => {
          // Determine generic insurance type for visual layout
          const isGeneralLiability = policy.type?.toLowerCase().includes("liability");
          const isAuto = policy.type?.toLowerCase().includes("auto");
          const isUmbrella = policy.type?.toLowerCase().includes("umbrella");
          const isWorkersComp = policy.type?.toLowerCase().includes("workers");

          // Only GL row uses the fetched limits; others keep generic display
          const showGlLimits = isGeneralLiability && glCoverages.length > 0;
          const showBaLimits = isAuto && baCoverages.length > 0;

          return (
            <div key={policy.id} className="grid grid-cols-[20px_1fr_25px_25px_120px_60px_60px_180px] border-b border-black divide-x divide-black">
              <div className="p-1 text-center font-bold">{insurers[index % insurers.length].letter}</div>
              
              {/* Type of Insurance Block */}
              <div className="p-1 text-[8px] relative">
                {isGeneralLiability && (
                  <>
                    <div className="flex items-center font-bold mb-1"><div className="w-3 h-3 border border-black flex items-center justify-center font-bold mr-1">X</div> COMMERCIAL GENERAL LIABILITY</div>
                    <div className="flex items-center ml-4 mt-2">
                      <div className="w-3 h-3 border border-black mr-1"></div> CLAIMS-MADE
                      <div className="w-3 h-3 border border-black flex items-center justify-center font-bold mx-1 ml-3">X</div> OCCUR
                    </div>
                    <div className="ml-1 mt-2 text-[7px]">
                      <div className="font-bold">GEN'L AGGREGATE LIMIT APPLIES PER:</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 border border-black inline-flex items-center justify-center text-[6px] font-bold">X</span> POLICY</span>
                        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 border border-black inline-flex"></span> PRO-JECT</span>
                        <span className="flex items-center gap-0.5"><span className="w-2.5 h-2.5 border border-black inline-flex"></span> LOC</span>
                      </div>
                    </div>
                  </>
                )}
                {isAuto && (
                  <div className="font-bold"><div className="w-3 h-3 border border-black flex items-center justify-center font-bold mr-1 inline-flex">X</div> AUTOMOBILE LIABILITY <br/><span className="font-normal ml-4">ANY AUTO</span></div>
                )}
                {isUmbrella && (
                  <div className="font-bold"><div className="w-3 h-3 border border-black flex items-center justify-center font-bold mr-1 inline-flex">X</div> UMBRELLA LIAB</div>
                )}
                {isWorkersComp && (
                  <div className="font-bold"><div className="w-3 h-3 border border-black flex items-center justify-center font-bold mr-1 inline-flex">X</div> WORKERS COMPENSATION</div>
                )}
                {!isGeneralLiability && !isAuto && !isUmbrella && !isWorkersComp && (
                  <div className="font-bold uppercase">{policy.type}</div>
                )}
              </div>

              <div className="p-1 text-center"></div>
              <div className="p-1 text-center"></div>
              
              <div className="p-1 text-center font-bold flex items-center justify-center text-[9px]">{policy.policyNum}</div>
              <div className="p-1 text-center flex items-center justify-center">{policy.effDate}</div>
              <div className="p-1 text-center flex items-center justify-center">{policy.expDate}</div>
              
              {/* Limits Block */}
              <div className="p-0.5 text-[8px] flex flex-col">
                {isGeneralLiability ? (
                  <>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1 font-bold">EACH OCCURRENCE</span>
                      <span className="font-bold">{showGlLimits ? glLimits.eachOccurrence : '$ 1,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1 leading-tight">DAMAGE TO RENTED<br/>PREMISES <span className="text-[7px]">(Ea occurrence)</span></span>
                      <span className="font-bold self-end">{showGlLimits ? glLimits.damagePremises : '$ 50,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">MED EXP <span className="text-[7px]">(Any one person)</span></span>
                      <span className="font-bold">{showGlLimits ? glLimits.medExp : '$ 5,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">PERSONAL &amp; ADV INJURY</span>
                      <span className="font-bold">{showGlLimits ? glLimits.personalAdv : '$ 1,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">GENERAL AGGREGATE</span>
                      <span className="font-bold">{showGlLimits ? glLimits.generalAggregate : '$ 2,000,000'}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="mr-1">PRODUCTS - COMP/OP AGG</span>
                      <span className="font-bold">{showGlLimits ? glLimits.productsCompOp : '$ 2,000,000'}</span>
                    </div>
                  </>
                ) : isUmbrella ? (
                  <>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1 font-bold">EACH OCCURRENCE</span>
                      <span className="font-bold">{umbCoverages.length > 0 ? formatLimit(umbCoverages[0].limit2) : '$ 5,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1 font-bold">AGGREGATE</span>
                      <span className="font-bold">{umbCoverages.length > 0 ? formatLimit(umbCoverages[0].limit1) : '$ 5,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1"></span>
                      <span className="font-bold"></span>
                    </div>
                  </>
                ) : isWorkersComp ? (
                  <>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">E.L. EACH ACCIDENT</span>
                      <span className="font-bold">{wcPart2 ? formatLimit(wcPart2.eachAccidentLimit) : '$ 1,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">E.L. DISEASE - EA EMPLOYEE</span>
                      <span className="font-bold">{wcPart2 ? formatLimit(wcPart2.diseaseEachEmployee) : '$ 1,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">E.L. DISEASE - POLICY LIMIT</span>
                      <span className="font-bold">{wcPart2 ? formatLimit(wcPart2.diseasePolicyLimit) : '$ 1,000,000'}</span>
                    </div>
                  </>
                ) : isAuto ? (
                  <>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">COMBINED SINGLE LIMIT <span className="text-[7px]">(Ea accident)</span></span>
                      <span className="font-bold">{showBaLimits ? baLimits.combinedSingleLimit : '$ 1,000,000'}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">BODILY INJURY <span className="text-[7px]">(Per person)</span></span>
                      <span className="font-bold">{showBaLimits ? baLimits.bodilyInjuryPerson : ''}</span>
                    </div>
                    <div className="flex justify-between border-b border-black border-dashed py-0.5">
                      <span className="mr-1">BODILY INJURY <span className="text-[7px]">(Per accident)</span></span>
                      <span className="font-bold">{showBaLimits ? baLimits.bodilyInjuryAccident : ''}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="mr-1">PROPERTY DAMAGE <span className="text-[7px]">(Per accident)</span></span>
                      <span className="font-bold">{showBaLimits ? baLimits.propertyDamage : ''}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400 text-[7px] italic">
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty rows to fill space if few policies */}
        {Array.from({ length: Math.max(0, 4 - activePolicies.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="grid grid-cols-[20px_1fr_25px_25px_120px_60px_60px_180px] border-b border-black divide-x divide-black h-[50px]">
             <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
          </div>
        ))}
      </div>

    </div>
  );
}
