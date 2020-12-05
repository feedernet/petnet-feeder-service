import {newFeederWizard} from "../constants";

const newFeederWizardReducer = (state = {show: false, deviceHid: null}, action) => {
    switch (action.type) {
        case newFeederWizard.SHOW_FEEDER_WIZARD:
            return {
                show: true,
                deviceHid: action.deviceHid
            }
        case newFeederWizard.DISMISS_FEEDER_WIZARD:
            return {
                show: false,
                deviceHid: null
            }
    }
    return state
}

export default newFeederWizardReducer;