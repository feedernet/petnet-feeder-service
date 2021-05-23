import React from "react";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import { Formik } from "formik";
import * as Yup from "yup";
import Slider from "rc-slider/es";

const validationSchema = Yup.object().shape({
  level: Yup.number()
    .required()
    .min(5, "You must have food in the hopper!")
    .max(100),
});

const levelMarks = {
  0: "0%",
  25: "25%",
  50: "50%",
  75: "75%",
  100: "100%",
};

export const HopperLevelFormComponent = function (props) {
  return (
    <Formik
      initialValues={{
        level: props.hasOwnProperty("initialLevel") ? props.initialLevel : 50,
      }}
      validationSchema={validationSchema}
      onSubmit={props.handleFormSubmit}
    >
      {({ values, errors, handleSubmit, setFieldValue }) => {
        if (props.handleRegisterFormSubmit) {
          props.handleRegisterFormSubmit(handleSubmit);
        }
        if (props.handleRegisterSetFieldValue) {
          props.handleRegisterSetFieldValue(setFieldValue);
        }
        return (
          <form>
            <Row className={"mt-4"}>
              <Col>
                <Form.Group controlId="hopperLevel">
                  <Slider
                    min={0}
                    max={100}
                    step={5}
                    onChange={(activity) => setFieldValue("level", activity)}
                    onAfterChange={() => {
                      if (
                        props.submitAfterChange !== null &&
                        props.submitAfterChange
                      ) {
                        handleSubmit();
                      }
                    }}
                    value={values.level}
                    marks={levelMarks}
                    trackStyle={{ backgroundColor: "#513C2C" }}
                    handleStyle={{ borderColor: "#513C2C" }}
                    activeDotStyle={{ borderColor: "#513C2C" }}
                  />
                  {errors.level ? (
                    <Form.Control.Feedback type="invalid">
                      {errors.level}
                    </Form.Control.Feedback>
                  ) : null}
                </Form.Group>
              </Col>
            </Row>
          </form>
        );
      }}
    </Formik>
  );
};
