import { generateStreamToken } from "../lib/stream.js";
import createHttpError from "http-errors";

const { InternalServerError } = createHttpError;

export async function getStreamToken(req, res, next) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({
      status: "success",
      success: true,
      token,
    });
  } catch (error) {
    next(InternalServerError(error.message));
  }
}
