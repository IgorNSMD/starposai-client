// 📂 src/redux/types/companyTypes.ts

export interface ICompany {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    currency: string;
    address?: string;
    activeSubscription?: string;
    subscriptionHistory?: string[];
  }
  
  export interface IVenue {
    _id?: string;
    company: string;
    name: string;
    address?: string;
    phone?: string;
    status?: "active" | "inactive";
  }

  export interface IPlan {
    _id: string;
    name: string;
    price: number;
    description?: string;
    features: string[];
    isFree: boolean;
    allowedRoles: string[];
  }
  
  export interface ISubscription {
    _id: string;
    company: string;
    plan: IPlan; // 👈 Asegúrate de que sea un objeto y no string
    billingCycle: string;
    paymentMethod: string;
    status: string;
    paymentStatus: string;
    trialActive: boolean;
    trialEndDate?: string;
    lastPaymentDate?: string;
    renewalDate?: string;
    createdAt?: string;
    updatedAt?: string;
  }

  // export interface ISubscription {
  //   _id?: string;
  //   company: string;
  //   plan: IPlan; // 👈 Asegúrate de que sea un objeto y no string
  //   billingCycle: "monthly" | "yearly";
  //   paymentMethod: string;
  //   status: "active" | "inactive" | "pending" | "suspended";
  //   paymentStatus: "paid" | "pending" | "failed";
  //   renewalDate: string;
  // }
  