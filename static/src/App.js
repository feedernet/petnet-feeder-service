import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Icon from "@mdi/react";
import { mdiSilverwareForkKnife, mdiCog, mdiPaw } from "@mdi/js";
import { ErrorComponent } from "./components/Error";
import FeederCardList from "./containers/FeederCardListContainer";
import FeedHistory from "./containers/FeedHistoryTableContainer";
import { getRootPath } from "./util";
import ProjectLogo from "./images/feeder-project-logo.svg";
import NewFeederWizard from "./containers/NewFeederWizard";
import SnackModal from "./containers/SnackModalContainer";
import EditFeederModal from "./containers/EditFeederModalContainer";
import PetCardList from "./containers/PetCardListContainer";
import EditPetModal from "./containers/EditPetModalContainer";
import ScheduleModal from "./containers/ScheduleModalContainer";

const rootPath = getRootPath();

function App() {
  return (
    <div>
      <Navbar
        expand="lg"
        variant="dark"
        bg="primary"
        fixed="top"
        className={
          window.navigator.standalone === true ? "ios-app-nav" : null
        }
      >
        <Container>
          <Navbar.Brand href="#">
            <img src={ProjectLogo} alt={"FeederNet Logo"} width={175} />
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Link
                to={rootPath}
                component={Nav.Link}
                active={window.location.pathname === `${rootPath}/`}
              >
                <Icon path={mdiPaw} size={0.75} /> Home
              </Link>
              <Link to={`${rootPath}/settings`} component={Nav.Link}>
                <Icon path={mdiCog} size={0.75} /> Settings
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container
        style={{ marginTop: window.navigator.standalone === true ? 70 : 100 }}
      >
        <Routes>
          <Route
            path={rootPath}
            element={
              <>
                <PetCardList />
                <FeederCardList />
                <FeedHistory />
                <NewFeederWizard />
                <SnackModal />
                <EditFeederModal />
                <EditPetModal />
                <ScheduleModal />
              </>
            }
          />
          <Route
            path="*"
            element={<ErrorComponent message="Page Not Found!" />}
          />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
