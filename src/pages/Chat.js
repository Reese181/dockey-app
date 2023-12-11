import React, { Fragment, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Parse from "parse";

//import stores
import useUserStore from "../stores/UserStore";

// CSS import
import "../../src/styles.css";

// Components
import ChatContainer from "../components/ChatCardContainer";
import NavbarBottom from "../components/NavbarBottom";
import ChatCardCreate from "../components/ChatCardCreateNew";

// Your Parse initialization configuration
const PARSE_APPLICATION_ID = "l3GQPvwNSbOEWclaYe7G7zfmdh2lQP2kHquXOGbJ";
const PARSE_JAVASCRIPT_KEY = "h9PTAAitCJFul7XadjhQbXFaK1N8VGZdJodYl5Tx";
const PARSE_HOST_URL = "https://parseapi.back4app.com/";
Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);
Parse.serverURL = PARSE_HOST_URL;

export default function Chat() {
  const { user } = useUserStore();
  // Hook to access the current location object
  const location = useLocation();
  // Retrieve the user ID and chat partner ID from the navigation state
  const { chatPartnerID } = location.state || {};

  useEffect(() => {
    if (!user) return;
  }, [user]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Fragment>
        <div className="">
          <ChatContainer
            chatPartnerID={chatPartnerID}
            currentUserID={user.id}
          />
          <div className="ChatCardNew-chat">
          <ChatCardCreate />
          </div>
        </div>
      <NavbarBottom activeItem={"Inbox"} />
    </Fragment>
  );
}
