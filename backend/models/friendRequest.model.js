import mongoose from "mongoose";

const friendRequestSchema = mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Request must contain Sender ID!"],
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Request must contain Receiver ID!"],
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const FrindRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FrindRequest;
