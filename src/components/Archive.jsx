import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DateGroup from "./DateGroup.jsx";
import styled from "styled-components";
import { faInbox } from "@fortawesome/free-solid-svg-icons";

// NOTE: There is a ton of overlap here with the main inbox component. a next step
// would be to refactor it
const MainBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
`;

const ManageCallsWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid lightgrey;
  border-radius: 8px;
  width: 100%;
  background: white;

  &:hover {
    cursor: pointer;
    font-weight: bold;
    color: black;
  }

  .manage-calls-text {
    margin-left: 8px;
  }
`;

const Archive = (props) => {
  if (props.display) {
    return (
      <MainBodyWrapper>
        <ManageCallsWrapper onClick={props.handleReset}>
          <FontAwesomeIcon icon={faInbox} />
          <div className="manage-calls-text">Un-Archive All Calls</div>
        </ManageCallsWrapper>

        {Object.keys(props.calls).length > 0 ? (
          Object.entries(props.calls).map((callData, id) => {
            return (
              <DateGroup
                date={callData[0]}
                callData={callData[1]}
                key={id}
                getCall={props.getCall}
                isArchive={true}
              />
            );
          })
        ) : (
          <div>No Call Data</div>
        )}
      </MainBodyWrapper>
    );
  }
  return <div></div>;
};
export default Archive;
