import React from "react";

export const PetAvatar = function (props) {
  let selectedStyles = {};
  if (props.selected) {
    selectedStyles = {
      boxShadow: "0 0 0 3px #28AFB0",
    };
  }

  return (
    <div
      className={"text-center mx-3 my-2"}
      style={{
        display: "inline-block",
        cursor: typeof props.handleSelect === "function" ? "pointer" : null,
      }}
      onClick={props.handleSelect}
    >
      <div
        className={"pet-avatar-container"}
        style={{
          borderRadius: "100%",
          display: "inline-block",
          verticalAlign: "middle",
          height: props.size,
          width: props.size,
          ...selectedStyles,
        }}
      >
        <img
          alt={props.name || "Pet Avatar"}
          src={props.image}
          style={{
            maxWidth: "100%",
            borderRadius: "100%",
            height: props.size,
            width: props.size,
            border: "2px solid white",
          }}
        />
      </div>
      {props.showName ? <p className={"my-1"}>{props.name}</p> : null}
    </div>
  );
};
