import React from "react";
import Spinner from "react-bootstrap/Spinner";

export const FoodWeightBubble = function (props) {
  let background = "#D8D8D8";
  if (props.loading && !props.weight) {
    background = "#28AFB0";
  } else if (props.weight !== null) {
    background = "#66B63A";
  }
  return (
    <div
      style={{
        borderRadius: "100%",
        display: "inline-block",
        verticalAlign: "middle",
        height: 76,
        width: 76,
        backgroundColor: background,
      }}
      className={"mx-3 my-2"}
    >
      {props.loading && props.weight === null ? (
        <Spinner
          animation="border"
          role="status"
          variant="light"
          style={{ marginTop: 22 }}
        >
          <span className="sr-only">Dispensing...</span>
        </Spinner>
      ) : null}
      {props.weight !== null ? (
        <h2 className={"text-light mt-3"}>{props.weight}g</h2>
      ) : null}
      {!props.loading && !props.weight ? (
        <h2 className={"text-light mt-3"}>0g</h2>
      ) : null}
    </div>
  );
};
