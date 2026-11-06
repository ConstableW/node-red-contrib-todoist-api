module.exports = function (RED) {
  const defineNodes = require("../lib/define-nodes");
  const { enc } = defineNodes;

  defineNodes(RED, [
    {
      type: "todoist-task-filter",
      method: "GET",
      path: () => "tasks/filter",
      required: ["query"],
      query: ["query", "lang"],
      paginate: true
    },
    {
      type: "todoist-task-quick-add",
      method: "POST",
      path: () => "tasks/quick",
      required: ["text"],
      body: "all",
      extraBody: { meta: true }
    },
    {
      type: "todoist-task-move",
      method: "POST",
      path: (p) => `tasks/${enc(p.id)}/move`,
      required: ["id"],
      body: "rest"
    }
  ]);
};
