import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import User from "../models/user.model.js";
import { connectMongo } from "../lib/db.js";

const { Unauthorized, BadRequest } = createHttpError;

export const protectRoute = async (req, _, next) => {
  const { token } = req.body;

  if (!token) {
    return next(Unauthorized("Unauthorized: no token provided"));
  }

  try {
    await connectMongo();

    const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decode) {
      return next(Unauthorized("Unauthorized: invalid token"));
    }

    const user = await User.findById(decode.userId).select("-password -__v");
    if (!user) {
      return next(Unauthorized("Unauthorized: user not found"));
    }

    req.user = user;
  } catch (error) {
    console.log("Error in protectRoute: ", error);
    return next(BadRequest(error.message));
  }

  next();
};
