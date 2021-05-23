import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export const NewFeederFinished = function (props) {
  return (
    <>
      <Modal.Body style={{ textAlign: "center" }} className={"py-4"}>
        <h2>That’s it! You’re all set. 🎉</h2>
        <p className={"text-muted mt-4 mb-1 mx-4"}>
          It really is that easy. All you need to do now is set your schedule
          and explore the rest of the app. Enjoy!
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant={"success"} onClick={props.closeWizard}>
          Finish
        </Button>
      </Modal.Footer>
    </>
  );
};
