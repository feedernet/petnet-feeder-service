export function formatUnixTimestamp(
  timeFromEpoch,
  showDate = true,
  showTime = true
) {
  const date = new Date(timeFromEpoch / 1000);
  let formatDate = "";
  let formatTime = "";

  if (showDate) {
    formatDate = date.toLocaleDateString("en-US");
  }
  if (showTime) {
    const separator = showDate ? " " : "";
    formatTime = `${separator}${date.toLocaleTimeString("en-US")}`;
  }

  return `${formatDate}${formatTime}`;
}

export function isStale(timeFromEpoch, staleSeconds = 120) {
  const ping = timeFromEpoch / 1000;
  const now = new Date().getTime();
  return now - ping > staleSeconds * 1000;
}

export function getRootPath() {
  let rootPath = document.getElementById("root").getAttribute("data-root-path");
  if (rootPath === "{{ root_path }}") {
    rootPath = "";
  }
  return rootPath;
}
