import React, { useState, useEffect } from "react";
import { ScheduleModalComponent } from "../components/ScheduleModal";
import {
  usePetSchedule,
  useCreatePetSchedule,
  useUpdatePetSchedule,
  useDeletePetSchedule,
} from "../hooks/usePets";
import { useModals } from "../context/ModalContext";

function ScheduleModal() {
  const { schedule, setSchedule } = useModals();
  const petId = schedule.pet?.id;

  const [editMode, setEditMode] = useState(false);
  const [newEvent, setNewEvent] = useState(false);
  const [targetEvent, setTargetEvent] = useState({});

  const { data: events = [] } = usePetSchedule(schedule.show ? petId : null);
  const { mutateAsync: createSchedule } = useCreatePetSchedule();
  const { mutateAsync: updateSchedule } = useUpdatePetSchedule();
  const { mutateAsync: deleteSchedule } = useDeletePetSchedule();

  // Reset edit state when modal closes
  useEffect(() => {
    if (!schedule.show) {
      setEditMode(false);
      setNewEvent(false);
      setTargetEvent({});
    }
  }, [schedule.show]);

  const handleClose = () => {
    setEditMode(false);
    setNewEvent(false);
    setTargetEvent({});
    setSchedule({ show: false, pet: {} });
  };

  const handleStartEdit = (isNew = true, event = {}) => {
    setEditMode(true);
    setNewEvent(isNew);
    setTargetEvent(isNew ? {} : event);
  };

  const handleSubmit = async (values) => {
    try {
      if (newEvent) {
        await createSchedule({
          petId,
          name: values.name,
          time: values.time,
          portion: values.portion,
        });
      } else {
        await updateSchedule({
          petId,
          eventId: targetEvent.event_id,
          name: values.name,
          time: values.time,
          portion: values.portion,
          enabled: values.enabled,
        });
      }
      setEditMode(false);
      setNewEvent(false);
      setTargetEvent({});
    } catch (_e) {
      // error handled via mutation state
    }
  };

  const handleDeleteEvent = async (eventId) => {
    await deleteSchedule({ petId, eventId });
  };

  return (
    <ScheduleModalComponent
      show={schedule.show}
      handleClose={handleClose}
      pet={schedule.pet}
      editMode={editMode}
      newEvent={newEvent}
      targetEvent={targetEvent}
      startEdit={handleStartEdit}
      events={events}
      handleDeleteEvent={handleDeleteEvent}
      handleFormSubmit={handleSubmit}
    />
  );
}

export default ScheduleModal;
