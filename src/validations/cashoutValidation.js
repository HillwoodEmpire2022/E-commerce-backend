import Joi from 'joi';

const cashoutValidator = Joi.object({
  phoneNumber: Joi.string().required(),
  amount: Joi.number().required(),
});

export default cashoutValidator;
