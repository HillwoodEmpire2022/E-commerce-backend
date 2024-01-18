import SellerProfile from '../models/sellerProfile.js';

export const adminGetAllSellers = async (req, res) => {
  try {
    const sellers = await SellerProfile.find().populate({
      path: 'user',
      select: 'email firstName lastName role ',
      match: { role: 'seller' },
    });
    if (!sellers || sellers.length === 0) {
      return res
        .status(404)
        .json({ message: 'No sellers available' });
    }
    return res.status(201).json({ data: { sellers } });
  } catch (error) {
    return res.status(500).json({ message: 'faled to get seller' });
  }
};
