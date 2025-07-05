import { RootState } from "../store/store";

export const getActiveContext = (state: RootState) => {
  const { activeCompanyId, activeVenueId, id: activeUserId } = state.auth.userInfo || {};

  if (!activeCompanyId || !activeVenueId || !activeUserId) {
    throw new Error("Faltan datos de companyId o venueId");
  }
  return { activeCompanyId, activeVenueId, activeUserId };
};
