import User from "../src/models/user.js";

 export const findUserById = async(userId) => {
    const userInfo = await User.findById(userId);
    if(userInfo == null){
        return false;
    }
    return userInfo;
}