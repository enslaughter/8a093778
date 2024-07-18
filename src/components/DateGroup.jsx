import React, { useEffect, useState } from "react";
import CallInfo from "./CallInfo";
import styled from "styled-components";

const DateGroup = (props) => {
  //This was part of a check to not render the date group divider for empty date groups
  const checkValidGrouping = (callData) => {
    let valid = false;
    if (!callData) {
      return false;
    }
    callData.forEach((call) => {
      if (!call.is_archive) {
        valid = true;
      }
    });
    return valid;
  };

  const DateGroupDivider = styled.div`
    width: 100%;
    .date-divider {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 32px;
      margin-top: 16px;
      margin-bottom: 16px;
    }
    .horizontal-rule {
      border-top: 1px solid lightgrey;
      border-bottom: 1px solid lightgrey;
      width: 100%;
    }
    .date-text {
      width: 500px;
    }
    font-size: 32px;
  `;
  const [callData, setCallData] = useState([]);
  useEffect(() => {
    setCallData(props.callData);
  }, [props.callData]);
  return (
    <DateGroupDivider>
      <div className={"date-divider"}>
        <div className={"horizontal-rule"}></div>
        <div className="date-text">{props.date}</div>{" "}
        <div className={"horizontal-rule"}></div>
      </div>
      {callData.map((call, id) => {
        return (
          <CallInfo
            call={call}
            getCall={props.getCall}
            key={id}
            isArchive={props.isArchive}
          />
        );
      })}
    </DateGroupDivider>
  );
};

export default DateGroup;
