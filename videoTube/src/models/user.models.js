import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
);

// pass encryption
// not safe to use arrow func here
// always assign next
userSchema.pre("save", async function(next) {
  if(!this.modified("password")) return next()
  this.password = bcrypt.hash(this.password, 10)
  next()
})

// now compare pass
userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
  // short lived access token 
  return jwt.sign({
    // usually only id
    _id: this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname
  }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY});
};

userSchema.methods.generateRefreshToken = function() {
  // short lived access token 
  return jwt.sign({
    // only id
    _id: this._id,
  }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY});
}

export const User = mongoose.model("User", userSchema);

// mongoose automatically creates an _id for all