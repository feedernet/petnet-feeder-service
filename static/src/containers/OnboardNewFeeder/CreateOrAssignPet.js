import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { PetAvatar } from "../../components/PetAvatar";
import AddNewIcon from "../../images/add_new.png";
import { CreatePetFormContainer } from "../CreatePetFormContainer";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getPetsAction } from "../../actions/getPets";
import { createPetAction } from "../../actions/createPet";
import { modifyPetAction } from "../../actions/modifyPet";
import { petShape } from "../../shapes/pet";
import DefaultCatImage from "../../images/default_cat.png";
import DefaultDogImage from "../../images/default_dog.png";

const default_pet_images = {
  cat: DefaultCatImage,
  dog: DefaultDogImage,
};

export class CreateOrAssignPetContainer extends React.Component {
  state = {
    pets: [],
    selectedPetId: null,
    creatingNewPet: false,
  };

  constructor(props) {
    super(props);
    this.updatePets = this.updatePets.bind(this);
    this.handleRegisterFormSubmit = this.handleRegisterFormSubmit.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleAssignAndProgress = this.handleAssignAndProgress.bind(this);
  }

  componentDidMount() {
    this.updatePets();
  }

  updatePets() {
    this.props.dispatchGetPets().then(() => {
      if (!this.props.getPetsState._requestFailed) {
        this.setState({ pets: this.props.getPetsState.pets });
      }
    });
  }

  handleRegisterFormSubmit(handleSubmit) {
    this.submitFormAction = handleSubmit;
  }

  handleFormSubmit(values, actions) {
    this.props
      .dispatchCreatePet(
        values.name,
        values.animal,
        values.weight,
        values.birthday,
        values.activity_level,
        values.image,
        this.props.deviceHid
      )
      .then(() => {
        if (!this.props.createPetState._requestFailed) {
          this.updatePets();
          this.setState({
            creatingNewPet: false,
          });
        }
      });
  }

  handleAssignAndProgress() {
    if (this.state.selectedPetId !== null) {
      this.props
        .dispatchModifyPet(
          this.state.selectedPetId,
          null,
          null,
          null,
          null,
          null,
          null,
          this.props.deviceHid
        )
        .then(() => {
          if (!this.props.modifyPetState._requestFailed) {
            this.props.nextStep();
          }
        });
    }
  }

  render() {
    const petArray = this.state.pets.map((pet) => {
      if (!pet.image) {
        pet.image = default_pet_images[pet.animal_type];
      }
      return (
        <PetAvatar
          name={pet.name}
          size={100}
          image={pet.image}
          showName
          handleSelect={() => this.setState({ selectedPetId: pet.id })}
          selected={pet.id === this.state.selectedPetId}
        />
      );
    });
    return (
      <>
        <Modal.Body style={{ textAlign: "center" }} className={"py-4"}>
          {this.state.creatingNewPet ? (
            <h2>A new friend!</h2>
          ) : (
            <h2>Who is this feeder for?</h2>
          )}

          {this.state.creatingNewPet ? (
            <p className={"text-muted mt-1"}>
              Help us get to know them by providing a few details.
            </p>
          ) : (
            <p className={"text-muted mt-1"}>
              You can add more pets later if this is a shared feeder.
            </p>
          )}
          {this.state.creatingNewPet ? (
            <CreatePetFormContainer
              handleRegisterFormSubmit={this.handleRegisterFormSubmit}
              submitCallBack={this.handleFormSubmit}
            />
          ) : (
            <>
              {petArray}
              <PetAvatar
                name={"New"}
                size={100}
                image={AddNewIcon}
                showName
                handleSelect={() => this.setState({ creatingNewPet: true })}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {this.state.creatingNewPet ? (
            <Button variant={"success"} onClick={() => this.submitFormAction()}>
              Save
            </Button>
          ) : (
            <Button variant={"success"} onClick={this.handleAssignAndProgress}>
              Assign
            </Button>
          )}
        </Modal.Footer>
      </>
    );
  }
}

CreateOrAssignPetContainer.propTypes = {
  deviceHid: PropTypes.string,
  getPetsState: PropTypes.arrayOf(petShape),
  createPetState: petShape,
  modifyPetState: petShape,
  dispatchGetPets: PropTypes.func,
  dispatchCreatePet: PropTypes.func,
  dispatchModifyPet: PropTypes.func,
};

const CreateOrAssignPet = withRouter(
  connect(
    (state) => {
      const { getPetsState, createPetState, modifyPetState } = state;
      return { getPetsState, createPetState, modifyPetState };
    },
    (dispatch) => {
      return {
        dispatchGetPets() {
          return dispatch(getPetsAction());
        },
        dispatchCreatePet(
          name,
          animal_type,
          weight,
          birthday,
          activity_level,
          image,
          device_hid
        ) {
          return dispatch(
            createPetAction(
              name,
              animal_type,
              weight,
              birthday,
              activity_level,
              image,
              device_hid
            )
          );
        },
        dispatchModifyPet(
          pet_id,
          name = null,
          animal_type = null,
          weight = null,
          birthday = null,
          activity_level = null,
          image = null,
          device_hid = null
        ) {
          return dispatch(
            modifyPetAction(
              pet_id,
              name,
              animal_type,
              weight,
              birthday,
              activity_level,
              image,
              device_hid
            )
          );
        },
      };
    }
  )(CreateOrAssignPetContainer)
);

export default CreateOrAssignPet;
