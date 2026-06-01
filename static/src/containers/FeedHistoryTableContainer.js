import React, { useState } from "react";
import { useFeedHistory, useFeeders } from "../hooks/useFeeders";
import { FeedHistoryTableComponent } from "../components/FeedHistoryTable";

function FeedHistory() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filteredDeviceId, setFilteredDeviceId] = useState("");
  const [filteredDeviceName, setFilteredDeviceName] = useState("");

  const { data: feeders = [] } = useFeeders();
  const { data } = useFeedHistory({ deviceId: filteredDeviceId, pageSize, page });

  const history = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleChangeFilter = (event) => {
    const matched = feeders.filter((f) => f.hid === event);
    if (matched.length > 0) {
      setFilteredDeviceId(matched[0].hid);
      setFilteredDeviceName(
        matched[0].name
          ? matched[0].name
          : `New Feeder (${matched[0].hid.substring(0, 6)})`
      );
    } else {
      setFilteredDeviceId("");
      setFilteredDeviceName("");
    }
    setPage(1);
  };

  const handleChangePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <>
      <h2 style={{ marginTop: 20, marginBottom: 20 }}>History</h2>
      <FeedHistoryTableComponent
        history={history}
        feeders={feeders}
        pageNumber={page}
        changePage={setPage}
        pageSize={pageSize}
        totalPages={totalPages}
        changePageSize={handleChangePageSize}
        filteredFeederName={filteredDeviceName}
        changeFilteredFeeder={handleChangeFilter}
      />
    </>
  );
}

export default FeedHistory;
