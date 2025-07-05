// src/styles/formPageStyles.ts
import { SxProps, Theme } from "@mui/material";

export const formPageStyles: Record<string, SxProps<Theme>> = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    px: { xs: 1, sm: 2, md: 4 },
    py: 2,
    width: "100%",
    maxWidth: "1000px",
    mx: "auto",
    boxSizing: "border-box",
  },
  sectionCard: {
    p: { xs: 2, md: 3 },
    boxShadow: 1,
    borderRadius: 2,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: { xs: "1.2rem", md: "1.5rem" },
    fontWeight: "bold",
    mb: 2,
    color: "#333",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    width: "100%",
    maxWidth: 500,
    '@media (max-width:600px)': {
      maxWidth: "100%",
    },
  },
  formRow: {
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    gap: 2,
    alignItems: "center",
  },
  inputField: {
    width: "100%",
  },
  selectField: {
    minWidth: 350,
    '@media (max-width:600px)': {
      minWidth: '100%',
    },
  },
  saveButton: {
    alignSelf: "flex-start",
    mt: 2,
    width: { xs: "100%", sm: "auto" },
    minWidth: 120,
    backgroundColor: "#47b2e4",
    "&:hover": {
      backgroundColor: "#2196f3",
    },
  },
  cancelButton: {
    minWidth: 120,
    borderColor: "#aaa",
    color: "#555",
    "&:hover": {
      backgroundColor: "#eee",
    },
  },
  datagridBox: {
    mt: 2,
    width: "100%",
    overflowX: "auto",
  },
  datagridStyle: {
    border: "none",
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#37517e",
      color: "#fff",
      fontWeight: "bold",
    },
    "& .MuiDataGrid-cell": {
      color: "#333",
    },
    "& .MuiDataGrid-row:hover": {
      backgroundColor: "#f5f5f5",
    },
    "& .MuiDataGrid-footerContainer": {
      justifyContent: "center",
    },
  },
};
