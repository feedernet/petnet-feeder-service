import React from "react";
import ProgressBar from "react-bootstrap/ProgressBar";
import FormLabel from "react-bootstrap/FormLabel";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

export const HopperLevelIndicatorComponent = function (props) {
  return (
    <div>
      <FormLabel>Hopper Level</FormLabel>
      <OverlayTrigger
        placement={"bottom"}
        overlay={<Tooltip id={`tooltip-bottom`}>{`${props.level}%`}</Tooltip>}
      >
        <ProgressBar variant="info" now={props.level} />
      </OverlayTrigger>
    </div>
  );
};
