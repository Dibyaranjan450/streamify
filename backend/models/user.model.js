import mongoose from "mongoose";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";

const { InternalServerError } = createHttpError;

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please provide your name!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: [true, "User already exists! Please use a different email."],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minlength: [6, "Password must be at least 6 characters long!"],
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(InternalServerError(error.message));
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordMatch = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordMatch;
};

const User = mongoose.model("User", userSchema);

export default User;
