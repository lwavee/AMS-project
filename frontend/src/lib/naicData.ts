/**
 * NAIC_LOOKUP
 * -----------
 * Maps carrier / writing-company names (lowercase) → official NAIC number.
 * Covers every company that appears in INSURANCE_PARENT_COMPANIES and the
 * common writing-company values saved to policies.
 *
 * Source: NAIC public company lookup (https://content.naic.org/)
 */
export const NAIC_LOOKUP: Record<string, string> = {
  // ── Progressive ───────────────────────────────────────────────────────────
  "progressive insurance, insurance company, pro": "24260",
  "progressive casualty insurance company":        "24260",
  "progressive casualty":                          "24260",
  "progressive":                                   "24260",
  "progressive direct insurance company":          "16322",

  // ── Travelers ─────────────────────────────────────────────────────────────
  "travelers insurance company, insurance company, trv": "25658",
  "travelers indemnity company":                   "25658",
  "travelers indemnity":                           "25658",
  "travelers":                                     "25658",
  "standard fire insurance (id), insurance company, stf": "19070",

  // ── The Hartford ──────────────────────────────────────────────────────────
  "hartford insurance group, insurance company, hig": "19682",
  "hartford underwriters insurance company":       "19682",
  "hartford underwriters":                         "19682",
  "hartford fire insurance company":               "19682",
  "hartford":                                      "19682",

  // ── Liberty Mutual ────────────────────────────────────────────────────────
  "liberty mutual agency corporation, insurance company, lrm": "23043",
  "liberty mutual fire insurance company":         "23043",
  "liberty mutual fire":                           "23043",
  "liberty mutual":                                "23043",

  // ── Chubb / ACE ───────────────────────────────────────────────────────────
  "chubb and son, inc., insurance company, chb":   "20281",
  "chubb group":                                   "20281",
  "chubb":                                         "20281",
  "ace american insurance company, writing company, atl011": "22667",
  "ace american insurance company":                "22667",

  // ── Allstate ──────────────────────────────────────────────────────────────
  "allstate, insurance company, all":              "19232",
  "allstate insurance company":                    "19232",
  "allstate":                                      "19232",

  // ── State Farm ────────────────────────────────────────────────────────────
  "state farm":                                    "25177",

  // ── Nationwide ────────────────────────────────────────────────────────────
  "nationwide exclusive, insurance company, nat":  "23787",
  "nationwide":                                    "23787",
  "allied/nationwide insurance company, insurance company, ali": "20109",

  // ── CNA ───────────────────────────────────────────────────────────────────
  "cna, insurance company, cna":                   "20443",
  "continental casualty company, insurance company, cnc": "20443",
  "continental casualty company":                  "20443",
  "cna":                                           "20443",

  // ── Markel ────────────────────────────────────────────────────────────────
  "markel american insurance company, insurance company, mkl": "38970",
  "markel":                                        "38970",

  // ── Zurich ────────────────────────────────────────────────────────────────
  "zurich insurance company**additional setups required": "16535",
  "zurich":                                        "16535",

  // ── Scottsdale ────────────────────────────────────────────────────────────
  "scottsdale insurance company, insurance company, sct": "41297",
  "scottsdale insurance company":                  "41297",
  "scottsdale":                                    "41297",

  // ── U.S. Specialty ────────────────────────────────────────────────────────
  "u.s. specialty insurance company, insurance company, usp": "29599",
  "us specialty insurance company":                "29599",
  "us specialty":                                  "29599",

  // ── SiriusPoint ───────────────────────────────────────────────────────────
  "siriuspoint specialty insurance corporation":   "16820",
  "siriuspoint":                                   "16820",

  // ── Kemper ────────────────────────────────────────────────────────────────
  "kemper, insurance company, kem":                "39071",
  "kemper":                                        "39071",

  // ── Philadelphia Insurance ────────────────────────────────────────────────
  "philadelphia ins co., insurance company, phi":  "18058",
  "philadelphia insurance":                        "18058",
  "philadelphia":                                  "18058",

  // ── Everest National ──────────────────────────────────────────────────────
  "everest national insurance company, insurance company, evr": "10120",
  "everest national":                              "10120",

  // ── RLI ───────────────────────────────────────────────────────────────────
  "rli corporation, insurance company, rli":       "13056",
  "rli":                                           "13056",

  // ── Evanston ──────────────────────────────────────────────────────────────
  "evanston insurance company, insurance company, eva": "35378",
  "evanston":                                      "35378",

  // ── Nautilus ──────────────────────────────────────────────────────────────
  "nautilus insurance company, insurance company, nti": "17370",
  "nautilus":                                      "17370",

  // ── AmTrust ───────────────────────────────────────────────────────────────
  "amtrust financial services, inc., insurance company, amt": "10267",
  "amtrust":                                       "10267",

  // ── Employers Holdings ────────────────────────────────────────────────────
  "employers holdings grp, insurance company, ehg": "21458",
  "employers insurance":                           "21458",
  "employers":                                     "21458",

  // ── Great American ────────────────────────────────────────────────────────
  "great american, insurance company, gre":        "16691",
  "great american":                                "16691",

  // ── Hudson ────────────────────────────────────────────────────────────────
  "hudson insurance company, insurance company, hud": "41238",
  "hudson":                                        "41238",

  // ── SAIF ──────────────────────────────────────────────────────────────────
  "saif corp, insurance company, sai":             "22195",
  "saif":                                          "22195",

  // ── Safeco ────────────────────────────────────────────────────────────────
  "safeco insurance company, insurance company, saf": "24740",
  "safeco":                                        "24740",

  // ── Mercury ───────────────────────────────────────────────────────────────
  "mercury insurance group, insurance company, mer": "11544",
  "mercury":                                       "11544",

  // ── Tokio Marine ──────────────────────────────────────────────────────────
  "tokio marine management, inc., insurance company, tok": "41297",
  "tokio marine":                                  "41297",

  // ── Berkley ───────────────────────────────────────────────────────────────
  "berkley mid-atlantic group**additional setups required": "32603",
  "berkley":                                       "32603",

  // ── Arch ──────────────────────────────────────────────────────────────────
  "arch ins grp, insurance company, arc":          "11150",
  "arch":                                          "11150",

  // ── Sentinel ──────────────────────────────────────────────────────────────
  "sentinel insurance company, ltd, insurance company, snt": "11000",
  "sentinel":                                      "11000",

  // ── Next Insurance ────────────────────────────────────────────────────────
  "next insurance us company, insurance company, nxt": "15622",
  "next insurance":                                "15622",

  // ── Guard / AmGuard ───────────────────────────────────────────────────────
  "guard insurance, insurance company, itg":       "42390",
  "amguard insurance company":                     "42390",
  "amguard":                                       "42390",

  // ── Pacific Specialty ─────────────────────────────────────────────────────
  "pacific specialty insurance company, insurance company, pac": "37850",
  "pacific specialty":                             "37850",

  // ── Geico ─────────────────────────────────────────────────────────────────
  "geico":                                         "22055",

  // ── Skyward Specialty ─────────────────────────────────────────────────────
  "skyward specialty insurance, insurance company, sky": "13640",
  "skyward specialty":                             "13640",

  // ── Western Surety ────────────────────────────────────────────────────────
  "western surety company, insurance company, wsc": "13188",
  "western surety":                                "13188",

  // ── Texas Mutual ──────────────────────────────────────────────────────────
  "texas mutual insurance, insurance company, tex": "22945",
  "texas mutual":                                  "22945",

  // ── Valley Forge ──────────────────────────────────────────────────────────
  "valley forge insurance, insurance company, vfo": "20508",
  "valley forge":                                  "20508",

  // ── USLI ──────────────────────────────────────────────────────────────────
  "usli investment corporation, insurance company, usl": "25257",
  "usli":                                          "25257",

  // ── Hippo ─────────────────────────────────────────────────────────────────
  "hippo insurance company, insurance company, hip": "17558",
  "hippo":                                         "17558",

  // ── Coterie ───────────────────────────────────────────────────────────────
  "coterie insurance agency llc, insurance company, cot": "15551",
  "coterie":                                       "15551",

  // ── Axis ──────────────────────────────────────────────────────────────────
  "axis insurance company, writing company, acr001": "37273",
  "axis insurance company":                        "37273",
  "axis":                                          "37273",
};

/**
 * Look up NAIC number for a given carrier / writing-company name.
 * First tries exact match (case-insensitive), then partial substring match.
 */
export function getNaicNumber(companyName: string): string {
  if (!companyName) return "";
  const key = companyName.trim().toLowerCase();
  if (NAIC_LOOKUP[key]) return NAIC_LOOKUP[key];
  for (const [name, naic] of Object.entries(NAIC_LOOKUP)) {
    if (key.includes(name) || name.includes(key)) return naic;
  }
  return "";
}
