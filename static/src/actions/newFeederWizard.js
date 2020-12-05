import {newFeederWizard} from "../constants";

export const dismissFeederWizard = () => {
    return {
        type: newFeederWizard.DISMISS_FEEDER_WIZARD,
        deviceHid: null
    };
};

export const showFeederWizard = deviceHid => {
    return {
        type: newFeederWizard.SHOW_FEEDER_WIZARD,
        deviceHid
    };
};
