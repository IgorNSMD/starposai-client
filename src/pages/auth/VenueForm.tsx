import React, { useEffect } from "react";
import { Formik, Form, ErrorMessage } from "formik";
import { Box, TextField, Checkbox, FormControlLabel, Button, MenuItem } from "@mui/material";

import { venueSchema } from "../../validation/registrationSchemas";
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { setVenueData } from "../../store/slices/registrationSlice";


const VenueForm: React.FC<{ handleNext: () => void; handleBack: () => void }> = ({ handleNext, handleBack }) => {
  const dispatch = useAppDispatch();
  const company = useAppSelector((state) => state.registration.company); // Datos de la empresa
  const venue = useAppSelector((state) => state.registration.venue); // Datos del local
  const currencies = useAppSelector((state) => state.parameters.parametersByCategory["Currency"] || []);

  // 📌 useEffect para sincronizar datos cuando el checkbox está activado
  useEffect(() => {
    if (venue.sameAsCompany) {
      dispatch(setVenueData({
        name: company.name,
        email: company.email,
        phone: company.phone,
        address: company.address,
        currency: company.currency,
        password: "" // ⚠️ La contraseña debe ser ingresada manualmente
      }));
    }
  }, [venue.sameAsCompany, company, dispatch]);

  return (
    <Formik
      enableReinitialize
      initialValues={venue}
      validationSchema={venueSchema}
      onSubmit={(values) => {
        dispatch(setVenueData(values));
        handleNext();
      }}
    >
      {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
        <Form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Checkbox para copiar datos de la empresa */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={values.sameAsCompany}
                  onChange={(e) => {
                    handleChange(e);
                    if (!e.target.checked) {
                      setFieldValue("name", "");
                      setFieldValue("email", "");
                      setFieldValue("phone", "");
                      setFieldValue("address", "");
                      setFieldValue("currency", "");                      
                    }
                    else{
                      setFieldValue("name", company.name);
                      setFieldValue("email", company.email);
                      setFieldValue("phone", company.phone);
                      setFieldValue("address", company.address);
                      setFieldValue("currency", company.currency);                      
                    }
                  }}
                  name="sameAsCompany"
                  
                />
              }
              label="Obtener datos panel empresa"
            />

            {/* Nombre del Local */}
            <TextField
              name="name"
              label="Nombre del Local"
              fullWidth
              value={values.name}
              onChange={handleChange}
              error={touched.name && Boolean(errors.name)}
              helperText={<ErrorMessage name="name" />}
              disabled={values.sameAsCompany}
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

            {/* Correo Usuario */}
            <TextField
              name="email"
              label="Correo Usuario"
              fullWidth
              value={values.email}
              onChange={handleChange}
              error={touched.email && Boolean(errors.email)}
              helperText={<ErrorMessage name="email" />}
              disabled={values.sameAsCompany}
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
  
              
              {/* Teléfono */}
            <TextField
              name="address"
              label="Dirección"
              fullWidth
              value={values.address}
              onChange={handleChange}
              error={touched.address && Boolean(errors.address)}
              helperText={<ErrorMessage name="address" />}
              disabled={values.sameAsCompany}
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
              disabled={values.sameAsCompany}
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

            {/* <TextField
              name="currency"
              label="Moneda"
              fullWidth
              value={values.currency}
              onChange={handleChange}
              error={touched.currency && Boolean(errors.currency)}
              helperText={<ErrorMessage name="currency" />}
              disabled={values.sameAsCompany}
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
            /> */}

            {/* Contraseña */}
            <TextField
              name="password"
              label="Contraseña"
              type="password"
              fullWidth
              value={values.password}
              onChange={handleChange}
              error={touched.password && Boolean(errors.password)}
              helperText={<ErrorMessage name="password" />}
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

            {/* Botones de navegación */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={handleBack}>
                Atrás
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

export default VenueForm;