export interface Customer {
  id: string;
  matchCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  type: 'Commercial' | 'Personal';
  createdDate: string;
  primaryExec: string;

  // Type / Settings
  customerType?: string;
  excludeTargetList?: boolean;
  excludePurge?: boolean;

  // Names
  nameType?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  firmName?: string;
  dba?: string;

  // Salutation
  formalSalutation?: string;
  informalSalutation?: string;
  altNameBilling?: boolean;

  // Agency Personnel
  executive?: string;
  representative?: string;
  brokersCustomer?: boolean;
  broker?: string;

  // Business Unit
  division?: string;
  branch?: string;
  department?: string;

  // Phone Numbers
  phoneResidence?: string;
  phoneResidenceExt?: string;
  phoneBusiness?: string;
  phoneBusinessExt?: string;
  fax?: string;
  faxExt?: string;
  cell?: string;
  cellExt?: string;
  pager?: string;
  pagerExt?: string;
  phoneOther?: string;
  phoneOtherExt?: string;

  // Internet
  email2?: string;
  web?: string;

  // Address extras
  address2?: string;
  country?: string;
  county?: string;
  latitude?: string;
  longitude?: string;
  altAddressBilling?: boolean;

  // Distribution / Contact Preferences
  preferredDistribution?: string;
  preferredMethod?: string;
  marketingSolicitation?: string;
  electronicDelivery?: string;
  notes?: string;

  // Business with Agency
  acquisition?: string;
  businessOrigin?: string;
  customerAddedDate?: string;

  // Referrals
  referralName?: string;
  referralLocation?: string;

  // Policy Checks
  autoCheckPolicies?: boolean;
  checkPersonal?: boolean;
  checkHealth?: boolean;
  checkCommercial?: boolean;
  checkNonPc?: boolean;
  checkLife?: boolean;
  checkFinancial?: boolean;
  checkBenefits?: boolean;

  // Other
  knownSinceYear?: string;
  notation?: string;
}

export const sampleCustomers: Customer[] = [];
