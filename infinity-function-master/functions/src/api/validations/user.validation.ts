import * as yup from 'yup';
import { AuthRole, AuthType } from '../../enums/auth.enum';

const PermissionValidation = yup.object().shape({
  page: yup.string().required(),
  role: yup.string().required()
});

export const StoreValidation = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  permissions: yup.array().of(PermissionValidation),
  authType: yup.string().equals([AuthType.EMAIL]).required(),
  authRole: yup.string().equals([AuthRole.COMMON, AuthRole.ADMINISTRATOR, AuthRole.DEVELOPER]).required(),
  password: yup.string()
    .min(8, 'The password must at least 8 characters.')
    .matches(/[0-9]/, 'The password must contain numbers.')
    .matches(/[a-zA-Z]/, 'The password must contain letters.')
    .matches(/[!@#$%&*()_=+;:,.?><\-]/, 'The password must contain special character.')
    .required(),
});

export const UpdateValidation = yup.object().shape({
  id: yup.string().required(),
  email: yup.string().email().nullable()
});

export const DeleteValidation = yup.object().shape({
  id: yup.string().required()
});
