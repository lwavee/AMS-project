# Policy Management Workflow

## Overview
The Policy Management flow consists of two primary endpoints:
1. **Creation:** `app/agency/customer/[id]/new-policy/page.tsx`
2. **Details / View:** `app/agency/customer/[id]/policy/[policyId]/page.tsx`

This document serves to explain the complex data mapping and state management within the Details view.

## Data Mapping & Fallbacks
When a user views a policy, the UI pulls a massive JSON object representing the policy details. 
Because legacy systems often have sparse data (or fields that were not filled out during creation), **every input field must have a fallback**.
- Fallback text should be `—` (an em-dash), not empty strings, to preserve UI spacing and grid integrity.
- **Example:** `<input type="text" readOnly value={policy.division || "—"} />`

### Key Data Groupings
We mapped the dense AMS360 desktop UI into the following logical panels:
- **Upper Core Details:** Effective Date, Transaction, Description.
- **Basic Policy Information:** Policy #, Issue State, Carrier Status, Policy Flags.
- **Company Details:** Company Type, Parent, Writing Company, Underwriter.
- **Personnel & Business Unit:** Exec, Rep, Broker, Division, Branch, Department.
- **Additional Policy Information:** First Written, Business Origin, Agency Class, Broker of Record Dates, Commission configurations.
- **Policy Premium Totals:** Premium, Fees, Billed/Unbilled metrics.
- **Billing / Payment:** Bill Method, Pay Plan, Installment Dates.

## Interactive Line of Business Grid

The Line of Business table breaks away from static rendering by implementing local, inline state manipulation. This allows the user to Add, Edit, and Delete rows rapidly without navigating away or opening modal popups.

### State Management
The page uses the following React hooks to manage the grid:
- `lobs`: An array holding the list of active Line of Business objects.
- `newLob`: A staging object holding the form data for the row currently being added or edited.
- `selectedLobIndex`: An integer tracking which row the user has highlighted. Null if no row is selected.
- `isAddingLob`: A boolean controlling the visibility of the inline slide-down form.
- `isEditingLob`: A boolean determining whether the inline form is in "Add" mode or "Save (Edit)" mode.

### User Flow
1. **Selection:** Clicking a `<tr>` sets the `selectedLobIndex`. This enables the Edit and Delete buttons.
2. **Adding:** Clicking "New" clears `selectedLobIndex` and opens the inline form (`isAddingLob = true`). The Add button pushes the `newLob` into the `lobs` array.
3. **Editing:** With a row selected, clicking "Edit" populates `newLob` with `lobs[selectedLobIndex]` and opens the form in edit mode (`isEditingLob = true`). Clicking "Save" replaces the object at the exact index in the array.
4. **Deleting:** Clicking "Delete" filters the `lobs` array, removing the selected index entirely.

*Note for Future Integration: Currently, `lobs` is managed strictly in local state. When integrating with the backend API, the `handleAddLob`, `handleSaveEdit`, and `handleDeleteLob` functions should be updated to execute `fetch` POST/PUT/DELETE requests against the Policy API.*