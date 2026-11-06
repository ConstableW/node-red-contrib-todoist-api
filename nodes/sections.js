module.exports = function (RED) {
  const defineNodes = require("../lib/define-nodes");
  const { enc } = defineNodes;

  defineNodes(RED, [
    {
      type: "todoist-section-get-all",
      method: "GET",
      path: () => "sections",
      query: ["project_id"],
      paginate: true
    },
    {
      type: "todoist-section-get",
      method: "GET",
      path: (p) => `sections/${enc(p.id)}`,
      required: ["id"]
    },
    {
      type: "todoist-section-create",
      method: "POST",
      path: () => "sections",
      required: ["name", "project_id"],
      body: "all"
    },
    {
      type: "todoist-section-update",
      method: "POST",
      path: (p) => `sections/${enc(p.id)}`,
      required: ["id"],
      body: "rest"
    },
    {
      type: "todoist-section-delete",
      method: "DELETE",
      path: (p) => `sections/${enc(p.id)}`,
      required: ["id"]
    }
  ]);
};
