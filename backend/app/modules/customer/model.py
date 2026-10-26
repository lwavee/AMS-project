from typing import Any
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.connection import Base
from datetime import date, datetime, timezone


def utc_now() -> datetime:
    """Return timezone-aware current UTC datetime."""
    return datetime.now(timezone.utc)


class Customer(Base):
    __tablename__ = "customers"

    # ── Core / Required ────────────────────────────────────────────────────────
    id              = Column(Integer, primary_key=True, index=True)
    match_code      = Column(String, unique=True, index=True)
    name            = Column(String, index=True)
    type            = Column(String)            # "Commercial" | "Personal"
    address         = Column(String)
    city            = Column(String)
    state           = Column(String)
    zip             = Column(String)
    phone           = Column(String)
    email           = Column(String)
    status          = Column(String)            # "Active" | "Inactive"
    primary_exec    = Column(String)
    created_date    = Column(Date, default=date.today)

    # ── Type / Settings ────────────────────────────────────────────────────────
    customer_type       = Column(String)        # "Customer" | "Prospect" | "Suspect"
    exclude_target_list = Column(Boolean, default=False)
    exclude_purge       = Column(Boolean, default=False)

    # ── Names ──────────────────────────────────────────────────────────────────
    name_type       = Column(String)            # "Individual" | "Family" | "Business"
    first_name      = Column(String)
    middle_name     = Column(String)
    last_name       = Column(String)
    firm_name       = Column(String)
    dba             = Column(String)

    # ── Salutation ─────────────────────────────────────────────────────────────
    formal_salutation   = Column(String)
    informal_salutation = Column(String)
    alt_name_billing    = Column(Boolean, default=False)

    # ── Agency Personnel ───────────────────────────────────────────────────────
    executive       = Column(String)
    representative  = Column(String)
    brokers_customer = Column(Boolean, default=False)
    broker          = Column(String)

    # ── Business Unit ──────────────────────────────────────────────────────────
    division        = Column(String)
    branch          = Column(String)
    department      = Column(String)

    # ── Phone Numbers ──────────────────────────────────────────────────────────
    phone_residence     = Column(String)
    phone_residence_ext = Column(String)
    phone_business      = Column(String)
    phone_business_ext  = Column(String)
    fax                 = Column(String)
    fax_ext             = Column(String)
    cell                = Column(String)
    cell_ext            = Column(String)
    pager               = Column(String)
    pager_ext           = Column(String)
    phone_other         = Column(String)
    phone_other_ext     = Column(String)

    # ── Internet ───────────────────────────────────────────────────────────────
    email2  = Column(String)
    web     = Column(String)

    # ── Co-Applicant ───────────────────────────────────────────────────────────
    has_co_applicant        = Column(String, default="No")
    co_applicant_first_name = Column(String, nullable=True)
    co_applicant_last_name  = Column(String, nullable=True)
    co_applicant_cell       = Column(String, nullable=True)
    co_applicant_email      = Column(String, nullable=True)

    # ── Address Extras ─────────────────────────────────────────────────────────
    address2            = Column(String)
    country             = Column(String)
    county              = Column(String)
    latitude            = Column(String)
    longitude           = Column(String)
    alt_address_billing = Column(Boolean, default=False)

    # ── Distribution / Contact Preferences ────────────────────────────────────
    preferred_distribution  = Column(String)
    preferred_method        = Column(String)
    marketing_solicitation  = Column(String)
    electronic_delivery     = Column(String)
    notes                   = Column(Text)

    # ── Business with Agency ───────────────────────────────────────────────────
    acquisition         = Column(String)
    business_origin     = Column(String)
    customer_added_date = Column(String)

    # ── Referrals ──────────────────────────────────────────────────────────────
    referral_name       = Column(String)
    referral_location   = Column(String)

    # ── Policy Auto-Check ──────────────────────────────────────────────────────
    auto_check_policies = Column(Boolean, default=False)
    check_personal      = Column(Boolean, default=False)
    check_health        = Column(Boolean, default=False)
    check_commercial    = Column(Boolean, default=False)
    check_non_pc        = Column(Boolean, default=False)
    check_life          = Column(Boolean, default=False)
    check_financial     = Column(Boolean, default=False)
    check_benefits      = Column(Boolean, default=False)

    # ── Other ──────────────────────────────────────────────────────────────────
    known_since_year    = Column(String)
    notation            = Column(String)

    # ── Relationships ─────────────────────────────────────────────────────────
    policies            = relationship("Policy", back_populates="customer", cascade="all, delete-orphan", passive_deletes=True)
    notes               = relationship("CustomerNote", back_populates="customer", cascade="all, delete-orphan", passive_deletes=True)
    documents           = relationship("CustomerDocument", back_populates="customer", cascade="all, delete-orphan", passive_deletes=True)
    master_certificates = relationship("MasterCertificate", back_populates="customer", cascade="all, delete-orphan", passive_deletes=True)
    certificate_holders = relationship("CertificateHolder", back_populates="customer", cascade="all, delete-orphan", passive_deletes=True)
    submissions         = relationship("Submission", back_populates="customer", cascade="all, delete-orphan", passive_deletes=True)


class Policy(Base):
    __tablename__ = "policies"

    id              = Column(Integer, primary_key=True, index=True)
    customer_id     = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    policy_num      = Column(String, index=True, nullable=False)
    status          = Column(String, default="Active")
    term            = Column(String, nullable=True)
    type            = Column(String, nullable=True)
    company         = Column(String, nullable=True)
    description     = Column(String, nullable=True)
    eff_date        = Column(String, nullable=True)
    exp_date        = Column(String, nullable=True)
    
    # Detailed form fields matching AMS360 layout
    submission_id   = Column(String, nullable=True)
    sub_eff_date    = Column(String, nullable=True)
    is_continuous   = Column(Boolean, default=False)
    is_not_renewable= Column(Boolean, default=False)
    issue_state     = Column(String, default="FL")
    carrier_status  = Column(String, default="Active")
    is_reinsurance  = Column(Boolean, default=False)
    business_type   = Column(String, nullable=True)
    transaction     = Column(String, nullable=True)
    company_type    = Column(String, default="Insurance")
    parent_company  = Column(String, nullable=True)
    writing_company = Column(String, nullable=True)
    division        = Column(String, nullable=True)
    branch          = Column(String, nullable=True)
    department      = Column(String, nullable=True)
    bill_method     = Column(String, default="Direct bill")
    pay_plan        = Column(String, nullable=True)
    executive       = Column(String, nullable=True)
    representative  = Column(String, nullable=True)
    broker          = Column(String, nullable=True)
    total_premium   = Column(String, nullable=True)
    premium         = Column(String, nullable=True)
    include_notes   = Column(Boolean, default=False)
    exclude_lines   = Column(Boolean, default=False)
    default_insured = Column(Boolean, default=True)
    default_co_insured = Column(Boolean, default=True)
    default_dba     = Column(Boolean, default=True)
    default_contacts= Column(Boolean, default=True)
    lobs            = Column(JSON, nullable=True)
    created_date    = Column(Date, default=date.today)

    customer = relationship("Customer", back_populates="policies")


class Submission(Base):
    __tablename__ = "submissions"

    id              = Column(Integer, primary_key=True, index=True)
    customer_id     = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    quote_id        = Column(String, index=True, nullable=False)
    status          = Column(String, default="Quoted")
    term            = Column(String, nullable=True)
    type            = Column(String, nullable=True)
    company         = Column(String, nullable=True)
    description     = Column(String, nullable=True)
    eff_date        = Column(String, nullable=True)
    exp_date        = Column(String, nullable=True)
    
    # Detailed form fields matching AMS360 layout
    submission_id   = Column(String, nullable=True)
    sub_eff_date    = Column(String, nullable=True)
    is_continuous   = Column(Boolean, default=False)
    is_not_renewable= Column(Boolean, default=False)
    issue_state     = Column(String, default="FL")
    carrier_status  = Column(String, default="Active")
    is_reinsurance  = Column(Boolean, default=False)
    business_type   = Column(String, nullable=True)
    transaction     = Column(String, nullable=True)
    company_type    = Column(String, default="Insurance")
    parent_company  = Column(String, nullable=True)
    writing_company = Column(String, nullable=True)
    division        = Column(String, nullable=True)
    branch          = Column(String, nullable=True)
    department      = Column(String, nullable=True)
    bill_method     = Column(String, default="Direct bill")
    pay_plan        = Column(String, nullable=True)
    executive       = Column(String, nullable=True)
    representative  = Column(String, nullable=True)
    broker          = Column(String, nullable=True)
    total_premium   = Column(String, nullable=True)
    premium         = Column(String, nullable=True)
    include_notes   = Column(Boolean, default=False)
    exclude_lines   = Column(Boolean, default=False)
    default_insured = Column(Boolean, default=True)
    default_co_insured = Column(Boolean, default=True)
    default_dba     = Column(Boolean, default=True)
    default_contacts= Column(Boolean, default=True)
    lobs            = Column(JSON, nullable=True)
    created_date    = Column(Date, default=date.today)

    customer = relationship("Customer", back_populates="submissions")


class Agency(Base):
    __tablename__ = "agencies"

    id: Any           = Column(Integer, primary_key=True, index=True)
    name: Any         = Column(String, index=True, nullable=False)
    email: Any        = Column(String, unique=True, index=True, nullable=False)
    user_id: Any      = Column(String, unique=True, index=True, nullable=True)
    address: Any      = Column(String, nullable=True)
    city: Any         = Column(String, nullable=True)
    state: Any        = Column(String, nullable=True)
    zip: Any          = Column(String, nullable=True)
    phone: Any        = Column(String, nullable=True)
    fax: Any          = Column(String, nullable=True)
    created_date: Any = Column(Date, default=date.today)

    agents = relationship("Agent", back_populates="agency", cascade="all, delete-orphan")
    invitations = relationship("AgentInvitation", back_populates="agency", cascade="all, delete-orphan")


class Agent(Base):
    __tablename__ = "agents"

    id: Any           = Column(Integer, primary_key=True, index=True)
    name: Any         = Column(String, index=True, nullable=False)
    email: Any        = Column(String, unique=True, index=True, nullable=False)
    agency_id: Any    = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Any      = Column(String, unique=True, index=True, nullable=True)
    created_date: Any = Column(Date, default=date.today)

    agency = relationship("Agency", back_populates="agents")
    mailbox = relationship("AgentMailbox", back_populates="agent", uselist=False, cascade="all, delete-orphan")


class AgentInvitation(Base):
    __tablename__ = "agent_invitations"

    id: Any           = Column(Integer, primary_key=True, index=True)
    agency_id: Any    = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Any         = Column(String, index=True, nullable=False)
    email: Any        = Column(String, index=True, nullable=False)
    phone: Any        = Column(String, nullable=True)
    location: Any     = Column(String, nullable=True)
    status: Any       = Column(String, default="Invitation Prepared", nullable=False)
    token: Any        = Column(String, unique=True, index=True, nullable=True)
    code: Any         = Column(String, nullable=True)
    expires_at: Any   = Column(DateTime, nullable=True)
    created_at: Any   = Column(DateTime, default=utc_now, nullable=False)
    updated_at: Any   = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    agency = relationship("Agency", back_populates="invitations")


class AgentMailbox(Base):
    """
    Connected agent email mailbox identity and credentials (encrypted at rest).
    Provider-neutral architecture supporting Microsoft 365, Outlook, and future providers.
    """
    __tablename__ = "agent_mailboxes"

    id: Any                      = Column(Integer, primary_key=True, index=True)
    agent_id: Any                = Column(Integer, ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    agency_id: Any               = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    provider: Any                = Column(String, default="microsoft", nullable=False)
    email: Any                   = Column(String, nullable=False, index=True)
    display_name: Any            = Column(String, nullable=True)
    encrypted_refresh_token: Any = Column(Text, nullable=True)
    status: Any                  = Column(String, default="Connected", nullable=False)  # "Not Connected", "Connecting", "Connected", "Connection Expired", "Connection Error"
    scopes: Any                  = Column(String, nullable=True)
    connected_at: Any            = Column(DateTime, default=utc_now, nullable=False)
    updated_at: Any              = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)
    expires_at: Any              = Column(DateTime, nullable=True)
    last_error: Any              = Column(Text, nullable=True)

    agent = relationship("Agent", back_populates="mailbox")
    agency = relationship("Agency")


class EmailAuditLog(Base):
    """
    AMS email audit log for outbound emails sent from agent's connected business mailbox.
    Records sender, recipient, attachments, policy/customer association, and Microsoft Graph ID.
    """
    __tablename__ = "email_audit_logs"

    id: Any               = Column(Integer, primary_key=True, index=True)
    agency_id: Any        = Column(Integer, ForeignKey("agencies.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id: Any         = Column(Integer, ForeignKey("agents.id", ondelete="SET NULL"), nullable=True, index=True)
    sender_email: Any     = Column(String, nullable=False)
    recipient_email: Any  = Column(String, nullable=False)
    subject: Any          = Column(String, nullable=False)
    body_preview: Any     = Column(Text, nullable=True)
    has_attachments: Any  = Column(Boolean, default=False, nullable=False)
    attachment_names: Any = Column(Text, nullable=True)
    customer_id: Any      = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    policy_id: Any        = Column(Integer, nullable=True, index=True)
    graph_message_id: Any = Column(String, nullable=True, index=True)
    status: Any           = Column(String, default="sent", nullable=False)  # "sent", "delivered", "failed", "draft"
    error_message: Any    = Column(Text, nullable=True)
    sent_at: Any          = Column(DateTime, default=utc_now, nullable=False)
    created_at: Any       = Column(DateTime, default=utc_now, nullable=False)

    agency = relationship("Agency")
    agent = relationship("Agent")


class CustomerNote(Base):
    __tablename__ = "customer_notes"

    id          = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    text        = Column(Text, nullable=False)
    author      = Column(String, nullable=False)
    role        = Column(String, nullable=False)
    created_at  = Column(String, nullable=False)

    customer    = relationship("Customer", back_populates="notes")


class GeneralLiabilityCoverage(Base):
    __tablename__ = "general_liability_coverages"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, index=True)
    coverage = Column(String)
    limit1 = Column(String)
    limit2 = Column(String)
    ded = Column(String)
    dedType = Column(String)
    basis = Column(String)
    appliesTo = Column(String)
    premium = Column(String)
    sortOrder = Column(String)
    level = Column(String)
    state = Column(String)
    location = Column(String)
    appliesPer = Column(String)
    otherDesc = Column(String)
    exposure = Column(String)
    rate = Column(String)
    misc = Column(String)
    numEmp = Column(String)
    retroDate = Column(String)
    comments = Column(Text)
    defaultStdCov = Column(Boolean, default=False)

    policy = relationship("Policy", backref="general_liability_coverages")


class GeneralLiabilityInfo(Base):
    __tablename__ = "general_liability_info"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, unique=True)
    liabilityCoverageType = Column(String)
    coverageBasis = Column(String)
    otherCoverages = Column(Text)

    policy = relationship("Policy", backref="general_liability_info")


class BusinessAutoCoverage(Base):
    __tablename__ = "business_auto_coverages"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, index=True)
    level = Column(String)
    state = Column(String)
    location = Column(String)
    coverage = Column(String)
    formSection = Column(String)
    limit1 = Column(String)
    limit2 = Column(String)
    premium = Column(String)
    dedType = Column(String)
    dedAmt = Column(String)
    sortOrder = Column(String)
    numOf = Column(String)
    rate = Column(String)
    misc = Column(String)

    policy = relationship("Policy", backref="business_auto_coverages")


class WorkersCompCoverage(Base):
    __tablename__ = "workers_comp_coverages"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, index=True)
    state = Column(String)
    employerId = Column(String)
    anniversaryDate = Column(String)
    participating = Column(String)
    retroPlan = Column(String)
    yearsRetro = Column(String)
    anniversaryRatingDate = Column(String)
    additionalInfo = Column(String)
    safetyGroup = Column(String)
    dividendPlan = Column(String)
    participatingBasis = Column(String)
    ncciId = Column(String)
    otherId = Column(String)

    policy = relationship("Policy", backref="workers_comp_coverages")


class BusinessAutoSymbol(Base):
    __tablename__ = "business_auto_symbols"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, unique=True)
    liability = Column(JSON, nullable=True)
    pip = Column(JSON, nullable=True)
    additionalPip = Column(JSON, nullable=True)
    medicalPayments = Column(JSON, nullable=True)
    uninsuredMotorist = Column(JSON, nullable=True)
    underinsuredMotorist = Column(JSON, nullable=True)
    towing = Column(JSON, nullable=True)
    comprehensive = Column(JSON, nullable=True)
    specifiedCauses = Column(JSON, nullable=True)
    collision = Column(JSON, nullable=True)

    policy = relationship("Policy", backref="business_auto_symbol")


class WorkersCompPart2(Base):
    __tablename__ = "workers_comp_part2"

    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, unique=True)
    liabilityCoverageType = Column(String)
    coverageType = Column(String)
    coverageBasis = Column(String)
    eachAccidentLimit = Column(String)
    diseasePolicyLimit = Column(String)
    diseaseEachEmployee = Column(String)
    deductible = Column(String)
    deductibleType = Column(String)
    appliesTo = Column(String)
    hasIncreasedLimits = Column(Boolean, default=False)
    incEachAccidentLimit = Column(String)
    incDiseasePolicyLimit = Column(String)
    incDiseaseEachEmployee = Column(String)
    incDeductible = Column(String)
    incDeductibleType = Column(String)
    incAppliesTo = Column(String)
    incFactor = Column(String)
    incFactoredPremium = Column(String)
    classificationsTotalPremium = Column(String)

    policy = relationship("Policy", backref="workers_comp_part2")


class UmbrellaCoverage(Base):
    __tablename__ = "umbrella_coverage"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False)
    level = Column(String)
    coverage = Column(String)
    state = Column(String)
    location = Column(String)
    limit1 = Column(String)
    limit2 = Column(String)
    retType = Column(String)
    retention = Column(String)
    premium = Column(String)
    sort = Column(String)
    exposure = Column(String)
    rate = Column(String)
    retAmount = Column(String)
    retBasis = Column(String)
    misc = Column(String)

    policy = relationship("Policy", backref="umbrella_coverages")

class UmbrellaInfo(Base):
    __tablename__ = "umbrella_info"
    id = Column(Integer, primary_key=True, index=True)
    policy_id = Column(Integer, ForeignKey("policies.id", ondelete="CASCADE"), nullable=False, unique=True)
    coverageType = Column(String, default="Umbrella")
    expiringPolicy = Column(String, default="")
    proposedRetroDate = Column(String, default="")
    currentRetroDate = Column(String, default="")
    firstDollarDefense = Column(String, default="No")

    policy = relationship("Policy", backref="umbrella_info")


class CustomerDocument(Base):
    __tablename__ = "customer_documents"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String, nullable=False)
    ext = Column(String)
    action = Column(String)
    description = Column(String)
    ref_num = Column(String)
    info = Column(String)
    b2_file_id = Column(String)
    url = Column(String)
    created_at = Column(String)
    author = Column(String)

    customer = relationship("Customer", back_populates="documents")

class MasterCertificate(Base):
    __tablename__ = "master_certificates"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    description = Column(String)
    form_type = Column(String)
    form_data = Column(JSON, nullable=True)
    created_date = Column(Date, default=date.today)

    customer = relationship("Customer", back_populates="master_certificates")
    holders = relationship("CertificateHolder", back_populates="certificate", cascade="all, delete-orphan")


class CertificateHolder(Base):
    __tablename__ = "certificate_holders"

    id                  = Column(Integer, primary_key=True, index=True)
    certificate_id      = Column(Integer, ForeignKey("master_certificates.id", ondelete="CASCADE"), nullable=False, index=True)
    customer_id         = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    name                = Column(String, nullable=False)
    contact             = Column(String, nullable=True)
    address             = Column(String, nullable=True)
    address2            = Column(String, nullable=True)
    city                = Column(String, nullable=True)
    state               = Column(String, nullable=True)
    zip                 = Column(String, nullable=True)
    email               = Column(String, nullable=True)
    fax                 = Column(String, nullable=True)
    fax_ext             = Column(String, nullable=True)
    issue_date          = Column(String, nullable=True)
    written_notice_days = Column(Integer, default=10)
    desc_of_ops         = Column(Text, nullable=True)
    same_as_master      = Column(Boolean, default=True)
    note                = Column(Text, nullable=True)
    print_note          = Column(Boolean, default=True)
    job_type            = Column(String, nullable=True)
    job_num             = Column(String, nullable=True)
    project_end_date    = Column(String, nullable=True)
    licensed            = Column(Boolean, default=False)
    bonded              = Column(Boolean, default=False)
    write_to_list       = Column(Boolean, default=False)
    distribution_method = Column(String, nullable=True)
    name_selection      = Column(String, nullable=True)
    additional_insured  = Column(JSON, nullable=True)   # {type: Y/N}
    waiver_subrogation  = Column(JSON, nullable=True)   # {type: Y/N}
    created_at          = Column(String, nullable=True)

    certificate = relationship("MasterCertificate", back_populates="holders")
    customer    = relationship("Customer", back_populates="certificate_holders")
