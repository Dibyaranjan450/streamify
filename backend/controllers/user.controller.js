import createHttpError from "http-errors";
import FrindRequest from "../models/friendRequest.model.js";
import User from "../models/user.model.js";

const { InternalServerError, NotAcceptable, NotFound, BadRequest, Forbidden } =
  createHttpError;

export async function getRecommnededUsers(req, res, next) {
  try {
    const currentUserId = req.user._id;
    const currentUser = req.user;

    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        { _id: { $nin: currentUser.friends } },
        { isOnboarded: true },
      ],
    }).select("-password -__v");

    res
      .status(200)
      .json({ status: "success", success: true, recommendedUsers });
  } catch (error) {
    console.log("Error in getRemmendedUsers: ", error);
    next(InternalServerError(error.message));
  }
}

export async function getMyFriends(req, res, next) {
  try {
    const user = await User.findById(req.user.id)
      .select("friends")
      .populate(
        "friends",
        "fullname profilePic nativeLanguage learningLanguage"
      );

    res
      .status(200)
      .json({ status: "success", success: true, friends: user.friends });
    //   .json(user.friends);
  } catch (error) {
    console.log("Error in getRemmendedUsers: ", error);
    next(InternalServerError(error.message));
  }
}

export async function sendFriendRequest(req, res, next) {
  try {
    const myID = req.user.id;
    const { id: recipientID } = req.params;

    console.log("myID ", myID);
    console.log("recipientID ", recipientID);

    if (myID === recipientID) {
      return next(NotAcceptable("You can't send friend request to yourself!"));
    }

    const recipient = await User.findById(recipientID);
    if (!recipient) {
      return next(NotFound("Recipient not found!"));
    }

    if (recipient.friends.includes(myID)) {
      return next(BadRequest("You are already friends with this user!"));
    }

    /////////////////// Cheack if same request exsits /////////////////////
    const existingRequest = await FrindRequest.findOne({
      $or: [
        { sender: myID, recipient: recipientID },
        { sender: recipientID, recipient: myID },
      ],
    });
    console.log("existingRequest ", existingRequest);

    if (existingRequest) {
      return next(
        BadRequest("A frined request already exists between you and this user!")
      );
    }

    const newFrindRequest = await FrindRequest.create({
      sender: myID,
      recipient: recipientID,
    });

    res.status(201).json({ status: "success", success: true, newFrindRequest });
    // res.status(201).json(newFrindRequest);
  } catch (error) {
    console.log("Error in sendFriendRequest: ", error);
    next(InternalServerError(error.message));
  }
}

export async function acceptFriendRequest(req, res, next) {
  try {
    const { id: requestID } = req.params;

    const friendRequest = await FrindRequest.findById(requestID);
    if (!friendRequest) {
      return next(NotFound("Friend request not found!"));
    }

    /////////////////// Verifying the current user is the recipient /////////////////////
    if (friendRequest.recipient.toString() !== req.user.id) {
      return next(Forbidden("You are not authorized to accept this request!"));
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    /////////////////// Add both user's ID to each user's friends list array /////////////////////
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    res.status(200).json({
      status: "success",
      success: true,
      message: "Friend request accepted",
    });
  } catch (error) {
    console.log("Error in acceptFriendRequest: ", error);
    next(InternalServerError(error.message));
  }
}

export async function getFriendRequests(req, res, next) {
  try {
    const incomingRequest = await FrindRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate(
      "sender",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    const acceptedRequest = await FrindRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({
      status: "success",
      success: true,
      incomingRequest,
      acceptedRequest,
    });
  } catch (error) {
    console.log("Error in getFriendRequests: ", error);
    next(InternalServerError(error));
  }
}

export async function getOutgoingFriendRequests(req, res, next) {
  try {
    const outgoingRequest = await FrindRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate(
      "recipient",
      "fullName profilePic nativeLanguage learningLanguage"
    );

    res.status(200).json({
      status: "success",
      success: true,
      outgoingRequest,
    });
  } catch (error) {
    console.log("Error in getOutgoingFriendRequests: ", error);
    next(InternalServerError(error));
  }
}
