import React from "react";
import PropTypes from "prop-types";
import {withRouter} from 'react-router-dom';
import {connect} from "react-redux";
import {getPetsAction} from "../actions/getPets";
import PetCard from "./PetCardContainer";


class PetCardListContainer extends React.Component {
    state = {
        loading: true,
        pets: []
    }

    constructor(props) {
        super(props);
        this.refreshPets = this.refreshPets.bind(this)
    }

    componentDidMount() {
        this.refreshPets()
    }

    refreshPets() {
        this.setState({loading: true}, () => {
            this.props.dispatchGetPets().then(() => {
                if (!this.props.getPetsState._requestFailed) {
                    this.setState({
                        pets: this.props.getPetsState.pets,
                        loading: false
                    })
                }
            })
        })
    }

    render() {
        const petArray = this.state.pets.map(
            (pet) => <PetCard pet={pet} key={pet.id}/>
        )


        return (
            <>
                <h2 style={{marginBottom: 20}} className={"d-none d-sm-block"}>Pets</h2>
                {this.state.loading ? <p>Loading...</p> : petArray}
            </>
        )
    }
}

PetCardListContainer.propTypes = {
    getPetsState: PropTypes.object,
    dispatchGetPets: PropTypes.func
};

const PetCardList = withRouter(connect(
    (state) => {
        const {getPetsState} = state;
        return {getPetsState};
    }, (dispatch) => {
        return {
            dispatchGetPets() {
                return dispatch(getPetsAction());
            }
        };
    }
)(PetCardListContainer));

export default PetCardList;