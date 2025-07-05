// 📂 src/redux/types/userTypes.ts

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    companyVenues: {
      companyId: string;
      venueId: string;
      role: string;
    }[];
    activeCompanyId?: string;
    activeVenueId?: string;
    isOwner: boolean;
  }
  