import Brand from '../models/brand.model.js';
import removeEmptySpaces from '../utils/removeEmptySpaces.js';

export const createBrand = async (req, res) => {
  try {
    const { name, productClass } = req.body;

    // Validate the input data
    if (!name || !productClass) {
      return res.status(400).json({
        error: 'Name and productClass id are required',
      });
    }

    // Check if brand with name and productClass exists
    const existingBrand = await Brand.findOne({
      name,
      productClass,
    });
    if (existingBrand) {
      return res.status(409).json({
        error:
          'Brand with the same name and productClass already exists',
      });
    }

    const brand = await Brand.create({
      name: removeEmptySpaces(name),
      productClass,
    });

    // Return a success response
    return res
      .status(201)
      .json({ status: 'success', data: { brand } });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: 'Internal server error' });
  }
};

// get all brands
export const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find();

    // Return a success response
    return res
      .status(200)
      .json({ status: 'success', data: { brands } });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error' });
  }
};

// get a single brand
export const getBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the brand by id
    const brand = await Brand.findById(id);

    // Check if brand exists
    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found',
      });
    }

    // Return a success response
    return res
      .status(200)
      .json({ status: 'success', data: { brand } });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error' });
  }
};

// update a brand
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, productClass } = req.body;

    // Validate the input data
    if (!name || !productClass) {
      return res.status(400).json({
        error: 'Name and productClass id are required',
      });
    }

    // Find the brand by id
    const brand = await Brand.findById(id);

    // Check if brand exists
    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found',
      });
    }

    // Update the brand
    brand.name = removeEmptySpaces(name);
    brand.productClass = productClass;
    await brand.save();

    // Return a success response
    return res
      .status(200)
      .json({ status: 'success', data: { brand } });
  } catch (error) {
    res
      .status(500)
      .json({ error: 'Internal server error' });
  }
};

// delete a brand
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the brand by id
    const brand = await Brand.findById(id);

    // Check if brand exists
    if (!brand) {
      return res.status(404).json({
        error: 'Brand not found',
      });
    }

    // Delete the brand
    await brand.deleteOne({ _id: id });

    // Return a success response
    return res.status(200).json({
      status: 'success',
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: 'Internal server error' });
  }
};
