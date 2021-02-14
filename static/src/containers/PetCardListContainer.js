import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { getPetsAction } from "../actions/getPets";
import PetCard from "./PetCardContainer";
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import { mdiDogSideOff } from "@mdi/js";
import Icon from "@mdi/react";

class PetCardListContainer extends React.Component {
  state = {
    loading: true,
    pets: [],
  };

  constructor(props) {
    super(props);
    this.refreshPets = this.refreshPets.bind(this);
  }

  componentDidMount() {
    this.refreshPets();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.getPetsState.pets !== prevProps.getPetsState.pets) {
      this.setState({
        pets: this.props.getPetsState.pets,
      });
    }
  }

  refreshPets() {
    this.setState({ loading: true }, () => {
      this.props.dispatchGetPets().then(() => {
        if (!this.props.getPetsState._requestFailed) {
          this.setState({
            pets: this.props.getPetsState.pets,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      });
    });
  }

  render() {
    const header = (
      <h2 style={{ marginBottom: 20 }} className={"d-none d-sm-block"}>
        Pets
      </h2>
    );
    if (this.state.loading) {
      return (
        <>
          {header}
          <Spinner
            animation="border"
            role="status"
            style={{ margin: "0 auto", display: "block" }}
          >
            <span className="sr-only">Loading...</span>
          </Spinner>
        </>
      );
    }

    const petArray = this.state.pets.map((pet) => (
      <PetCard pet={pet} key={pet.id} />
    ));

    return (
      <>
        {header}
        {petArray}
        {this.state.pets.length === 0 && !this.state.loading ? (
          <Card style={{ marginBottom: 20 }} bg={"light"} text={"dark"}>
            <Card.Body>
              <p className={"text-center font-weight-bold mb-1"}>
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
}

PetCardListContainer.propTypes = {
  getPetsState: PropTypes.object,
  dispatchGetPets: PropTypes.func,
};

const PetCardList = withRouter(
  connect(
    (state) => {
      const { getPetsState } = state;
      return { getPetsState };
    },
    (dispatch) => {
      return {
        dispatchGetPets() {
          return dispatch(getPetsAction());
        },
      };
    }
  )(PetCardListContainer)
);

export default PetCardList;
