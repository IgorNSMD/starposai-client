// 📂 src/validation/registrationSchemas.ts
import * as yup from "yup";

// 📌 Paso 1: Empresa
export const companySchema = yup.object().shape({
  name: yup.string().min(3, "Debe tener al menos 3 caracteres").required("El nombre de la empresa es obligatorio"),
  email: yup.string().email("Correo inválido").required("El correo electrónico es obligatorio"),
  phone: yup.string().matches(/^[0-9]+$/, "Solo se permiten números").min(8, "Debe tener al menos 8 dígitos"),
  address: yup.string().min(5, "Debe tener al menos 5 caracteres").nullable(),
  currency: yup.string().required("Selecciona una moneda"),
});

// 📌 Paso 2: Local
export const venueSchema = yup.object().shape({
  name: yup.string()
    .when("sameAsCompany", {
      is: false, // Solo es requerido si sameAsCompany es falso
      then: (schema) => schema.required("El nombre del local es obligatorio"),
      otherwise: (schema) => schema.notRequired(), // Si el checkbox está marcado, no requiere validación
    }),
  phone: yup.string().matches(/^[0-9]+$/, "Solo se permiten números").min(8, "Debe tener al menos 8 dígitos"),
});

// 📌 Paso 3: Usuario
export const userSchema = yup.object().shape({
  name: yup.string().min(3, "Debe tener al menos 3 caracteres").required("El nombre es obligatorio"),
  email: yup.string().email("Correo inválido").required("El correo electrónico es obligatorio"),
  password: yup.string().min(6, "Debe tener al menos 6 caracteres").required("La contraseña es obligatoria"),
});
