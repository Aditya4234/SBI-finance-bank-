export interface ICompany {
  id: string;
  companyName: string;
  cinNumber: string;
  gstNumber: string;
  panNumber: string;
  businessType: string;
  registeredAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  authorizedSignatory: {
    name: string;
    email: string;
    mobile: string;
    designation: string;
  };
  isVerified: boolean;
  kycStatus: string;
  isActive: boolean;
  adminId: string;
  employees: string[];
  createdAt: Date;
  updatedAt: Date;
}
