import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Header from "./Header.jsx";
import Archive from "./components/Archive.jsx";
import Inbox from "./components/Inbox.jsx";

import "./css/app.css";
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars";
import {
  faCircleInfo,
  faGear,
  faPhone,
  faPlus,
  faUser,
  faX,
} from "@fortawesome/free-solid-svg-icons";

import { sortCallsByDate } from "./util/helpers.js";

const TabStates = {
  INBOX: 0,
  ARCHIVE: 1,
};

const AppWrapper = styled.div`
  font-family: "Kumbh Sans", sans-serif;
  color: hsla(144, 0%, 25%, 1);
  margin: 0;
`;

const BodyWrapper = styled.div`
  margin: 0;
  margin-top: 48px;
  box-sizing: content-box;
  background: hsla(188, 16%, 97%, 1);
  padding-bottom: 80px;
`;

const TopBar = styled.div`
  display: flex;
  flex-direction: row;
  max-height: 48px;
  justify-content: flex-start;
  align-items: center;
  padding: 8px;
  background: hsla(188, 16%, 97%, 1);
  header {
    justify-self: flex-start;
    flex-grow: 0;
  }
  svg {
    max-height: 48px;
    max-width: 138px;
    padding: 16px;
  }

  .topbar-tabs {
    display: flex;
    padding: 16px;
    justify-content: space-evenly;
    flex-grow: 1;

    .tab-inactive:hover {
      font-weight: 700;
      cursor: pointer;
      color: black;
    }

    div {
      box-sizing: content-box;
      padding: 8px;
    }
  }

  .tab-active {
    font-weight: 700;
    border-bottom: 4px solid hsla(144, 53%, 50%, 1);
  }

  .topbar-settings {
    justify-self: flex-end;
    flex-grow: 0;
  }
`;

const Footer = styled.div`
  position: fixed;
  width: 100%;
  background: white;
  bottom: 0;
  padding: 8px;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;

  .footer-icon {
    padding: 16px;
  }

  .footer-calls {
    border-bottom: 2px solid hsla(144, 53%, 50%, 1);
  }

  .footer-dialpad {
    height: 32px;
    width: 32px;
    font-size: 32px;
    color: white;
    background: hsla(144, 53%, 50%, 1);
    border-radius: 32px;

    &:hover {
      cursor: pointer;
      background: hsla(144, 53%, 30%, 1);
    }
  }

  .footer-contacts,
  .footer-settings,
  .footer-location {
    &:hover {
      cursor: pointer;
      color: black;
    }
  }

  .dialpad-plus {
    padding-left: 2px;
    padding-bottom: 4px;
  }
`;

const CallInfo = styled.div`
  min-height: 100%;
  min-width: 100%;
  position: fixed;
  margin: -8px;
  top: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Kumbh Sans", sans-serif;
  color: hsla(144, 0%, 25%, 1);

  .call-info-window {
    background: white;
    text-align: center;
    padding: 32px;
    border-radius: 16px;

    div {
      margin-bottom: 6px;
    }
  }

  .call-info-header {
    font-size: 32px;
    font-weight: bold;
  }

  .call-info-number,
  .call-info-time {
    padding: 8px;
    font-size: 20px;
    font-weight: bold;
  }

  .modal-close {
    position: absolute;
    font-size: 48px;
    top: 32px;
    right: 32px;
    color: white;

    &:hover {
      cursor: pointer;
      color: lightgrey;
    }
  }
`;

// Format a phone number string into groups of 3 digits

// NOTE (These can be moved out into a util library since they are shared with the CallInfo component)
const formatPhoneNumber = (value) => {
  console.log(value);
  if (!value) {
    return "";
  }
  value = value.replace(/\D/g, "");
  if (value.length < 2) {
    return value.replace(/(\d{1})/, "+$1");
  }
  if (value.length < 5) {
    return value.replace(/(\d{1})(\d{1,3})/, "+$1 ($2");
  }
  if (value.length < 8) {
    return value.replace(/(\d{1})(\d{3})(\d{1,3})/, "+$1 ($2) $3");
  }
  if (value.length < 10) {
    return value.replace(/(\d{1})(\d{3})(\d{3})(\d{1,2})/, "+$1 ($2) $3-$4");
  }
  return value.replace(
    /(\d{1})(\d{3})(\d{3})(\d{2})(\d{1,2})/,
    "+$1 ($2) $3-$4-$5"
  );
};

const formatCallDetails = (call_type, call_direction, call_to, call_via) => {
  let prefixString = "";
  if (call_type == "missed") {
    if (call_direction == "inbound") {
      prefixString = "Missed call from ";
    } else {
      prefixString = "Tried to call ";
    }
  } else {
    if (call_direction == "inbound") {
      prefixString = "Call from ";
    } else {
      prefixString = "Call to ";
    }
  }
  return `${prefixString} ${call_to} via device ${call_via}`;
};

const formatTime = (call_time) => {
  if (!call_time) {
    return "";
  }
  let is_PM = "";
  let hour = call_time.substring(11, 13);
  let minute = call_time.substring(14, 16);
  if (hour > 12) {
    hour = hour - 12;
    is_PM = "PM";
  } else {
    is_PM = "AM";
  }
  return `${hour}:${minute} ${is_PM}`;
};

// NOTE: Some of the state handling here is quite rough.
// A context would be a better solution to prevent prop-drilling
const App = () => {
  const handleTabClick = (type) => {
    setCurrentTab(type);
  };

  const getCall = async (callId) => {
    await axios
      .get(`https://aircall-backend.onrender.com/activities/${callId}`)
      .then((response) => {
        console.log("Call data fetched successfully: ", response);
        setLoadedCall(response.data);
        setCallModalOpen(true);
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
  };

  const archiveCall = async (callId, refresh = true) => {
    await axios
      .patch(`https://aircall-backend.onrender.com/activities/${callId}`, {
        is_archived: true,
      })
      .then((response) => {
        console.log("Call archived successfully: ", response);
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
    if (refresh) {
      fetchData();
    }
  };

  const archiveAllCalls = async () => {
    console.log("Attempting to archive all calls...");
    console.log(calls);
    Object.entries(calls).forEach((callGroup) => {
      callGroup[1].forEach((call) => {
        archiveCall(call.id, false);
      });
    });
    fetchData();
  };

  const handleReset = async () => {
    await axios
      .patch("https://aircall-backend.onrender.com/reset")
      .then((response) => {
        console.log("Call data reset successfully: ", response);
        fetchData();
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
  };

  const fetchData = async () => {
    await axios
      .get("https://aircall-backend.onrender.com/activities")
      .then((response) => {
        console.log(response.data);
        setCalls(sortCallsByDate(response.data));
      })
      .catch((err) => {
        console.log("ERROR: ", err);
      });
  };

  const [calls, setCalls] = useState([]);
  const [loadedCall, setLoadedCall] = useState({});
  const [callModalOpen, setCallModalOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState(TabStates.INBOX);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      <AppWrapper>
        <TopBar>
          <Header />
          <div className="topbar-tabs">
            <div
              className={
                currentTab == TabStates.INBOX ? "tab-active" : "tab-inactive"
              }
              onClick={() => handleTabClick(TabStates.INBOX)}
            >
              Inbox
            </div>
            <div
              className={
                currentTab == TabStates.ARCHIVE ? "tab-active" : "tab-inactive"
              }
              onClick={() => handleTabClick(TabStates.ARCHIVE)}
            >
              Archive
            </div>
          </div>
          <div className="topbar-settings">
            <FontAwesomeIcon icon={faBars} />
          </div>
        </TopBar>
        <BodyWrapper>
          <Inbox
            calls={calls}
            handleReset={handleReset}
            archiveAllCalls={archiveAllCalls}
            getCall={getCall}
            display={currentTab == TabStates.INBOX}
          />
          <Archive
            calls={calls}
            handleReset={handleReset}
            archiveAllCalls={archiveAllCalls}
            getCall={getCall}
            display={currentTab == TabStates.ARCHIVE}
          />
        </BodyWrapper>
        <Footer>
          <div className="footer-icon footer-calls">
            <FontAwesomeIcon icon={faPhone} />
          </div>
          <div className="footer-icon footer-contacts">
            <FontAwesomeIcon icon={faUser} />
          </div>
          <div className="footer-icon footer-dialpad">
            <FontAwesomeIcon icon={faPlus} className="dialpad-plus" />
          </div>
          <div className="footer-icon footer-settings">
            <FontAwesomeIcon icon={faGear} />
          </div>
          <div className="footer-icon footer-location">
            <FontAwesomeIcon icon={faCircleInfo} />
          </div>
        </Footer>
      </AppWrapper>
      {callModalOpen && Object.keys(loadedCall).length > 0 && (
        <CallInfo>
          <div className="modal-close" onClick={() => setCallModalOpen(false)}>
            <FontAwesomeIcon icon={faX} />
          </div>
          <div className="call-info-window">
            <div className="call-info-header">Call Information</div>
            <div className="call-info-number">
              {formatPhoneNumber(loadedCall.from.toString())}
            </div>
            <div>
              {formatCallDetails(
                loadedCall.call_type,
                loadedCall.direction,
                loadedCall.to,
                loadedCall.via
              )}
            </div>
            <div className="call-info-time">
              {formatTime(loadedCall.created_at)}
            </div>
            <div className="call-info-duration">
              {loadedCall.duration} minutes
            </div>
          </div>
        </CallInfo>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));

export default App;
