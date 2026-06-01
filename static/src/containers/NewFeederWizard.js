import React, { useRef, useEffect } from "react";
import StepWizard from "react-step-wizard";
import CreateOrAssignPet from "./OnboardNewFeeder/CreateOrAssignPet";
import Modal from "react-bootstrap/Modal";
import SetHopperLevel from "./OnboardNewFeeder/SetHopperLevel";
import { NewFeederFinished } from "./OnboardNewFeeder/Finished";
import CreateRecipe from "./OnboardNewFeeder/CreateRecipe";
import { useModals } from "../context/ModalContext";
import { useQueryClient } from "@tanstack/react-query";

function NewFeederWizard() {
  const { newFeederWizard, setNewFeederWizard } = useModals();
  const qc = useQueryClient();
  const wizardRef = useRef(null);

  const registerSetupWizard = (instance) => {
    wizardRef.current = instance;
  };

  useEffect(() => {
    if (newFeederWizard.show && wizardRef.current) {
      wizardRef.current.firstStep();
    }
  }, [newFeederWizard.show]);

  const handleDismiss = () =>
    setNewFeederWizard({ show: false, deviceHid: null });

  const handleCloseAndRefresh = () => {
    handleDismiss();
    qc.invalidateQueries({ queryKey: ["feeders"] });
  };

  return (
    <Modal
      show={newFeederWizard.show}
      onHide={handleDismiss}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title className={"h5"}>New Feeder Wizard</Modal.Title>
      </Modal.Header>
      <StepWizard
        instance={registerSetupWizard}
        transitions={{}}
        isLazyMount
      >
        <CreateOrAssignPet deviceHid={newFeederWizard.deviceHid} />
        <SetHopperLevel deviceHid={newFeederWizard.deviceHid} />
        <CreateRecipe deviceHid={newFeederWizard.deviceHid} />
        <NewFeederFinished closeWizard={handleCloseAndRefresh} />
      </StepWizard>
    </Modal>
  );
}

export default NewFeederWizard;
