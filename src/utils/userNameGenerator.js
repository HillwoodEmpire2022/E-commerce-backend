import User from "../models/user.js";

export const generateUserName = async () => {
  const recentRegisteredUser = await User.find().sort({ _id: -1 }).limit(1);
  let newUserName = "";

  if (recentRegisteredUser.length !== 0) {
    const collectionCount = recentRegisteredUser[0].username.slice(4);
    newUserName = `user${parseInt(collectionCount) + 1}`;
  } else {
    newUserName = `user${1}`;
  }

  return newUserName;
};
