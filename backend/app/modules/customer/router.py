"""
Customer Router
---------------
Thin HTTP layer for the Customer domain.
All business logic and DB queries are delegated to service.py / repository.py.

Endpoints:
  GET    /api/customers/        → list all customers
  GET    /api/customers/{id}    → get single customer
  POST   /api/customers/        → create customer
  PUT    /api/customers/{id}    → update customer
  DELETE /api/customers/{id}    → delete customer
"""
from fastapi import APIRouter, Depends, Response, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from starlette.concurrency import run_in_threadpool

from app.database.connection import get_db
from app.modules.auth.deps import get_current_user
from app.core.b2 import upload_file_to_b2
from app.modules.customer.schema import (
    CustomerCreate,
    CustomerUpdate,
    Customer as CustomerSchema,
    Policy as PolicySchema,
    PolicyCreate,
    CustomerNote as CustomerNoteSchema,
    CustomerNoteCreate,
    CustomerNoteUpdate,
)
from app.modules.customer import service as customer_service

router = APIRouter()


@router.get("/", response_model=List[CustomerSchema])
def list_customers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.list_customers(db)


@router.get("/{customer_id}", response_model=CustomerSchema)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.get_customer(db, customer_id)


@router.post("/", response_model=CustomerSchema, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.create_customer(db, customer.model_dump())


@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.update_customer(db, customer_id, customer.model_dump(exclude_unset=True))


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    customer_service.delete_customer(db, customer_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{customer_id}/policies", response_model=List[PolicySchema])
def list_policies(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.list_policies(db, customer_id)


@router.post("/{customer_id}/policies", response_model=PolicySchema, status_code=status.HTTP_201_CREATED)
def create_policy(
    customer_id: int,
    policy: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.create_policy(db, customer_id, policy.model_dump())


@router.put("/{customer_id}/policies/{policy_id}", response_model=PolicySchema)
def update_policy(
    customer_id: int,
    policy_id: int,
    policy: PolicyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.update_policy(db, customer_id, policy_id, policy.model_dump())


@router.get("/{customer_id}/notes", response_model=List[CustomerNoteSchema])
def list_customer_notes(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.list_customer_notes(db, customer_id)


@router.post("/{customer_id}/notes", response_model=CustomerNoteSchema, status_code=status.HTTP_201_CREATED)
def create_customer_note(
    customer_id: int,
    note: CustomerNoteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.create_customer_note(db, customer_id, note.model_dump())


@router.put("/{customer_id}/notes/{note_id}", response_model=CustomerNoteSchema)
def update_customer_note(
    customer_id: int,
    note_id: int,
    note: CustomerNoteUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.update_customer_note(db, customer_id, note_id, note.text)


@router.delete("/{customer_id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_note(
    customer_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    customer_service.delete_customer_note(db, customer_id, note_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from app.modules.customer import schema

@router.get("/{customer_id}/policies/{policy_id}/general-liability", response_model=List[schema.GeneralLiabilityCoverage])
def get_gl_coverages(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.get_gl_coverages(db, customer_id, policy_id)

@router.put("/{customer_id}/policies/{policy_id}/general-liability", response_model=List[schema.GeneralLiabilityCoverage])
def update_gl_coverages(
    customer_id: int, policy_id: int, coverages: List[schema.GeneralLiabilityCoverageCreate], db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_gl_coverages(db, customer_id, policy_id, [c.model_dump() for c in coverages])

@router.get("/{customer_id}/policies/{policy_id}/general-liability/info", response_model=schema.GeneralLiabilityInfo)
def get_gl_info(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    info = customer_service.get_gl_info(db, customer_id, policy_id)
    if not info:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return info

@router.put("/{customer_id}/policies/{policy_id}/general-liability/info", response_model=schema.GeneralLiabilityInfo)
def update_gl_info(
    customer_id: int, policy_id: int, info: schema.GeneralLiabilityInfoCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_gl_info(db, customer_id, policy_id, info.model_dump())

@router.get("/{customer_id}/policies/{policy_id}/business-auto", response_model=List[schema.BusinessAutoCoverage])
def get_ba_coverages(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.get_ba_coverages(db, customer_id, policy_id)

@router.put("/{customer_id}/policies/{policy_id}/business-auto", response_model=List[schema.BusinessAutoCoverage])
def update_ba_coverages(
    customer_id: int, policy_id: int, coverages: List[schema.BusinessAutoCoverageCreate], db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_ba_coverages(db, customer_id, policy_id, [c.model_dump() for c in coverages])

@router.get("/{customer_id}/policies/{policy_id}/workers-comp", response_model=List[schema.WorkersCompCoverage])
def get_wc_coverages(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.get_wc_coverages(db, customer_id, policy_id)

@router.put("/{customer_id}/policies/{policy_id}/workers-comp", response_model=List[schema.WorkersCompCoverage])
def update_wc_coverages(
    customer_id: int, policy_id: int, coverages: List[schema.WorkersCompCoverageCreate], db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_wc_coverages(db, customer_id, policy_id, [c.model_dump() for c in coverages])

@router.get("/{customer_id}/policies/{policy_id}/business-auto/symbols", response_model=schema.BusinessAutoSymbol)
def get_ba_symbols(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    symbols = customer_service.get_ba_symbols(db, customer_id, policy_id)
    if not symbols:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return symbols

@router.put("/{customer_id}/policies/{policy_id}/business-auto/symbols", response_model=schema.BusinessAutoSymbol)
def update_ba_symbols(
    customer_id: int, policy_id: int, symbols: schema.BusinessAutoSymbolCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_ba_symbols(db, customer_id, policy_id, symbols.model_dump())

@router.get("/{customer_id}/policies/{policy_id}/workers-comp/part2", response_model=schema.WorkersCompPart2)
def get_wc_part2(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    part2 = customer_service.get_wc_part2(db, customer_id, policy_id)
    if not part2:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return part2

@router.put("/{customer_id}/policies/{policy_id}/workers-comp/part2", response_model=schema.WorkersCompPart2)
def update_wc_part2(
    customer_id: int, policy_id: int, part2: schema.WorkersCompPart2Create, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_wc_part2(db, customer_id, policy_id, part2.model_dump())

@router.get("/{customer_id}/policies/{policy_id}/umbrella", response_model=List[schema.UmbrellaCoverage])
def get_umbrella_coverages(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.get_umbrella_coverages(db, customer_id, policy_id)

@router.put("/{customer_id}/policies/{policy_id}/umbrella", response_model=List[schema.UmbrellaCoverage])
def update_umbrella_coverages(
    customer_id: int, policy_id: int, coverages: List[schema.UmbrellaCoverageCreate], db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.replace_umbrella_coverages(db, customer_id, policy_id, [c.model_dump() for c in coverages])

@router.get("/{customer_id}/policies/{policy_id}/umbrella/info", response_model=schema.UmbrellaInfo)
def get_umbrella_info(
    customer_id: int, policy_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    info = customer_service.get_umbrella_info(db, customer_id, policy_id)
    if not info:
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    return info

@router.get("/{customer_id}/documents", response_model=List[schema.CustomerDocument])
def list_customer_documents(
    customer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.list_customer_documents(db, customer_id)

@router.post("/{customer_id}/documents", response_model=schema.CustomerDocument, status_code=status.HTTP_201_CREATED)
async def create_customer_document(
    customer_id: int,
    file: UploadFile = File(...),
    action: str = Form(...),
    description: str = Form(""),
    refNum: str = Form(""),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    # Read file content
    content = await file.read()
    file_name = file.filename or "document"
    ext = file_name.split('.')[-1].upper() if '.' in file_name else ""
    
    # Upload to B2 in a thread pool to avoid blocking the event loop
    b2_result = await run_in_threadpool(upload_file_to_b2, content, f"customer_{customer_id}_{file_name}")
    
    # Create DB record
    doc_data = {
        "file_name": file_name,
        "ext": ext,
        "action": action,
        "description": description,
        "ref_num": refNum,
        "info": "Upload",
        "b2_file_id": b2_result["b2_file_id"],
        "url": b2_result["url"],
        "author": current_user.get("email", "YOU").split('@')[0].upper() if isinstance(current_user, dict) else "SYSTEM"
    }
    
    return customer_service.create_customer_document(db, customer_id, doc_data)

@router.get("/{customer_id}/certificates", response_model=List[schema.MasterCertificateResponse])
def list_master_certificates(
    customer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.list_master_certificates(db, customer_id)

@router.post("/{customer_id}/certificates", response_model=schema.MasterCertificateResponse, status_code=status.HTTP_201_CREATED)
def create_master_certificate(
    customer_id: int, cert: schema.MasterCertificateCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.create_master_certificate(db, customer_id, cert.model_dump())


@router.get("/{customer_id}/certificates/{certificate_id}", response_model=schema.MasterCertificateResponse)
def get_master_certificate(
    customer_id: int, certificate_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.get_master_certificate(db, customer_id, certificate_id)

@router.put("/{customer_id}/certificates/{certificate_id}", response_model=schema.MasterCertificateResponse)
def update_master_certificate(
    customer_id: int, certificate_id: int, cert: schema.MasterCertificateCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    return customer_service.update_master_certificate(db, customer_id, certificate_id, cert.model_dump(exclude_unset=True))

@router.delete("/{customer_id}/certificates/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_master_certificate(
    customer_id: int, certificate_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)
):
    customer_service.delete_master_certificate(db, customer_id, certificate_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ── Certificate Holders ────────────────────────────────────────────────────────

@router.get(
    "/{customer_id}/certificates/{certificate_id}/holders",
    response_model=List[schema.CertificateHolderResponse],
) 
def list_certificate_holders(
    customer_id: int,
    certificate_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.list_certificate_holders(db, customer_id, certificate_id)


@router.post(
    "/{customer_id}/certificates/{certificate_id}/holders",
    response_model=schema.CertificateHolderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_certificate_holder(
    customer_id: int,
    certificate_id: int,
    holder: schema.CertificateHolderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.create_certificate_holder(
        db, customer_id, certificate_id, holder.model_dump()
    )


@router.put(
    "/{customer_id}/certificates/{certificate_id}/holders/{holder_id}",
    response_model=schema.CertificateHolderResponse,
)
def update_certificate_holder(
    customer_id: int,
    certificate_id: int,
    holder_id: int,
    holder: schema.CertificateHolderCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return customer_service.update_certificate_holder(
        db, customer_id, holder_id, holder.model_dump(exclude_unset=True)
    )


@router.delete(
    "/{customer_id}/certificates/{certificate_id}/holders/{holder_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_certificate_holder(
    customer_id: int,
    certificate_id: int,
    holder_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    customer_service.delete_certificate_holder(db, customer_id, holder_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
