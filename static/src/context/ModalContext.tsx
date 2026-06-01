import { createContext, useContext, useState, ReactNode } from "react";

interface SnackState {
  show: boolean;
  deviceHid: string | null;
  defaultPortion: number;
}

interface EditFeederState {
  show: boolean;
  feeder: Record<string, unknown>;
  defaultPortion: number;
}

interface EditPetState {
  show: boolean;
  pet: Record<string, unknown>;
}

interface ScheduleState {
  show: boolean;
  pet: Record<string, unknown>;
}

interface NewFeederWizardState {
  show: boolean;
  deviceHid: string | null;
}

interface ModalContextValue {
  snack: SnackState;
  setSnack: React.Dispatch<React.SetStateAction<SnackState>>;
  editFeeder: EditFeederState;
  setEditFeeder: React.Dispatch<React.SetStateAction<EditFeederState>>;
  editPet: EditPetState;
  setEditPet: React.Dispatch<React.SetStateAction<EditPetState>>;
  schedule: ScheduleState;
  setSchedule: React.Dispatch<React.SetStateAction<ScheduleState>>;
  newFeederWizard: NewFeederWizardState;
  setNewFeederWizard: React.Dispatch<React.SetStateAction<NewFeederWizardState>>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  // snackModal: { show, deviceHid, defaultPortion }
  const [snack, setSnack] = useState<SnackState>({
    show: false,
    deviceHid: null,
    defaultPortion: 0.0625,
  });

  // editFeeder: { show, feeder, defaultPortion }
  const [editFeeder, setEditFeeder] = useState<EditFeederState>({
    show: false,
    feeder: {},
    defaultPortion: 0.0625,
  });

  // editPet: { show, pet }
  const [editPet, setEditPet] = useState<EditPetState>({
    show: false,
    pet: {},
  });

  // schedule: { show, pet }
  const [schedule, setSchedule] = useState<ScheduleState>({
    show: false,
    pet: {},
  });

  // newFeederWizard: { show, deviceHid }
  const [newFeederWizard, setNewFeederWizard] = useState<NewFeederWizardState>({
    show: false,
    deviceHid: null,
  });

  return (
    <ModalContext.Provider
      value={{
        snack,
        setSnack,
        editFeeder,
        setEditFeeder,
        editPet,
        setEditPet,
        schedule,
        setSchedule,
        newFeederWizard,
        setNewFeederWizard,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModals = (): ModalContextValue | null => useContext(ModalContext);
