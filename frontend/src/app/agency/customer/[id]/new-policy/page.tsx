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
  "JENCAP, Insurance Company, JENC",
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
  "Minnesota Workers' Compensation Assigned Risk Pla, Insurance Company",
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
  "Rockingham Mutual Insurance Company, Insurance Company, RMI",
  "RV Nuccio & Associates Insurance Brokers, Inc., Insurance Company",
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
  "Sequoia Insurance Company **additional setups required, Insurance",
  "Skyward Specialty Insurance, Insurance Company, SKY",
  "Special Markets Ins Consultants, Insurance Company, SMC",
  "Standard Fire Insurance (ID), Insurance Company, STF",
  "Starstone National Insurance Co. (OR), Insurance Company, SNI",
  "State Auto Insurance Companies, Insurance Company, STA",
  "State Compensation Insurance Fund, Insurance Company, SCF",
  "State Fund, Insurance Company, SFU",
  "State National Insurance Company, Inc., Insurance Company, SNC",
  "Stillwater Insurance Services (formerly Fidelity National Insurance)",
  "Suretec Insurance Co., Insurance Company, STC",
  "Surety One, Insurance Company, SON",
  "Surety Solutions, Insurance Company, SSL",
  "TBD (CA), Insurance Company, TBD",
  "Technology Insurance Co., Insurance Company, TCH",
  "Terheggen-Malone Marine insurance (CA) (CA), Insurance Company",
  "Texas Mutual Insurance, Insurance Company, TEX",
  "The Insurance Shop, Insurance Company, TIS",
  "The Medical Protective Company, Insurance Company, MED",
  "Thimble Insurance Services, Insurance Company, THM",
  "TMR General Agency, Inc, Insurance Company, TMRG",
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
  "Woldwide Insurance Network Inc. dba Smart Choice, Insurance Company",
  "Wright National Flood Insurance, Insurance Company, WNF",
  "XYZ Insurance Company, Insurance Company, XYZ",
  "Zenith, Insurance Company, ZEN",
  "Zurich Insurance Company**additional setups required, Insurance Company"
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
  ],
  "JENCAP, Insurance Company, JENC": [
    "Atlantic Casualty Insurance Company, Writing Company, JENC01",
    "JENCAP, Insurance Company, JENC"
  ],
  "K2Specialty, Insurance Company, K2S": [
    "K2Specialty, Insurance Company, K2S",
    "Midvale Ind Co, Writing Company, K2S001"
  ],
  "Kaiser Permanente, Insurance Company, KAP": [
    "Kaiser Permanente, Insurance Company, KAP"
  ],
  "Kemper, Insurance Company, KEM": [
    "Alpha Property & Casualty Insurance Company, Writing Company, KEM001",
    "Financial Indemnity Company, Writing Company, KEM011",
    "Infinity Assurance Insurance Company, Writing Company, KEM023",
    "Infinity Commercial Auto, Writing Company, KEM019",
    "Infinity County Mutual Insurance Company, Writing Company, KEM021",
    "Infinity Insurance Company, Writing Company, KEM020",
    "Infinity Select Insurance Company, Writing Company, KEM024",
    "Kemper, Insurance Company, KEM",
    "Unitrin Specialty, Writing Company, KEM018"
  ],
  "KENTUCKY WORKERS COMP, Insurance Company, KWC": [
    "KENTUCKY WORKERS COMP, Insurance Company, KWC"
  ],
  "Liberty Mutual Agency Corporation, Insurance Company, LRM": [
    "America Fire and Casualty Co, Writing Company, LRM016",
    "American Economy Ins Co, Writing Company, LRM043",
    "AMERICAN STATES PREFERRED INSURANCE COMPANY, Writing Company",
    "First National Ins Co of America, Writing Company, LRM034",
    "General Ins Co of America, Writing Company, LRM040",
    "Liberty County Mutual Insurance Company (CO T), Writing Company",
    "Liberty Mutual Agency Corporation, Insurance Company, LRM",
    "Liberty Mutual Fire Insurance Co, Writing Company, LRM014",
    "Liberty Mutual Insurance Company, Writing Company, LRM022",
    "Liberty Mutual Personal Insurance Company (Co V), Writing Company",
    "LM General Insurance Company (Co S), Writing Company, LRM032",
    "Ohio Casualty Insurance Co, Writing Company, LRM018",
    "Ohio Security Insurance Co, Writing Company, LRM017",
    "Safeco Ins Co of Illinois, Writing Company, LRM036",
    "Safeco Ins Co of Indiana, Writing Company, LRM042",
    "Safeco Insurance Company of America, Writing Company, LRM041",
    "Safeco Insurance, Writing Company, LRM038",
    "Safeco of Oregon, Writing Company, LRM037",
    "West American Insurance Co, Writing Company, LRM019"
  ],
  "Life Insurance Generic, Insurance Company, LIF": [
    "Life Insurance Generic, Insurance Company, LIF"
  ],
  "Magna Carta Companies, Insurance Company, MAG": [
    "Magna Carta Companies, Insurance Company, MAG",
    "Public Service Mutual Insurance Company, Writing Company, MAG001"
  ],
  "Main Street America Group, Insurance Company, NGM": [
    "Austin Mutual Insurance Co., Writing Company, NGM009",
    "Main Street America Group, Insurance Company, NGM",
    "Markel Insurance Company, Writing Company, NGM010",
    "Spring Valley Mutual Insurance Company, Writing Company, NGM008"
  ],
  "Mapfre USA (Formerly Commerce and Commerce West Insurance": [
    "Commerce West Ins Co, Writing Company, CMW001",
    "Mapfre Ins Co, Writing Company, CMW003",
    "Mapfre USA (Formerly Commerce and Commerce West Insurance Co",
    "SIAA, Writing Company, CMW008"
  ],
  "Markel American Insurance Company, Insurance Company, MKL": [
    "Essentia Insurance Company, Writing Company, MKL004",
    "Evanston Insurance Company, Writing Company, MKL002",
    "Markel American Insurance Co, Writing Company, MKL001",
    "Markel American Insurance Company, Insurance Company, MKL",
    "Markel Insurance Company, Writing Company, MKL005",
    "SureTec Insurance Company,, Writing Company, MKL003"
  ],
  "MARYLAND WORKERS COMP, Insurance Company, YMC": [
    "MARYLAND WORKERS COMP, Insurance Company, YMC"
  ],
  "Mercury Insurance Group, Insurance Company, MER": [
    "American Mercury Insurance Company, Writing Company, MER001",
    "American Mercury Lloyds Insurance Co, Writing Company, MER002",
    "California Automobile Insurance Co., Writing Company, MER009",
    "Mercury Casualty Company, Writing Company, MER005",
    "Mercury County Mutual Insurance Co, Writing Company, MER004",
    "Mercury Indemnity of America, Writing Company, MER007",
    "Mercury Indemnity of Georgia, Writing Company, MER013",
    "Mercury Insurance Co of Florida, Writing Company, MER006",
    "Mercury Insurance Company of Georgia, Writing Company, MER012",
    "Mercury Insurance Company of Illinois, Writing Company, MER011",
    "Mercury Insurance Company, Writing Company, MER010",
    "Mercury Insurance Group, Insurance Company, MER",
    "Mercury National Insurance Company, Writing Company, MER008",
    "State and County Mutual Fire Insurance Co. (S), Writing Company, MER003"
  ],
  "MetLife Auto & Home, Insurance Company, MET": [
    "MetLife Auto & Home, Insurance Company, MET",
    "Metropolitan Direct Property and Casualty Insurance Company, Writing Company",
  ],
  "Minnesota FAIR Plan (MN), Insurance Company, MFP": [
    "Minnesota FAIR Plan (MN), Insurance Company, MFP"
  ],
  "Minnesota Workers' Compensation Assigned Risk Pla, Insurance Company": [
    "Minnesota Workers' Compensation Assigned Risk Pla, Insurance Company",
    "Superior Point, Writing Company, MWC001"
  ],
  "Montana State Fund, Insurance Company, MNS": [
    "Montana State Fund, Insurance Company, MNS"
  ],
  "Monterey Insurance Company, Insurance Company, MON": [
    "Monterey Insurance Company, Insurance Company, MON"
  ],
  "Munich Re Grp, Insurance Company, MUN": [
    "American Modern Prop & Cas Ins Co, Writing Company, MUN001",
    "Munich Re Grp, Insurance Company, MUN"
  ],
  "National General (formerly GMAC), Insurance Company, INT": [
    "Integon National, Writing Company, INT011",
    "Integon Preferred Insurance Co, Writing Company, INT013",
    "National General (formerly GMAC), Insurance Company, INT",
    "Stillwater Property & Casualy Insurance Company, Writing Company"
  ],
  "Nationwide Exclusive, Insurance Company, NAT": [
    "Allied Insurance Company of America, Writing Company, NAT014",
    "Allied Property & Casualty Insurance Company, Writing Company",
    "AMCO Insurance Company, Writing Company, NAT022",
    "Colonial County Mutual Insurance Company, Writing Company",
    "Crestbrook Insurance Company ( NW Private Client), Writing Company",
    "Depositors Insurance Company, Writing Company, NAT026",
    "Home State County Mutual, Writing Company, NAT030",
    "Motor Club of Iowa Insurance Company, Writing Company",
    "Nationwide Affinity Insurance Co of America, Writing Company",
    "Nationwide Agribusiness Insurance Company, Writing Company",
    "Nationwide Assurance Company, Writing Company, NAT002",
    "Nationwide Exclusive, Insurance Company, NAT",
    "Nationwide General Insurance Company, Writing Company",
    "Nationwide Indemnity Company, Writing Company, NAT001",
    "Nationwide Insurance Company of America, Writing Company",
    "Nationwide Insurance of Florida, Writing Company, NAT003",
    "Nationwide Life and Annuities Insurance Company, Writing Company",
    "Nationwide Life, Writing Company, NAT028",
    "Nationwide Lloyds, Writing Company, NAT011",
    "Nationwide Mutual Fire Insurance Company, Writing Company",
    "Nationwide Mutual Insurance Company, Writing Company, NAT006",
    "Nationwide Mutual Property & Casualty Co, Writing Company",
    "Nationwide, Writing Company, NAT012",
    "Scottsdale Indemnity Company, Writing Company, NAT020",
    "Titan Indemnity, Writing Company, NAT019",
    "Titan Insurance Company, Writing Company, NAT024",
    "Victoria Automobile Insurance Company, Writing Company",
    "Victoria Fire and Casualty Ins, Writing Company, NAT027",
    "Victoria National Insurance Company, Writing Company, NAT017",
    "Victoria Select Insurance Company, Writing Company, NAT013",
    "Victoria Specialty Insurance Company, Writing Company, NAT016"
  ],
  "Nautilus Insurance Company, Insurance Company, NTI": [
    "Nautilus Insurance Company, Insurance Company, NTI"
  ],
  "New York State Insurance Fund, Insurance Company, NEW": [
    "New York State Insurance Fund, Insurance Company, NEW"
  ],
  "Next Insurance US Company, Insurance Company, NXT": [
    "Next Insurance US Company, Insurance Company, NXT",
    "State National Insurance Company, Writing Company, NXT001"
  ],
  "NIPC, Insurance Company, NIPC": [
    "American Alternative Insurance Corporation, Writing Company, NIPC",
    "NIPC, Insurance Company, NIPC"
  ],
  "Nonprofits Insurance Alliance Group, Insurance Company, NON": [
    "California Capital Insurance Co., Writing Company, NON004",
    "Nonprofits Insurance Alliance Group, Insurance Company, NON",
    "Nonprofits Insurance Alliance of CA, Writing Company, NON001",
    "North American Elite Insurance Company, Writing Company, NON002",
    "QBE Insurance Corporation, Writing Company, NON003"
  ],
  "Norguard Ins Co, Insurance Company, NRG": [
    "Norguard Ins Co, Insurance Company, NRG"
  ],
  "Northern California Schools Insurance Group, Insurance Company": [
    "Northern California Schools Insurance Group, Insurance Company"
  ],
  "Northfield Insurance Company, Insurance Company, NOR": [
    "Hawkeye Wholesale Insurance Services Inc., Writing Company, NOR",
    "Northfield Insurance Company, Insurance Company, NOR"
  ],
  "Novita Insurance Solution, Insurance Company, NVI": [
    "ComStar General Insurance Solution, Writing Company, NVI001",
    "Novita Insurance Solution, Insurance Company, NVI"
  ],
  "Obsidian Specialty Insurance Copany, Insurance Company, OBS": [
    "Obsidian Specialty Insurance Copany, Insurance Company, OBS"
  ],
  "Pacific Specialty Insurance Company, Insurance Company, PAC": [
    "Kinney & Co, Writing Company, PAC004",
    "McGraw Insurance Services, Writing Company, PAC003",
    "Pacific Specialty Insurance Co, Writing Company, PAC001",
    "Pacific Specialty Insurance Company, Insurance Company, PAC"
  ],
  "Parent Company, Insurance Company, PNT": [
    "Accident Fund Gen Ins Co, Writing Company, PNT007",
    "AMCO Insurance Company, Writing Company, PNT001",
    "Charter Oak Fire Ins Co, Writing Company, PNT003",
    "Farmington Casualty Company, Writing Company, PNT004",
    "Fidelity & Guar Ins Co, Writing Company, PNT006",
    "First Comp, Writing Company, PNT011",
    "Parent Company, Insurance Company, PNT",
    "Pennsylvania Manufacturers' Association Insuran, Writing Company",
    "Phoenix Insurance (PHX), Writing Company, PNT005",
    "Preferred Contractors Insurance Co., Writing Company, PNT008",
    "Sequoia Insurance Company, Writing Company, PNT010",
    "Standard Fire Insurance Company, Writing Company, PNT002",
    "Technology Insurance Company, Inc., Writing Company, PNT009"
  ],
  "Pennsylvania Lumbermens Grp, Insurance Company, PLG": [
    "Pennsylvania Lumbermens Grp, Insurance Company, PLG",
    "Pennsylvania Lumbermens Mut Ins, Writing Company, PLG001"
  ],
  "Philadelphia Ins Co., Insurance Company, PHI": [
    "GIG Insurance Group, Writing Company, PHI002",
    "Philadelphia Indemnity Insurance Companys, Writing Company",
    "Philadelphia Ins Co., Insurance Company, PHI"
  ],
  "Preferred Contractors Insurance Company, Insurance Company": [
    "Preferred Contractors Insurance Company, Insurance Company"
  ],
  "Prime Insurance Company, Insurance Company, PCO": [
    "Prime Insurance Company, Insurance Company, PCO"
  ],
  "Progressive Insurance, Insurance Company, PRO": [
    "Artisan and Truckers Casualty, Writing Company, PRO048",
    "Drive Insurance Co, Writing Company, PRO050",
    "Drive New Jersey Insurance Co, Writing Company, PRO034",
    "Progressive Auto Pro, Writing Company, PRO028",
    "Progressive Casualty Ins Co, Writing Company, PRO005",
    "Progressive Casualty Ins, Writing Company, PRO001",
    "Progressive Classic Ins Co, Writing Company, PRO012",
    "Progressive County Mutual, Writing Company, PRO008",
    "Progressive Insurance, Insurance Company, PRO",
    "Progressive Northern Ins Co, Writing Company, PRO049",
    "Progressive Preferred Ins Co, Writing Company, PRO006",
    "Progressive West Ins, Writing Company, PRO020",
    "United Financial Casualty Co, Writing Company, PRO014"
  ],
  "Propeller, Inc., Insurance Company, PPL": [
    "Arch Insurance Company, Writing Company, PPL007",
    "Bond - CA, Writing Company, PPL002",
    "Bond - Commercial, Writing Company, PPL001",
    "Bond - OR, Writing Company, PPL004",
    "Bond - Residential, Writing Company, PPL005",
    "Bond, Writing Company, PPL003",
    "Bonds - WA, Writing Company, PPL006",
    "Propeller, Inc., Insurance Company, PPL"
  ],
  "Prospect, Insurance Company, PRS": [
    "Prospect, Insurance Company, PRS",
    "Travelers Personal Ins Co, Writing Company, PRS001"
  ],
  "ProSure Group, Insurance Company, PRG": [
    "ProSure Group, Insurance Company, PRG"
  ],
  "Red Shield Insurance Company, Insurance Company, RSI": [
    "Red Shield Insurance Company, Insurance Company, RSI"
  ],
  "RLI Corporation, Insurance Company, RLI": [
    "RLI Corporation, Insurance Company, RLI",
    "RLI Indemnity Company, Writing Company, RLI002"
  ],
  "Rockingham Mutual Insurance Company, Insurance Company, RMI": [
    "Rockingham Mutual Insurance Company, Insurance Company, RMI"
  ],
  "RV Nuccio & Associates Insurance Brokers, Inc., Insurance Company": [
    "RV Nuccio & Associates Insurance Brokers, Inc., Insurance Company"
  ],
  "Safe Herb, Insurance Company, SFH": [
    "Hubson Excess Insurance Co., Writing Company, SFH001",
    "Safe Herb, Insurance Company, SFH"
  ],
  "Safebuilt Insurance Services, Insurance Company, SFB": [
    "Employers Preferred Ins Co, Writing Company, SFB001",
    "Safebuilt Insurance Services, Insurance Company, SFB"
  ],
  "Safeco Insurance Company, Insurance Company, SAF": [
    "General Insurance Company of America, Writing Company, SAF007",
    "Safeco Insurance Company of America, Writing Company, SAF008",
    "Safeco Insurance Company, Insurance Company, SAF"
  ],
  "Safeway Insurance Company, Insurance Company, SIC": [
    "Safeway Insurance Co., Writing Company, SIC001",
    "Safeway Insurance Company, Insurance Company, SIC"
  ],
  "SAIF Corp, Insurance Company, SAI": [
    "SAIF Corp, Insurance Company, SAI",
    "Third Coast Insurance Company, Writing Company, SAI001"
  ],
  "Sample Work Comp Company, Insurance Company, SWC": [
    "Sample Work Comp Company, Insurance Company, SWC"
  ],
  "SCJ Insurance Services, Insurance Company, SCJ": [
    "Americas Ins Co, Writing Company, SCJ002",
    "Safe Auto Ins Co, Writing Company, SCJ001",
    "SCJ Insurance Services, Insurance Company, SCJ"
  ],
  "Scottsdale Insurance Company, Insurance Company, SCT": [
    "Scottsdale Insurance Company, Insurance Company, SCT"
  ],
  "Seaview Insurance Company, Insurance Company, SEA": [
    "Seaview Insurance Company, Insurance Company, SEA"
  ],
  "Sentinel Insurance Company, LTD, Insurance Company, SNT": [
    "Sentinel Insurance Company, LTD, Insurance Company, SNT"
  ],
  "Sequoia Insurance Company **additional setups required, Insurance": [
    "Sequoia Insurance Company **additional setups required, Insurance"
  ],
  "Skyward Specialty Insurance, Insurance Company, SKY": [
    "Great Midwest Insurance Company, Writing Company, SKY001",
    "Skyward Specialty Insurance, Insurance Company, SKY"
  ],
  "Special Markets Ins Consultants, Insurance Company, SMC": [
    "Special Markets Insurance Consultants, Ins., Writing Company, SMC001",
    "Special Markets Ins Consultants, Insurance Company, SMC"
  ],
  "Standard Fire Insurance (ID), Insurance Company, STF": [
    "Standard Fire Insurance (ID), Insurance Company, STF"
  ],
  "Starstone National Insurance Co. (OR), Insurance Company, SNI": [
    "Starstone National Insurance Co. (OR), Insurance Company, SNI"
  ],
  "State Auto Insurance Companies, Insurance Company, STA": [
    "State Auto Insurance Companies, Insurance Company, STA",
    "State Auto Property & Casualty, Writing Company, STA004"
  ],
  "State Compensation Insurance Fund, Insurance Company, SCF": [
    "Kinney & Co, Writing Company, SCF001",
    "State Compensation Insurance Fund of CA, Writing Company",
    "State Compensation Insurance Fund, Insurance Company, SCF"
  ],
  "State Fund, Insurance Company, SFU": [
    "State Fund, Insurance Company, SFU"
  ],
  "State National Insurance Company, Inc., Insurance Company, SNC": [
    "State National Insurance Company, Inc., Insurance Company, SNC"
  ],
  "Stillwater Insurance Services (formerly Fidelity National Insurance)": [
    "Stillwater Insurance Services (formerly Fidelity National Insurance)"
  ],
  "Suretec Insurance Co., Insurance Company, STC": [
    "Bond - AZ, Writing Company, STC008",
    "Bond - Boli, Writing Company, STC004",
    "Bond - CA, Writing Company, STC005",
    "Bond - License & Permit Bond, Writing Company, STC012",
    "Bond - OR, Writing Company, STC009",
    "Bond - Performance, Writing Company, STC013",
    "Bond - Public Works, Writing Company, STC001",
    "Bond - Residential, Writing Company, STC010",
    "Bond - WA, Writing Company, STC011",
    "Bond, Writing Company, STC006",
    "Bond- Commercial, Writing Company, STC002",
    "Bond- Plumbing, Writing Company, STC003",
    "Bond-Janitorial, Writing Company, STC007",
    "Suretec Insurance Co., Insurance Company, STC"
  ],
  "Surety One, Insurance Company, SON": [
    "Surety One, Insurance Company, SON"
  ],
  "Surety Solutions, Insurance Company, SSL": [
    "Hudson Insurance Company, Writing Company, SSL001",
    "Surety Solutions, Insurance Company, SSL"
  ],
  "TBD (CA), Insurance Company, TBD": [
    "TBD (CA), Insurance Company, TBD"
  ],
  "Technology Insurance Co., Insurance Company, TCH": [
    "Technology Insurance Co., Insurance Company, TCH"
  ],
  "Terheggen-Malone Marine insurance (CA) (CA), Insurance Company": [
    "Terheggen-Malone Marine insurance (CA) (CA), Insurance Company"
  ],
  "Texas Mutual Insurance, Insurance Company, TEX": [
    "Argonaut Insurance Company, Writing Company, TEX001",
    "Texas Mutual Insurance Company, Writing Company, TEX002",
    "Texas Mutual Insurance, Insurance Company, TEX"
  ],
  "The Insurance Shop, Insurance Company, TIS": [
    "Employers Prefered Insurance Company, Writing Company, TIS001",
    "The Insurance Shop, Insurance Company, TIS"
  ],
  "The Medical Protective Company, Insurance Company, MED": [
    "CM&F Group Inc, Writing Company, MED002",
    "Medical Protective Company, Writing Company, MED001",
    "The Medical Protective Company, Insurance Company, MED"
  ],
  "Thimble Insurance Services, Insurance Company, THM": [
    "National Speciality Insurance Company, Writing Company, THM001",
    "Thimble Insurance Services, Insurance Company, THM"
  ],
  "TMR General Agency, Inc, Insurance Company, TMRG": [
    "Greate Lakes Insurance SE, Writing Company, TMRG01",
    "TMR General Agency, Inc, Insurance Company, TMRG"
  ],
  "Tokio Marine Management, Inc., Insurance Company, TOK": [
    "American Contractors Indemnity Company, Writing Company",
    "Houston Casualty Company, Writing Company, TOK002",
    "Texas Bonding Company, Writing Company, TOK005",
    "Tokio Marine Management, Inc., Insurance Company, TOK",
    "US Specialty Insurance Company, Writing Company, TOK003"
  ],
  "Travelers Insurance Company, Insurance Company, TRV": [
    "Charter Oak Fire Ins Co, Writing Company, TRV001",
    "Consumers County Mutual, Writing Company, TRV023",
    "Farmington Casualty Company, Writing Company, TRV014",
    "Fidelity & Guaranty Insurance Underwriters, Writing Company",
    "Liberty Mutual Insurance, Writing Company, TRV033",
    "Phoenix Insurance (PHX), Writing Company, TRV002",
    "St Paul Fire and Marine Ins Co, Writing Company, TRV019",
    "St. Paul Protective Ins. Co., Writing Company, TRV030",
    "The Automobile Ins Co of Hartford CT, Writing Company, TRV013",
    "The First Floridian, Writing Company, TRV020",
    "The Standard Fire Insurance Company, Writing Company, TRV012",
    "The Travelers Indemnity Company of Connecticut, Writing Company",
    "TRAVCAL Indemnity Company (Auto), Writing Company, TRV021",
    "TRAVCO Insurance Co, Writing Company, TRV022",
    "Traveler?s Lloyd?s Co, Writing Company, TRV008",
    "Travelers C&S of Illinois, Writing Company, TRV010",
    "Travelers Casualty & Surety Company of America, Writing Company",
    "Travelers Casualty & Surety, Writing Company, TRV009",
    "Travelers Casualty Co of CT, Writing Company, TRV016",
    "Travelers Commercial Ins Co, Writing Company, TRV017",
    "Travelers Excess and Surplus Lines Co, Writing Company, TRV018",
    "Travelers Home and Marine Co., Writing Company, TRV028",
    "Travelers Indemnity (IND), Writing Company, TRV003",
    "Travelers Indemnity Co of Missouri, Writing Company, TRV011",
    "Travelers Indemnity of America (TIA), Writing Company, TRV004",
    "Travelers Ins Co, Writing Company, TRV007",
    "Travelers Insurance Company, Insurance Company, TRV",
    "Travelers Lloyds of Texas Ins Co, Writing Company, TRV027",
    "Travelers of Illinois (TIL), Writing Company, TRV005",
    "Travelers of Rhode Island (TRI), Writing Company, TRV006",
    "Travelers Personal Ins Co, Writing Company, TRV034",
    "Travelers Personal security Ins Co, Writing Company, TRV024",
    "Travelers Property Casualty Co of Amer, Writing Company",
    "Travelers Property Casualty Co of Ill, Writing Company, TRV026",
    "Travelers Property Casualty Ins Co, Writing Company, TRV025"
  ],
  "Trisura Specialty Insurance Company, Insurance Company, TRI": [
    "Trisura Specialty Insurance Company, Insurance Company, TRI"
  ],
  "U.S. Specialty Insurance Company, Insurance Company, USP": [
    "U.S. Specialty Insurance Company, Insurance Company, USP"
  ],
  "Unigard Insurance Company- a QBE Company**additional setups": [
    "QBE, Writing Company, UNI007",
    "Unigard Insurance Company- a QBE Company**additional setups"
  ],
  "United Health Care, Insurance Company, UHC": [
    "United Health Care, Insurance Company, UHC"
  ],
  "United Specialty Insurance Company, Insurance Company, UIN": [
    "United Specialty Insurance Company, Insurance Company, UIN"
  ],
  "Unitrin Specialty, Insurance Company, UNS": [
    "Unitrin Specialty, Insurance Company, UNS"
  ],
  "USLI Investment Corporation, Insurance Company, USL": [
    "Evanston Insurance Company, Writing Company, USL005",
    "Kinney & Co, Writing Company, USL006",
    "Mount Vernon Fire Insurance Company, Writing Company, USL002",
    "United States Liability Insurance Company, Writing Company",
    "USLI Investment Corporation, Insurance Company, USL"
  ],
  "Valley Forge Insurance, Insurance Company, VFO": [
    "BOP, Writing Company, VFO002",
    "Pollution, Writing Company, VFO001",
    "Valley Forge Insurance, Insurance Company, VFO"
  ],
  "Valley Surety Insurance Agency, Insurance Company, VAL": [
    "Valley Surety Insurance Agency, Insurance Company, VAL"
  ],
  "VFIS Insurance Services, Insurance Company, VFI": [
    "AIG Specialty Insurance Company, Writing Company, VFI001",
    "National Union Fire Insurance Company, Writing Company, VFI002",
    "VFIS Insurance Services, Insurance Company, VFI"
  ],
  "Victoria Insurance Group *Additional setups required": [
    "Victoria Insurance Group *Additional setups required"
  ],
  "Wbl Grp, Insurance Company, WBL": [
    "Stillwater Prop & Cas Ins Co, Writing Company, WBL001",
    "Wbl Grp, Insurance Company, WBL"
  ],
  "Western Surety Company, Insurance Company, WSC": [
    "Bond - Boli, Writing Company, WSC001",
    "Bond - Commercial, Writing Company, WSC002",
    "Bond - WA, Writing Company, WSC003",
    "Western Surety Company, Insurance Company, WSC"
  ],
  "Woldwide Insurance Network Inc. dba Smart Choice, Insurance Company": [
    "Midvale Indemnity Company, Writing Company, WWN001",
    "Woldwide Insurance Network Inc. dba Smart Choice, Insurance Company"
  ],
  "Wright National Flood Insurance, Insurance Company, WNF": [
    "Wright National Flood Ins, Writing Company, WNF001",
    "Wright National Flood Insurance, Insurance Company, WNF"
  ],
  "XYZ Insurance Company, Insurance Company, XYZ": [
    "XYZ Insurance Company, Insurance Company, XYZ"
  ],
  "Zenith, Insurance Company, ZEN": [
    "Zenith, Insurance Company, ZEN"
  ],
  "Zurich Insurance Company**additional setups required, Insurance Company": [
    "American Zurich Insurance Company, Writing Company, MIG009",
    "Coast National Insurance Company, Writing Company, MIG021",
    "Foremost Insurance, Writing Company, MIG017",
    "Foremost Signature, Writing Company, MIG018",
    "Zurich Insurance Company**additional setups required, Insurance Company",
    "Zurich-American Insurance Company, Writing Company, MIG008"
  ]
};

const BROKERAGE_PARENT_COMPANIES: string[] = [
  "Abacus Insurance, Brokerage Company, ABA",
  "Abram Interstate Insurance Services, Brokerage Company, ABR",
  "Affinity Nonprofits, Brokerage Company, AFF",
  "American Surplus Lines Agency, Brokerage Company, ASL",
  "AmWins Access Insurance Services, Brokerage Company, AMW",
  "AON Association Services, Brokerage Company, AON",
  "Arrowhead General Insurance Agency Inc., Brokerage Company",
  "Atlas General Insurance Services, Brokerage Company, ATL",
  "Bass Underwriters Inc., Brokerage Company, BAS",
  "Bellingham Insurance Services, Brokerage Company, BEL",
  "Berkshire Hathaway Grp, Brokerage Company, BER",
  "biBerk A Berkshire Hathaway Company, Brokerage Company, BIE",
  "Builders and Tradesmen (BTIS), Brokerage Company, BTI",
  "Burns & Wilcox, Brokerage Company, BUR",
  "BX Bond Exchange, Brokerage Company, BXB",
  "CBIC, Brokerage Company, CBIC",
  "Century Surety Company, Brokerage Company, CEN",
  "Charity First Insurance Services, Inc., Brokerage Company, CHA",
  "Cluett Commercial Insurance, Brokerage Company, CLU",
  "Colonial General Insurance Agency, Inc., Brokerage Company, CGA",
  "Commodore Insurance, Brokerage Company, CMM",
  "Cover Whale Insurance Solutions, LLC (CA), Brokerage Company",
  "CRC Group, Brokerage Company, CRC",
  "Delos Insurance Solutions Backed  (CA), Brokerage Company, DSB",
  "DGA Insurance Services, LLC, Brokerage Company, DGA",
  "Elite MGA, Brokerage Company, EMG",
  "Evergreen Insurance Managers, Inc., Brokerage Company, EVG",
  "Evolution Insurance Brokers, LLC, Brokerage Company, EVO",
  "Gateway Underwriters Agency, Brokerage Company, GAT",
  "Gorst & Compass Insurance, Brokerage Company, GOR",
  "Greenwood General Insurance Agency, Brokerage Company, GRN",
  "GSU Insurance Services, Brokerage Company, GSU",
  "Hawkeye Wholesale Insurance Services Inc., Brokerage Company",
  "Hiscox Ins Co Inc, Brokerage Company, HIS",
  "Hull & Company LLC, Brokerage Company, HUC",
  "Ian H. Graham Insurance, Brokerage Company, IAN",
  "ICAT Earthquake (residential only), Brokerage Company, ICA",
  "IES Indemnity, Brokerage Company, IES",
  "Insco, Brokerage Company, INC",
  "International Beauty Brokerage, Inc. (IBBI), Brokerage Company",
  "ISC, Brokerage Company, ISC",
  "J E Brown, Brokerage Company, JEB",
  "J R Olsen, Brokerage Company, JRO",
  "Jencap Speciality Insurance Services, Brokerage Company, JEN",
  "K&K Insurance Group, Inc., Brokerage Company, KAK",
  "Keating Insurance, Brokerage Company, KEA",
  "KW Specialty Insurance Company, Brokerage Company, KWS",
  "Lloyd's of London, Brokerage Company, LOL",
  "London Underwriters, Brokerage Company, LON",
  "Mini Co Insurance Agency LLC, Brokerage Company, MIN",
  "Monarch E & S Insurance Services, Brokerage Company, MON",
  "Morstan General Agency, Brokerage Company, MOR",
  "Myers & Stevens, Brokerage Company, MYE",
  "Nationwide Brokerage Solutions, Brokerage Company, NBS",
  "Navigators Insurance Co., Brokerage Company, NAV",
  "NCCI, Brokerage Company, NCC",
  "NCIP - Natural Catastrophe Insurance Program, Brokerage Company",
  "New Age Underwriter's Agency, Inc, Brokerage Company, NAU",
  "NIF Group, Brokerage Company, NIF",
  "Novatae Risk Group, Brokerage Company, NVT",
  "Novus Underwriters, Inc., Brokerage Company, NOV",
  "One80, Brokerage Company, One80",
  "Osprey Underwriters Inc., Brokerage Company, OSP",
  "Pacific Coast E&S, Brokerage Company, PCE",
  "Pacific Excess Insurance Marketing Inc, Brokerage Company, PEX",
  "Paragon Insurance Holdings, Brokerage Company, PAR",
  "PersonalUmbrella.com, Brokerage Company, PUM",
  "Primex Insurance Brokers, Brokerage Company, PIB",
  "Professional Program Insurance Brokerage, Brokerage Company",
  "R.E. Chaix & Associates, Brokerage Company, REC",
  "RIC Insurance General Agency Inc., Brokerage Company, RIC",
  "Risk Exchange Insurance Services, Inc., Brokerage Company, REX",
  "Risk Placement Services, Inc, Brokerage Company, RPS",
  "River Valley Underwriters (RVU), Brokerage Company, RVU",
  "Rivington, Brokerage Company, RIV",
  "Robert Moreno Insurance Services (CA), Brokerage Company, RC",
  "RSG National Specialty Programs, Brokerage Company, RSG",
  "RSI, Brokerage Company, RSI",
  "RT- Specialty, Brokerage Company, RTS",
  "S Phillips Surety, Brokerage Company, SPS",
  "Scottish American, Brokerage Company, SAM",
  "Shield Commercial Insurance Services, Brokerage Company, SHI",
  "SIAA, Brokerage Company, SIA",
  "SIS, Brokerage Company, SIS",
  "Sterling Insurance Services LLC, Brokerage Company, SISL",
  "Superior Access/Bolt Access, Brokerage Company, SUP",
  "Supression Pro Insurance Services, Brokerage Company, SPP",
  "TCB Insurance Programs, Brokerage Company, TCB",
  "Texas Security General Insurance Agency, LLC, Brokerage Compa",
  "The Mechanic Group, Brokerage Company, TMG",
  "Underwriters at Lloyd's London, Brokerage Company, ULL",
  "Union General Insurance Services, Inc., Brokerage Company, UG",
  "USG, Brokerage Company, USG1",
  "Western Security Surplus Brokerage, Brokerage Company, WSS",
  "Wholesure Solutions, LLC ( Appalachians ), Brokerage Company",
  "Word and Brown, Brokerage Company, WAB",
  "Worldwide Facilities, Inc., Brokerage Company, WOR",
  "XS Specialty LLC, Brokerage Company, XSS"
];

const BROKERAGE_WRITING_COMPANIES: Record<string, string[]> = {
  "Abacus Insurance, Brokerage Company, ABA": [
    "Abacus Insurance, Brokerage Company, ABA",
    "AGCS Marine Insurance Company, Writing Company, ABA003",
    "American Guarantee and Liability Insurance Comp, Writing Company",
    "Zurich American Insurance Company, Writing Company, ABA002"
  ],
  "Abram Interstate Insurance Services, Brokerage Company, ABR": [
    "Abram Interstate Insurance Services, Brokerage Company, ABR",
    "Liberty Mutual Insurance Company, Writing Company, ABR003",
    "Travelers Property Casualty Co of Amer, Writing Company, ABR002",
    "Underwriters at Lloyd's London, Writing Company, ABR001"
  ],
  "Affinity Nonprofits, Brokerage Company, AFF": [
    "Affinity Nonprofits, Brokerage Company, AFF",
    "Arch Insurance Company, Writing Company, AFF002",
    "Philadelphia Indemnity Insurance Companys, Writing Company"
  ],
  "American Surplus Lines Agency, Brokerage Company, ASL": [
    "American Surplus Lines Agency, Brokerage Company, ASL",
    "United States Liability Insurance Company, Writing Company"
  ],
  "AmWins Access Insurance Services, Brokerage Company, AMW": [
    "Accelerant Specialty Insurance Company, Writing Company",
    "ACE Property & Casualty Insurance Company, Writing Company",
    "Admiral Insurance Company, Writing Company, AMW018",
    "AmWins Access Insurance Services, Brokerage Company, AMW",
    "Artisan and Truckers Casualty Co, Writing Company, AMW032",
    "AXIS Surplus Insurance Company, Writing Company, AMW028",
    "Capitol Specialty Insurance Corp., Writing Company, AMW039",
    "Century Surety, Writing Company, AMW010",
    "Colony Insurance Company, Writing Company, AMW041",
    "Covington Specialty Ins Co, Writing Company, AMW001",
    "Employer's Preferred Ins Co., Writing Company, AMW026",
    "Evanston Insurance Company, Writing Company, AMW002",
    "Gerber Life Insurance Company, Writing Company, AMW024",
    "Gotham Insurance Company, Writing Company, AMW021",
    "Great American E&S Insurance Company, Writing Company",
    "Great American Insurance Company, Writing Company, AMW005",
    "Great Divide Insurance Company, Writing Company, AMW031",
    "Houston Specialty Insurance Company, Writing Company",
    "IES Indemnity Excess & Surplus Agency Inc, Writing Company",
    "Infinity Commercial Auto, Writing Company, AMW014",
    "James River Insurance Company, Writing Company, AMW030",
    "Kinsale Insurance Company, Writing Company, AMW029",
    "Liberty Mutual Insurance Company, Writing Company, AMW023",
    "Maxum Indemnity Company, Writing Company, AMW006",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "Mount Vernon Fire Insurance Company, Writing Company",
    "Mount Vernon Specialty Ins Co, Writing Company, AMW007",
    "Mt. Hawley Insurance Company, Writing Company, AMW020",
    "National Liability & Fire Ins. Co., Writing Company, AMW013",
    "Nautilus Insurance Company, Writing Company, AMW004",
    "Ohio Security Insurance Company, Writing Company, AMW025",
    "Penn-Star Insurance Company, Writing Company, AMW011",
    "Progressive Casualty Insurance Company, Writing Company",
    "RLI Insurance Company, Writing Company, AMW037",
    "Scottsdale Insurance Company, Writing Company, AMW003",
    "StarNet Insurance Company, Writing Company, AMW043",
    "State Compensation Insurance Fund, Writing Company, AMW017",
    "The Pie Insurance Company, Writing Company, AMW015",
    "Travelers Casualty and Surety Company of America, Writing Company",
    "Underwriters at Lloyd's London, Writing Company, AMW038",
    "United Financial Casualty Company, Writing Company, AMW033",
    "United States Liability Insurance Co., Writing Company, AMW008",
    "Westchester Specialty Insurance Services, Inc., Writing Company",
    "Western World Insurance Company, Writing Company, AMW019"
  ],
  "AON Association Services, Brokerage Company, AON": [
    "AON Association Services, Brokerage Company, AON",
    "Arch Ins Co, Writing Company, AON002",
    "Granite State Insurance Co, Writing Company, AON001",
    "The Hartford, Writing Company, AON003",
    "Twin City Fire Insurance Company, Writing Company, AON004"
  ],
  "Arrowhead General Insurance Agency Inc., Brokerage Company": [
    "Arrowhead General Insurance Agency Inc., Brokerage Company, AR",
    "Everest National Insurance Company, Writing Company, ARR001",
    "Integon National Insurance Company, Writing Company, ARR002"
  ],
  "Atlas General Insurance Services, Brokerage Company, ATL": [
    "Accelerant Specialty Insurance Co, Writing Company, ATL002",
    "Accident Fund General Insurance Company, Writing Company",
    "Accredited Surety & Casualty Co, Writing Company, ATL004",
    "AmGuard Insurance Company, Writing Company, ATL015",
    "Atlas General Insurance Services, Brokerage Company, ATL",
    "Century Surety Insurance Company, Writing Company, ATL001",
    "Endurance Assurance Corporation, Writing Company, ATL010",
    "Falls Lake Fire & Casualty Co, Writing Company, ATL014",
    "Kinsale Insurance Company, Writing Company, ATL011",
    "Mesa Underwriters Specialty Insurance Co., Writing Company",
    "PennStar, Writing Company, ATL007",
    "Rockingham Casualty Company, Writing Company, ATL012",
    "Rockingham Insurance Company, Writing Company, ATL008",
    "Rockingham Specialty, Writing Company, ATL013",
    "StarStone National Insurance Co., Writing Company, ATL005",
    "Trisura Specialty Insurance Company, Writing Company, ATL009"
  ],
  "Bass Underwriters Inc., Brokerage Company, BAS": [
    "AXIS Surplus Insurance Company, Writing Company, BAS004",
    "Bass Underwriters Inc., Brokerage Company, BAS",
    "Burlington Insurance Company, Writing Company, BAS003",
    "Century Surety Insurance, Writing Company, BAS002",
    "James River Insurance Company, Writing Company, BAS005",
    "Penn-America Insurance Company, Writing Company, BAS001"
  ],
  "Bellingham Insurance Services, Brokerage Company, BEL": [
    "Bellingham Insurance Services, Brokerage Company, BEL",
    "Hudson Insurance Company, Writing Company, BEL001",
    "Underwriters at Lloyd's of London, Writing Company, BEL002"
  ],
  "Berkshire Hathaway Grp, Brokerage Company, BER": [
    "AmGuard Insurance Company, Writing Company, BER001",
    "Berkshire Hathaway Assur Corp, Writing Company, BER006",
    "Berkshire Hathaway Grp, Brokerage Company, BER",
    "Berkshire Hathaway Specialty Ins Co, Writing Company, BER007",
    "Continental Divide Insurance Company, Writing Company, BER008",
    "National Liability & Fire Ins. Co., Writing Company, BER005",
    "Oak River Insurance Company, Writing Company, BER009",
    "Philadelphia Reins Corp, Writing Company, BER010",
    "The Medical Protective Company, Writing Company, BER002",
    "United States Liability Insurance Co., Writing Company, BER004",
    "Wellfleet Insurance Company, Writing Company, BER003"
  ],
  "biBerk A Berkshire Hathaway Company, Brokerage Company, BIE": [
    "Berkshire Hathaway Direct Insurance Company, Writing Company",
    "biBerk A Berkshire Hathaway Company, Brokerage Company, BIB",
    "National Liability & Fire Insurance Company, Writing Company",
    "Wellfleet Insurance Company, Writing Company, BIB002"
  ],
  "Builders and Tradesmen (BTIS), Brokerage Company, BTI": [
    "Accredited Surety & Casualty Co, Writing Company, BTI013",
    "AIG Insurance Company, Writing Company, BTI016",
    "AM Specialty Insurance, Writing Company, BTI043",
    "American Casualty Company of Reading, Pennsylvania, Writing Company",
    "AmGUARD Insurance Company, Writing Company, BTI061",
    "AmTrust, Writing Company, BTI004",
    "Associated Industries Ins Co Inc, Writing Company, BTI051",
    "AXIS Surplus Insurance Company, Writing Company, BTI060",
    "Builders and Tradesmen (BTIS), Brokerage Company, BTI",
    "CBIC, Writing Company, BTI003",
    "Certain Underwriters at Lloyd's, London, Writing Company, BTI042",
    "Clear Blue Speciality Insurance Company, Writing Company",
    "Clear Spring Property and Casualty Company, Writing Company",
    "CNA, Writing Company, BTI017",
    "Continental Casualty Company, Writing Company, BTI011",
    "Contractors Bonding and Insurance Company, Writing Company",
    "Crum & Forster Specialty Insurance Company, Writing Company",
    "Employers Preferred Insurance Co., Writing Company, BTI044",
    "Evanston Insurance Company, Writing Company, BTI006",
    "Great American Insurance Company, Writing Company, BTI025",
    "Gridiron Insurance Underwriter 0166, Writing Company, BTI038",
    "Hartford of the Midwest, Writing Company, BTI018",
    "Hiscox Insurance Company, Writing Company, BTI037",
    "Infinity Commercial Auto, Writing Company, BTI027",
    "Insurance Company of the West, Writing Company, BTI039",
    "Integon National Insurance Company, Writing Company, BTI031",
    "Integon Preferred Insurance Company, Writing Company, BTI030",
    "Liberty Mutual, Writing Company, BTI033",
    "Lloyds of London, Writing Company, BTI019",
    "Mapfre Ins Co, Writing Company, BTI052",
    "Merchants Bonding Co A Mut, Writing Company, BTI008",
    "Mount Vernon Fire Insurance Company, Writing Company, BTI049",
    "Mt. Hawley Insurance Company, Writing Company, BTI007",
    "National Fire Insurance Co. of Hartford, Writing Company, BTI053",
    "National General, Writing Company, BTI028",
    "Nationwide Mutual Insurance Company, Writing Company, BTI012",
    "Navigators Insurance Company, Writing Company, BTI023",
    "Next Insurance Company, Writing Company, BTI024",
    "Ohio Security Insurance Company, Writing Company, BTI029",
    "Old Replublic Surety Company, Writing Company, BTI005",
    "Palomar Excess & Surplus Insurance Company, Writing Company",
    "Philadelphia Indemnity Insurance Company, Writing Company",
    "Security National Insurance Co, Writing Company, BTI048",
    "Sequoia Insurance Company, Writing Company, BTI026",
    "Sierra Specialty Insurance Company, Writing Company, BTI062",
    "Sirius America Insurance Co, Writing Company, BTI020",
    "Spinnaker Insurance Company, Writing Company, BTI021",
    "Starr Indemnity & Liability Company, Writing Company, BTI015",
    "State National Insurance Company Inc., Writing Company, BTI036",
    "Technology Insurance Co., Writing Company, BTI047",
    "The Hartford, Writing Company, BTI034",
    "The North River Insurance Company, Writing Company, BTI041",
    "The Ohio Casualty Insurance Company, Writing Company, BTI010",
    "The Pie Insurance Company, Writing Company, BTI002",
    "Transportation Insurance Company a Stock Insurance Company, Writing Company",
    "United States Liability Insurance Group, Writing Company, BTI032",
    "Valley Forge Insurance Company, Writing Company, BTI055",
    "Wesco Insurance Company, Writing Company, BTI022",
    "Western Surety Company, Writing Company, BTI035",
    "Zenith, Writing Company, BTI046"
  ],
  "Burns & Wilcox, Brokerage Company, BUR": [
    "Ace Fire Underwriters Insurance Company, Writing Company",
    "American Modern Property and Casualty Insurance, Writing Company",
    "AmGUARD Insurance Company, Writing Company, BUR008",
    "Atain Specialty Insurance Company, Writing Company, BUR002",
    "Ategrity Specialty Insurance Company, Writing Company, BUR012",
    "Beazley Breach Response, Writing Company, BUR011",
    "Burns & Wilcox, Brokerage Company, BUR",
    "Certain Underwriters at Lloyd's, London, Writing Company, BUR014",
    "Colony Insurance Company, Writing Company, BUR001",
    "Evanston Insurance Company, Writing Company, BUR003",
    "Gemini Insurance Company, Writing Company, BUR015",
    "Hudson Insurance Company, Writing Company, BUR009",
    "North Light Specialty Ins Co, Writing Company, BUR006",
    "Philadelphia Indemnity Insurance Companys, Writing Company",
    "RLI Insurance Company, Writing Company, BUR005",
    "Scottsdale Insurance Company, Writing Company, BUR010"
  ],
  "BX Bond Exchange, Brokerage Company, BXB": [
    "ATLANTIC SPECIALTY INSURANCE COMPANY, Writing Company",
    "BX Bond Exchange, Brokerage Company, BXB",
    "Great American Insurance Company, Writing Company, BXB005",
    "Great Midwest Ins Co, Writing Company, BXB006",
    "Hudson Insurance Company, Writing Company, BXB003",
    "Jet Insurance Company, Writing Company, BXB001",
    "Old Republic Surety, Writing Company, BXB002"
  ],
  "CBIC, Brokerage Company, CBIC": [
    "CBIC, Brokerage Company, CBIC"
  ],
  "Century Surety Company, Brokerage Company, CEN": [
    "Century Surety Company, Brokerage Company, CEN",
    "R. E. Chaix & Associates, Writing Company, CEN001"
  ],
  "Charity First Insurance Services, Inc., Brokerage Company, CHA": [
    "Charity First Insurance Services, Inc., Brokerage Company, CHA",
    "Nova Cas Co, Writing Company, CHA002",
    "Travelers Property Casualty Co of Amer, Writing Company, CHA001"
  ],
  "Cluett Commercial Insurance, Brokerage Company, CLU": [
    "Cluett Commercial Insurance, Brokerage Company, CLU",
    "The Hartford, Writing Company, CLU001"
  ],
  "Colonial General Insurance Agency, Inc., Brokerage Company, CGA": [
    "Colonial General Insurance Agency, Inc., Brokerage Company, CGA",
    "Scottsdale Insurance Company, Writing Company, CGA001"
  ],
  "Commodore Insurance, Brokerage Company, CMM": [
    "Clear Blue Specialty Insurance Company, Writing Company, CMM001",
    "Commodore Insurance, Brokerage Company, CMM",
    "Commodore Risk Retention Group, Writing Company, CMM002",
    "Lloyd's of London, Writing Company, CMM003"
  ],
  "Cover Whale Insurance Solutions, LLC (CA), Brokerage Company": [
    "Accredited Specialty Insurance Company, Writing Company, CWS005",
    "Canopius US Insurance Company, Writing Company, CWS009",
    "Certain Underwriters at Lloyds of London, Writing Company, CWS007",
    "Cover Whale Insurance Solutions, LLC (CA), Brokerage Company",
    "Everspan Indemnity Insurance Company, Writing Company, CWS004",
    "General Security Indemnity Company of Arizona, Writing Company",
    "Knight Specialty Insurance Company, Writing Company, CWS006",
    "Lloyds of London, Writing Company, CWS002",
    "Trisura Specialty insurance Company, Writing Company, CWS003"
  ],
  "CRC Group, Brokerage Company, CRC": [
    "AXIS Insurance Company, Writing Company, CRC024",
    "Burlington Insurance Company, Writing Company, CRC010",
    "Century Surety Company, Writing Company, CRC015",
    "Champlain Specialty Insurance Company, Writing Company, CRC021",
    "Colony Insurance Company, Writing Company, CRC023",
    "CRC Group, Brokerage Company, CRC",
    "Evanston Insurance Co., Writing Company, CRC004",
    "Gotham Insurance Company, Writing Company, CRC006",
    "Great Lakes Insurance, Writing Company, CRC009",
    "Hadron Specialty Insurance Company, Writing Company, CRC027",
    "Hamilton Select Insurance Inc., Writing Company, CRC007",
    "Hiscox Ins Co Inc, Writing Company, CRC019",
    "Hudson Excess Insurance Company, Writing Company, CRC013",
    "James River Insurance Company, Writing Company, CRC018",
    "Kinsale Insurance Company, Writing Company, CRC014",
    "Lexington Insurance Co., Writing Company, CRC001",
    "Mount Vernon Fire Insurance Company, Writing Company, CRC016",
    "MS Transverse Specialty Insurance Company, Writing Company",
    "Mt. Hawley Insurance Company, Writing Company, CRC003",
    "Old Republic Union Insurance Company, Writing Company, CRC011",
    "Palms Specialty Insurance Company, Inc, Writing Company",
    "Scottsdale Insurance Company, Writing Company, CRC008",
    "Seneca Specialty Insurance Company, Writing Company, CRC025",
    "StarStone National Insurance Company, Writing Company, CRC005",
    "StarStone Specialty Insurance Company, Writing Company, CRC020",
    "Steadfast Insurance Company, Writing Company, CRC026",
    "Westchester Surplus Lines Insurance Company, Writing Company",
    "Western World Insurance Company, Writing Company, CRC002",
    "Zurich American Insurance Company, Writing Company, CRC012"
  ],
  "Delos Insurance Solutions Backed  (CA), Brokerage Company, DSB": [
    "Delos Insurance Solutions Backed  (CA), Brokerage Company, DSB",
    "Homesite Insurance Company, Writing Company, DSB001"
  ],
  "DGA Insurance Services, LLC, Brokerage Company, DGA": [
    "DGA Insurance Services, LLC, Brokerage Company, DGA",
    "Northfield Excess & Surplus Lines, Writing Company, DGA001"
  ],
  "Elite MGA, Brokerage Company, EMG": [
    "Clear Blue Insurance Co., Writing Company, EMG002",
    "Concert Specialty Insurance Company, Writing Company, EMG003",
    "Elite MGA, Brokerage Company, EMG",
    "The Hanover Insurance Group, Inc., Writing Company, EMG001"
  ],
  "Evergreen Insurance Managers, Inc., Brokerage Company, EVG": [
    "Crum and Forster Specialty Insurance Company, Writing Company",
    "Evergreen Insurance Managers, Inc., Brokerage Company, EVG",
    "Penn-Star Insurance Co, Writing Company, EVG001"
  ],
  "Evolution Insurance Brokers, LLC, Brokerage Company, EVO": [
    "Evolution Insurance Brokers, LLC, Brokerage Company, EVO",
    "Prime Insurance Company, Writing Company, EVO001"
  ],
  "Gateway Underwriters Agency, Brokerage Company, GAT": [
    "Alliance of Nonprofits for Ins RRG, Writing Company, GAT003",
    "Gateway Underwriters Agency, Brokerage Company, GAT",
    "Mount Vernon Fire Insurance Company, Writing Company, GAT002",
    "United States Liability Insurance Co., Writing Company, GAT001"
  ],
  "Gorst & Compass Insurance, Brokerage Company, GOR": [
    "Accident Fund General Insurance Company, Writing Company",
    "Clear Spring Insurance, Writing Company, GOR002",
    "Evanston Insurance Company, Writing Company, GOR001",
    "Gorst & Compass Insurance, Brokerage Company, GOR",
    "Great American E&S Insurance, Writing Company, GOR009",
    "Mesa Underwriters Specialty Insurance Company A, Writing Company",
    "Mount Vernon Fire Insurance Company, Writing Company, GOR008",
    "Nautilus Insurance Company, Writing Company, GOR004",
    "Underwriters at Lloyd's A, XV, Writing Company, GOR007",
    "United States Liability Insurance Company, Writing Company"
  ],
  "Greenwood General Insurance Agency, Brokerage Company, GRN": [
    "AmGUARD Insurance Company, Writing Company, GRN003",
    "Business Alliance Insurance, Writing Company, GRN002",
    "Crum & Forster Specialty Insurance Company, Writing Company",
    "Falls Lake Fire & Casualty Co, Writing Company, GRN014",
    "Great American Insurance Company, Writing Company, GRN007",
    "Greenwood General Insurance Agency, Brokerage Company, GRN",
    "Hadron Specialty Insurance Company, Writing Company, GRN006",
    "Kinsale Insurance Company, Writing Company, GRN011",
    "Mt. Hawley Insurance Company, Writing Company, GRN001",
    "National Liability & Fire Insurance Co, Writing Company, GRN004",
    "Rockingham Casualty Company, Writing Company, GRN013",
    "Rockingham Specialty, Inc., Writing Company, GRN015",
    "Scottsdale Insurance Company, Writing Company, GRN005",
    "The Hartford, Writing Company, GRN008",
    "United National Insurance Company, Writing Company, GRN009",
    "United Specialty Insurance Company, Writing Company, GRN010"
  ],
  "GSU Insurance Services, Brokerage Company, GSU": [
    "Colony Insurance Company, Writing Company, GSU001",
    "GSU Insurance Services, Brokerage Company, GSU",
    "National Fire & Marine Insurance Company, Writing Company",
    "National Liability & Fire Ins. Co., Writing Company, GSU004",
    "Nautilus Insurance Company, Writing Company, GSU003",
    "Northfield Insurance Company, Writing Company, GSU007",
    "Scottsdale Insurance Company, Writing Company, GSU002",
    "Western World Insurance Co, Writing Company, GSU006",
    "Western World Insurance Group, Writing Company, GSU005"
  ],
  "Hawkeye Wholesale Insurance Services Inc., Brokerage Company": [
    "ACE Property & Casualty Insurance Company, Writing Company",
    "Clear Blue Insurance Co., Writing Company, HWS008",
    "Everest National Insurance Company, Writing Company, HWS005",
    "Great Divide Insurance Company, Writing Company, HWS009",
    "Hawkeye Wholesale Insurance Services Inc., Brokerage Company",
    "HDI Global Specialty SE, Writing Company, HWS002",
    "Nautilus Insurance Company, Writing Company, HWS003",
    "Northfield Insurance Company, Writing Company, HWS006",
    "Seneca Insurance Company, Inc., Writing Company, HWS010",
    "Starstone National Ins/Torus National Ins Co., Writing Company",
    "State National Insurance Company, Inc., Writing Company, HWS007"
  ],
  "Hiscox Ins Co Inc, Brokerage Company, HIS": [
    "Hiscox Ins Co Inc, Brokerage Company, HIS"
  ],
  "Hull & Company LLC, Brokerage Company, HUC": [
    "Amguard Ins Co, Writing Company, HUC008",
    "Atlantic Casualty Insurance Company, Writing Company, HUC011",
    "Berkley Assur Co, Writing Company, HUC004",
    "Colony Insurance Company, Writing Company, HUC001",
    "Great American Assurance Company, Writing Company, HUC010",
    "Houston Specialty Insurance Company, Writing Company, HUC003",
    "Hull & Company LLC, Brokerage Company, HUC",
    "James River Insurance Company, Writing Company, HUC009",
    "Kinsale Insurance Co., Writing Company, HUC002",
    "Kinsale Insurance Company, Writing Company, HUC005",
    "National Liability & Fire Ins. Co., Writing Company, HUC007",
    "Penn-Star Insurance Company, Writing Company, HUC006"
  ],
  "Ian H. Graham Insurance, Brokerage Company, IAN": [
    "Continental Casualty Company, Writing Company, IAN002",
    "Ian H. Graham Insurance, Brokerage Company, IAN",
    "Obsidian Specialty Insurance Company, Writing Company, IAN001"
  ],
  "ICAT Earthquake (residential only), Brokerage Company, ICA": [
    "Accident Fund General Insurance Company, Writing Company",
    "American Contractors Indem. Co., Writing Company, ICA002",
    "Certain Underwriters at Lloyd's, London, Writing Company, ICA008",
    "ICAT Earthquake (residential only), Brokerage Company, ICA",
    "Nationwide, Writing Company, ICA006",
    "Nova Casualty Company, Writing Company, ICA007",
    "Obsidian Specialty Insurance Company, Writing Company, ICA001",
    "Scottsdale Insurance Company, Writing Company, ICA003",
    "Third Coast Insurance Company, Writing Company, ICA004"
  ],
  "IES Indemnity, Brokerage Company, IES": [
    "Beazley Insurance Company, Writing Company, IES001",
    "IES Indemnity, Brokerage Company, IES",
    "Mount Vernon Fire Insurance Co., Writing Company, IES002",
    "United States Liability Insurance Co., Writing Company, IES003"
  ],
  "Insco, Brokerage Company, INC": [
    "Developers Surety and Indemnity Co., Writing Company, INC001",
    "Insco, Brokerage Company, INC"
  ],
  "International Beauty Brokerage, Inc. (IBBI), Brokerage Company": [
    "International Beauty Brokerage, Inc. (IBBI), Brokerage Company",
    "Lloyds of London, Writing Company, IBB001",
    "Topa Insurance Company, Writing Company, IBB002"
  ],
  "ISC, Brokerage Company, ISC": [
    "Accident Fund Gen Ins Co, Writing Company, ISC009",
    "Accident Fund General Insurance Company, Writing Company",
    "AIX Specialty Insurance Company, Writing Company, ISC003",
    "Certain Underwriters at Lloyd's, London, Writing Company, ISC013",
    "Clear Blue Specialty Insurance, Writing Company, ISC018",
    "Hamilton Insurance DAC, Writing Company, ISC019",
    "Interstate Fire & Casualty Company, Writing Company, ISC001",
    "ISC, Brokerage Company, ISC",
    "Loyd's London Insurance Company, Writing Company, ISC015",
    "Nova Casualty Company, Writing Company, ISC010",
    "Obsidian Specialty Insurance Company, Writing Company, ISC002",
    "PCIC, Writing Company, ISC004",
    "Preferred Contractors Insurance Co., Writing Company, ISC012",
    "Preferred Contractors Insurance Company, RRG, Writing Company",
    "SiriusPoint Specialty Insurance Corporation, Writing Company",
    "Sutton Specialty Insurance Company, Writing Company, ISC014",
    "The Pie Insurance Company, Writing Company, ISC017",
    "Third Coast Insurance Company, Writing Company, ISC006",
    "Trisura Specialty Insurance Company, Writing Company, ISC011",
    "United Specialty Insurance Company, Writing Company, ISC016",
    "US Specialty Insurance Company, Writing Company, ISC007",
    "Westchester Surplus Lines Insurance Company, Writing Company"
  ],
  "J R Olsen, Brokerage Company, JRO": [
    "Hartford Fire Insurance Company, Writing Company, JRO001",
    "J R Olsen, Brokerage Company, JRO"
  ],
  "Jencap Speciality Insurance Services, Brokerage Company, JEN": [
    "Jencap Speciality Insurance Services, Brokerage Company, JEN",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "Mount Vernon Fire Insurance Company, Writing Company, JEN002",
    "Nautilus Insurance Company, Writing Company, JEN003",
    "Scottsdale Indemnity Company, Writing Company, JEN001",
    "United States Liability Insurance Company, Writing Company, JEN005"
  ],
  "K&K Insurance Group, Inc., Brokerage Company, KAK": [
    "AIG Insurance Company, Writing Company, KAK003",
    "K&K Insurance Group, Inc., Brokerage Company, KAK",
    "Markel, Writing Company, KAK001",
    "Nationwide Mutual Insurance Co, Writing Company, KAK002"
  ],
  "Keating Insurance, Brokerage Company, KEA": [
    "Crum & Forster Commercial Insurance, Writing Company, KE",
    "Keating Insurance, Brokerage Company, KEA"
  ],
  "KW Specialty Insurance Company, Brokerage Company, KWS": [
    "Financial Indemnity Company, Writing Company, KWS001",
    "KW Specialty Insurance Company, Brokerage Company, KWS"
  ],
  "Lloyd's of London, Brokerage Company, LOL": [
    "Highland Insurance Solutions, Writing Company, LOL002",
    "Lloyd's of London, Brokerage Company, LOL",
    "Professional Program Insurance Brokerage, Writing Company, LOL001"
  ],
  "London Underwriters, Brokerage Company, LON": [
    "Biberk, Writing Company, LON001",
    "London Underwriters, Brokerage Company, LON",
    "National Liability & Fire Insurance Co, Writing Company, LON003",
    "Pie Casualty Insurance Company, Writing Company, LON006",
    "Sierra Specialty Insurance Company, Writing Company, LON005",
    "State National Insurance Company, Inc., Writing Company, LON002",
    "Wellfleet Insurance Company, Writing Company, LON004"
  ],
  "Mini Co Insurance Agency LLC, Brokerage Company, MIN": [
    "Aspen American Ins. Co., Writing Company, MIN001",
    "Mini Co Insurance Agency LLC, Brokerage Company, MIN",
    "Safeco Insurance Company of America, Writing Company, MIN002"
  ],
  "Monarch E & S Insurance Services, Brokerage Company, MON": [
    "Associated Industries Insurance Company, Inc, Writing Company",
    "Atlantic Casualty Insurance Company, Writing Company, MON023",
    "Burlington Insurance Company, Writing Company, MON012",
    "Canopius US Insurance, Writing Company, MON013",
    "Century Surety Insurance Company, Writing Company, MON005",
    "Certain Underwriters at Lloyds, London, Writing Company, MON022",
    "Champlain Specialty Insurance Company, Writing Company, MON019",
    "Colony Insurance Company, Writing Company, MON003",
    "Concert Specialty Insurance Company, Writing Company, MON002",
    "Cumis Specialty Insurance Company, Writing Company, MON016",
    "Evanston Insurance Company, Writing Company, MON004",
    "Gemini Insurance Company, Writing Company, MON009",
    "Great American Insurance Company, Writing Company, MON014",
    "GuideOne National Insurance Company, Writing Company, MON011",
    "Hudson Excess Insurance Company, Writing Company, MON018",
    "Kinsale Insurance Company, Writing Company, MON021",
    "Mesa Underwriters Specialty, Writing Company, MON010",
    "Monarch E & S Insurance Services, Brokerage Company, MON",
    "Mount Vernon Fire Insurance, Writing Company, MON017",
    "Nautilus Insurance Company, Writing Company, MON008",
    "Northfield Insurance Company, Writing Company, MON024",
    "Richmond National Insurance Company, Writing Company, MON001",
    "Scottsdale Insurance Company, Writing Company, MON007",
    "U.S. Liability Insurance Co, Writing Company, MON020",
    "United National Insurance Company, Writing Company, MON015"
  ],
  "Morstan General Agency, Brokerage Company, MOR": [
    "Morstan General Agency, Brokerage Company, MOR",
    "Trisura Specialty Insurance Company, Writing Company, MOR001"
  ],
  "Myers & Stevens, Brokerage Company, MYE": [
    "Ace American Insurance Company, Writing Company, MYE001",
    "BCS Insurance Company, Writing Company, MYE002",
    "Myers & Stevens, Brokerage Company, MYE"
  ],
  "Nationwide Brokerage Solutions, Brokerage Company, NBS": [
    "American Modern Property and Casualty Insurance, Writing Company",
    "Century Insurance Group, Writing Company, NBS004",
    "Hiscox Insurance Company Inc., Writing Company, NBS002",
    "Nationwide Brokerage Solutions, Brokerage Company, NBS",
    "NBS, Writing Company, NBS001",
    "Penn Star Insurance Company, Writing Company, NBS007",
    "Scottsdale Insurance Company, Writing Company, NBS003",
    "Seaview Insurance Company, Writing Company, NBS005",
    "United States Liability Insurance Company, Writing Company, NBS006"
  ],
  "Navigators Insurance Co., Brokerage Company, NAV": [
    "Navigators Insurance Co., Brokerage Company, NAV"
  ],
  "NCCI, Brokerage Company, NCC": [
    "Liberty Mutual, Writing Company, NCC003",
    "NCCI, Brokerage Company, NCC",
    "SAIF, Writing Company, NCC002",
    "Travelers Property Casualty Company of America, Writing Company",
    "Wellfleet New York Insurance Company, Writing Company, NCC004"
  ],
  "NCIP - Natural Catastrophe Insurance Program, Brokerage Company": [
    "Certain Underwriters at Lloyds of London, Writing Company, NCI001",
    "NCIP - Natural Catastrophe Insurance Program, Brokerage Company"
  ],
  "New Age Underwriter's Agency, Inc, Brokerage Company, NAU": [
    "Certain Underwriters at Lloyd's, Writing Company, NAU001",
    "Knight Specialty Insurance, Writing Company, NAU002",
    "New Age Underwriter's Agency, Inc, Brokerage Company, NAU"
  ],
  "NIF Group, Brokerage Company, NIF": [
    "Mesa Underwriters Specialty, Writing Company, NIF002",
    "Nautilus Insurance Company, Writing Company, NIF001",
    "NIF Group, Brokerage Company, NIF"
  ],
  "Novatae Risk Group, Brokerage Company, NVT": [
    "Atlantic Casualty Insurance Company, Writing Company, NVT008",
    "Century Surety Company, Writing Company, NVT007",
    "certain Underwriters at Lloyd's, Writing Company, NVT002",
    "Evanston Insurance Company, Writing Company, NVT009",
    "HDI Global Specialty SE, Writing Company, NVT003",
    "James River Insurance Company, Writing Company, NVT010",
    "Kinsale Insurance Company, Writing Company, NVT006",
    "Nautilus Insurance Company, Writing Company, NVT004",
    "Northfield Insurance Company, Writing Company, NVT005",
    "Novatae Risk Group, Brokerage Company, NVT",
    "Seneca Specialty Insurance Company, Writing Company, NVT001"
  ],
  "Novus Underwriters, Inc., Brokerage Company, NOV": [
    "Accredited Specialty Insurance Company, Writing Company, NOV008",
    "AmGuard Insurance Company, Writing Company, NOV004",
    "Century Surety Company, Writing Company, NOV011",
    "CHUBB, Writing Company, NOV003",
    "Crum & Forster Specialty Insurance Company, Writing Company, NOV010",
    "Evanston Insurance Company, Writing Company, NOV002",
    "Hamilton Select Insurance Inc, Writing Company, NOV012",
    "James River Insurance, Writing Company, NOV005",
    "Liberty Mutual, Writing Company, NOV007",
    "Lloyds of London, Writing Company, NOV006",
    "Novus Underwriters, Inc., Brokerage Company, NOV",
    "Richmond National Insurance Company, Writing Company, NOV001",
    "Seneca Insurance Company Inc., Writing Company, NOV009"
  ],
  "One80, Brokerage Company, One80": [
    "AmTrust E&S Ins Services, Inc., Writing Company, One801",
    "One80, Brokerage Company, One80"
  ],
  "Osprey Underwriters Inc., Brokerage Company, OSP": [
    "Adriatic Ins Co, Writing Company, OSP001",
    "Great American Insurance Company, Writing Company, OSP003",
    "Osprey Underwriters Inc., Brokerage Company, OSP",
    "United Specialty Insurance Company, Writing Company, OSP002"
  ],
  "Pacific Coast E&S, Brokerage Company, PCE": [
    "Benchmark Insurance Company, Writing Company, PCE005",
    "Lloyd's of London, Writing Company, PCE006",
    "Mesa Underwriters Specialty, Writing Company, PCE003",
    "Nautilus Insurance Company, Writing Company, PCE002",
    "Pacific Coast E&S, Brokerage Company, PCE",
    "Scottsdale Insurance Company, Writing Company, PCE001",
    "United States Liability Insurance Co., Writing Company, PCE004"
  ],
  "Pacific Excess Insurance Marketing Inc, Brokerage Company, PEX": [
    "Pacific Excess Insurance Marketing Inc, Brokerage Company, PEX",
    "Zenith Insurance Company, Writing Company, PEX001"
  ],
  "Paragon Insurance Holdings, Brokerage Company, PAR": [
    "Hadron Specialty Insurance Company, Writing Company, PAR001",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "Paragon Insurance Holdings, Brokerage Company, PAR"
  ],
  "PersonalUmbrella.com, Brokerage Company, PUM": [
    "American Alternative Insurance Corporation, Writing Company, PUM002",
    "Markel Insurance Company, Writing Company, PUM001",
    "PersonalUmbrella.com, Brokerage Company, PUM"
  ],
  "Primex Insurance Brokers, Brokerage Company, PIB": [
    "Capitol Specialty Insurance Corporation, Writing Company, PIB001",
    "Columbia Insurance Company, Writing Company, PIB008",
    "National Liability & Fire Ins. Co., Writing Company, PIB006",
    "Nautilus Insurance Company, Writing Company, PIB005",
    "Northfield Insurance Company, Writing Company, PIB003",
    "Primex Insurance Brokers, Brokerage Company, PIB",
    "Scottsdale Insurance Company, Writing Company, PIB004",
    "Underwriters at Lloyd's London, Writing Company, PIB002",
    "Western World Insurance Group, Writing Company, PIB007"
  ],
  "Professional Program Insurance Brokerage, Brokerage Company": [
    "Canopius Us Ins, Writing Company, PPI003",
    "Certain Underwriters at Lloyds of London, Writing Company, PPI001",
    "Lloyds of London, Writing Company, PPI002",
    "Professional Program Insurance Brokerage, Brokerage Company, PPI"
  ],
  "R.E. Chaix & Associates, Brokerage Company, REC": [
    "Allied World Surplus Lines, Writing Company, REC010",
    "Atlantic Casualty Insurance Company, Writing Company, REC014",
    "Berkeley Assurance Company, Writing Company, REC007",
    "Burlington Insurance Company, Writing Company, REC005",
    "Capitol Specialty Insurance Corporation, Writing Company, REC002",
    "Century Surety Company, Writing Company, REC012",
    "Certain Underwriters at Lloyds, Writing Company, REC003",
    "Evanston Insurance Company, Writing Company, REC001",
    "Kinsale Insurance Company, Writing Company, REC011",
    "Maxum Indemnity Company, Writing Company, REC008",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "Mount Vernon Fire Insurance Company, Writing Company, REC013",
    "Palomar Excess and Surplus Insurance Company, Writing Company",
    "R.E. Chaix & Associates, Brokerage Company, REC",
    "U.S. Specialty Insurance Company, Writing Company, REC009",
    "United States Liability Insurance Company, Writing Company, REC006"
  ],
  "RIC Insurance General Agency Inc., Brokerage Company, RIC": [
    "ACE Property & Casualty Insurance Company, Writing Company, RIC002",
    "Admiral Insurance Company, Writing Company, RIC004",
    "Amguard Ins Co, Writing Company, RIC020",
    "Berkley Assur Co, Writing Company, RIC011",
    "Canopius Us Ins, Writing Company, RIC019",
    "Contractors Bonding and Insurance Company, Writing Company, RIC022",
    "Employer's Preferred Ins Co., Writing Company, RIC013",
    "Evanston Insurance Company, Writing Company, RIC003",
    "Great American Insurance Company, Writing Company, RIC010",
    "Houston Specialty Insurance Company, Writing Company, RIC007",
    "James River Insurance Company, Writing Company, RIC018",
    "Kinsale Insurance Company, Writing Company, RIC016",
    "Liberty Mutual Insurance Company, Writing Company, RIC008",
    "Lloyds of London, Writing Company, RIC009",
    "Mount Vernon Fire Insurance Company, Writing Company, RIC021",
    "National Fire & Marine Ins Co, Writing Company, RIC001",
    "National Liability & Fire Ins. Co., Writing Company, RIC024",
    "Penn-Star Insurance Company, Writing Company, RIC023",
    "RIC Insurance General Agency Inc., Brokerage Company, RIC",
    "Scottsdale Insurance Company, Writing Company, RIC005",
    "Seneca Insurance Company, Inc., Writing Company, RIC017",
    "State Compensation Insurance Fund of CA, Writing Company, RIC012",
    "The Burlington Insurance Company, Writing Company, RIC006",
    "United Specialty Insurance Company, Writing Company, RIC015",
    "United States Liability Insurance Co., Writing Company, RIC014"
  ],
  "Risk Exchange Insurance Services, Inc., Brokerage Company, REX": [
    "Atlanta Intl Ins Co, Writing Company, REX001",
    "Risk Exchange Insurance Services, Inc., Brokerage Company, REX"
  ],
  "Risk Placement Services, Inc, Brokerage Company, RPS": [
    "Accredited Surety & Casualty Co, Writing Company, RPS003",
    "Associated Industries Ins Co Inc, Writing Company, RPS007",
    "ATLANTIC SPECIALTY INSURANCE COMPANY, Writing Company",
    "Century Surety Insurance Company, Writing Company, RPS001",
    "Hanover Insurance Company, Writing Company, RPS014",
    "Lloyds of London, Writing Company, RPS010",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "Nautilus Insurance Company, Writing Company, RPS011",
    "Northfield Insurance Company, Writing Company, RPS012",
    "Penn-Star Insurance Company, Writing Company, RPS009",
    "Republic-Vanguard Insurance, Writing Company, RPS015",
    "Risk Placement Services, Inc, Brokerage Company, RPS",
    "Rockingham Specialty, Inc., Writing Company, RPS008",
    "Scottsdale Insurance Company, Writing Company, RPS002",
    "Trisura Specialty Insurance Company, Writing Company, RPS006",
    "United States Liability Insurance Co., Writing Company, RPS013"
  ],
  "River Valley Underwriters (RVU), Brokerage Company, RVU": [
    "Champlain Specialty Ins Co, Writing Company, RVU003",
    "Crum & Forster Specialty Ins Co, Writing Company, RVU001",
    "River Valley Underwriters (RVU), Brokerage Company, RVU",
    "Scottsdale Insurance Co, Writing Company, RVU002",
    "StarStone Specialty Insurance Company, Writing Company, RBU004"
  ],
  "Rivington, Brokerage Company, RIV": [
    "American Modern Prop & Cas Ins Co, Writing Company, RIV002",
    "Rivington, Brokerage Company, RIV",
    "Texas Insurance Company, Writing Company, RIV001"
  ],
  "Robert Moreno Insurance Services (CA), Brokerage Company, RC": [
    "Harco National Insurance Company, Writing Company, ROB001",
    "Robert Moreno Insurance Services (CA), Brokerage Company, ROB",
    "Sutter Ins Co, Writing Company, ROB002"
  ],
  "RSG National Specialty Programs, Brokerage Company, RSG": [
    "Ace Fire Underwriters Ins Co, Writing Company, RSG006",
    "Canopius US Insurance, Inc, Writing Company, RSG007",
    "Great American E & S Insurance Company, Writing Company, RSG005",
    "Guide One National Insurance Company, Writing Company, RSG002",
    "Hudson Excess Insurance Company, Writing Company, RSG004",
    "Mesa Underwriters Specialty Insurance, Writing Company, RSG008",
    "RSG National Specialty Programs, Brokerage Company, RSG",
    "Technology Insurance Company, Writing Company, RSG001"
  ],
  "RSI, Brokerage Company, RSI": [
    "Allianz Global Corporate & Specialty SE, Writing Company, RSI005",
    "Certain Underwriters at Lloyds London, Writing Company, RSI004",
    "Evanston Insurance Co, Writing Company, RSI001",
    "Mesa Underwriting Specialty Ins Co, Writing Company, RSI002",
    "RSI, Brokerage Company, RSI",
    "United States Liability Insurance Company, Writing Company, RSI003"
  ],
  "RT- Specialty, Brokerage Company, RTS": [
    "AmTrust Insurance Company, Writing Company, RTS003",
    "Ategrity Specialty Insurance Co., Writing Company, RTS015",
    "Axis Surplus Insurance Company, Writing Company, RTS022",
    "Berkley Assurance Company, Writing Company, RTS020",
    "Canopius US Insurance Inc, Writing Company, RTS018",
    "Capitol Specialty Insurance, Writing Company, RTS023",
    "Century Surety Company, Writing Company, RTS025",
    "Certain Underwriters at Lloyd's, Writing Company, RTS016",
    "Champlain Specialty Insurance Company, Writing Company, RTS021",
    "Clear Blue Specialty Insurance Company, Writing Company, RTS011",
    "Covington Specialty Insurance Company, Writing Company, RTS002",
    "Evanston Insurance Company, Writing Company, RTS005",
    "Gotham Insurance Company, Writing Company, RTS007",
    "Guide One National Insurance Company, Writing Company, RTS014",
    "HDI Global Specialty SE, Writing Company, RTS008",
    "Hudson Excess Insurance Company, Writing Company, RTS027",
    "Kinsale Insurance Company, Writing Company, RTS024",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "National Liability & Fire Insurance Company, Writing Company, RTS010",
    "Nautilus Insurance Company, Writing Company, RTS026",
    "Northfield Insurance Company, Writing Company, RTS019",
    "Pie Insurance, Writing Company, RTS017",
    "RT- Specialty, Brokerage Company, RTS",
    "Scottsdale Insurance Company, Writing Company, RTS009",
    "Sirius America Insurance Company, Writing Company, RTS012",
    "Technology Insurance Company, Writing Company, RTS004",
    "United States Fire Insurance Company, Writing Company, RTS001",
    "Western World Insurance Company, Writing Company, RTS006"
  ],
  "S Phillips Surety, Brokerage Company, SPS": [
    "Great American Insurance Company, Writing Company, SPS002",
    "Merchants Bonding Company, Writing Company, SPS003",
    "Philadelphia Indemnity Insurance Company, Writing Company, SPS006",
    "Platte River Insurance Company, Writing Company, SPS001",
    "S Phillips Surety, Brokerage Company, SPS",
    "Swiss Re Corporate Solutions Insurance, Writing Company, SPS005",
    "Texas Bonding Company, Writing Company, SPS008",
    "The North River Insurance Company, Writing Company, SPS007",
    "Western Surety Company, Writing Company, SPS004"
  ],
  "Scottish American, Brokerage Company, SAM": [
    "Atlantic Casualty Insurance Company, Writing Company, SAM005",
    "Crum & Forster Specialty Ins. Co., Writing Company, SAM003",
    "Evanston Insurance Company, Writing Company, SAM001",
    "Gemini Insurance, Writing Company, SAM002",
    "Lloyd's of London, Writing Company, SAM004",
    "Mount Vernon Fire Insurance Co, Writing Company, SAM006",
    "Scottish American, Brokerage Company, SAM"
  ],
  "Shield Commercial Insurance Services, Brokerage Company, SHI": [
    "AGCS Marine Insurance Company, Writing Company, SHI005",
    "Evanston Insurance Company, Writing Company, SHI002",
    "Nationwide, Writing Company, SHI004",
    "Palms Insurance Company, Writing Company, SHI001",
    "Scottsdale Insurance Company, Writing Company, SHI003",
    "Shield Commercial Insurance Services, Brokerage Company, SHI"
  ],
  "SIAA, Brokerage Company, SIA": [
    "Aegis, Writing Company, SIA004",
    "Alliance United, Writing Company, SIA007",
    "Dairyland, Writing Company, SIA011",
    "Foremost/Bristol West, Writing Company, SIA003",
    "Infinity, Writing Company, SIA010",
    "Kemper, Writing Company, SIA009",
    "Mapfre, Writing Company, SIA008",
    "National General, Writing Company, SIA002",
    "Pacific Specialty, Writing Company, SIA001",
    "RMIS, Writing Company, SIA005",
    "SIAA, Brokerage Company, SIA",
    "Third Coast Insurance Company, Writing Company, SIA012",
    "Travelers, Writing Company, SIA006"
  ],
  "SIS, Brokerage Company, SIS": [
    "Accident Fund General Insurance Company, Writing Company, SIS006",
    "AIX Specialty Insurance Company, Writing Company, SIS003",
    "Certain Underwriters at Lloyd's, London, Writing Company, SIS009",
    "Interstate Fire & Casualty Company, Writing Company, SIS001",
    "Kemper (Interstate Insurance Agency), Writing Company, SIS014",
    "Lloyd's London Insurance Company, Writing Company, SIS011",
    "Nova Casualty Company, Writing Company, SIS007",
    "Obsidian Specialty Insurance Company, Writing Company, SIS002",
    "PCIC, Writing Company, SIS004",
    "Prospect, Writing Company, SIS015",
    "Safebuilt Insurance SVCS , LLC, Writing Company, SIS013",
    "SIS, Brokerage Company, SIS",
    "Sutton Specialty Insurance Company, Writing Company, SIS010",
    "Third Coast Insurance Company, Writing Company, SIS005",
    "Trisura Specialty Insurance Company, Writing Company, SIS008",
    "United Specialty Insurance Company, Writing Company, SIS012"
  ],
  "Sterling Insurance Services LLC, Brokerage Company, SISL": [
    "Kinsale Insurance Company, Writing Company, SISL01",
    "Richmond National Insurance Company, Writing Company, SISL02",
    "Sterling Insurance Services LLC, Brokerage Company, SISL"
  ],
  "Superior Access/Bolt Access, Brokerage Company, SUP": [
    "Allied Insurance Company, Writing Company, SUP009",
    "AmTrust North America, Writing Company, SUP001",
    "Arrowhead General Insurance, Writing Company, SUP012",
    "Liberty Mutual Insurance, Writing Company, SUP006",
    "Nationwide General Ins Co, Writing Company, SUP010",
    "Nationwide Insurance Company of America, Writing Company",
    "Ohio Security Insurance Company - a stock company, Writing Company",
    "Safeco, Writing Company, SUP002",
    "Sequoia Insurance Co, Writing Company, SUP007",
    "Spinnaker Insurance Company, Writing Company, SUP013",
    "Superior Access/Bolt Access, Brokerage Company, SUP",
    "The Charter Oak Fire Insurance Company, Writing Company, SUP008",
    "The Hartford, Writing Company, SUP003",
    "The Travelers Indemnity Company of Connecticut, Writing Company",
    "Unitrin, Writing Company, SUP011",
    "Wellfleet Insurance Company, Writing Company, SUP004"
  ],
  "Supression Pro Insurance Services, Brokerage Company, SPP": [
    "Certain Underwriters at Lloyd's of London, Writing Company, SPP001",
    "Lloyd's of London, Writing Company, SPP002",
    "Supression Pro Insurance Services, Brokerage Company, SPP"
  ],
  "TCB Insurance Programs, Brokerage Company, TCB": [
    "Loyds of London, Writing Company, TCB001",
    "TCB Insurance Programs, Brokerage Company, TCB"
  ],
  "Texas Security General Insurance Agency, LLC, Brokerage Compa": [
    "Century Surety Company, Writing Company, TSGI02",
    "Nautilus Insurance Company, Writing Company, TSGI01",
    "Texas Security General Insurance Agency, LLC, Brokerage Company"
  ],
  "The Mechanic Group, Brokerage Company, TMG": [
    "Allied World Surplus Lines Insurance Company, Writing Company, TMG001",
    "The Mechanic Group, Brokerage Company, TMG"
  ],
  "Underwriters at Lloyd's London, Brokerage Company, ULL": [
    "Underwriters at Lloyd's London, Brokerage Company, ULL"
  ],
  "Union General Insurance Services, Inc., Brokerage Company, UG": [
    "Benchmark Insurance Company, Writing Company, UGI005",
    "Capitol Specialty Insurance Corporation, Writing Company, UGI003",
    "Contractors Bonding and Insurance Company, Writing Company",
    "Great American Insurance Group, Writing Company, UGI009",
    "Northfield Insurance Company, Writing Company, UGI006",
    "RLI Insurance Company, Writing Company, UGI008",
    "Scottsdale Insurance Company, Writing Company, UGI004",
    "Union General Insurance Services, Inc., Brokerage Company, UGI",
    "United States Fire Insurance Company, Writing Company, UGI001"
  ],
  "USG, Brokerage Company, USG1": [
    "Acceptance Casualty Insurance Company, Writing Company",
    "Allied World Surplus Lines Insurance Company, Writing Company",
    "AmGuard Insurance Company, Writing Company, USG106",
    "Ategrity Specialty Insurance Company, Writing Company, USG114",
    "Atlantic Casualty Insurance Company, Writing Company, USG123",
    "Berkshire Hathaway Guard, Writing Company, USG119",
    "Burlington Insurance Company, Writing Company, USG113",
    "Canopius US Insurance, Inc., Writing Company, USG124",
    "Century Surety Insurance, Writing Company, USG112",
    "Colony Insurance Company, Writing Company, USG102",
    "Crum & Forster Specialty Ins Co, Writing Company, USG125",
    "Evanston Insurance Company, Writing Company, USG104",
    "General Star Indemnity Company, Writing Company, USG108",
    "Great American Insurance Company, Writing Company, USG115",
    "GuideOne National Insurance Company, Writing Company, USG111",
    "Houston Specialty Insurance Company, Writing Company, USG109",
    "Kinsale Insurance Company, Writing Company, USG126",
    "Lloyd's of London, Writing Company, USG122",
    "Mesa Underwriters Specialty Insurance Company, Writing Company",
    "Mt. Hawley Insurance Co, Writing Company, USG118",
    "National Union Fire Ins, Writing Company, USG120",
    "NorGuard Insurance Company, Writing Company, USG110",
    "Northfield Insurance Company, Writing Company, USG117",
    "Richmond National, Writing Company, USG127",
    "Twin City Fire Insurance Company, Writing Company, USG116",
    "USG, Brokerage Company, USG1",
    "Westchester Fire Insurance Company, Writing Company, USG103",
    "Western World Insurance Co., Writing Company, USG121"
  ],
  "Western Security Surplus Brokerage, Brokerage Company, WSS": [
    "Western Security Surplus Brokerage, Brokerage Company, WSS"
  ],
  "Wholesure Solutions, LLC ( Appalachians ), Brokerage Company": [
    "Accident Insurance Company, Writing Company, APP023",
    "Accredited Specialty Insurance Company, Writing Company",
    "Accredited Surety and Casualty Company, Inc., Writing Company",
    "American Builders Insurance Company RRG, Inc., Writing Company",
    "AmTrust Insurance Company, Writing Company, APP008",
    "Berkshire Hathaway Direct Insurance Company, Writing Company",
    "Biberk Business Insurance, Writing Company, APP020",
    "Carolina Casualty Insurance Company, Writing Company, APP004",
    "Clear Spring Prop & Casualty Co, Writing Company, APP009",
    "Crum & Forster Specialty Insurance Company, Writing Company",
    "Evanston Insurance Company, Writing Company, APP010",
    "Hamilton Select Insurance Inc, Writing Company, APP030",
    "Homesite Insurance Company of Florida, Writing Company",
    "Kinsale Insurance Company, Writing Company, APP024",
    "LIO Specialty Insurance Company, Writing Company, APP013",
    "Markel Insurance Company, Writing Company, APP005",
    "Maxum Indemnity Company, Writing Company, APP016",
    "MidSouth Mutual Insurance Company, Writing Company, APP011",
    "Midwest Employers Casualty Company, Writing Company, APP003",
    "National Liability & Fire Ins. Co., Writing Company, APP002",
    "Nautilus Insurance Company, Writing Company, APP014",
    "Next Insurance US Company, Writing Company, APP026",
    "Northfield Insurance Company, Writing Company, APP022",
    "Penn-Star Insurance Company, Writing Company, APP029",
    "Sirius America Insurance Company, Writing Company, APP015",
    "StarStone National Insurance Company, Writing Company",
    "The Burlington Insurance Company, Writing Company, APP001",
    "The Pie Insurance Company, Writing Company, APP007",
    "Underwriters at Lloyd's London, Writing Company, APP006",
    "United National Insurance Company, Writing Company, APP019",
    "Wellfleet New York Insurance Company, Writing Company",
    "Wholesure Solutions, LLC ( Appalachians ), Brokerage Company"
  ],
  "Word and Brown, Brokerage Company, WAB": [
    "Sutter Hith Plan, Writing Company, WAB001",
    "Word and Brown, Brokerage Company, WAB"
  ],
  "Worldwide Facilities, Inc., Brokerage Company, WOR": [
    "Atlantic Casualty Insurance Company, Writing Company, WOR010",
    "Bankers Standard Ins Co, Writing Company, WOR003",
    "Century Surety, Writing Company, WOR002",
    "Covington Specialty Ins Co, Writing Company, WOR001",
    "Evanston Insurance Company, Writing Company, WOR004",
    "Kinsale Insurance Company, Writing Company, WOR008",
    "Mount Vernon Fire Insurance Company, Writing Company, WOR009",
    "Scottsdale Insurance Company, Writing Company, WOR005",
    "The Burlington Insurance Company, Writing Company, WOR006",
    "Westchester Surplus Lines Insurance Company, Writing Company",
    "Worldwide Facilities, Inc., Brokerage Company, WOR"
  ],
  "XS Specialty LLC, Brokerage Company, XSS": [
    "AIG Specialty Insurance Company, Writing Company, XSS015",
    "AM Specialty Insurance Company, Writing Company, XSS020",
    "Canopius US Insurance, Inc, Writing Company, XSS011",
    "Capitol Specialty Insurance Corporation, Writing Company, XSS004",
    "Certain Underwriters at Lloyd's London, Writing Company, XSS009",
    "Champlain Specialty Insurance Company, Writing Company, XSS014",
    "Clear Blue Specialty Insurance, Writing Company, XSS010",
    "Commerce & Industry Insurance Company, Writing Company",
    "Concert Specialty Insurance Company, Writing Company, XSS002",
    "CUMIS Specialty Insurance Company, Writing Company, XSS013",
    "Gemini Insurance, Writing Company, XSS006",
    "Houston Specialty Insurance Company, Writing Company, XSS007",
    "James River Insurance Co., Writing Company, XSS018",
    "Kinsale Insurance Company, Writing Company, XSS017",
    "National Union Fire Ins, Writing Company, XSS016",
    "Obsidian Specialty Insurance Company, Writing Company, XSS003",
    "Richmond National Insurance Company, Writing Company, XSS001",
    "Summit Specialty Insurance Company, Writing Company, XSS005",
    "United National Insurance Company, Writing Company, XSS012",
    "United Specialty Insurance Co, Writing Company, XSS008",
    "XS Specialty LLC, Brokerage Company, XSS"
  ]
};

export default function NewPolicyPage() {
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
    } else if (companyType === "Brokerage") {
      const companies = BROKERAGE_WRITING_COMPANIES[parentCompany];
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

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-bg-base font-sans select-none text-text-main pb-24">
      {/* ── Top Window Bar ── */}
      <header className="bg-white/85 backdrop-blur-md border-b border-border-main h-16 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
            <span className="text-white font-bold text-xl tracking-wider font-sans">S</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm sm:text-base tracking-tight text-text-main leading-tight font-sans">Sterling Insurance Services</span>
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
      <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6">
        <div className="bg-secondary/40 border border-border-main rounded-2xl p-4 flex gap-3.5 items-start">
          <Info className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 space-y-1 font-medium">
            <p className="font-bold text-text-main">Enter the Basic Policy Information or select a Submission to create the new Policy.</p>
            <p>To create a Policy for an existing Submission, select Submission # and Effective Date. The most current Application version(s) will default.</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6">

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
                      {companyType === "Brokerage" && BROKERAGE_PARENT_COMPANIES.map((company) => (
                        <option key={company} value={company}>{company}</option>
                      ))}
                      {companyType === "Subscription" && (
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
                      ) : companyType === "Brokerage" && BROKERAGE_WRITING_COMPANIES[parentCompany] ? (
                        BROKERAGE_WRITING_COMPANIES[parentCompany].map((company) => (
                          <option key={company} value={company}>{company}</option>
                        ))
                      ) : companyType === "Brokerage" ? (
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border-main/50 pt-4">
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
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-main py-3.5 px-4 sm:px-8 flex justify-between sm:justify-end gap-3 z-50 shadow-lg select-none">
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