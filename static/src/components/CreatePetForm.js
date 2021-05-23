import React from "react";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import DropdownButton from "react-bootstrap/DropdownButton";
import Dropdown from "react-bootstrap/Dropdown";
import AvatarEditor from "react-avatar-editor";
import Dropzone from "react-dropzone";
import { Field, Formik } from "formik";
import AddPhotoIcon from "../images/add_photo.png";
import * as Yup from "yup";
import Slider from "rc-slider/es";
import Icon from "@mdi/react";
import {
  mdiCat,
  mdiDog,
  mdiImageSizeSelectActual,
  mdiMagnifyPlusOutline,
  mdiRotateLeftVariant,
  mdiRotateRightVariant,
  mdiInformationOutline,
} from "@mdi/js";

const oldest = new Date();
oldest.setFullYear(oldest.getFullYear() - 30);

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Your pet has to have a name."),
  animal: Yup.string().required(),
  birthday: Yup.date()
    .required("What is their birthday?")
    .min(oldest, "That's... not possible...")
    .max(new Date(), "Put it back in the DeLorean!"),
  weight: Yup.number().required("It is okay to guesstimate...").min(1),
  unit: Yup.string(),
});

const activityLevelMarks = {
  0: "Lazy",
  5: "Normal",
  10: "Active",
};

const sliderGradient = {
  10: "#66b63a",
  9: "#46b75c",
  8: "#21b778",
  7: "#00b691",
  6: "#00b3a3",
  5: "#28afb0",
  4: "#1793a2",
  3: "#1b788e",
  2: "#235d77",
  1: "#25445c",
  0: "#212d40",
};

export const CreatePetFormComponent = function (props) {
  let initialValues = {
    name: "",
    animal: "cat",
    birthday: "",
    weight: "",
    unit: "lbs",
    activity_level: 5,
  };
  if (props.hasOwnProperty("defaultValues")) {
    initialValues = { ...initialValues, ...props.defaultValues };
  }
  return (
    <>
      <Row className={"mt-4"}>
        <Dropzone
          noClick
          noKeyboard
          maxFiles={1}
          accept={"image/*"}
          onDrop={(dropped) => props.handleSetPetImage(dropped[0])}
        >
          {({ getRootProps, getInputProps, open }) => (
            <>
              <Col xs={12} sm={6}>
                <div {...getRootProps()}>
                  <AvatarEditor
                    width={175}
                    height={175}
                    image={props.petImage}
                    color={[255, 255, 255, 1]}
                    border={0}
                    borderRadius={100}
                    scale={props.petImageScale}
                    rotate={props.petImageAngle}
                    ref={props.handleRegisterAvatarEditor}
                  />
                  <input {...getInputProps()} />
                </div>
              </Col>
              <Col xs={12} sm={6} className={"text-left"}>
                <Button
                  style={{ width: "100%" }}
                  className={"mt-3"}
                  onClick={open}
                >
                  <Icon path={mdiImageSizeSelectActual} size={0.75} /> Select
                  Image
                </Button>
                <Form.Label className={"my-2"}>
                  <Icon path={mdiMagnifyPlusOutline} size={0.75} /> Zoom
                </Form.Label>
                <div className={"mx-2"}>
                  <Slider
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={props.handleScaleImage}
                    disabled={props.petImage === AddPhotoIcon}
                  />
                </div>
                <ButtonGroup
                  aria-label="Image rotation"
                  style={{ width: "100%" }}
                  className={"mt-3"}
                >
                  <Button
                    variant="primary"
                    disabled={
                      props.petImageAngle <= -270 ||
                      props.petImage === AddPhotoIcon
                    }
                    onClick={() =>
                      props.handleRotateImage(props.petImageAngle - 90)
                    }
                  >
                    <Icon path={mdiRotateLeftVariant} size={0.75} /> Left
                  </Button>
                  <Button
                    variant="primary"
                    disabled={
                      props.petImageAngle >= 270 ||
                      props.petImage === AddPhotoIcon
                    }
                    onClick={() =>
                      props.handleRotateImage(props.petImageAngle + 90)
                    }
                  >
                    <Icon path={mdiRotateRightVariant} size={0.75} /> Right
                  </Button>
                </ButtonGroup>
              </Col>
            </>
          )}
        </Dropzone>
      </Row>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={props.handleFormSubmit}
        validateOnChange={false}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
        }) => {
          props.handleRegisterFormSubmit(handleSubmit);
          return (
            <form>
              <Row className={"mt-4"}>
                <Col xm={12} className={"text-left"}>
                  <Form.Group controlId="newPetName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type={"text"}
                      placeholder={"Fido"}
                      name={"name"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.name}
                      isInvalid={touched.name && errors.name}
                    />
                    {touched.name && errors.name ? (
                      <Form.Control.Feedback type="invalid">
                        {errors.name}
                      </Form.Control.Feedback>
                    ) : null}
                  </Form.Group>
                  <ButtonGroup
                    aria-label="Basic example"
                    style={{ width: "100%" }}
                  >
                    <Field
                      as={Button}
                      variant={values.animal === "cat" ? "secondary" : "light"}
                      name={"animal"}
                      value={"cat"}
                      onClick={handleChange}
                      onBlur={handleBlur}
                    >
                      <Icon path={mdiCat} size={0.75} /> Cat
                    </Field>
                    <Field
                      as={Button}
                      variant={values.animal === "dog" ? "secondary" : "light"}
                      name={"animal"}
                      value={"dog"}
                      onClick={handleChange}
                      onBlur={handleBlur}
                    >
                      <Icon path={mdiDog} size={0.75} /> Dog
                    </Field>
                  </ButtonGroup>
                </Col>
              </Row>
              <Row className={"text-left mt-4"}>
                <Col xs={12} sm={6}>
                  <Form.Group controlId="newPetBirthday">
                    <Form.Label>Birthday</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="01/01/2020"
                      name={"birthday"}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.birthday}
                      isInvalid={touched.birthday && errors.birthday}
                    />
                    {touched.birthday && errors.birthday ? (
                      <Form.Control.Feedback type="invalid">
                        {errors.birthday}
                      </Form.Control.Feedback>
                    ) : null}
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group controlId="newPetWeight">
                    <Form.Label>Weight</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type="number"
                        placeholder="10"
                        name={"weight"}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.weight}
                        isInvalid={touched.weight && errors.weight}
                      />

                      <DropdownButton
                        as={InputGroup.Append}
                        variant="outline-secondary"
                        title={values.unit}
                        id="weight-unit"
                        onChange={handleChange}
                        name={"unit"}
                      >
                        <Dropdown.Item
                          onClick={() => setFieldValue("unit", "lbs")}
                        >
                          lbs
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => setFieldValue("unit", "kg")}
                        >
                          kg
                        </Dropdown.Item>
                      </DropdownButton>
                    </InputGroup>
                    {touched.weight && errors.weight ? (
                      <Form.Control.Feedback type="invalid">
                        {errors.weight}
                      </Form.Control.Feedback>
                    ) : null}
                  </Form.Group>
                </Col>
              </Row>
              <Row className={"text-left"}>
                <Col>
                  <Form.Group controlId="newPetWeight">
                    <Form.Label className={"mb-0"}>Activity Level</Form.Label>
                    <Form.Text className="text-muted mb-3">
                      <Icon path={mdiInformationOutline} size={0.6} /> This will
                      be used to help calculate daily caloric intake.
                    </Form.Text>
                    <div className={"mx-4"}>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        onChange={(activity) =>
                          setFieldValue("activity_level", activity)
                        }
                        value={values.activity_level}
                        marks={activityLevelMarks}
                        trackStyle={{
                          backgroundColor:
                            sliderGradient[values.activity_level],
                        }}
                        handleStyle={{
                          borderColor: sliderGradient[values.activity_level],
                        }}
                        activeDotStyle={{
                          borderColor: sliderGradient[values.activity_level],
                        }}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </form>
          );
        }}
      </Formik>
    </>
  );
};
