import React from "react";
import { useFeeders } from "../hooks/useFeeders";
import FeederCard from "./FeederCardContainer";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";

function FeederCardList() {
  const { data: feeders = [], isLoading } = useFeeders();

  const header = (
    <h2 style={{ marginBottom: 20 }} className={"d-none d-sm-block"}>
      Feeders
    </h2>
  );

  if (isLoading) {
    return (
      <>
        {header}
        <Spinner
          animation="border"
          role="status"
          style={{ margin: "0 auto", display: "block" }}
        >
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </>
    );
  }

  const feederArray = feeders.map((feeder) => (
    <FeederCard key={feeder.hid} feeder={feeder} />
  ));

  return (
    <>
      {header}
      {feeders.length > 0 ? (
        feederArray
      ) : (
        <Card style={{ marginBottom: 20 }} bg={"light"} text={"dark"}>
          <Card.Body>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Spinner
                animation={"border"}
                role={"status"}
                size={"sm"}
                className={"mt-1 mx-2"}
              >
                <span className={"visually-hidden"}>Searching...</span>
              </Spinner>
              <p className={"fw-bold mb-0"} style={{ display: "inline-block" }}>
                Waiting for New Devices
              </p>
            </div>
            <p className={"text-center text-muted mt-1 mb-0"}>
              Having trouble connecting your feeder? Check out the{" "}
              <a
                className={"text-secondary"}
                href={
                  "https://github.com/feedernet/petnet-feeder-service/wiki/Getting-Started#getting-your-feeder-to-communicate"
                }
              >
                Getting Started
              </a>{" "}
              guide on the FeederNet Wiki.
            </p>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

export default FeederCardList;
