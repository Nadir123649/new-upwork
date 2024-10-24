import * as yup from "yup";

export const signUpSchema = yup.object({
  fullName: yup
    .string("Name should be string")
    .required("Full name is required")
    .min(2, "Name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),
  email: yup
    .string("Email should be string")
    .required("Email is required")
    .email("Not a valid email"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number can only contain numbers"),
  password: yup
    .string("Password should be string")
    .required("Password is required")
    .min(5, "Password should be at least 5 characters")
    .max(20, "Password should be less than 20 characters"),
  cPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
  personal: yup
    .string(),
  professional: yup
    .string(),
  subscriptionType: yup
    .string()
    .oneOf(['standard', 'premium'], "Invalid subscription type")
    .required("Subscription type is required"),
});

export const logInSchema = yup.object({
  email: yup
    .string("Email should be string")
    .required("Email is required")
    .email("Not a valid email"),
  password: yup
    .string("Password should be string")
    .required("Password is required")
    .min(5, "Password should be at least 5 characters")
    .max(20, "Password should be less than 20 characters")
});