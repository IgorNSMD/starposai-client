// 📂 src/pages/auth/CompanyForm.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate

import { Formik, Form, ErrorMessage } from "formik";
import { Box, TextField, MenuItem, Button } from "@mui/material";

import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { fetchParametersByCategory } from '../../store/slices/parameterSlice';
import { companySchema } from "../../validation/registrationSchemas";
import { setCompanyData } from "../../store/slices/registrationSlice";


const CompanyForm: React.FC<{ handleNext: () => void }> = ({ handleNext }) => {
  const dispatch = useAppDispatch();
  const company = useAppSelector((state) => state.registration.company); // Obtener datos de Redux
  const currencies = useAppSelector((state) => state.parameters.parametersByCategory["Currency"] || []);

  const navigate = useNavigate(); // Hook para redirigir al Home

  useEffect(() => {
    if (currencies.length === 0) {  // 🚀 Solo ejecuta si aún no se han cargado las monedas
      //console.log("🚀 Solo ejecuta si aún no se han cargado las monedas");
      dispatch(fetchParametersByCategory("Currency"));
      //dispatch(setSelectedRole('PLAN_1')); // 👈 Guardar el rol seleccionado en Redux
    }
  }, [dispatch, currencies]);

  //console.log('currencies', currencies)

  return (
    <Formik
      enableReinitialize // ✅ Mantiene los datos al retroceder
      initialValues={company}
      validationSchema={companySchema}
      onSubmit={(values) => {
        dispatch(setCompanyData(values));
        handleNext(); // 🔹 Avanza al siguiente paso
      }}
    >
      {({ handleChange, handleSubmit, values, errors, touched }) => (
        <Form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="name"
              label="Nombre de la Empresa"
              fullWidth
              value={values.name}
              onChange={handleChange}
              error={touched.name && Boolean(errors.name)}
              helperText={<ErrorMessage name="name" />}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
            />

            <TextField
              name="email"
              label="Correo Electrónico"
              fullWidth
              value={values.email}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={<ErrorMessage name="email" />}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
            />

            <TextField
              name="phone"
              label="Teléfono"
              fullWidth
              value={values.phone}
              onChange={handleChange}
              error={touched.phone && Boolean(errors.phone)}
              helperText={<ErrorMessage name="phone" />}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
            />

            <TextField
              name="address"
              label="Dirección"
              fullWidth
              value={values.address}
              onChange={handleChange}
              error={touched.address && Boolean(errors.address)}
              helperText={<ErrorMessage name="address" />}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
            />

            <TextField
              name="currency"
              label="Moneda"
              select
              fullWidth
              value={currencies.some(option => option.key === values.currency) ? values.currency : ""}
              onChange={handleChange}
              error={touched.currency && Boolean(errors.currency)}
              helperText={<ErrorMessage name="currency" />}
              slotProps={{
                inputLabel: {
                  shrink: true,
                  sx: {
                    color: '#444444',
                    '&.Mui-focused': {
                      color: '#47b2e4',
                    },
                  },
                },
              }}
            >
              {currencies.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.value}
                </MenuItem>
              ))}
            </TextField>

            {/* Botones de navegación */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => navigate("/")}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Siguiente
              </Button>
            </Box>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default CompanyForm;