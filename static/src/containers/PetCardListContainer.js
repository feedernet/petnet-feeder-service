import React from "react";
import { usePets } from "../hooks/usePets";
import PetCard from "./PetCardContainer";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import { mdiDogSideOff } from "@mdi/js";
import Icon from "@mdi/react";

function PetCardList() {
  const { data: pets = [], isLoading } = usePets();

  const header = (
    <h2 style={{ marginBottom: 20 }} className={"d-none d-sm-block"}>
      Pets
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

  const petArray = pets.map((pet) => <PetCard pet={pet} key={pet.id} />);

  return (
    <>
      {header}
      {petArray}
      {pets.length === 0 && !isLoading ? (
        <Card style={{ marginBottom: 20 }} bg={"light"} text={"dark"}>
          <Card.Body>
            <p className={"text-center fw-bold mb-1"}>
              <Icon path={mdiDogSideOff} size={1} /> No Pets Found
            </p>
            <p className={"text-center text-muted m-0"}>
              Once you have added a pet, you can assign it a feeder, create a
              schedule, and view their feed history.
            </p>
          </Card.Body>
        </Card>
      ) : null}
    </>
  );
}

export default PetCardList;
