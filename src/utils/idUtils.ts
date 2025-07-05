export const extractId = (field: string | { _id: string }) =>
    typeof field === "string" ? field : field._id;
  