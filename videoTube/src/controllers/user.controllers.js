import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js';
import { User } from '../models/user.models.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  // validation
  // if(fullname?.trim() === "") {
  //   throw new ApiErrors(400, "All fields are required")
  // }
  if(
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiErrors(400, "all fields are required");
  }

  // check if its an existing user
  const existedUser = await User.findOne({
    $or: [{username}, {email}]
  });
  if (existedUser) {
    throw new ApiErrors(409, "user with email or username already exists");
  };

  console.warn(req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path; 
  const coverLocalPath = req.files?.coverImage?.[0]?.path; 
  if (!avatarLocalPath) {
    throw new ApiErrors(400, "Avatar file is missing");
  };

  // now upload on cloudinary
  // const avatar = await uploadOnCloudinary(avatarLocalPath);
  // let coverImage = ""
  // if(coverLocalPath) {
  //   coverImage = await uploadOnCloudinary(coverLocalPath);
  // }

  let avatar = ''
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Uploaded Avatar", avatar); 
  } catch (error){
    console.log("error uploading avatar:", error);
    throw new ApiErrors(500, "Failed to uplaod avatar")
  }

  let coverImage = ''
  try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("Uploaded cover image", coverImage); 
  } catch (error){
    console.log("error uploading cover image:", error);
    throw new ApiErrors(500, "Failed to upload coverImage")
  }

  try {
    const user = await User.create({
      fullname, 
      avatar: avatar.url,
      coverImage: coverImage?.url || '',
      email, 
      password, 
      username: username.toLowerCase()
    });
  
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken "
    ); 
  
    if(!createdUser) {
      throw new ApiErrors(500, "Something went wrong while regestering a user ");
    }
  
    return res
    .status(201)
    .json( new ApiResponse(200, createdUser, "User registered successfully."))
  } catch (error) {
    console.log("User creation failed");

    if (avatar) {
      await deleteFromCloudinary(avatar.public_id);
    }
    if (coverImage) {
      await deleteFromCloudinary(coverImage.public_id);
    }

    throw new ApiErrors(500, "Something went wrong while regestering a user and the images were deleted");

  }

}) 

export { registerUser }