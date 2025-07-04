import { connectMongo } from "../lib/db.js";
import User from "../models/user.model.js";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { upsertStreamUser } from "../lib/stream.js";

const { BadRequest, Unauthorized, NotFound } = createHttpError;

export async function signup(req, res, next) {
  const { fullName, email, password, gender } = req.body;

  /////////////////// Checking Gender for User /////////////////////
  const Gender = Object.freeze({
    MALE: "male",
    FEMALE: "female",
    // OTHER: "other",
  });

  if (!gender || !Object.values(Gender).includes(gender)) {
    return next(
      BadRequest(
        "User validation failed: gender: Please enter your valid gender!"
      )
    );
  }

  try {
    await connectMongo();

    const profilePic = `https://avatar.iran.liara.run/public/${
      gender === "male" ? "boy" : "girl"
    }`;

    /////////////////// Saving User to Database /////////////////////
    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePic,
    });
    const { password: _, __v, ...user } = newUser.toObject();

    /////////////////// Cretaing User in Stream /////////////////////
    await upsertStreamUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
      image: newUser.profilePic || "",
    });

    /////////////////// Signning Access Token /////////////////////
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      status: "success",
      success: true,
      user,
      token,
    });
  } catch (err) {
    console.log("Error ion signup controller: ", err);
    next(BadRequest(err.message));
  }
}

export async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(Unauthorized("Provide your email & password!"));
  }

  try {
    await connectMongo();

    /////////////////// Finding User /////////////////////
    const existUser = await User.findOne({ email });
    if (!existUser) {
      return next(Unauthorized("Invalid email or password!"));
    }

    /////////////////// Checking Password /////////////////////
    const isCorrectPassword = await existUser.matchPassword(password);
    if (!isCorrectPassword) {
      return next(Unauthorized("Invalid email or password!"));
    }

    /////////////////// Signning Access Token /////////////////////
    const token = jwt.sign(
      { userId: existUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    const { password: _, __v: __, ...user } = existUser.toObject();
    res.status(200).json({
      status: "success",
      success: true,
      user,
      token,
    });
  } catch (err) {
    next(BadRequest(err.message));
  }
}

export async function logout(_, res, next) {
  try {
    res.status(200).json({
      status: "success",
      success: true,
      message: "Logout successfully",
    });
  } catch (err) {
    next(err);
  }
}

export const onboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { fullName, bio, nativeLanguage, learningLanguage, location } =
      req.body;

    /////////////////// Validating body payload /////////////////////
    if (
      !fullName ||
      !bio ||
      !nativeLanguage ||
      !learningLanguage ||
      !location
    ) {
      return next(
        BadRequest({
          message: "All fields are required!",
          missingFields: [
            !fullName && "fullName",
            !bio && "bio",
            !nativeLanguage && "nativeLanguage",
            !learningLanguage && "learningLanguage",
            !location && "location",
          ].filter(Boolean),
        })
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...req.body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return next(NotFound("User not found"));
    }

    //TODO: Update the user info in stream
    await upsertStreamUser({
      id: updatedUser._id.toString(),
      name: updatedUser.fullName,
      image: updatedUser.profilePic || "",
    });

    res.status(200).json({
      status: "success",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    next(BadRequest(error.message));
  }
};

export const getMe = (req, res) => {
  res.status(200).json({
    status: "success",
    success: true,
    user: req.user,
  });
};
