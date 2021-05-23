import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const marks = {
  0.0625: "1/16",
  0.25: "1/4",
  0.5: "1/2",
  0.75: "3/4",
  1: "1",
  1.25: "1 1/4",
  1.5: "1 1/2",
  1.75: "1 3/4",
  2: "2",
};

export const displaySizes = {
  0.0625: "1/16",
  0.125: "1/8",
  0.1875: "3/16",
  0.25: "1/4",
  0.3125: "5/16",
  0.375: "3/8",
  0.4375: "7/16",
  0.5: "1/2",
  0.5625: "9/16",
  0.625: "5/8",
  0.6875: "11/16",
  0.75: "3/4",
  0.8125: "13/16",
  0.875: "7/8",
  0.9375: "15/16",
  1: "1",
  1.0625: "1 1/16",
  1.125: "1 1/8",
  1.1875: "1 3/16",
  1.25: "1 1/4",
  1.3125: "1 5/16",
  1.375: "1 3/8",
  1.4375: "1 7/16",
  1.5: "1 1/2",
  1.5625: "1 9/16",
  1.625: "1 5/8",
  1.6875: "1 11/16",
  1.75: "1 3/4",
  1.8125: "1 13/16",
  1.875: "1 7/8",
  1.9375: "1 15/16",
  2: "2",
};

export const FoodVolumeSlider = function (props) {
  return (
    <div className={"my-4"}>
      <Slider
        value={props.hasOwnProperty("value") ? props.value : 0.0625}
        min={0.0625}
        max={2}
        step={0.0625}
        marks={marks}
        onChange={props.hasOwnProperty("onChange") ? props.onChange : () => {}}
        onAfterChange={
          props.hasOwnProperty("onAfterChange") ? props.onAfterChange : () => {}
        }
        disabled={props.hasOwnProperty("disabled") ? props.disabled : false}
      />
    </div>
  );
};
