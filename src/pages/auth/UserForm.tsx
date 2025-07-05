// 📂 src/pages/auth/UserForm.tsx
import React from "react";
import { Formik, Form, } from "formik";
import { Box,Button,TextField } from "@mui/material";

import { userSchema } from "../../validation/registrationSchemas";
import { useAppDispatch, useAppSelector } from '../../store/redux/hooks';
import { setUserData } from "../../store/slices/registrationSlice";

const UserForm: React.FC<{ handleNext: () => void; handleBack: () => void }> = ({ handleNext,handleBack }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.registration.user); // Obtener datos guardados

  // const [formData, setFormData] = React.useState({
  //   name: "",
  //   email: "",
  //   password: "",
  // });


  return (
    <Formik
      enableReinitialize
      initialValues={user}
      validationSchema={userSchema}
      onSubmit={(values) => {
        dispatch(setUserData(values));
        handleNext();
      }}
    >
      {({ handleChange, handleSubmit, values }) => (
        <Form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="name"
              label="Nombre"
              fullWidth
              value={values.name} // ✅ Ahora Formik mantiene el estado
              onChange={handleChange}
            />
            <TextField
              name="email"
              label="Correo"
              fullWidth
              type="email"
              value={values.email} // ✅ Se mantiene el estado
              onChange={handleChange}
            />
            <TextField
              name="password"
              label="Contraseña"
              fullWidth
              type="password"
              value={values.password} // ✅ Persistencia correcta
              onChange={handleChange}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button onClick={handleBack} variant="outlined">
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

export default UserForm;
