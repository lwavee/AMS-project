/* eslint-disable */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "../../../../../lib/config";
import {
  Plus,
  Check,
  X,
  Shield,
  Calendar,
  Building2,
  CreditCard,
  Users,
  Info,
  CheckCircle,
  FileText
} from "lucide-react";

const INSURANCE_PARENT_COMPANIES = [
  "(CA), Insurance Company, (CA)",
  "(MN), Insurance Company, (MN)",
  "ABC Auto Insurance, Insurance Company, ABC",
  "Access Insurance Company, Insurance Company, ACS",
  "ACE Group (formerly Atlantic Mutual Companies), Insurance Company",
  "Acrisure, Insurance Company, ACR",
  "Aegis General Insurance, Insurance Company, AEG",
  "Allied/Nationwide Insurance Company, Insurance Company, ALI",
  "Allstate, Insurance Company, ALL",
  "Alteris Insurance Services Inc., Insurance Company, AIS",
  "American Assets Grp (CA), Insurance Company, AAG",
  "American Business Insurance Services (CA), Insurance Company",
  "American Collectors Insurance Company, Insurance Company",
  "American Modern Insurance Group**additional setups required",
  "American Prop & Cas Inc, Insurance Company, APR",
  "AmTrust Financial Services, Inc., Insurance Company, AMT",
  "Anchor General Insurance Agency, Inc., Insurance Company, ANC",
  "Arch Ins Grp, Insurance Company, ARC",
  "Ark International Group, Insurance Company, ARK",
  "Arthur J. Gallagher & Company, Insurance Company, AJG",
  "Artisan and Truckers Casualty, Insurance Company, ART",
  "Aspire General Insurance, Insurance Company, ASP",
  "Associated Industries Insurance Company, Insurance Company",
  "Assurant Group**Additional Setups Required, Insurance Company",
  "Atain Insurance Companies, Insurance Company, ATA",
  "Ategrity Specialty Insurance Company, Insurance Company, ATE",
  "AU Gold, Insurance Company, AGO",
  "Bamboo, Insurance Company, BAM",
  "BBSI, Insurance Company, BBS",
  "Berkley Mid-Atlantic Group**additional setups required",
  "BIS, Insurance Company, BIS",
  "Blue Cross Blue Shield, Insurance Company, BCB",
  "Bond Experts II, Insurance Company, BON",
  "Bridger Auto, Insurance Company, BAIS",
  "Bristol West Holdings Inc, Insurance Company, BWA",
  "Britt/Paulk Insurance Agency, Insurance Company, BRI",
  "Brookside General (CA), Insurance Company, BRO",
  "CA Fair Plan, Insurance Company, CFP",
  "California Earthquake Authority, Insurance Company, CEA",
  "California Low Cost Insurance Policy, Insurance Company",
  "Canopius US Insurance, Inc., Insurance Company, CUI",
  "Capital Insurance Group (CIG), Insurance Company, CIG",
  "Carnegie General Insurance Agency (CA), Insurance Company",
  "Certain Underwriters at Lloyds of London, Insurance Company",
  "Chubb and Son, Inc., Insurance Company, CHB",
  "CIBA Insurance Services, Insurance Company, CIB",
  "CM&F Group Inc, Insurance Company, CMF",
  "CNA, Insurance Company, CNA",
  "Columbia Lloyds Insurance Company, Insurance Company, CLIC",
  "Community Associates Insurance Solutions, Insurance Company",
  "Continental Casualty Company, Insurance Company, CNC",
  "Coterie Insurance Agency LLC, Insurance Company, COT",
  "CSE Insurance Group/ Alliance United/Safeguard, Insurance Com",
  "Daigle, Insurance Company, DAG",
  "Dairyland Insurance, Insurance Company, DAI",
  "--DEFAULT--, Insurance Company, DEFCMP",
  "Developers Surety and Indemnity Co., Insurance Company, DEV",
  "Drive Insurance Company, Insurance Company, DRV",
  "Eagle West Insurance Co., Insurance Company, EAG",
  "Earthquake Coverage (CA), Insurance Company, EAC",
  "Employers Holdings Grp, Insurance Company, EHG",
  "Essentia Insurance Company, Insurance Company, ESS",
  "Evanston Insurance Company, Insurance Company, EVA",
  "Everest National Insurance Company, Insurance Company, EVR",
  "Federated National Insurance**additional setups required",
  "First Comp, Insurance Company, FCO",
  "First Connect Insurance Services, Insurance Company, FCN",
  "Foremost Insurance Company, Insurance Company, FIC",
  "Frank Winston Crum Insurance, Insurance Company, FWCI",
  "GEORGIA WORKERS COMP, Insurance Company, GWC",
  "GIG Insurance Group, Insurance Company, GGG",
  "Great American, Insurance Company, GRE",
  "Guard Insurance, Insurance Company, ITG",
  "Hagerty Insurance, Insurance Company, HAG",
  "Hamilton Insurance DAC (CA), Insurance Company, HAM",
  "Harco National Insurance Company, Insurance Company, HRC",
  "Hartford Insurance Group, Insurance Company, HIG",
  "Hippo Insurance Company, Insurance Company, HIP",
  "Hudson Insurance Company, Insurance Company, HUD",
  "Infinity Insurance Company**additional setups required",
  "Interstate Fire & Casualty Company (CA), Insurance Company",
  "Invo Peo, Insurance Company, INV",
  "K2Specialty, Insurance Company, K2S",
  "Kaiser Permanente, Insurance Company, KAP",
  "Kemper, Insurance Company, KEM",
  "KENTUCKY WORKERS COMP, Insurance Company, KWC",
  "Liberty Mutual Agency Corporation, Insurance Company, LRM",
  "Life Insurance Generic, Insurance Company, LIF",
  "Magna Carta Companies, Insurance Company, MAG",
  "Main Street America Group, Insurance Company, NGM",
  "Mapfre USA (Formerly Commerce and Commerce West Insurance",
  "Markel American Insurance Company, Insurance Company, MKL",
  "MARYLAND WORKERS COMP, Insurance Company, YMC",
  "Mercury Insurance Group, Insurance Company, MER",
  "MetLife Auto & Home, Insurance Company, MET",
  "Minnesota FAIR Plan (MN), Insurance Company, MFP",
  "Minnesota Workers' Compensation Assigned Risk Pla",
  "Montana State Fund, Insurance Company, MNS",
  "Monterey Insurance Company, Insurance Company, MON",
  "Munich Re Grp, Insurance Company, MUN",
  "National General (formerly GMAC), Insurance Company, INT",
  "Nationwide Exclusive, Insurance Company, NAT",
  "Nautilus Insurance Company, Insurance Company, NTI",
  "New York State Insurance Fund, Insurance Company, NEW",
  "Next Insurance US Company, Insurance Company, NXT",
  "NIPC, Insurance Company, NIPC",
  "Nonprofits Insurance Alliance Group, Insurance Company, NON",
  "Norguard Ins Co, Insurance Company, NRG",
  "Northern California Schools Insurance Group, Insurance Company",
  "Northfield Insurance Company, Insurance Company, NOR",
  "Novita Insurance Solution, Insurance Company, NVI",
  "Obsidian Specialty Insurance Copany, Insurance Company, OBS",
  "Pacific Specialty Insurance Company, Insurance Company, PAC",
  "Parent Company, Insurance Company, PNT",
  "Pennsylvania Lumbermens Grp, Insurance Company, PLG",
  "Philadelphia Ins Co., Insurance Company, PHI",
  "Preferred Contractors Insurance Company, Insurance Company",
  "Prime Insurance Company, Insurance Company, PCO",
  "Progressive Insurance, Insurance Company, PRO",
  "Propeller, Inc., Insurance Company, PPL",
  "Prospect, Insurance Company, PRS",
  "ProSure Group, Insurance Company, PRG",
  "Red Shield Insurance Company, Insurance Company, RSI",
  "RLI Corporation, Insurance Company, RLI",
  "Rockingham Mutual Insurance Company, Insurance Company",
  "RV Nuccio & Associates Insurance Brokers, Inc.",
  "Safe Herb, Insurance Company, SFH",
  "Safebuilt Insurance Services, Insurance Company, SFB",
  "Safeco Insurance Company, Insurance Company, SAF",
  "Safeway Insurance Company, Insurance Company, SIC",
  "SAIF Corp, Insurance Company, SAI",
  "Sample Work Comp Company, Insurance Company, SWC",
  "SCJ Insurance Services, Insurance Company, SCJ",
  "Scottsdale Insurance Company, Insurance Company, SCT",
  "Seaview Insurance Company, Insurance Company, SEA",
  "Sentinel Insurance Company, LTD, Insurance Company, SNT",
  "Sequoia Insurance Company **additional setups required",
  "Skyward Specialty Insurance, Insurance Company, SKY",
  "Special Markets Ins Consultants, Insurance Company, SMC",
  "Standard Fire Insurance (ID), Insurance Company, STF",
  "Starstone National Insurance Co. (OR), Insurance Company, SNI",
  "State Auto Insurance Companies, Insurance Company, STA",
  "State Compensation Insurance Fund, Insurance Company, SCF",
  "State Fund, Insurance Company, SFU",
  "State National Insurance Company, Inc., Insurance Company, SN",
  "Stillwater Insurance Services (formerly Fidelity National Insurance",
  "Suretec Insurance Co., Insurance Company, STC",
  "Surety One, Insurance Company, SON",
  "Surety Solutions, Insurance Company, SSL",
  "TBD (CA), Insurance Company, TBD",
  "Technology Insurance Co., Insurance Company, TCH",
  "Terheggen-Malone Marine insurance (CA) (CA), Insurance Compa",
  "Texas Mutual Insurance, Insurance Company, TEX",
  "The Insurance Shop, Insurance Company, TIS",
  "The Medical Protective Company, Insurance Company, MED",
  "Thimble Insurance Services, Insurance Company, THM",
  "Tokio Marine Management, Inc., Insurance Company, TOK",
  "Travelers Insurance Company, Insurance Company, TRV",
  "Trisura Specialty Insurance Company, Insurance Company, TRI",
  "U.S. Specialty Insurance Company, Insurance Company, USP",
  "Unigard Insurance Company- a QBE Company**additional setups",
  "United Health Care, Insurance Company, UHC",
  "United Specialty Insurance Company, Insurance Company, UIN",
  "Unitrin Specialty, Insurance Company, UNS",
  "USLI Investment Corporation, Insurance Company, USL",
  "Valley Forge Insurance, Insurance Company, VFO",
  "Valley Surety Insurance Agency, Insurance Company, VAL",
  "VFIS Insurance Services, Insurance Company, VFI",
  "Victoria Insurance Group *Additional setups required",
  "Wbl Grp, Insurance Company, WBL",
  "Western Surety Company, Insurance Company, WSC",
  "Woldwide Insurance Network Inc. dba Smart Choice, Insurance C",
  "Wright National Flood Insurance, Insurance Company, WNF",
  "XYZ Insurance Company, Insurance Company, XYZ",
  "Zenith, Insurance Company, ZEN",
  "Zurich Insurance Company**additional setups required"
];

const INSURANCE_WRITING_COMPANIES: Record<string, string[]> = {
  "(CA), Insurance Company, (CA)": ["(CA), Insurance Company, (CA)"],
  "--DEFAULT--, Insurance Company, DEFCMP": [
    "--DEFAULT--, Insurance Company, DEFCMP"
  ],
  "ACE Group (formerly Atlantic Mutual Companies), Insurance Company": [
    "ACE American Insurance Company, Writing Company, ATL011",
    "ACE Group (formerly Atlantic Mutual Companies), Insurance Company"
  ],
  "Acrisure, Insurance Company, ACR": [
    "Acrisure, Insurance Company, ACR",
    "Axis Insurance Company, Writing Company, ACR001"
  ],
  "Aegis General Insurance, Insurance Company, AEG": [
    "Aegis General Insurance, Insurance Company, AEG",
    "Aegis Security Insurance Company, Writing Company, AEG001",
    "Seaview Insurance Company, Writing Company, AEG002"
  ],
  "Allied/Nationwide Insurance Company, Insurance Company, ALI": [
    "Allied Insurance Company of America, Writing Company, ALI022",
    "Allied/Nationwide Insurance Company, Insurance Company, ALI",
    "AMCO, Writing Company, ALI002",
    "Depositors, Writing Company, ALI004",
    "Freedom Specialty Ins Co, Writing Company, ALI024",
    "Nationwide Affinity Insurance Co of America, Writing Company, ALI0",
    "Nationwide Agribusiness Ins Co, Writing Company, ALI001",
    "Nationwide Insurance Company of America, Writing Company, ALI01",
    "Nationwide Mutual, Writing Company, ALI005",
    "Nationwide Property & Casualty Insurance Co, Writing Company, ALI",
    "Seaview Insurance Company, Writing Company, ALI025"
  ],
  "Allstate, Insurance Company, ALL": [
    "Allstate County Mutual Insurance, Writing Company, ALL001",
    "Allstate Fire and Casualty Insurance Company, Writing Company, AL",
    "Allstate Floridian Indemnity Company, Writing Company, ALL007",
    "Allstate Floridian Insurance Company, Writing Company, ALL006",
    "Allstate Indemnity Company, Writing Company, ALL002",
    "Allstate Insurance Company, Writing Company, ALL003",
    "Allstate Motor Club, Inc., Writing Company, ALL015",
    "Allstate New Jersey Property and Casualty Insurance Company, Writi",
    "Allstate NJ Insurance Company, Writing Company, ALL008",
    "Allstate Property and Casualty, Writing Company, ALL004",
    "Allstate Texas Lloyds, Writing Company, ALL005",
    "Allstate Vehicle & Prop Ins Co, Writing Company, ALL016",
    "Allstate, Insurance Company, ALL",
    "California Earthquake Authority, Writing Company, ALL009",
    "Deerbrook Ins. Company, Writing Company, ALL010",
    "Northbrook Indemnity Company, Writing Company, ALL011",
    "Northbrook Property Casualty, Writing Company, ALL012"
  ],
  "Alteris Insurance Services Inc., Insurance Company, AIS": [
    "Alteris Insurance Services Inc., Insurance Company, AIS",
    "Harco National Insurance Company, Writing Company, AIS001"
  ],
  "American Assets Grp (CA), Insurance Company, AAG": [
    "American Assets Grp (CA), Insurance Company, AAG",
    "Explorer Ins Co, Writing Company, AAG001"
  ],
  "American Business Insurance Services (CA), Insurance Company": [
    "American Business Insurance Services (CA), Insurance Company, A",
    "New York Marine & General Ins.Co., Writing Company, ABU001"
  ],
  "American Collectors Insurance Company, Insurance Company": [
    "American Alternative Insurance Corporation, Writing Company, ACI0",
    "American Collectors Insurance Company, Insurance Company, ACI"
  ],
  "American Modern Insurance Group**additional setups required": [
    "American Modern Insurance Group**additional setups required, Insu",
    "American Modern P&C Ins. Co., Writing Company, AMM012"
  ],
  "American Prop & Cas Inc, Insurance Company, APR": [
    "American Prop & Cas Inc, Insurance Company, APR"
  ],
  "AmTrust Financial Services, Inc., Insurance Company, AMT": [
    "AmTrust Financial Services, Inc., Insurance Company, AMT",
    "AmTrust Insurance Company of Kansas, Writing Company, AMT013",
    "Liberty Mutual, Writing Company, AMT014",
    "Mount Vernon Fire Insurance Company, Writing Company, AMT015",
    "National General Ins Online Inc, Writing Company, AMT016",
    "Security National Insurance Co, Writing Company, AMT005",
    "Sequoia Insurance Co, Writing Company, AMT006",
    "Technology Insurance Co, Writing Company, AMT011",
    "Wesco Insurance Co, Writing Company, AMT008"
  ],
  "Anchor General Insurance Agency, Inc., Insurance Company, ANC": [
    "Anchor General Insurance Agency, Inc., Insurance Company, ANC",
    "Anchor General Insurance Company, Writing Company, ANC001"
  ],
  "Arch Ins Grp, Insurance Company, ARC": [
    "Arch Ins Co, Writing Company, ARC001",
    "Arch Ins Grp, Insurance Company, ARC"
  ],
  "Ark International Group, Insurance Company, ARK": [
    "Ark International Group, Insurance Company, ARK",
    "Stratford Insurance Company, Writing Company, ARK001"
  ],
  "Arthur J. Gallagher & Company, Insurance Company, AJG": [
    "Arthur J. Gallagher & Company, Insurance Company, AJG"
  ],
  "Artisan and Truckers Casualty, Insurance Company, ART": [
    "Artisan and Truckers Casualty, Insurance Company, ART"
  ],
  "Aspire General Insurance, Insurance Company, ASP": [
    "Aspire General Ins, Writing Company, ASP001",
    "Aspire General Insurance, Insurance Company, ASP"
  ],
  "Associated Industries Insurance Company, Insurance Company": [
    "Associated Industries Insurance Company, Insurance Company, ACC"
  ],
  "Assurant Group**Additional Setups Required, Insurance Company": [
    "American Bankers Ins Group, Writing Company, ASR001",
    "American Reliable Insurance Company, Writing Company, ASR005",
    "Assurant Group**Additional Setups Required, Insurance Company, A"
  ],
  "Atain Insurance Companies, Insurance Company, ATA": [
    "Atain Insurance Companies, Insurance Company, ATA",
    "Atain Specialty Insurance Company, Writing Company, ATA001"
  ],
  "Ategrity Specialty Insurance Company, Insurance Company, ATE": [
    "Ategrity Specialty Insurance Company, Insurance Company, ATE"
  ],
  "AU Gold, Insurance Company, AGO": [
    "AU Gold, Insurance Company, AGO",
    "Certain Underwriter Lloyd's, Writing Company, AGO01"
  ],
  "Bamboo, Insurance Company, BAM": [
    "Bamboo, Insurance Company, BAM",
    "Sutton National Insurance Company, Writing Company, BAM001"
  ],
  "BBSI, Insurance Company, BBS": [
    "ACE American Insurance Co, Writing Company, BBS001",
    "BBSI, Insurance Company, BBS"
  ],
  "Berkley Mid-Atlantic Group**additional setups required": [
    "Berkley Mid-Atlantic Group**additional setups required, Insurance"
  ],
  "BIS, Insurance Company, BIS": [
    "Associated Industries Insurance Company, Inc., Writing Company, B",
    "BIS, Insurance Company, BIS",
    "Developers Surety and Indemnity Company, Writing Company, BIS0"
  ],
  "Blue Cross Blue Shield, Insurance Company, BCB": [
    "Blue Cross Blue Shield, Insurance Company, BCB"
  ],
  "Bond Experts II, Insurance Company, BON": [
    "Bond Experts II, Insurance Company, BON",
    "Houston Specialty Insurance Company, Writing Company, BON001"
  ],
  "Bridger Auto, Insurance Company, BAIS": [
    "Bridger Auto, Insurance Company, BAIS",
    "Incline National Insurance Company, Writing Company, BAIS01"
  ],
  "Bristol West Holdings Inc, Insurance Company, BWA": [
    "Bristol West Holdings Inc, Insurance Company, BWA",
    "Bristol West Insurance Company, Writing Company, BWA003",
    "Coast National Insurance Company, Writing Company, BWA001"
  ],
  "Britt/Paulk Insurance Agency, Insurance Company, BRI": [
    "Britt/Paulk Insurance Agency, Insurance Company, BRI"
  ],
  "Brookside General (CA), Insurance Company, BRO": [
    "Brookside General (CA), Insurance Company, BRO",
    "Topa Insurance Company, Writing Company, BRO001"
  ],
  "CA Fair Plan, Insurance Company, CFP": [
    "CA Fair Plan, Insurance Company, CFP",
    "California Capital Insurance Co., Writing Company, CFP001"
  ],
  "California Earthquake Authority, Insurance Company, CEA": [
    "California Earthquake Authority, Insurance Company, CEA"
  ],
  "California Low Cost Insurance Policy, Insurance Company": [
    "21st Century Centennial Insurance Co, Writing Company, CAAR02",
    "California Automobile Assigned Risk Plan, Writing Company, CAAR01",
    "California Low Cost Insurance Policy, Insurance Company, CAARP"
  ],
  "Canopius US Insurance, Inc., Insurance Company, CUI": [
    "Canopius US Insurance, Inc., Insurance Company, CUI",
    "Professional Program Insurance Brokerage, Writing Company, CUI001"
  ],
  "Capital Insurance Group (CIG), Insurance Company, CIG": [
    "California Capital Insurance Co, Writing Company, CIG001",
    "Capital Insurance Group (CIG), Insurance Company, CIG",
    "Eagle West Insurance Co, Writing Company, CIG002",
    "Monterey Insurance Co, Writing Company, CIG003",
    "Nevada Capital, Writing Company, CIG004"
  ],
  "Carnegie General Insurance Agency (CA), Insurance Company": [
    "Carnegie Flagship Program, Writing Company, CAR001",
    "Carnegie General Insurance Agency (CA), Insurance Company, CAR",
    "Safe Auto Insurance Company, Writing Company, CAR002"
  ],
  "Certain Underwriters at Lloyds of London, Insurance Company": [
    "Certain Underwriters at Lloyds of London, Insurance Company, CUL"
  ],
  "Chubb and Son, Inc., Insurance Company, CHB": [
    "Chubb and Son, Inc., Insurance Company, CHB"
  ],
  "CIBA Insurance Services, Insurance Company, CIB": [
    "CIBA Insurance Services, Insurance Company, CIB"
  ],
  "CM&F Group Inc, Insurance Company, CMF": [
    "CM&F Group Inc, Insurance Company, CMF",
    "Medical Protective Co, Writing Company, CMF001"
  ],
  "CNA, Insurance Company, CNA": [
    "American Casualty Co. of Reading PA, Writing Company, CNA005",
    "CNA Surety, Writing Company, CNA012",
    "CNA, Insurance Company, CNA",
    "Continental Casualty Company, Writing Company, CNA001",
    "National Fire Insurance Company of Hartford, Writing Company, CNA",
    "Valley Forge Insurance Company, Writing Company, CNA006",
    "Western Surety Company, Writing Company, CNA011"
  ],
  "Columbia Lloyds Insurance Company, Insurance Company, CLIC": [
    "Columbia Lloyds Ins Co, Writing Company, CLIC01",
    "Columbia Lloyds Insurance Company, Insurance Company, CLIC"
  ],
  "Community Associates Insurance Solutions, Insurance Company": [
    "Community Associates Insurance Solutions, Insurance Company, CAI",
    "Pennsylvania Manufacturers' Association Insuran, Writing Company, CAI001"
  ],
  "Continental Casualty Company, Insurance Company, CNC": [
    "Continental Casualty Company, Insurance Company, CNC",
    "Western Surety Company, Writing Company, CNC001"
  ],
  "Coterie Insurance Agency LLC, Insurance Company, COT": [
    "Coterie Insurance Agency LLC, Insurance Company, COT",
    "Spinnaker Insurance Company, Writing Company, COT001"
  ],
  "CSE Insurance Group/ Alliance United/Safeguard, Insurance Com": [
    "CSE Insurance Group/ Alliance United/Safeguard, Insurance Company, CSE",
    "Gold, Writing Company, CSE003"
  ],
  "Daigle, Insurance Company, DAG": [
    "Arch Ins Co, Writing Company, DAG002",
    "Daigle, Insurance Company, DAG"
  ],
  "Dairyland Insurance, Insurance Company, DAI": [
    "Dairyland Insurance Company, Writing Company, DAI001",
    "Dairyland Insurance, Insurance Company, DAI",
    "Viking Insurance Company of Wisconsin, Writing Company, DAI008"
  ],
  "Developers Surety and Indemnity Co., Insurance Company, DEV": [
    "Developers Surety and Indemnity Co., Insurance Company, DEV"
  ],
  "Drive Insurance Company, Insurance Company, DRV": [
    "Drive Insurance Company, Insurance Company, DRV"
  ],
  "Eagle West Insurance Co., Insurance Company, EAG": [
    "Eagle West Insurance Co., Insurance Company, EAG"
  ],
  "Earthquake Coverage (CA), Insurance Company, EAC": [
    "Earthquake Coverage (CA), Insurance Company, EAC"
  ],
  "Employers Holdings Grp, Insurance Company, EHG": [
    "Employers Compensation Insurance Company, Writing Company, EHG001",
    "Employers Holdings Grp, Insurance Company, EHG",
    "Employers Preferred Ins Co, Writing Company, EHG002"
  ],
  "Essentia Insurance Company, Insurance Company, ESS": [
    "Essentia Insurance Company, Insurance Company, ESS"
  ],
  "Evanston Insurance Company, Insurance Company, EVA": [
    "Evanston Insurance Company, Insurance Company, EVA",
    "Kinney & Co, Writing Company, EVA001"
  ],
  "Everest National Insurance Company, Insurance Company, EVR": [
    "Everest National Insurance Company, Insurance Company, EVR"
  ],
  "Federated National Insurance**additional setups required": [
    "Federated National Insurance**additional setups required, Insurance"
  ],

  "First Comp, Insurance Company, FCO": [
    "First Comp, Insurance Company, FCO",
    "Markel Insurance, Writing Company, FCO011"
  ],
  "First Connect Insurance Services, Insurance Company, FCN": [
    "First Connect Insurance Services, Insurance Company, FCN",
    "Hippo Insurance Company, Writing Company, FCN001"
  ],
  "Foremost Insurance Company, Insurance Company, FIC": [
    "California Earthquake Authority, Writing Company, FIC010",
    "Foremost Insurance Co, Writing Company, FIC001",
    "Foremost Insurance Company, Insurance Company, FIC",
    "Foremost Star, Writing Company, FIC009",
    "Mobile Home, Writing Company, FIC011",
    "Motorcyce / ORV, Writing Company, FIC008",
    "Specialty Dwelli, Writing Company, FIC007"
  ],
  "Frank Winston Crum Insurance, Insurance Company, FWCI": [
    "Clear Blue Insurance Co, Writing Company, FWCI01",
    "Frank Winston Crum Insurance, Insurance Company, FWCI"
  ],
  "GEORGIA WORKERS COMP, Insurance Company, GWC": [
    "GEORGIA WORKERS COMP, Insurance Company, GWC"
  ],
  "GIG Insurance Group, Insurance Company, GGG": [
    "GIG Insurance Group, Insurance Company, GGG",
    "Philadelphia Indemnity Insurance Companys, Writing Company, GGG"
  ],
  "Great American, Insurance Company, GRE": [
    "Great American, Insurance Company, GRE"
  ],
  "Guard Insurance, Insurance Company, ITG": [
    "AmGUARD Insurance Company, Writing Company, ITG002",
    "Guard Insurance, Insurance Company, ITG"
  ],
  "Hagerty Insurance, Insurance Company, HAG": [
    "Essentia Insurance Company, Writing Company, HAG001",
    "Hagerty Insurance, Insurance Company, HAG"
  ],
  "Hamilton Insurance DAC (CA), Insurance Company, HAM": [
    "Hamilton Insurance DAC (CA), Insurance Company, HAM"
  ],
  "Harco National Insurance Company, Insurance Company, HRC": [
    "Harco National Insurance Company, Insurance Company, HRC"
  ],
  "Hartford Insurance Group, Insurance Company, HIG": [
    "Hartford Accident and Indemnity Company, Writing Company, HIG001",
    "Hartford Casualty Insurance Company, Writing Company, HIG002",
    "Hartford Fire Insurance Company, Writing Company, HIG003",
    "Hartford Insurance Company of the Midwest, Writing Company, HIG004",
    "Hartford Insurance Group, Insurance Company, HIG",
    "Hartford Property & Casualty, Writing Company, HIG014",
    "Hartford Underwriters Insurance Company, Writing Company, HIG005",
    "Scottsdale Indemnity Company, Writing Company, HIG028",
    "Sentinel Insurance Company LTD, Writing Company, HIG010",
    "The Automobile Ins. Co of Hartford CT, Writing Company, HIG027",
    "Trumbull Insurance Company, Writing Company, HIG011",
    "Twin City Fire Insurance Company, Writing Company, HIG012"
  ],
  "Hippo Insurance Company, Insurance Company, HIP": [
    "Hippo Insurance Company, Insurance Company, HIP"
  ],
  "Hudson Insurance Company, Insurance Company, HUD": [
    "Hudson Insurance Company, Insurance Company, HUD",
    "J E Brown & Associates, Writing Company, HUD001"
  ],
  "Infinity Insurance Company**additional setups required": [
    "Gold, Writing Company, INF020",
    "Infinity Auto Ins Co, Writing Company, INF018",
    "Infinity Indemnity Insurance Company, Writing Company, INF017",
    "Infinity Insurance Company W, Writing Company, INF009",
    "Infinity Insurance Company**additional setups required, Insurance Company",
    "Infinity Select Insurance, Writing Company, INF010",
    "Kemper, Writing Company, INF024",
    "Kinney & Co, Writing Company, INF023",
    "RSVP, Writing Company, INF019",
    "SIAA, Writing Company, INF022",
    "Special, Writing Company, INF021"
  ],
  "Interstate Fire & Casualty Company (CA), Insurance Company": [
    "Infinity Insurance Company, Writing Company, IFC001",
    "Interstate Fire & Casualty Company (CA), Insurance Company, IFC"
  ],
  "Invo Peo, Insurance Company, INV": [
    "Bridgefield Casualty Insurance, Writing Company, INV003",
    "Employers Preferred Insurance Co, Writing Company, INV002",
    "Frank Crum, Writing Company, INV001",
    "Invo Peo, Insurance Company, INV"
  ]
};

export default function NewPolicyPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params?.id as string;

  // Customer state loaded from API
  const [customerName, setCustomerName] = useState("Loading...");
  const [execDefault, setExecDefault] = useState("");
  const [repDefault, setRepDefault] = useState("");
  const [divisionDefault, setDivisionDefault] = useState("");

  // Form Fields State
  const [submissionId, setSubmissionId] = useState("");
  const [subEffDate, setSubEffDate] = useState("");

  const [policyNum, setPolicyNum] = useState("");
  const [effDate, setEffDate] = useState("");
  const [expDate, setExpDate] = useState("");
  const [isContinuous, setIsContinuous] = useState(false);
  const [isNotRenewable, setIsNotRenewable] = useState(false);
  const [issueState, setIssueState] = useState("FL");
  const [carrierStatus, setCarrierStatus] = useState("Active");
  const [isReinsurance, setIsReinsurance] = useState(false);
  const [term, setTerm] = useState("12");

  const [businessType, setBusinessType] = useState("Commercial Lines");
  const [transaction, setTransaction] = useState("New business");
  const [description, setDescription] = useState("New business");

  const [companyType, setCompanyType] = useState("Insurance");
  const [parentCompany, setParentCompany] = useState("Progressive");
  const [writingCompany, setWritingCompany] = useState("Progressive Casualty");

  const [division, setDivision] = useState("Gamaty Insurance Agency");
  const [branch, setBranch] = useState("Capital & Co");
  const [department, setDepartment] = useState("Commercial");

  const [billMethod, setBillMethod] = useState("Direct bill");
  const [payPlan, setPayPlan] = useState("Full Payment");

  const [executive, setExecutive] = useState("");
  const [representative, setRepresentative] = useState("");
  const [broker, setBroker] = useState("");

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

  // Sync writing company when parent company or company type changes
  useEffect(() => {
    if (companyType === "Insurance") {
      const companies = INSURANCE_WRITING_COMPANIES[parentCompany];
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
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCustomerName(data.name || [data.first_name, data.last_name].filter(Boolean).join(" ") || "Unknown Customer");
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
          if (data.division) {
            setDivision(data.division);
            setDivisionDefault(data.division);
          }
          if (data.branch) setBranch(data.branch);
          if (data.department) setDepartment(data.department);
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

    if (!policyNum.trim()) {
      setError("Policy Number is required.");
      return;
    }
    if (!effDate) {
      setError("Effective Date is required.");
      return;
    }

    setIsLoading(true);

    const payload = {
      policy_num: policyNum.trim(),
      status: "Active",
      term: term ? `${term} Months` : "12 Months",
      type: businessType,
      company: parentCompany,
      description: description || transaction,
      eff_date: effDate,
      exp_date: expDate || "Continuous",

      submission_id: submissionId || null,
      sub_eff_date: subEffDate || null,
      is_continuous: isContinuous,
      is_not_renewable: isNotRenewable,
      issue_state: issueState,
      carrier_status: carrierStatus,
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
      include_notes: includeNotes,
      exclude_lines: excludeLines,
      default_insured: defaultInsured,
      default_co_insured: defaultCoInsured,
      default_dba: defaultDba,
      default_contacts: defaultContacts
    };

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/policies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        let errMsg = "Failed to create policy in database";
        if (errData && errData.detail) {
          if (typeof errData.detail === "string") {
            errMsg = errData.detail;
          } else if (Array.isArray(errData.detail) && errData.detail.length > 0) {
            errMsg = errData.detail[0].msg || errMsg;
          }
        }
        throw new Error(errMsg);
      }

      const createdPolicy = await res.json();

      // Keep localStorage as quick local backup cache data
      const formattedPolicy = {
        id: createdPolicy.id.toString(),
        policyNum: createdPolicy.policy_num,
        status: createdPolicy.status,
        term: createdPolicy.term,
        type: "",
        lobs: [],
        company: createdPolicy.company,
        description: createdPolicy.description,
        effDate: createdPolicy.eff_date,
        expDate: createdPolicy.exp_date,
        createdDate: new Date(createdPolicy.created_date).toLocaleDateString()
      };

      const currentPoliciesStr = localStorage.getItem(`policies_${customerId}`);
      const policiesList = currentPoliciesStr ? JSON.parse(currentPoliciesStr) : [];
      policiesList.unshift(formattedPolicy);
      localStorage.setItem(`policies_${customerId}`, JSON.stringify(policiesList));

      // Trigger a Storage Event to notify open tabs
      window.dispatchEvent(new Event("storage"));

      setSuccess(true);
      setTimeout(() => {
        try {
          window.close();
        } catch (e) {
          router.push(`/agency/customer/${customerId}`);
        }
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save policy to database. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    try {
      window.close();
    } catch (e) {
      router.push(`/agency/customer/${customerId}`);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base font-sans select-none text-text-main pb-24">
      {/* ── Top Window Bar ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <span className="text-white font-bold text-xl tracking-wider font-sans">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-text-main leading-tight font-sans">Sterling Insurance Services</span>
            <span className="text-[9px] uppercase tracking-wider text-primary font-bold leading-none mt-0.5">Create New Policy</span>
          </div>
        </div>

        <button
          onClick={handleCancel}
          className="h-8 w-8 flex items-center justify-center rounded-xl border border-border-main bg-white hover:bg-slate-50 transition-all text-slate-400 hover:text-slate-800 cursor-pointer"
          title="Cancel and Close"
        >
          <X size={15} />
        </button>
      </header>

      {/* ── Descriptive Instruction Box ── */}
      <div className="max-w-5xl mx-auto px-6 mt-6">
        <div className="bg-secondary/40 border border-border-main rounded-2xl p-4 flex gap-3.5 items-start">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1 font-medium">
            <p className="font-bold text-text-main">Enter the Basic Policy Information or select a Submission to create the new Policy.</p>
            <p>To create a Policy for an existing Submission, select Submission # and Effective Date. The most current Application version(s) will default.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-6">

        {/* Success Feedback Card */}
        {success && (
          <div className="bg-success/5 border border-success/20 text-success p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle className="size-5 text-success shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-success">Policy Created Successfully!</p>
              <p className="text-[11px] font-semibold text-success/80 mt-0.5">Saving details and closing window...</p>
            </div>
          </div>
        )}

        {/* Error Feedback Card */}
        {error && (
          <div className="bg-danger/5 border border-danger/20 text-danger p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-3 duration-200">
            <Info className="size-5 text-danger shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-danger">Validation Error</p>
              <p className="text-[11px] font-semibold text-danger/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ─ GRID CONTAINER ─ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CARD 1: Submission & Customer */}
            <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-1.5">
                <Users size={12} className="text-primary" />
                Customer & Submission
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    disabled
                    className="w-full h-10 px-3.5 bg-secondary/35 border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none opacity-80"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Submission #</label>
                    <select
                      value={submissionId}
                      onChange={(e) => setSubmissionId(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="">-- Select --</option>
                      <option value="SUB-2026-001">SUB-2026-001</option>
                      <option value="SUB-2026-002">SUB-2026-002</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Sub. Eff Date</label>
                    <input
                      type="date"
                      value={subEffDate}
                      onChange={(e) => setSubEffDate(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Policy Parameters */}
            <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4 md:row-span-2">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-1.5">
                <Shield size={12} className="text-primary" />
                Policy Specifications
              </div>

              <div className="space-y-4">

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                    Policy # <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Policy Number"
                    value={policyNum}
                    onChange={(e) => setPolicyNum(e.target.value)}
                    className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="flex justify-between items-end mb-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Effective Date <span className="text-danger">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (effDate) {
                              const dateObj = new Date(effDate);
                              dateObj.setMonth(dateObj.getMonth() + 6);
                              setExpDate(dateObj.toISOString().split('T')[0]);
                            }
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold border border-primary/30 text-primary rounded bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          6 months
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (effDate) {
                              const dateObj = new Date(effDate);
                              dateObj.setFullYear(dateObj.getFullYear() + 1);
                              setExpDate(dateObj.toISOString().split('T')[0]);
                            }
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold border border-primary/30 text-primary rounded bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                        >
                          12 months
                        </button>
                      </div>
                    </div>
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
                          setExpDate(dateObj.toISOString().split('T')[0]);
                        } else {
                          setExpDate("");
                        }
                      }}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Expiration Date</label>
                    <input
                      type="date"
                      value={expDate}
                      onChange={(e) => setExpDate(e.target.value)}
                      disabled={isContinuous}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary disabled:bg-secondary/45"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isContinuous}
                      onChange={(e) => {
                        setIsContinuous(e.target.checked);
                        if (e.target.checked) setExpDate("");
                      }}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    Continuous
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNotRenewable}
                      onChange={(e) => setIsNotRenewable(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    Not Renewable
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Carrier Status</label>
                    <select
                      value={carrierStatus}
                      onChange={(e) => setCarrierStatus(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Issue State</label>
                    <select
                      value={issueState}
                      onChange={(e) => setIssueState(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="FL">FL</option>
                      <option value="NY">NY</option>
                      <option value="CA">CA</option>
                      <option value="TX">TX</option>
                      <option value="GA">GA</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Renewal/Term</label>
                    <input
                      type="number"
                      min="0"
                      value={term}
                      onChange={(e) => setTerm(e.target.value)}
                      className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    />
                  </div>
                  <div className="col-span-2 flex items-end pb-2.5">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isReinsurance}
                        onChange={(e) => setIsReinsurance(e.target.checked)}
                        className="rounded border-border-main text-primary focus:ring-primary/20"
                      />
                      Reinsurance Check
                    </label>
                  </div>
                </div>

                <div className="border-t border-border-main/50 pt-4 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Type of Business</label>
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="Benefits">Benefits</option>
                      <option value="Commercial Lines">Commercial Lines</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Health">Health</option>
                      <option value="Life">Life</option>
                      <option value="Non Property & Casualty">Non Property & Casualty</option>
                      <option value="Personal Lines">Personal Lines</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Transaction</label>
                      <select
                        value={transaction}
                        onChange={(e) => {
                          setTransaction(e.target.value);
                          setDescription(e.target.value);
                        }}
                        className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                      >
                        <option value="Anniversary re-rate">Anniversary re-rate</option>
                        <option value="Binder Billable">Binder Billable</option>
                        <option value="Binder Endorsement">Binder Endorsement</option>
                        <option value="Binder New Business">Binder New Business</option>
                        <option value="Binder Renewal">Binder Renewal</option>
                        <option value="Cancellation confirmation">Cancellation confirmation</option>
                        <option value="Cancellation request">Cancellation request</option>
                        <option value="New business">New business</option>
                        <option value="New business quote">New business quote</option>
                        <option value="Non-renewal notified Agency">Non-renewal notified Agency</option>
                        <option value="Non-renewal notified PolHolder">Non-renewal notified PolHolder</option>
                        <option value="Policy (unspecified)">Policy (unspecified)</option>
                        <option value="Policy change">Policy change</option>
                        <option value="Policy change quote">Policy change quote</option>
                        <option value="Policy inquiry">Policy inquiry</option>
                        <option value="Policy Synchronization">Policy Synchronization</option>
                        <option value="Policy Synchronization Request">Policy Synchronization Request</option>
                        <option value="Premium audit">Premium audit</option>
                        <option value="Reinstatement">Reinstatement</option>
                        <option value="Reissue">Reissue</option>
                        <option value="Renew policy">Renew policy</option>
                        <option value="Renewal quote">Renewal quote</option>
                        <option value="Renewal request">Renewal request</option>
                        <option value="Renewal requote">Renewal requote</option>
                        <option value="Reversal of non-renewal">Reversal of non-renewal</option>
                        <option value="Rewrite">Rewrite</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Description</label>
                      <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-10 px-3.5 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CARD 3: Company Setup */}
            <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-1.5">
                <Building2 size={12} className="text-primary" />
                Insurance Company Settings
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Class</label>
                  <div className="flex gap-4">
                    {["Insurance", "Brokerage", "Subscription"].map((type) => (
                      <label key={type} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                        <input
                          type="radio"
                          name="companyType"
                          value={type}
                          checked={companyType === type}
                          onChange={() => setCompanyType(type)}
                          className="text-primary focus:ring-primary/20"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Parent Company</label>
                    <select
                      value={parentCompany}
                      onChange={(e) => setParentCompany(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      {companyType === "Insurance" && INSURANCE_PARENT_COMPANIES.map((company) => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                      {companyType !== "Insurance" && (
                        <>
                          <option value="Progressive">Progressive</option>
                          <option value="Travelers">Travelers</option>
                          <option value="Liberty Mutual">Liberty Mutual</option>
                          <option value="Hartford">The Hartford</option>
                          <option value="Chubb">Chubb Group</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Writing Company</label>
                    <select
                      value={writingCompany}
                      onChange={(e) => setWritingCompany(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      {companyType === "Insurance" && INSURANCE_WRITING_COMPANIES[parentCompany] ? (
                        INSURANCE_WRITING_COMPANIES[parentCompany].map((company) => (
                          <option key={company} value={company}>{company}</option>
                        ))
                      ) : companyType === "Insurance" ? (
                        <option value={parentCompany}>{parentCompany}</option>
                      ) : (
                        <>
                          <option value="Progressive Casualty">Progressive Casualty</option>
                          <option value="Travelers Indemnity">Travelers Indemnity</option>
                          <option value="Liberty Mutual Fire">Liberty Mutual Fire</option>
                          <option value="Hartford Underwriters">Hartford Underwriters</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Business Unit */}
            <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-1.5">
                <Building2 size={12} className="text-primary" />
                Internal Business Unit
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Division</label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                  >
                    <option value="Gamaty Insurance Agency">Gamaty Insurance Agency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Branch</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                  >
                    <option value="Armar Insurance">Armar Insurance</option>
                    <option value="CapCo Florida">CapCo Florida</option>
                    <option value="Capital & Co">Capital & Co</option>
                    <option value="JMB - DO NOT SERVICE">JMB - DO NOT SERVICE</option>
                    <option value="Pregill Insurance">Pregill Insurance</option>
                    <option value="WCFL Insurance Services">WCFL Insurance Services</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                  >
                    <option value="Commercial">Commercial</option>
                    <option value="Health">Health</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CARD 5: Billing & primary service */}
            <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-1.5">
                <CreditCard size={12} className="text-primary" />
                Billing & Service Group
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Bill Method</label>
                    <select
                      value={billMethod}
                      onChange={(e) => setBillMethod(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="Direct bill">Direct bill</option>
                      <option value="Agency bill">Agency bill</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Pay Plan</label>
                    <select
                      value={payPlan}
                      onChange={(e) => setPayPlan(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="Annual">Annual</option>
                      <option value="Bi-Monthly">Bi-Monthly</option>
                      <option value="Full Pay">Full Pay</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Nine (9) Equal Payments">Nine (9) Equal Payments</option>
                      <option value="Other">Other</option>
                      <option value="Premium Finance">Premium Finance</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Semi-Annual">Semi-Annual</option>
                      <option value="Seven (7) Payments">Seven (7) Payments</option>
                      <option value="Ten (10) Payments">Ten (10) Payments</option>
                      <option value="Three Payments">Three Payments</option>
                      <option value="Two Payments">Two Payments</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-t border-border-main/50 pt-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Executive</label>
                    <select
                      value={executive}
                      onChange={(e) => setExecutive(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
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
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Rep</label>
                    <select
                      value={representative}
                      onChange={(e) => setRepresentative(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
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
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Broker</label>
                    <select
                      value={broker}
                      onChange={(e) => setBroker(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-border-main text-text-main text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary"
                    >
                      <option value="">-- None --</option>
                      <option value="Broker, External">Broker, External</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 6: Options & Customer Defaults */}
            <div className="bg-white border border-border-main rounded-2xl p-5 shadow-sm space-y-4">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-border-main pb-2 flex items-center gap-1.5">
                <FileText size={12} className="text-primary" />
                Options & Customer Defaults
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Options checkboxes */}
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Additional Options</label>
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNotes}
                      onChange={(e) => setIncludeNotes(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    Include Policy Notes
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeLines}
                      onChange={(e) => setExcludeLines(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    Exclude Lines of Business
                  </label>
                </div>

                {/* Default from current customer checkboxes */}
                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Default From Customer</label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defaultInsured}
                      onChange={(e) => setDefaultInsured(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    First Named Insured Info
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defaultCoInsured}
                      onChange={(e) => setDefaultCoInsured(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    Co-Insured/Dependent
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defaultDba}
                      onChange={(e) => setDefaultDba(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    DBA
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={defaultContacts}
                      onChange={(e) => setDefaultContacts(e.target.checked)}
                      className="rounded border-border-main text-primary focus:ring-primary/20"
                    />
                    Contacts
                  </label>
                </div>

              </div>
            </div>

          </div>

          {/* ── STICKY BOTTOM ACTIONS BAR ── */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-main py-4 px-8 flex justify-end gap-3 z-50 shadow-lg select-none">
            <button
              type="button"
              onClick={handleCancel}
              className="h-10 px-6 border border-border-main bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || success}
              className="h-10 px-8 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-primary/20 hover:bg-primary/95 active:scale-[0.98] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              {isLoading ? "Processing..." : "OK"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}