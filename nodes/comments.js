module.exports = function (RED) {
  const defineNodes = require("../lib/define-nodes");
  const { enc } = defineNodes;

  defineNodes(RED, [
    {
      // Todoist verlangt entweder task_id oder project_id
      type: "todoist-comment-get-all",
      method: "GET",
      path: () => "comments",
      query: ["task_id", "project_id"],
      paginate: true
    },
    {
      type: "todoist-comment-create",
      method: "POST",
      path: () => "comments",
      required: ["content"],
      body: "all"
    },
    {
      type: "todoist-comment-update",
      method: "POST",
      path: (p) => `comments/${enc(p.id)}`,
      required: ["id", "content"],
      body: "rest"
    },
    {
      type: "todoist-comment-delete",
      method: "DELETE",
      path: (p) => `comments/${enc(p.id)}`,
      required: ["id"]
    }
  ]);
};
