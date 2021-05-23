import React from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { EditPetModalComponent } from "../components/EditPetModal";
import { dismissEditPetModal } from "../actions/editPetModal";
import { CreatePetFormContainer } from "./CreatePetFormContainer";
import { modifyPetAction } from "../actions/modifyPet";
import { getPetsAction } from "../actions/getPets";
import { deletePetAction } from "../actions/deletePet";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Icon from "@mdi/react";
import { mdiDelete } from "@mdi/js";

class EditPetModalContainer extends React.Component {
  state = { showConfirmDelete: false };

  constructor(props) {
    super(props);
    this.handleRegisterFormSubmit = this.handleRegisterFormSubmit.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleRegisterFormSubmit(handleSubmit) {
    this.submitFormAction = handleSubmit;
  }

  handleFormSubmit(values, actions) {
    this.props
      .dispatchModifyPet(
        this.props.editPetModalState.pet.id,
        values.name,
        values.animal,
        values.weight,
        values.birthday,
        values.activity_level,
        values.image,
        this.props.editPetModalState.pet.device_hid
      )
      .then(() => {
        if (!this.props.modifyPetState._requestFailed) {
          this.props.dispatchGetPets();
          this.props.dispatchDismissEditPetModal();
        }
      });
  }

  handleDelete() {
    this.props
      .dispatchDeletePet(this.props.editPetModalState.pet.id)
      .then(() => {
        if (!this.props.deletePetState._requestFailed) {
          this.props.dispatchGetPets();
          this.props.dispatchDismissEditPetModal();
          this.setState({ showConfirmDelete: true });
        }
      });
  }

  render() {
    const initialValues = this.props.editPetModalState.pet;
    let transformedValues = {
      name: initialValues.name,
      animal: initialValues.animal_type,
      // Once we get a user settings model established, the unit here
      // can be based upon that.
      weight: initialValues.weight / 453.5925, // grams -> lbs
      activity_level: initialValues.activity_level,
      birthday: new Date(initialValues.birthday / 1000).toLocaleDateString(
        "en-US"
      ),
      image: initialValues.image,
    };
    return (
      <>
        <EditPetModalComponent
          show={
            this.props.editPetModalState.show && !this.state.showConfirmDelete
          }
          handleClose={this.props.dispatchDismissEditPetModal}
          handleSubmit={() => this.submitFormAction()}
          toggleConfirm={() => this.setState({ showConfirmDelete: true })}
        >
          <CreatePetFormContainer
            handleRegisterFormSubmit={this.handleRegisterFormSubmit}
            submitCallBack={this.handleFormSubmit}
            defaultValues={transformedValues}
          />
        </EditPetModalComponent>
        <Modal
          show={this.state.showConfirmDelete}
          onHide={() => this.setState({ showConfirmDelete: false })}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Are you sure?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Deleting a pet will delete it's schedule and data.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="danger"
              onClick={this.handleDelete}
              style={{ width: "100%" }}
            >
              <Icon path={mdiDelete} size={0.75} /> Delete
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

EditPetModalContainer.propTypes = {
  editPetModalState: PropTypes.object,
  modifyPetState: PropTypes.object,
  dispatchDismissEditPetModal: PropTypes.func,
  dispatchModifyPet: PropTypes.func,
  dispatchGetPets: PropTypes.func,
  dispatchDeletePet: PropTypes.func,
};

const EditPetModal = withRouter(
  connect(
    (state) => {
      const { editPetModalState, modifyPetState, deletePetState } = state;
      return { editPetModalState, modifyPetState, deletePetState };
    },
    (dispatch) => {
      return {
        dispatchDismissEditPetModal() {
          return dispatch(dismissEditPetModal());
        },
        dispatchModifyPet(
          pet_id,
          name,
          animal_type,
          weight,
          birthday,
          activity_level,
          image,
          device_hid
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
        dispatchGetPets() {
          return dispatch(getPetsAction());
        },
        dispatchDeletePet(petId) {
          return dispatch(deletePetAction(petId));
        },
      };
    }
  )(EditPetModalContainer)
);

export default EditPetModal;
