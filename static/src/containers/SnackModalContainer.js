import React, { useState, useEffect } from "react";
import { SnackModalComponent } from "../components/SnackModal";
import { useTriggerFeeding } from "../hooks/useFeeders";
import { useModals } from "../context/ModalContext";

function SnackModal() {
  const { snack, setSnack } = useModals();
  const [portion, setPortion] = useState(snack.defaultPortion);
  const { mutate: triggerFeeding } = useTriggerFeeding();

  // Sync portion when modal opens for a new device
  useEffect(() => {
    if (snack.show) {
      setPortion(snack.defaultPortion);
    }
  }, [snack.deviceHid, snack.show, snack.defaultPortion]);

  const handleClose = () =>
    setSnack({ show: false, deviceHid: null, defaultPortion: 0.0625 });

  const dispense = () => {
    triggerFeeding(
      { deviceId: snack.deviceHid, portion },
      { onSuccess: handleClose }
    );
  };

  return (
    <SnackModalComponent
      show={snack.show}
      handleClose={handleClose}
      handleDispense={dispense}
      currentPortion={portion}
      setPortion={setPortion}
    />
  );
}

export default SnackModal;
