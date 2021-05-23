import React from "react";
import PropTypes from "prop-types";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import { feedEventShape, feederDeviceShape } from "../shapes/feeder";
import { formatUnixTimestamp } from "../util";
import Card from "react-bootstrap/Card";
import Icon from "@mdi/react";
import { mdiCalendarRemove } from "@mdi/js";

const feedSourceMap = {
  4: "Snack Time!",
  5: "Feeder Button",
  6: "Schedule",
};

export const FeedHistoryTableComponent = function (props) {
  const historyArray = props.history.map((historyItem) => (
    <tr className={historyItem.fail ? "table-warning" : null}>
      <td>{formatUnixTimestamp(historyItem.start_time)}</td>
      <td>
        {historyItem.device_name
          ? historyItem.device_name
          : `New Feeder (${historyItem.device_hid.substring(0, 6)})`}
      </td>
      <td>{feedSourceMap[historyItem.source]}</td>
      {historyItem.fail ? (
        <td colSpan={2}>
          Failed to dispense:{" "}
          {historyItem.error ? historyItem.error : "Unknown Error!"}
        </td>
      ) : (
        <td>{historyItem.grams_actual}g</td>
      )}
    </tr>
  ));

  let pageNumbers = (
    <Pagination.Item>
      Page {props.pageNumber} / {props.totalPages}
    </Pagination.Item>
  );

  const feederDropdownItems = props.feeders.map((feeder) => (
    <Dropdown.Item eventKey={feeder.hid}>{feeder.name}</Dropdown.Item>
  ));

  return (
    <div style={{ marginBottom: 20 }}>
      <Row>
        <Col xs={12} md={4} className={"mb-2"}>
          <Dropdown onSelect={props.changeFilteredFeeder}>
            <Dropdown.Toggle variant="primary" id="feeder-filter-dropdown">
              Feeders:{" "}
              {props.filteredFeederName ? props.filteredFeederName : "All"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey="">All Feeders</Dropdown.Item>
              {feederDropdownItems}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
        <Col xs={12} md={8} className={"mb-2"} style={{ textAlign: "right" }}>
          <Dropdown onSelect={props.changePageSize}>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic">
              Page Size: {props.pageSize}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey={10}>10</Dropdown.Item>
              <Dropdown.Item eventKey={25}>25</Dropdown.Item>
              <Dropdown.Item eventKey={50}>50</Dropdown.Item>
              <Dropdown.Item eventKey={75}>75</Dropdown.Item>
              <Dropdown.Item eventKey={100}>100</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      {props.totalPages > 0 ? (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Time</th>
                <th>Feeder</th>
                <th>Source</th>
                <th>Final Bowl Weight</th>
              </tr>
            </thead>
            <tbody>{historyArray}</tbody>
          </Table>
          <Pagination className={"justify-content-center"}>
            <Pagination.Prev
              onClick={() => props.changePage(props.pageNumber - 1)}
              disabled={props.pageNumber === 1}
            />
            {pageNumbers}
            <Pagination.Next
              onClick={() => props.changePage(props.pageNumber + 1)}
              disabled={props.pageNumber === props.totalPages}
            />
          </Pagination>
        </>
      ) : (
        <Card style={{ marginBottom: 20 }} bg={"light"} text={"dark"}>
          <Card.Body>
            <p className={"text-center font-weight-bold mb-1"}>
              <Icon path={mdiCalendarRemove} size={1} /> No History Available
            </p>
            <p className={"text-center text-muted m-0"}>
              This is where you will find historical information about when and
              how much your pet(s) have been fed.
            </p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

FeedHistoryTableComponent.propTypes = {
  history: PropTypes.arrayOf(feedEventShape),
  feeders: PropTypes.arrayOf(feederDeviceShape),
  totalPages: PropTypes.number,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  filteredFeederName: PropTypes.string,
  changeFilteredFeeder: PropTypes.func,
  changePage: PropTypes.func,
  changePageSize: PropTypes.func,
};
