module.exports = function (RED) {
  const defineNodes = require("../lib/define-nodes");
  const { enc } = defineNodes;

  defineNodes(RED, [
    {
      type: "todoist-project-get",
      method: "GET",
      path: (p) => `projects/${enc(p.id)}`,
      required: ["id"]
    },
    {
      type: "todoist-project-create",
      method: "POST",
      path: () => "projects",
      required: ["name"],
      body: "all"
    },
    {
      type: "todoist-project-update",
      method: "POST",
      path: (p) => `projects/${enc(p.id)}`,
      required: ["id"],
      body: "rest"
    },
    {
      type: "todoist-project-delete",
      method: "DELETE",
      path: (p) => `projects/${enc(p.id)}`,
      required: ["id"]
    },
    {
      type: "todoist-project-archive",
      method: "POST",
      path: (p) => `projects/${enc(p.id)}/archive`,
      required: ["id"]
    },
    {
      type: "todoist-project-unarchive",
      method: "POST",
      path: (p) => `projects/${enc(p.id)}/unarchive`,
      required: ["id"]
    }
  ]);
};
