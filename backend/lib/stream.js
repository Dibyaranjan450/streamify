import { StreamChat } from "stream-chat";
import dotenv from "dotenv";

dotenv.config();
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.log("Stream API key or secret is missing!");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    // const res = await streamClient.upsertUser(userData);
    // console.log(res);
  } catch (error) {
    console.log("Error in createStreamUser: ", error);
    throw error;
  }
};

export const generateStreamToken = (userId) => {
  try {
    const userID = userId.toString();
    return streamClient.createToken(userID);
  } catch (error) {
    consolor.log("Error in generateStreamToken: ", error);
    throw error;
  }
};
