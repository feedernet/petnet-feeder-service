import React, { useState, useEffect, useRef } from "react";
import { EditFeederModalComponent } from "../components/EditFeederModal";
import {
  useModifyFeeder,
  useRestartFeeder,
  useDeleteFeeder,
  useSetHopperLevel,
  useHopperLevel,
  useSetRecipe,
} from "../hooks/useFeeders";
import { useModals } from "../context/ModalContext";

function EditFeederModal() {
  const { editFeeder, setEditFeeder } = useModals();
  const { feeder: modalFeeder, defaultPortion } = editFeeder;

  const [feeder, setFeeder] = useState(modalFeeder);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [manualFeedPortion, setManualFeedPortion] = useState(defaultPortion);

  const hopperLevelValueRef = useRef(null);

  const { data: hopperLevelData } = useHopperLevel(feeder?.hid);
  const { mutateAsync: modifyFeeder } = useModifyFeeder();
  const { mutateAsync: restartFeeder } = useRestartFeeder();
  const { mutateAsync: deleteFeeder } = useDeleteFeeder();
  const { mutateAsync: setHopperLevel } = useSetHopperLevel();
  const { mutateAsync: setRecipe } = useSetRecipe();

  // Sync local state when the modal opens for a different feeder
  useEffect(() => {
    if (editFeeder.show) {
      setFeeder(modalFeeder);
      setManualFeedPortion(defaultPortion);
      if (hopperLevelValueRef.current && hopperLevelData !== undefined) {
        hopperLevelValueRef.current("level", hopperLevelData);
      }
    }
  }, [modalFeeder?.hid, editFeeder.show]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = () =>
    setEditFeeder({ show: false, feeder: {}, defaultPortion: 0.0625 });

  const handleSubmitChange = async (closeModal = true) => {
    try {
      await modifyFeeder({
        deviceId: feeder.hid,
        name: feeder.name,
        timezone: feeder.timezone,
        frontButton: feeder.frontButton,
        black: feeder.black,
      });
      if (closeModal) {
        handleClose();
      }
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const updateAndSubmit = (event, field, value, closeModal = true) => {
    event.persist();
    event.preventDefault();
    const updated = { ...feeder, [field]: value };
    setFeeder(updated);
    modifyFeeder({
      deviceId: updated.hid,
      name: updated.name,
      timezone: updated.timezone,
      frontButton: updated.frontButton,
      black: updated.black,
    }).then(() => {
      if (closeModal) handleClose();
    });
  };

  const handleDeleteDevice = async () => {
    try {
      await deleteFeeder(feeder.hid);
      handleClose();
      setShowConfirmDelete(false);
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const handleRestartDevice = async () => {
    try {
      await restartFeeder(feeder.hid);
      handleClose();
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const handleSetHopperLevel = async (values) => {
    await setHopperLevel({ deviceId: feeder.hid, level: values.level });
  };

  const handleSetManualFeedPortion = async (portion, commit = false) => {
    const oldPortion = manualFeedPortion;
    setManualFeedPortion(portion);
    if (commit) {
      try {
        await setRecipe({
          deviceId: feeder.hid,
          tbsp_per_feeding: portion * 16,
        });
      } catch (_e) {
        setManualFeedPortion(oldPortion);
      }
    }
  };

  return (
    <EditFeederModalComponent
      show={editFeeder.show}
      isStale={!feeder?.connected}
      handleClose={handleClose}
      name={feeder?.name}
      timezone={feeder?.timezone}
      frontButtonEnabled={feeder?.frontButton}
      isBlack={feeder?.black}
      handleNameChange={(event) => {
        event.persist();
        setFeeder((prev) => ({ ...prev, name: event.target.value }));
      }}
      handleTimezoneChange={(event) =>
        updateAndSubmit(event, "timezone", event.target.value, false)
      }
      handleFrontButtonChange={(event, enabled) =>
        updateAndSubmit(event, "frontButton", enabled, false)
      }
      handleColorChange={(event, black) =>
        updateAndSubmit(event, "black", black, false)
      }
      handleRestart={handleRestartDevice}
      handleSubmit={handleSubmitChange}
      handleDelete={handleDeleteDevice}
      toggleConfirmDelete={setShowConfirmDelete}
      showConfirmDelete={showConfirmDelete}
      hopperLevel={hopperLevelData ?? 0}
      setHopperLevel={handleSetHopperLevel}
      recipeServing={manualFeedPortion}
      handleSetRecipeServing={handleSetManualFeedPortion}
      handleRegisterHopperLevelControl={(setHopperLevelValue) => {
        hopperLevelValueRef.current = setHopperLevelValue;
      }}
    />
  );
}

export default EditFeederModal;
