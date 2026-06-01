import React, { useRef } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import { useSetHopperLevel } from "../../hooks/useFeeders";
import { HopperLevelFormComponent } from "../../components/HopperLevelForm";

function SetHopperLevel({ deviceHid, nextStep }) {
  const submitFormRef = useRef(null);
  const { mutateAsync: setHopperLevel } = useSetHopperLevel();

  const handleRegisterFormSubmit = (handleSubmit) => {
    submitFormRef.current = handleSubmit;
  };

  const handleSubmitForm = async (values) => {
    try {
      await setHopperLevel({ deviceId: deviceHid, level: values.level });
      nextStep();
    } catch (_e) {
      // error handled via mutation state
    }
  };

  return (
    <>
      <Modal.Body style={{ textAlign: "center" }} className={"py-4"}>
        <p className={"text-muted mt-1"}>
          Empty the bowl and make sure there is food in the hopper.
        </p>
        <h2>How full is the hopper?</h2>
        <div className={"mx-4"}>
          <HopperLevelFormComponent
            handleFormSubmit={handleSubmitForm}
            handleRegisterFormSubmit={handleRegisterFormSubmit}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant={"success"}
          onClick={() => submitFormRef.current && submitFormRef.current()}
        >
          Next
        </Button>
      </Modal.Footer>
    </>
  );
}

SetHopperLevel.propTypes = {
  deviceHid: PropTypes.string,
  nextStep: PropTypes.func,
};

export default SetHopperLevel;
