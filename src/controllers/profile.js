import SellerProfile from '../models/sellerProfile.js';
import { base64FileStringGenerator } from '../utils/base64Converter.js';
import { uploadbusinessLogoToCloudinary } from '../utils/cloudinary.js';
// By Seller Himself
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await SellerProfile.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });

    if (!profile)
      return res.status(404).json({
        status: 'fail',
        message: 'Profile not found',
      });

    if (req.file) {
      let logoString = base64FileStringGenerator(req.file).content;
      if (!logoString) {
        return res.status(404).json({ message: 'No uploaded logo' });
      }
      const companyLogo = await uploadbusinessLogoToCloudinary(logoString, profile.businessLogo);
      profile.logo = companyLogo.url;
    }
    await profile.save();

    res.status(200).json({
      status: 'success',
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const getProfile = async (req, res, next) => {
  try {
    let profile;
    if (!req.params?.id) {
      profile = await SellerProfile.findOne({ user: req.user._id });
    } else {
      profile = await SellerProfile.findById(req.params.id);
    }

    if (!profile) {
      return res.status(400).json({
        status: 'fail',
        message: 'Profile not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      status: 'fail',
      message: 'Internal server error',
    });
  }
};
