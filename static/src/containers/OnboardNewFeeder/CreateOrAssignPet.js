import React, { useState, useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { PetAvatar } from "../../components/PetAvatar";
import AddNewIcon from "../../images/add_new.png";
import { CreatePetFormContainer } from "../CreatePetFormContainer";
import PropTypes from "prop-types";
import { usePets, useCreatePet, useModifyPet } from "../../hooks/usePets";
import DefaultCatImage from "../../images/default_cat.png";
import DefaultDogImage from "../../images/default_dog.png";

const default_pet_images = {
  cat: DefaultCatImage,
  dog: DefaultDogImage,
};

function CreateOrAssignPet({ deviceHid, nextStep }) {
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [creatingNewPet, setCreatingNewPet] = useState(false);
  const submitFormRef = useRef(null);

  const { data: pets = [] } = usePets();
  const { mutateAsync: createPet } = useCreatePet();
  const { mutateAsync: modifyPet } = useModifyPet();

  const handleRegisterFormSubmit = (handleSubmit) => {
    submitFormRef.current = handleSubmit;
  };

  const handleFormSubmit = async (values) => {
    try {
      await createPet({
        name: values.name,
        animal_type: values.animal,
        weight: values.weight,
        birthday: values.birthday,
        activity_level: values.activity_level,
        image: values.image,
        device_hid: deviceHid,
      });
      setCreatingNewPet(false);
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const handleAssignAndProgress = async () => {
    if (selectedPetId !== null) {
      try {
        await modifyPet({
          pet_id: selectedPetId,
          device_hid: deviceHid,
        });
        nextStep();
      } catch (_e) {
        // error handled via mutation state
      }
    }
  };

  const petArray = pets.map((pet) => {
    const image = pet.image || default_pet_images[pet.animal_type];
    return (
      <PetAvatar
        key={pet.id}
        name={pet.name}
        size={100}
        image={image}
        showName
        handleSelect={() => setSelectedPetId(pet.id)}
        selected={pet.id === selectedPetId}
      />
    );
  });

  return (
    <>
      <Modal.Body style={{ textAlign: "center" }} className={"py-4"}>
        {creatingNewPet ? (
          <h2>A new friend!</h2>
        ) : (
          <h2>Who is this feeder for?</h2>
        )}
        {creatingNewPet ? (
          <p className={"text-muted mt-1"}>
            Help us get to know them by providing a few details.
          </p>
        ) : (
          <p className={"text-muted mt-1"}>
            You can add more pets later if this is a shared feeder.
          </p>
        )}
        {creatingNewPet ? (
          <CreatePetFormContainer
            handleRegisterFormSubmit={handleRegisterFormSubmit}
            submitCallBack={handleFormSubmit}
          />
        ) : (
          <>
            {petArray}
            <PetAvatar
              name={"New"}
              size={100}
              image={AddNewIcon}
              showName
              handleSelect={() => setCreatingNewPet(true)}
            />
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {creatingNewPet ? (
          <Button
            variant={"success"}
            onClick={() => submitFormRef.current && submitFormRef.current()}
          >
            Save
          </Button>
        ) : (
          <Button variant={"success"} onClick={handleAssignAndProgress}>
            Assign
          </Button>
        )}
      </Modal.Footer>
    </>
  );
}

CreateOrAssignPet.propTypes = {
  deviceHid: PropTypes.string,
  nextStep: PropTypes.func,
};

export default CreateOrAssignPet;
