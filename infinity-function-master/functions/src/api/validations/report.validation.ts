import * as yup from 'yup';

export const NeuroValidation = yup.object().shape({
  accessId: yup.string().required(),
  assessmentId: yup.string().required()
});
