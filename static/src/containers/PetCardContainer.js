import React from "react";
import PropTypes from "prop-types";
import { PetCardComponent } from "../components/PetCard";
import { usePetSchedule } from "../hooks/usePets";
import { useRecipe } from "../hooks/useFeeders";
import { useModals } from "../context/ModalContext";

function PetCard({ pet }) {
  const { data: events = [] } = usePetSchedule(pet.id);
  const { data: recipe } = useRecipe(pet.device_hid);
  const { setSnack, setEditPet, setSchedule } = useModals();

  const manualFeedPortion = recipe
    ? recipe.tbsp_per_feeding / 16
    : 0.0625;

  const d = new Date();
  const pctDayElapsed =
    (d.getHours() * 3600 +
      d.getMinutes() * 60 +
      d.getSeconds() +
      d.getMilliseconds() / 1000) /
    864;

  return (
    <PetCardComponent
      pet={pet}
      pctDayElapsed={pctDayElapsed}
      events={events}
      showSnackModal={() =>
        setSnack({
          show: true,
          deviceHid: pet.device_hid,
          defaultPortion: manualFeedPortion,
        })
      }
      showEditPetModal={() => setEditPet({ show: true, pet })}
      showScheduleModal={() => setSchedule({ show: true, pet })}
    />
  );
}

PetCard.propTypes = {
  pet: PropTypes.object.isRequired,
};

export default PetCard;
