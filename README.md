# @constablew/node-red-contrib-todoist-api

![Todoist API v1 for Node-RED](https://raw.githubusercontent.com/ConstableW/node-red-contrib-todoist-api/master/assets/banner.svg)

![npm](https://img.shields.io/npm/dm/@constablew/node-red-contrib-todoist-api)

> ⚠️ This is a maintained fork of [`@foxleigh81/node-red-contrib-todoist-api`](https://github.com/foxleigh81/node-red-contrib-todoist-api) by Alex Foxleigh, which is no longer maintained.
> Version 2.x targets the **Todoist API v1** (`https://api.todoist.com/api/v1/`). List endpoints (all tasks, all projects) are fetched page by page and returned as a flat array in `msg.payload.data`.

This is a node-red palette that allows you to interact with your [Todoist](https://todoist.com) account via the [Todoist API](https://developer.todoist.com/api/v1/).

## Install

You can install via the node-red palette manager or via npm:

```bash
npm i --unsafe-perm @constablew/node-red-contrib-todoist-api
```

## Usage

### Configuration

To start using these nodes you need a token configuration node: drag any Todoist node from the palette into the flow editor, double-click it, click the pencil next to **Select Token**, and paste your Todoist API token. All Todoist nodes can share this one configuration.

To get your personal Todoist API token, open https://app.todoist.com/app/settings/integrations/developer in Todoist (Settings → Integrations → Developer).

### Adding data

Each node reads its input from `msg.payload` (an object, e.g. `{ "id": "123" }` or `{ "content": "Buy milk" }`) and sends the Todoist response on its output as `msg.payload.data`. The fields every node understands are listed in [docs/nodes.md](docs/nodes.md). See the example below for a basic flow that creates a new task in your Todoist project.

### Example flow

```json
[
  {
    "id": "cd167cf2edaf6512",
    "type": "inject",
    "z": "a42573365dced8a7",
    "name": "'Create' Task Data",
    "props": [{ "p": "payload" }, { "p": "topic", "vt": "str" }],
    "repeat": "",
    "crontab": "",
    "once": false,
    "onceDelay": 0.1,
    "topic": "",
    "payload": "{\"content\":\"Test Task\",\"project_id\":2184202398,\"priority\":1}",
    "payloadType": "json",
    "x": 410,
    "y": 440,
    "wires": [["57872b84db271bd5"]]
  },
  {
    "id": "57872b84db271bd5",
    "type": "todoist-task-create",
    "z": "a42573365dced8a7",
    "name": "",
    "token": "59a4505979e26f0f",
    "x": 610,
    "y": 440,
    "wires": [["a33919ea4e211f6f"]]
  },
  {
    "id": "a33919ea4e211f6f",
    "type": "debug",
    "z": "a42573365dced8a7",
    "name": "",
    "active": true,
    "tosidebar": true,
    "console": false,
    "tostatus": false,
    "complete": "false",
    "statusVal": "",
    "statusType": "auto",
    "x": 970,
    "y": 680,
    "wires": []
  },
  { "id": "59a4505979e26f0f", "type": "add-todoist-api-token", "name": "Todoist" }
]
```

The payload data in the inject node is the same data as the Todoist API create task item, see the [Todoist API v1 documentation](https://developer.todoist.com/api/v1/).

## Nodes available

All nodes are in the palette category **Todoist**. The complete reference with all payload fields, examples and outputs is in **[docs/nodes.md](docs/nodes.md)**.

| Area | Nodes |
| --- | --- |
| **Tasks** | [Get all tasks](docs/nodes.md#get-all-tasks), [Get tasks by filter](docs/nodes.md#get-tasks-by-filter), [Get a task](docs/nodes.md#get-a-task), [Create a task](docs/nodes.md#create-a-task), [Quick add task](docs/nodes.md#quick-add-task), [Update a task](docs/nodes.md#update-a-task), [Move a task](docs/nodes.md#move-a-task), [Complete a task](docs/nodes.md#complete-a-task), [Reopen a task](docs/nodes.md#reopen-a-task), [Delete a task](docs/nodes.md#delete-a-task) |
| **Projects** | [Get all projects](docs/nodes.md#get-all-projects), [Get](docs/nodes.md#get-a-project), [Create](docs/nodes.md#create-a-project), [Update](docs/nodes.md#update-a-project), [Archive / Unarchive](docs/nodes.md#archive--unarchive-a-project), [Delete](docs/nodes.md#delete-a-project) |
| **Sections** | [List all](docs/nodes.md#list-all-sections), [Get](docs/nodes.md#get-a-section), [Create](docs/nodes.md#create-a-section), [Update](docs/nodes.md#update-a-section), [Delete](docs/nodes.md#delete-a-section) |
| **Labels** | [List all](docs/nodes.md#list-all-labels), [Get](docs/nodes.md#get-a-label), [Create](docs/nodes.md#create-a-label), [Update](docs/nodes.md#update-a-label), [Delete](docs/nodes.md#delete-a-label) |
| **Comments** | [List](docs/nodes.md#list-comments), [Create](docs/nodes.md#create-a-comment), [Update](docs/nodes.md#update-a-comment), [Delete](docs/nodes.md#delete-a-comment) |
| **Generic** | [Custom query](docs/nodes.md#generic-query) for any other endpoint of the Todoist API v1 |

Good to know (details in [docs/nodes.md](docs/nodes.md#common-behaviour)):

- Result data is in `msg.payload.data`, the HTTP status in `msg.payload.status`.
- List nodes load **all pages** from the API and return one flat array.
- On API errors `msg.payload` is the error object (`msg.payload.response.status`, `msg.payload.response.data`).
- Nodes added in 2.1.0 check the token and required payload fields before sending a request.

Here is a visual representation of the nodes available:

![all available nodes](https://raw.githubusercontent.com/ConstableW/node-red-contrib-todoist-api/master/all-nodes.png)

## Test flow

[`examples/todoist-test-flow.json`](examples/todoist-test-flow.json) is an importable flow (Node-RED menu → Import) with one inject per node and a shared debug output for manual testing. It also contains an **auto test** that creates a throw-away project `ClaudeTest`, runs all nodes against it and deletes it again. After importing, enter your Todoist API token in the "Todoist Token" config node and replace the placeholder IDs (`PROJECT_ID`, `TASK_ID`, ...) in the inject payloads for the manual tests.

## License

GNU General Public License v3.0 – see [LICENSE](LICENSE).

Originally created by [Alex Foxleigh](https://github.com/foxleigh81), maintained by [ConstableW](https://github.com/ConstableW).

## Support

Buy Me a Coffee – Maintainer:

[![Buy Me a Coffee – Maintainer](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/constablew)

Support the original author:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/I3I21FRCN)
