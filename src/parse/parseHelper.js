import Parse from "parse";

// Your Parse initialization configuration goes here
const PARSE_APPLICATION_ID = "l3GQPvwNSbOEWclaYe7G7zfmdh2lQP2kHquXOGbJ";
const PARSE_JAVASCRIPT_KEY = "h9PTAAitCJFul7XadjhQbXFaK1N8VGZdJodYl5Tx";
const PARSE_HOST_URL = "https://parseapi.back4app.com/";
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export const _sender_user_id = "Sender_User_ID";
export const _receiver_user_id = "Receiver_User_ID";
export const _message_date = "Message_Date";
export const _message = "Message";
export const _message_text = "Message_Text";
export const _username = "username";
export const _unread = "Unread_Message";
export const _messageId = "objectId";
export const _profile_image = "profile_image";

export const _messageFields = {
  messageId: "objectId",
  message: "Message",
  date: "Message_Date",
  text: "Message_Text",
  senderId: "Sender_User_ID",
  receiverId: "Receiver_User_ID",
  unread: "Unread_Message",
  img: "Image",
};

export async function getUserName(userId) {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId", userId);
  let result = await userQuery.first();
  return result.get(_username);
}

export async function getUnreadMessagesCount(userId, chatPartnerId) {
  const query = new Parse.Query("Message");
  query.equalTo(_receiver_user_id, userId);
  query.equalTo(_sender_user_id, chatPartnerId);
  query.equalTo(_unread, true); 
  return query.count();
}

export function getMessageDate(msg) {
  const messageDate = msg.get(_message_date).toLocaleDateString();
  return messageDate ? messageDate : "Unknown date";
}

export function getMessageText(msg) {
  return msg.get(_message_text);
}

export function isMessageUnread(msg) {
  return msg.get(_unread);
}

export function getMessageId(msg) {
  return msg.get(_messageId);
}

export async function fetchDockNumbers(currentUserId) {
  const User = Parse.Object.extend("_User");
  const query = new Parse.Query(Parse.User);
  try {
    const results = await query.find();
    const docks = [];
    const dockToUserId = {};

    for (const user of results) {
      const dock = user.get("dock");
      const userId = user.id;
      if (dock && userId !== currentUserId) {
        docks.push(dock);
        dockToUserId[dock] = userId;
      }
    }

    return { docks, dockToUserId };
  } catch (error) {
    console.error("Error while fetching dock numbers", error);
    throw error; 
  }
}

export async function sendMessage(receiverId, senderId, messageContent, imageObject) {
  const Message = Parse.Object.extend("Message");

  // Creating pointers for sender and receiver
  const senderPointer = Parse.Object.extend('_User').createWithoutData(senderId);
  const receiverPointer = Parse.Object.extend('_User').createWithoutData(receiverId);

  // Creating a new message object
  const message = new Message();
  message.set(_messageFields.text, messageContent);
  message.set(_messageFields.senderId, senderPointer);
  message.set(_messageFields.receiverId, receiverPointer);
  message.set(_messageFields.date, new Date());
  message.set(_messageFields.unread, true);

  if (imageObject) {
    message.set(_messageFields.img, imageObject); // Adding image pointer if image is provided
  }

  // Setting ACL for each message - can only be read by sender and receiver, can only be written by sender 
  const acl = new Parse.ACL();
  acl.setReadAccess(senderId, true);
  acl.setReadAccess(receiverId, true);
  acl.setWriteAccess(senderId, true); // Sender can modify message
  acl.setWriteAccess(receiverId, true); // need to keep this in so user can mark message as read
  acl.setPublicReadAccess(false); // but stops public access
  message.setACL(acl);

  try {
    await message.save();
    return "message sent successfully";
  } catch (error) {
    console.error('Error while sending message:', error);
    throw error; 
  }
}

export async function uploadImage(file) {
  const parseFile = new Parse.File(file.name, file);
  try {
    await parseFile.save();
    const ImageObject = new Parse.Object("Image");
    ImageObject.set('Image_File', parseFile);
    await ImageObject.save();
    return ImageObject;
  } catch (error) {
    console.error('Error while uploading image:', error);
    throw error; 
  }
}

export async function markMessagesAsRead(chatPartnerID, userID) {
  const Message = Parse.Object.extend("Message");
  const query = new Parse.Query(Message);
  query.equalTo(_receiver_user_id, userID);
  query.equalTo(_sender_user_id, chatPartnerID);
  query.equalTo(_unread, true);

  try {
      const messages = await query.find();
      messages.forEach(message => {
          message.set(_unread, false); 
      });
      await Parse.Object.saveAll(messages); 
  } catch (error) {
      console.error('Error while marking all messages as read:', error);
      throw error;
  }
}

export async function getProfileImage(userId) {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId", userId);
  let result = await userQuery.first();
  return result.get(_profile_image);
}

export async function setProfileImage(user, file) {
  if (!user) return "Please provide a user";
  if (!file) return "Please provide a file";
  try {
    const fileName = user.id + "-profile.jpg";
    const parseFile = new Parse.File(fileName, file);
    await parseFile.save();
    await user.save("profile_image", parseFile);
    return "Profile image updated successfully!";
  } catch (error) {
    return "Error updating profile image:", error;
  }
}

export async function setNewPassword(user, password) {
  if (!user) return "Please provide a user";
  if (!password) return "Please provide a password";
  try {
    await user.save("password", password);
    return "Password updated successfully!";
  } catch (error) {
    return "Error updating password:", error;
  }
}

export async function collectProfileData(userId) {
  const userQuery = new Parse.Query(Parse.User);
  userQuery.equalTo("objectId", userId);
  let query = await userQuery.first();
  let profile = {
    profileImage: query.get("profile_image")?._url,
    dockNr: query.get("dock"),
    firstName: query.get("first_name"),
    lastName: query.get("last_name"),
    phoneNr: query.get("phone_no"),
    email: query.get("email"),
  };
  return profile;
}
