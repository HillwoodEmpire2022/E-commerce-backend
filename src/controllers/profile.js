import SellerProfile from "../models/sellerProfile.js";

// By Seller Himself
export const updateProfile = async (req, res, next) => {
  try {
    const profile = await SellerProfile.findOneAndUpdate(
      { user: req.user._id },
      req.body
    );

    if (!profile)
      return res.status(404).json({
        status: "fail",
        message: "Profile not found",
      });

    res.status(200).json({
      status: "success",
      data: {
        profile: "Profile updated",
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
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
        status: "fail",
        message: "Profile not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: "Internal server error",
    });
  }
};
