import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import PropTypes from "prop-types";
import { useQueryClient } from "@tanstack/react-query";
import { FoodWeightBubble } from "../../components/FoodWeightBubble";
import {
  useTriggerFeeding,
  useSetRecipe,
} from "../../hooks/useFeeders";
import { getFeedHistory } from "../../api/feeders";

function timer(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function CreateRecipe({ deviceHid, nextStep }) {
  const [measuredWeights, setMeasuredWeights] = useState([null, null, null]);
  const [isCurrentlyMeasuring, setIsCurrentlyMeasuring] = useState([
    false,
    false,
    false,
  ]);
  const [errorWeighing, setErrorWeighing] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [measuredDensity, setMeasuredDensity] = useState(0);

  const qc = useQueryClient();
  const { mutate: triggerFeeding } = useTriggerFeeding();
  const { mutateAsync: setRecipe } = useSetRecipe();

  const handleDispenseAndPoll = async () => {
    const timeoutTime = new Date(Date.now() + 1000 * 60);

    // Get the current feed history to find the latest timestamp before dispensing
    let lastTimeBefore = null;
    try {
      const historyBefore = await getFeedHistory({ deviceId: deviceHid, pageSize: 5, page: 1 });
      if (historyBefore?.data?.length > 0) {
        lastTimeBefore = historyBefore.data[0].timestamp;
      }
    } catch (_e) {
      // ignore
    }

    if (!manualEntry) {
      triggerFeeding({ deviceId: deviceHid, portion: 0.0625 });

      let lastTimeAfter = null;
      let portionWeight = null;

      while (
        (lastTimeAfter === null || lastTimeAfter <= lastTimeBefore) &&
        new Date() < timeoutTime &&
        !manualEntry
      ) {
        await timer(2000);
        try {
          const history = await getFeedHistory({
            deviceId: deviceHid,
            pageSize: 5,
            page: 1,
          });
          // Invalidate the cache so UI stays fresh
          qc.invalidateQueries({ queryKey: ["feedHistory"] });
          if (history?.data?.length > 0) {
            lastTimeAfter = history.data[0].timestamp;
            portionWeight = history.data[0].grams_actual;
          }
        } catch (_e) {
          // keep trying
        }
      }

      if (new Date() >= timeoutTime) {
        setErrorWeighing(true);
        setManualEntry(true);
        return null;
      }

      if (portionWeight >= 1) {
        return portionWeight;
      }

      // Try again if no food was dispensed
      return handleDispenseAndPoll();
    }
  };

  const handleDispenseAndWeighLoop = async () => {
    const weights = [...measuredWeights];
    const progress = [...isCurrentlyMeasuring];

    for (let weighStep = 0; weighStep < 3; weighStep++) {
      progress[weighStep] = true;
      setIsCurrentlyMeasuring([...progress]);

      weights[weighStep] = await handleDispenseAndPoll();

      const sum = weights.reduce((a, b) => (b !== null ? a + b : a), 0);
      setMeasuredWeights([...weights]);
      setMeasuredDensity(Math.round(sum / (weighStep + 1)));
    }
  };

  const handleCreateRecipe = async () => {
    if (measuredDensity !== null && measuredDensity > 0) {
      try {
        await setRecipe({
          deviceId: deviceHid,
          g_per_tbsp: measuredDensity,
          tbsp_per_feeding: 1,
          name: "Initial Recipe",
          budget_tbsp: 1,
        });
        nextStep();
      } catch (_e) {
        // error handled via mutation state
      }
    }
  };

  return (
    <>
      <Modal.Body style={{ textAlign: "center" }} className={"pt-4"}>
        {errorWeighing ? (
          <Alert variant={"danger"}>
            The automatic measuring process didn't work! Please manually enter
            food weight.
          </Alert>
        ) : null}
        <h2>What does their food weigh?</h2>
        <p className={"text-muted mt-1"}>
          To make sure we are dispensing the right amount of food, we need to
          know how dense it is.
        </p>

        {!manualEntry ? (
          <>
            <p className={"text-muted mt-1"}>
              We are going to automatically dispense three 1 tbsp portions to
              get the weight of their food.
            </p>
            <p className={"text-warning mt-1 font-weight-bold"}>
              Please keep your pet(s) away during this process.
            </p>
          </>
        ) : (
          <>
            <p className={"mt-1"}>
              Please weigh out a single tablespoon of food and enter the weight
              below.
            </p>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="0"
                type="number"
                aria-label="Weight of food"
                aria-describedby="food-weight"
                value={measuredDensity}
                onChange={(event) =>
                  setMeasuredDensity(Math.round(event.target.value))
                }
              />
              <InputGroup.Text id="food-weight">g/tbsp</InputGroup.Text>
            </InputGroup>
          </>
        )}

        {!manualEntry ? (
          <>
            <FoodWeightBubble
              loading={isCurrentlyMeasuring[0]}
              weight={measuredWeights[0]}
            />
            <FoodWeightBubble
              loading={isCurrentlyMeasuring[1]}
              weight={measuredWeights[1]}
            />
            <FoodWeightBubble
              loading={isCurrentlyMeasuring[2]}
              weight={measuredWeights[2]}
            />
          </>
        ) : null}

        {!manualEntry ? (
          <p className={"mt-3"}>
            Average density: {measuredDensity} g/tbsp
          </p>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        {!manualEntry ? (
          <Button
            variant={"secondary"}
            onClick={() => setManualEntry(true)}
          >
            Manual Entry
          </Button>
        ) : null}

        {!manualEntry && measuredWeights[2] === null ? (
          <Button
            variant={"success"}
            onClick={() => handleDispenseAndWeighLoop()}
            disabled={isCurrentlyMeasuring[0]}
          >
            Start Weighing Food
          </Button>
        ) : null}

        {!manualEntry && measuredWeights[2] !== null ? (
          <Button
            variant={"success"}
            onClick={() => handleCreateRecipe()}
          >
            Submit
          </Button>
        ) : null}

        {manualEntry ? (
          <>
            <Button
              variant={"light"}
              onClick={() => {
                setMeasuredWeights([null, null, null]);
                setIsCurrentlyMeasuring([false, false, false]);
                setErrorWeighing(false);
                setManualEntry(false);
              }}
            >
              Go Back
            </Button>
            <Button
              variant={"success"}
              onClick={() => handleCreateRecipe()}
            >
              Submit
            </Button>
          </>
        ) : null}
      </Modal.Footer>
    </>
  );
}

CreateRecipe.propTypes = {
  deviceHid: PropTypes.string,
  nextStep: PropTypes.func,
};

export default CreateRecipe;
