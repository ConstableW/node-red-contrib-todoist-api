module.exports = function (RED) {
  const defineNodes = require("../lib/define-nodes");
  const { enc } = defineNodes;

  defineNodes(RED, [
    {
      type: "todoist-label-get-all",
      method: "GET",
      path: () => "labels",
      paginate: true
    },
    {
      type: "todoist-label-get",
      method: "GET",
      path: (p) => `labels/${enc(p.id)}`,
      required: ["id"]
    },
    {
      type: "todoist-label-create",
      method: "POST",
      path: () => "labels",
      required: ["name"],
      body: "all"
    },
    {
      type: "todoist-label-update",
      method: "POST",
      path: (p) => `labels/${enc(p.id)}`,
      required: ["id"],
      body: "rest"
    },
    {
      type: "todoist-label-delete",
      method: "DELETE",
      path: (p) => `labels/${enc(p.id)}`,
      required: ["id"]
    }
  ]);
};
