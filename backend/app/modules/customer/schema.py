from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import date

class CustomerBase(BaseModel):
    # --- Original fields ---
    match_code: str
    name: str
    type: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: str
    primary_exec: str

    # --- Type / Settings ---
    customer_type: Optional[str] = None
    exclude_target_list: Optional[bool] = False
    exclude_purge: Optional[bool] = False

    # --- Names ---
    name_type: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    firm_name: Optional[str] = None
    dba: Optional[str] = None

    # --- Salutation ---
    formal_salutation: Optional[str] = None
    informal_salutation: Optional[str] = None
    alt_name_billing: Optional[bool] = False

    # --- Agency Personnel ---
    executive: Optional[str] = None
    representative: Optional[str] = None
    brokers_customer: Optional[bool] = False
    broker: Optional[str] = None

    # --- Business Unit ---
    division: Optional[str] = None
    branch: Optional[str] = None
    department: Optional[str] = None

    # --- Phone Numbers ---
    phone_residence: Optional[str] = None
    phone_residence_ext: Optional[str] = None
    phone_business: Optional[str] = None
    phone_business_ext: Optional[str] = None
    fax: Optional[str] = None
    fax_ext: Optional[str] = None
    cell: Optional[str] = None
    cell_ext: Optional[str] = None
    pager: Optional[str] = None
    pager_ext: Optional[str] = None
    phone_other: Optional[str] = None
    phone_other_ext: Optional[str] = None

    # --- Internet ---
    email2: Optional[str] = None
    web: Optional[str] = None

    # --- Address extras ---
    address2: Optional[str] = None
    country: Optional[str] = None
    county: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    alt_address_billing: Optional[bool] = False

    # --- Distribution / Contact Preferences ---
    preferred_distribution: Optional[str] = None
    preferred_method: Optional[str] = None
    marketing_solicitation: Optional[str] = None
    electronic_delivery: Optional[str] = None
    notes: Optional[str] = None

    # --- Business with Agency ---
    acquisition: Optional[str] = None
    business_origin: Optional[str] = None
    customer_added_date: Optional[str] = None

    # --- Referrals ---
    referral_name: Optional[str] = None
    referral_location: Optional[str] = None

    # --- Policy Checks ---
    auto_check_policies: Optional[bool] = False
    check_personal: Optional[bool] = False
    check_health: Optional[bool] = False
    check_commercial: Optional[bool] = False
    check_non_pc: Optional[bool] = False
    check_life: Optional[bool] = False
    check_financial: Optional[bool] = False
    check_benefits: Optional[bool] = False

    # --- Other ---
    known_since_year: Optional[str] = None
    notation: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    # All fields optional for partial updates
    match_code: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    status: Optional[str] = None
    primary_exec: Optional[str] = None

    customer_type: Optional[str] = None
    exclude_target_list: Optional[bool] = None
    exclude_purge: Optional[bool] = None
    name_type: Optional[str] = None
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    firm_name: Optional[str] = None
    dba: Optional[str] = None
    formal_salutation: Optional[str] = None
    informal_salutation: Optional[str] = None
    alt_name_billing: Optional[bool] = None
    executive: Optional[str] = None
    representative: Optional[str] = None
    brokers_customer: Optional[bool] = None
    broker: Optional[str] = None
    division: Optional[str] = None
    branch: Optional[str] = None
    department: Optional[str] = None
    phone_residence: Optional[str] = None
    phone_residence_ext: Optional[str] = None
    phone_business: Optional[str] = None
    phone_business_ext: Optional[str] = None
    fax: Optional[str] = None
    fax_ext: Optional[str] = None
    cell: Optional[str] = None
    cell_ext: Optional[str] = None
    pager: Optional[str] = None
    pager_ext: Optional[str] = None
    phone_other: Optional[str] = None
    phone_other_ext: Optional[str] = None
    email2: Optional[str] = None
    web: Optional[str] = None
    address2: Optional[str] = None
    country: Optional[str] = None
    county: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    alt_address_billing: Optional[bool] = None
    preferred_distribution: Optional[str] = None
    preferred_method: Optional[str] = None
    marketing_solicitation: Optional[str] = None
    electronic_delivery: Optional[str] = None
    notes: Optional[str] = None
    acquisition: Optional[str] = None
    business_origin: Optional[str] = None
    customer_added_date: Optional[str] = None
    referral_name: Optional[str] = None
    referral_location: Optional[str] = None
    auto_check_policies: Optional[bool] = None
    check_personal: Optional[bool] = None
    check_health: Optional[bool] = None
    check_commercial: Optional[bool] = None
    check_non_pc: Optional[bool] = None
    check_life: Optional[bool] = None
    check_financial: Optional[bool] = None
    check_benefits: Optional[bool] = None
    known_since_year: Optional[str] = None
    notation: Optional[str] = None

class ContactPerson(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    fax: Optional[str] = None

class Customer(CustomerBase):
    id: int
    created_date: date
    contact_person: Optional[ContactPerson] = None

    class Config:
        from_attributes = True



class PolicyBase(BaseModel):
    policy_num: str
    status: str = "Active"
    term: Optional[str] = None
    type: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    eff_date: Optional[str] = None
    exp_date: Optional[str] = None
    
    submission_id: Optional[str] = None
    sub_eff_date: Optional[str] = None
    is_continuous: Optional[bool] = False
    is_not_renewable: Optional[bool] = False
    issue_state: Optional[str] = "FL"
    carrier_status: Optional[str] = "Active"
    is_reinsurance: Optional[bool] = False
    business_type: Optional[str] = None
    transaction: Optional[str] = None
    company_type: Optional[str] = "Insurance"
    parent_company: Optional[str] = None
    writing_company: Optional[str] = None
    division: Optional[str] = None
    branch: Optional[str] = None
    department: Optional[str] = None
    bill_method: Optional[str] = "Direct bill"
    pay_plan: Optional[str] = None
    executive: Optional[str] = None
    representative: Optional[str] = None
    broker: Optional[str] = None
    include_notes: Optional[bool] = False
    exclude_lines: Optional[bool] = False
    default_insured: Optional[bool] = True
    default_co_insured: Optional[bool] = True
    default_dba: Optional[bool] = True
    default_contacts: Optional[bool] = True
    lobs: Optional[List[Any]] = None

class PolicyCreate(PolicyBase):
    pass

class Policy(PolicyBase):
    id: int
    customer_id: int
    created_date: date

    class Config:
        from_attributes = True


class CustomerNoteBase(BaseModel):
    text: str
    author: str
    role: str


class CustomerNoteCreate(CustomerNoteBase):
    pass


class CustomerNoteUpdate(BaseModel):
    text: str


class CustomerNote(CustomerNoteBase):
    id: int
    customer_id: int
    created_at: str

    class Config:
        from_attributes = True

class GeneralLiabilityCoverageBase(BaseModel):
    coverage: Optional[str] = None
    limit1: Optional[str] = None
    limit2: Optional[str] = None
    ded: Optional[str] = None
    dedType: Optional[str] = None
    basis: Optional[str] = None
    appliesTo: Optional[str] = None
    premium: Optional[str] = None
    sortOrder: Optional[str] = None
    level: Optional[str] = None
    state: Optional[str] = None
    location: Optional[str] = None
    appliesPer: Optional[str] = None
    otherDesc: Optional[str] = None
    exposure: Optional[str] = None
    rate: Optional[str] = None
    misc: Optional[str] = None
    numEmp: Optional[str] = None
    retroDate: Optional[str] = None
    comments: Optional[str] = None
    defaultStdCov: Optional[bool] = False

class GeneralLiabilityCoverageCreate(GeneralLiabilityCoverageBase):
    pass

class GeneralLiabilityCoverage(GeneralLiabilityCoverageBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True

class GeneralLiabilityInfoBase(BaseModel):
    liabilityCoverageType: Optional[str] = None
    coverageBasis: Optional[str] = None
    otherCoverages: Optional[str] = None

class GeneralLiabilityInfoCreate(GeneralLiabilityInfoBase):
    pass

class GeneralLiabilityInfo(GeneralLiabilityInfoBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True


class BusinessAutoCoverageBase(BaseModel):
    level: Optional[str] = None
    state: Optional[str] = None
    location: Optional[str] = None
    coverage: Optional[str] = None
    formSection: Optional[str] = None
    limit1: Optional[str] = None
    limit2: Optional[str] = None
    premium: Optional[str] = None
    dedType: Optional[str] = None
    dedAmt: Optional[str] = None
    sortOrder: Optional[str] = None
    numOf: Optional[str] = None
    rate: Optional[str] = None
    misc: Optional[str] = None

class BusinessAutoCoverageCreate(BusinessAutoCoverageBase):
    pass

class BusinessAutoCoverage(BusinessAutoCoverageBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True


class WorkersCompCoverageBase(BaseModel):
    state: Optional[str] = None
    employerId: Optional[str] = None
    anniversaryDate: Optional[str] = None
    participating: Optional[str] = None
    retroPlan: Optional[str] = None
    yearsRetro: Optional[str] = None
    anniversaryRatingDate: Optional[str] = None
    additionalInfo: Optional[str] = None
    safetyGroup: Optional[str] = None
    dividendPlan: Optional[str] = None
    participatingBasis: Optional[str] = None
    ncciId: Optional[str] = None
    otherId: Optional[str] = None

class WorkersCompCoverageCreate(WorkersCompCoverageBase):
    pass

class WorkersCompCoverage(WorkersCompCoverageBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True


class BusinessAutoSymbolBase(BaseModel):
    liability: Optional[Any] = None
    pip: Optional[Any] = None
    additionalPip: Optional[Any] = None
    medicalPayments: Optional[Any] = None
    uninsuredMotorist: Optional[Any] = None
    underinsuredMotorist: Optional[Any] = None
    towing: Optional[Any] = None
    comprehensive: Optional[Any] = None
    specifiedCauses: Optional[Any] = None
    collision: Optional[Any] = None

class BusinessAutoSymbolCreate(BusinessAutoSymbolBase):
    pass

class BusinessAutoSymbol(BusinessAutoSymbolBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True


class WorkersCompPart2Base(BaseModel):
    liabilityCoverageType: Optional[str] = None
    coverageType: Optional[str] = None
    coverageBasis: Optional[str] = None
    eachAccidentLimit: Optional[str] = None
    diseasePolicyLimit: Optional[str] = None
    diseaseEachEmployee: Optional[str] = None
    deductible: Optional[str] = None
    deductibleType: Optional[str] = None
    appliesTo: Optional[str] = None
    hasIncreasedLimits: Optional[bool] = False
    incEachAccidentLimit: Optional[str] = None
    incDiseasePolicyLimit: Optional[str] = None
    incDiseaseEachEmployee: Optional[str] = None
    incDeductible: Optional[str] = None
    incDeductibleType: Optional[str] = None
    incAppliesTo: Optional[str] = None
    incFactor: Optional[str] = None
    incFactoredPremium: Optional[str] = None
    classificationsTotalPremium: Optional[str] = None

class WorkersCompPart2Create(WorkersCompPart2Base):
    pass

class WorkersCompPart2(WorkersCompPart2Base):
    id: int
    policy_id: int

    class Config:
        from_attributes = True


class UmbrellaCoverageBase(BaseModel):
    level: Optional[str] = None
    coverage: Optional[str] = None
    state: Optional[str] = None
    location: Optional[str] = None
    limit1: Optional[str] = None
    limit2: Optional[str] = None
    retType: Optional[str] = None
    retention: Optional[str] = None
    premium: Optional[str] = None
    sort: Optional[str] = None
    exposure: Optional[str] = None
    rate: Optional[str] = None
    retAmount: Optional[str] = None
    retBasis: Optional[str] = None
    misc: Optional[str] = None

class UmbrellaCoverageCreate(UmbrellaCoverageBase):
    pass

class UmbrellaCoverage(UmbrellaCoverageBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True

class UmbrellaInfoBase(BaseModel):
    coverageType: Optional[str] = "Umbrella"
    expiringPolicy: Optional[str] = ""
    proposedRetroDate: Optional[str] = ""
    currentRetroDate: Optional[str] = ""
    firstDollarDefense: Optional[str] = "No"

class UmbrellaInfoCreate(UmbrellaInfoBase):
    pass

class UmbrellaInfo(UmbrellaInfoBase):
    id: int
    policy_id: int

    class Config:
        from_attributes = True


class CustomerDocumentBase(BaseModel):
    file_name: str
    ext: Optional[str] = None
    action: Optional[str] = None
    description: Optional[str] = None
    ref_num: Optional[str] = None
    info: Optional[str] = None
    b2_file_id: Optional[str] = None
    url: Optional[str] = None
    author: Optional[str] = None

class CustomerDocumentCreate(CustomerDocumentBase):
    pass

class CustomerDocument(CustomerDocumentBase):
    id: int
    customer_id: int
    created_at: str

    class Config:
        from_attributes = True

class MasterCertificateBase(BaseModel):
    description: Optional[str] = None
    form_type: Optional[str] = None
    form_data: Optional[Any] = None

class MasterCertificateCreate(MasterCertificateBase):
    pass

class MasterCertificateResponse(MasterCertificateBase):
    id: int
    customer_id: int
    created_date: date

    class Config:
        from_attributes = True


# ── Certificate Holders ────────────────────────────────────────────────────────

class CertificateHolderCreate(BaseModel):
    name: str
    contact: Optional[str] = None
    address: Optional[str] = None
    address2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip: Optional[str] = None
    email: Optional[str] = None
    fax: Optional[str] = None
    fax_ext: Optional[str] = None
    issue_date: Optional[str] = None
    written_notice_days: Optional[int] = 10
    desc_of_ops: Optional[str] = None
    same_as_master: Optional[bool] = True
    note: Optional[str] = None
    print_note: Optional[bool] = True
    job_type: Optional[str] = None
    job_num: Optional[str] = None
    project_end_date: Optional[str] = None
    licensed: Optional[bool] = False
    bonded: Optional[bool] = False
    write_to_list: Optional[bool] = False
    distribution_method: Optional[str] = None
    name_selection: Optional[str] = None
    additional_insured: Optional[Any] = None
    waiver_subrogation: Optional[Any] = None

class CertificateHolderResponse(CertificateHolderCreate):
    id: int
    certificate_id: int
    customer_id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
