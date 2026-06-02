import React, { useState, useRef } from "react";
import { EditPetModalComponent } from "../components/EditPetModal";
import { CreatePetFormContainer } from "./CreatePetFormContainer";
import { useModifyPet, useDeletePet } from "../hooks/usePets";
import { useModals } from "../context/ModalContext";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Icon from "@mdi/react";
import { mdiDelete } from "@mdi/js";

function EditPetModal() {
  const { editPet, setEditPet } = useModals();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const submitFormRef = useRef(null);

  const { mutateAsync: modifyPet } = useModifyPet();
  const { mutateAsync: deletePet } = useDeletePet();

  const handleClose = () => setEditPet({ show: false, pet: {} });

  const handleRegisterFormSubmit = (handleSubmit) => {
    submitFormRef.current = handleSubmit;
  };

  const handleFormSubmit = async (values) => {
    try {
      await modifyPet({
        pet_id: editPet.pet.id,
        name: values.name,
        animal_type: values.animal,
        weight: values.weight,
        birthday: values.birthday,
        activity_level: values.activity_level,
        image: values.image,
        device_hid: editPet.pet.device_hid,
      });
      handleClose();
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const handleDelete = async () => {
    try {
      await deletePet(editPet.pet.id);
      handleClose();
      setShowConfirmDelete(false);
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const initialValues = editPet.pet;
  const transformedValues = initialValues.name
    ? {
        name: initialValues.name,
        animal: initialValues.animal_type,
        weight: initialValues.weight / 453.5925, // grams -> lbs
        activity_level: initialValues.activity_level,
        birthday: new Date(initialValues.birthday).toLocaleDateString("en-US"),
        image: initialValues.image,
      }
    : {};

  return (
    <>
      <EditPetModalComponent
        show={editPet.show && !showConfirmDelete}
        handleClose={handleClose}
        handleSubmit={() => submitFormRef.current && submitFormRef.current()}
        toggleConfirm={() => setShowConfirmDelete(true)}
      >
        <CreatePetFormContainer
          handleRegisterFormSubmit={handleRegisterFormSubmit}
          submitCallBack={handleFormSubmit}
          defaultValues={transformedValues}
        />
      </EditPetModalComponent>
      <Modal
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
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
            onClick={handleDelete}
            style={{ width: "100%" }}
          >
            <Icon path={mdiDelete} size={0.75} /> Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default EditPetModal;
