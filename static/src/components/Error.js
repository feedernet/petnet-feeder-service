import React from "react";

export const ErrorComponent = function (props) {
  return (
    <>
      <h1>Ugh oh... Something has gone wrong!</h1>
      <p>{props.message}</p>
    </>
  );
};
