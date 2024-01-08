import User from "../models/user.js";

export const adminGetAllSellers = async(req, res) =>{
try {
    const sellers = await User.find({role:"seller"});
    if(!sellers || sellers.length === 0){
   return res.status(500).json({message:"No sellers available"});

    }
    return res.status(201).json({data:{sellers}})
} catch (error) {
    console.log(error)
    return res.status(500).json({message:"faled to get seller"});
}
}; 