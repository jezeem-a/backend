import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiErrors } from '../utils/ApiErrors.js';
import { User } from '../models/user.models.js';
import { deleteFromCloudinary, uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

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

});

const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new ApiErrors(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiErrors(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiErrors(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

});

const logoutUser = asyncHandler( async (req, res) => { 
  await User.findByIdAndUpdate(
    // after middleware this
    // req.user._id,
  )
})

const refreshAccessToken = asyncHandler( async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if(!incomingRefreshToken) {
    throw new ApiErrors(401, "refresh token is required");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id); 

    if(!user) {
      throw new ApiErrors(401, "Invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiErrors(401, "Invalid refresh Token");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefereshTokens(user._id);


    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}), "Access token refreshed successfully")

  } catch (error) {
    throw new ApiErrors(500, "Something went wrong while refreshing access token")
  }
});

export { registerUser, loginUser, refreshAccessToken }