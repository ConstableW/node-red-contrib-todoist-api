const runQuery = require("./run-query");

const enc = encodeURIComponent;

/**
 * Baut aus ausgewählten Payload-Feldern einen Query-String.
 * Arrays werden kommasepariert, leere Werte weggelassen.
 */
function toQueryString(payload, keys) {
  const params = new URLSearchParams();
  (keys || []).forEach((key) => {
    const value = payload[key];
    if (value === undefined || value === null || value === "") return;
    params.append(key, Array.isArray(value) ? value.join(",") : String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Registriert mehrere Todoist-Nodes anhand einer kompakten Beschreibung.
 *
 * def = {
 *   type:      Node-RED-Typname
 *   method:    HTTP-Methode
 *   path:      (payload) => Pfad ohne Query-String (relativ zu /api/v1/)
 *   required:  Pflichtfelder in msg.payload (optional)
 *   query:     Felder aus msg.payload, die als Query-String gesendet werden
 *   body:      "all" = gesamte Payload, "rest" = Payload ohne "id"
 *   extraBody: feste Zusatzfelder für den Body
 *   paginate:  alle Seiten laden und als Array zurückgeben
 * }
 */
module.exports = function defineNodes(RED, definitions) {
  definitions.forEach((def) => {
    function TodoistNode(config) {
      RED.nodes.createNode(this, config);
      const node = this;

      node.on("input", function (msg) {
        const tokenNode = RED.nodes.getNode(config.token);
        const token = tokenNode && tokenNode.credentials && tokenNode.credentials.token;
        if (!token) {
          node.status({ fill: "red", shape: "ring", text: "No token" });
          return node.error("No Todoist API token configured", msg);
        }

        const payload =
          msg.payload && typeof msg.payload === "object" ? msg.payload : {};
        const missing = (def.required || []).filter(
          (key) => payload[key] === undefined || payload[key] === ""
        );
        if (missing.length) {
          const text = `msg.payload.${missing.join(", msg.payload.")} required`;
          node.status({ fill: "red", shape: "ring", text });
          return node.error(text, msg);
        }

        let data;
        if (def.body === "all") {
          data = { ...payload };
        } else if (def.body === "rest") {
          data = { ...payload };
          delete data.id;
        }
        if (def.extraBody) data = { ...(data || {}), ...def.extraBody };

        return runQuery(
          node,
          {
            token,
            endpoint: def.path(payload) + toQueryString(payload, def.query),
            method: def.method,
            data,
            paginate: def.paginate
          },
          msg
        );
      });
    }
    RED.nodes.registerType(def.type, TodoistNode);
  });
};

module.exports.enc = enc;
