/* 
id string pk
  watchHistory ObjectId[] videos
  username string
  email string
  fullName string
  avatar string
  coverImage string
  password string
  refreshToken string
  createdAt string
  updatedAt string
*/

import mongoose, { Schema } from 'mongoose';


const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String, //cloudinary url
      required: true, 
    },
    coverImage: {
      type: String,
    },
    // this array will hold objects
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video"
      }
    ],
    password: {
      type: String,
      // pass the message to front end
      required: [true, "password is required"]
    },
    refreshToken: {
      type: String
    }
  },
  // automatically create fields like createdAt & updatedAt
  { timestamps: true }
)

export const User = mongoose.model("User", userSchema);

// mongoose automatically creates an _id for all