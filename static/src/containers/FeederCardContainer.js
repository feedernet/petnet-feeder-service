import React from "react";
import PropTypes from "prop-types";
import { FeederCardComponent } from "../components/FeederCard";
import { formatUnixTimestamp, isStale } from "../util";
import { NewFeederCardComponent } from "../components/NewFeederCard";
import {
  useFeederTelemetry,
  useRecipe,
} from "../hooks/useFeeders";
import { usePets } from "../hooks/usePets";
import { useModals } from "../context/ModalContext";

function FeederCard({ feeder }) {
  const { data: telemetry = {} } = useFeederTelemetry(feeder.hid);
  const { data: recipe } = useRecipe(feeder.hid);
  const { data: allPets = [] } = usePets();
  const { setNewFeederWizard, setSnack, setEditFeeder } = useModals();

  const pets = allPets.filter((pet) => pet.device_hid === feeder.hid);

  const manualFeedPortion = recipe
    ? recipe.tbsp_per_feeding / 16
    : 0.0625;

  const lastPing = feeder.lastPingedAt ? feeder.lastPingedAt : feeder.discoveredAt;
  const lastPingDate = formatUnixTimestamp(lastPing);
  const connected = feeder.connected || !isStale(lastPing);
  const justDiscovered =
    connected &&
    (feeder.lastPingedAt === 0 || feeder.lastPingedAt === null);

  return (
    <>
      {feeder.currentRecipe === null ? (
        <NewFeederCardComponent
          key={feeder.hid}
          feeder={feeder}
          showNewFeederWizard={() =>
            setNewFeederWizard({ show: true, deviceHid: feeder.hid })
          }
        />
      ) : (
        <FeederCardComponent
          key={feeder.hid}
          feeder={feeder}
          telemetry={telemetry}
          isStale={!connected}
          isJustDiscovered={justDiscovered}
          lastPing={lastPingDate}
          showSnackModal={() =>
            setSnack({
              show: true,
              deviceHid: feeder.hid,
              defaultPortion: manualFeedPortion,
            })
          }
          showEditModal={() =>
            setEditFeeder({
              show: true,
              feeder,
              defaultPortion: manualFeedPortion,
            })
          }
          pets={pets}
        />
      )}
    </>
  );
}

FeederCard.propTypes = {
  feeder: PropTypes.object.isRequired,
};

export default FeederCard;
