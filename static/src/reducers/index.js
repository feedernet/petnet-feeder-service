import { combineReducers } from "redux";
import getFeederDevicesReducer from "./getFeederDevices";
import triggerFeedingReducer from "./triggerFeeding";
import getFeederTelemetryReducer from "./getFeederTelemetry";
import getFeedHistoryReducer from "./getFeedHistory";
import modifyFeederReducer from "./modifyFeeder";
import restartFeederReducer from "./restartFeeder";
import deleteFeederReducer from "./deleteFeeder";
import getPetsReducer from "./getPets";
import createPetReducer from "./createPet";
import modifyPetReducer from "./modifyPet";
import setHopperLevelReducer from "./setHopperLevel";
import getHopperLevelReducer from "./getHopperLevel";
import setRecipeReducer from "./setRecipe";
import newFeederWizardReducer from "./newFeederWizard";
import getRecipeReducer from "./getRecipe";
import snackModalReducer from "./snackModal";
import editFeederModalReducer from "./editFeederModal";
import getPetScheduleReducer from "./getPetSchedule";
import editPetModalReducer from "./editPetModal";
import deletePetReducer from "./deletePet";
import scheduleModalReducer from "./scheduleModal";

export default combineReducers({
  getFeederDevicesState: getFeederDevicesReducer,
  getFeederTelemetryState: getFeederTelemetryReducer,
  triggerFeedingState: triggerFeedingReducer,
  getFeedHistoryState: getFeedHistoryReducer,
  modifyFeederState: modifyFeederReducer,
  restartFeederState: restartFeederReducer,
  deleteFeederState: deleteFeederReducer,
  getPetsState: getPetsReducer,
  createPetState: createPetReducer,
  modifyPetState: modifyPetReducer,
  setHopperLevelState: setHopperLevelReducer,
  getHopperLevelState: getHopperLevelReducer,
  setRecipeState: setRecipeReducer,
  newFeederWizardState: newFeederWizardReducer,
  getRecipeState: getRecipeReducer,
  snackModalState: snackModalReducer,
  editFeederModalState: editFeederModalReducer,
  getPetScheduleState: getPetScheduleReducer,
  editPetModalState: editPetModalReducer,
  deletePetState: deletePetReducer,
  scheduleModalState: scheduleModalReducer,
});
