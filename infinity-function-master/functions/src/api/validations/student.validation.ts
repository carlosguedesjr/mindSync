import * as yup from 'yup';
import { AuthType } from '../../enums/auth.enum';

export const StoreValidation = yup.object().shape({
  name: yup.string().required(),
  email: yup.string().email().required(),
  authType: yup.string().equals([AuthType.EMAIL]).required(),
  password: yup.string()
    .min(6, 'The password must at least 6 characters.')
    .matches(/[0-9]/, 'The password must contain numbers.')
    .matches(/[a-zA-Z]/, 'The password must contain letters.')
    .required(),
});

export const UpdateValidation = yup.object().shape({
  id: yup.string().required(),
  email: yup.string().email().nullable()
});

export const DeleteValidation = yup.object().shape({
  id: yup.string().required()
});
