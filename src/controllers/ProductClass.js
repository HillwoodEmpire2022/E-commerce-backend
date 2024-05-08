import ProductClass from '../models/ProductClass.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';
import { productClassValidation } from '../validations/productClassValidation.js';

export const createProductClass = async (req, res) => {
  try {
    const { error } = productClassValidation.validate(
      req.body,
      {
        errors: { label: 'key', wrap: { label: false } },
        allowUnknown: true,
      }
    );

    if (error) {
      return res
        .status(400)
        .send({ message: error.message });
    }

    const productClass = await ProductClass.create({
      name: removeEmptySpaces(req.body.name),
    });

    return res.status(201).json({
      status: 'success',
      data: {
        productClass,
      },
    });
  } catch (error) {}
};

export const getProductClasses = async (req, res) => {
  try {
    const productClasses = await ProductClass.find();

    return res.status(201).json({
      status: 'success',
      data: {
        productClasses,
      },
    });
  } catch (error) {}
};
