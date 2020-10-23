import React from 'react';
import {Switch, Route, withRouter, Link} from 'react-router-dom';
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Icon from '@mdi/react'
import {mdiPaw, mdiSilverwareForkKnife, mdiCog} from '@mdi/js';
import {ErrorComponent} from "./components/Error";
import FeederCardList from "./containers/FeederCardListContainer";


class App extends React.Component {
    state = {
        routes: [
            {
                path: '/',
                label: 'Feeder List',
                exact: true,
                render: props => {
                    return <FeederCardList {...props} />;
                }
            },
            {
                label: 'Page Not Found',
                render: () => {
                    return <ErrorComponent message="Page Not Found!"/>;
                }
            }
        ]
    };

    render() {
        return (
            <div>
                <Navbar expand="lg" variant="dark" bg="primary" fixed="top">
                    <Container>
                        <Navbar.Brand href="#">
                            <Icon path={mdiPaw} size={1}/> Pet Feeder
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="mr-auto">
                                <Link to={"/"} component={Nav.Link}>
                                    <Icon path={mdiSilverwareForkKnife} size={.75}/> Feeders
                                </Link>
                                <Link to={"/settings"} component={Nav.Link}>
                                    <Icon path={mdiCog} size={.75}/> Settings
                                </Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Container style={{marginTop: 100}}>
                    <Switch>
                        {this.state.routes.map(ea => {
                            return <Route key={ea.path} {...ea} />;
                        })}
                    </Switch>
                </Container>
            </div>
        );
    }

}

export default withRouter(App);
