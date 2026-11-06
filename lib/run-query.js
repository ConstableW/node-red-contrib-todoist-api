const todoistQuery = require("./build-query");

/**
 * Todoist API v1 liefert Listen paginiert: { results: [...], next_cursor }.
 * Folgt dem Cursor, bis alle Seiten geladen sind, und setzt response.data
 * auf das zusammengefügte Array (wie in der alten REST v2 API).
 */
async function fetchAllPages(options) {
  const separator = options.endpoint.includes("?") ? "&" : "?";
  const all = [];
  let cursor = null;
  let response;

  do {
    const endpoint =
      `${options.endpoint}${separator}limit=200` +
      (cursor ? `&cursor=${encodeURIComponent(cursor)}` : "");
    response = await todoistQuery({ ...options, endpoint });
    const body = response.data;
    if (Array.isArray(body)) {
      all.push(...body);
      break;
    }
    all.push(...((body && body.results) || []));
    cursor = body && body.next_cursor;
  } while (cursor);

  response.data = all;
  return response;
}

module.exports = function runQuery(node, options, msg) {
  const { paginate, ...queryOptions } = options;
  const request = paginate
    ? fetchAllPages(queryOptions)
    : todoistQuery(queryOptions);

  return request
    .then(function (response) {
      msg.payload = response;
      msg.response = response;
      node.send(msg);
      node.status({ fill: "green", shape: "dot", text: "Success" });
    })
    .catch((error) => {
      msg.payload = error;
      msg.response = error;
      node.send(msg);
      node.status({ fill: "red", shape: "dot", text: "API Error" });
    });
};
