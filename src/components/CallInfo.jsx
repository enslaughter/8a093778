import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

const CallInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid lightgrey;
  border-radius: 8px;
  width: calc(100% - 16px);
  margin-top: 8px;
  margin-bottom: 8px;
  background: white;

  &:hover {
    cursor: pointer;
    border-color: black;
  }

  .phone-icon {
    display: flex;
    flex-direction: row;
    margin-left: 8px;
    margin-right: 16px;
    flex-grow: 0;
  }

  .call-direction {
    position: absolute;
    translate: 16px;
  }

  .call-missed {
    color: hsla(0, 83%, 55%, 1);
  }

  .call-inbound {
    color: grey;
  }

  .call-outbound {
    color: hsla(144, 53%, 50%, 1);
  }

  .call-number {
    flex-grow: 1;
  }

  .caller-info {
    font-size: 12px;
  }

  .call-time {
    width: 180px;
    justify-self: flex-end;
    flex-grow: 0;
    margin-left: 8px;
  }

  .call-duration {
    font-size: 16px;
  }
`;

// Format a phone number string into groups of 3 digits
const formatPhoneNumber = (value) => {
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

const CallInfo = (props) => {
  const [call, setCall] = useState([]);
  useEffect(() => {
    setCall(props.call);
  }, [props.call]);
  if (props.call.is_archived && !props.isArchive) {
    return <div></div>;
  }
  return (
    <CallInfoWrapper onClick={() => props.getCall(props.call.id)}>
      <div className="phone-icon">
        <FontAwesomeIcon
          icon={faPhone}
          className={
            call.call_type == "missed" ? "call-missed" : "call-answered"
          }
        />
        <div className="call-direction">
          {call.direction == "inbound" ? (
            <FontAwesomeIcon icon={faArrowDown} className="call-inbound" />
          ) : (
            <FontAwesomeIcon icon={faArrowUp} className="call-outbound" />
          )}
        </div>
      </div>
      <div className="call-number">
        <div>{call.from && formatPhoneNumber(call.from.toString())}</div>
        <div className="caller-info">
          <div>
            {formatCallDetails(
              call.call_type,
              call.direction,
              call.to,
              call.via
            )}
          </div>
        </div>
      </div>
      <div className="call-time">
        <div>{formatTime(call.created_at)}</div>
        <div className="call-duration">{call.duration} minutes</div>
      </div>
    </CallInfoWrapper>
  );
};

export default CallInfo;
