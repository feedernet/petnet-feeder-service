import React from "react";
import AddPhotoIcon from "../images/add_photo.png";
import { CreatePetFormComponent } from "../components/CreatePetForm";

export class CreatePetFormContainer extends React.Component {
  state = {
    petImage: AddPhotoIcon,
    petImageScale: 1,
    petImageAngle: 0,
  };

  constructor(props) {
    super(props);
    this.handleRegisterAvatarEditor = this.handleRegisterAvatarEditor.bind(
      this
    );
    this.handleRegisterFormSubmitToParent = this.handleRegisterFormSubmitToParent.bind(
      this
    );
    this.handleSendFormCallback = this.handleSendFormCallback.bind(this);
    if (
      this.props.defaultValues &&
      this.props.defaultValues.hasOwnProperty("image")
    ) {
      this.state.petImage = this.props.defaultValues.image;
    }
  }

  handleRegisterAvatarEditor(editor) {
    this.editor = editor;
  }

  handleRegisterFormSubmitToParent(handleSubmit) {
    this.props.handleRegisterFormSubmit(handleSubmit);
  }

  handleSendFormCallback(values, actions) {
    let parsedValues = {
      animal: values["animal"],
      name: values["name"],
      image: null,
      activity_level: values["activity_level"],
    };
    const birthday = new Date(values["birthday"]);
    parsedValues["birthday"] = birthday.getTime() * 1000;

    if (this.editor && this.state.petImage !== AddPhotoIcon) {
      const canvas = this.editor.getImageScaledToCanvas();
      parsedValues["image"] = canvas.toDataURL();
    }

    if (values["unit"] === "lbs") {
      parsedValues["weight"] = values["weight"] * 453.5925; // lbs => grams
    } else {
      parsedValues["weight"] = values["weight"] * 1000; // kg => grams
    }

    this.props.submitCallBack(parsedValues, actions);
  }

  render() {
    return (
      <CreatePetFormComponent
        petImage={this.state.petImage}
        defaultValues={this.props.defaultValues}
        handleSetPetImage={(image) => this.setState({ petImage: image })}
        petImageScale={this.state.petImageScale}
        handleScaleImage={(scale) => this.setState({ petImageScale: scale })}
        petImageAngle={this.state.petImageAngle}
        handleRotateImage={(angle) => this.setState({ petImageAngle: angle })}
        handleRegisterAvatarEditor={this.handleRegisterAvatarEditor}
        handleRegisterFormSubmit={this.handleRegisterFormSubmitToParent}
        handleFormSubmit={this.handleSendFormCallback}
      />
    );
  }
}
