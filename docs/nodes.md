# Node reference

Complete reference of all nodes in `@constablew/node-red-contrib-todoist-api` (Todoist API v1, base URL `https://api.todoist.com/api/v1/`).

All nodes live in the palette category **Todoist**, take their input from `msg.payload` and need a **Todoist Token** config node (see [README](../README.md#configuration)).

- [Common behaviour](#common-behaviour)
- [Tasks](#tasks)
- [Projects](#projects)
- [Sections](#sections)
- [Labels](#labels)
- [Comments](#comments)
- [Generic query](#generic-query)
- [Field reference](#field-reference)
- [Examples](#examples)

## Common behaviour

### Input

`msg.payload` must be an object. Its fields are described per node below. IDs are strings (numbers also work). Fields not listed for a node are ignored by that node, but fields you add to the body of a *create* or *update* node are passed through to Todoist unchanged, so any field the Todoist API accepts can be used (see the [Todoist API v1 reference](https://developer.todoist.com/api/v1/)).

### Output

On success the node sends the message on its output with:

| Property | Content |
| --- | --- |
| `msg.payload` | The full HTTP response (axios response object) |
| `msg.response` | Same as `msg.payload` |
| `msg.payload.status` | HTTP status code (e.g. `200`, `204`) |
| `msg.payload.data` | The data returned by Todoist (an object, or an **array** for list nodes) |

Use `msg.payload.data` in the next node. The node status shows a green **Success**.

On an API error (e.g. 400, 401, 404) the node still sends a message, but `msg.payload` and `msg.response` contain the **error object**: `msg.payload.response.status` is the HTTP status and `msg.payload.response.data` the error body. The node status shows a red **API Error**. Check `msg.payload.status` / `msg.payload.response` in a switch node if you need to branch on errors.

### List nodes and pagination

Todoist API v1 returns lists page by page (`{ results: [...], next_cursor }`). All list nodes (marked *all pages* below) follow the cursor automatically with `limit=200` per request and return **one flat array** in `msg.payload.data`.

### Validation

Nodes added in version 2.1.0 (everything except the original task/project nodes and the generic query node) check before sending a request:

- no token configured → the node reports `No Todoist API token configured` (catch node / debug)
- a required payload field is missing → the node reports `msg.payload.<field> required` and sends nothing

The original nodes (get/create/update/complete/reopen/delete task, get all tasks, get all projects, query) do not validate and send whatever they get.

---

## Tasks

| Node | Type id | Request |
| --- | --- | --- |
| [Get all tasks](#get-all-tasks) | `todoist-task-get-all` | `GET tasks` (all pages) |
| [Get tasks by filter](#get-tasks-by-filter) | `todoist-task-filter` | `GET tasks/filter` (all pages) |
| [Get a task](#get-a-task) | `todoist-task-get` | `GET tasks/{id}` |
| [Create a task](#create-a-task) | `todoist-task-create` | `POST tasks` |
| [Quick add task](#quick-add-task) | `todoist-task-quick-add` | `POST tasks/quick` |
| [Update a task](#update-a-task) | `todoist-task-update` | `POST tasks/{id}` |
| [Move a task](#move-a-task) | `todoist-task-move` | `POST tasks/{id}/move` |
| [Complete a task](#complete-a-task) | `todoist-task-complete` | `POST tasks/{id}/close` |
| [Reopen a task](#reopen-a-task) | `todoist-task-reopen` | `POST tasks/{id}/reopen` |
| [Delete a task](#delete-a-task) | `todoist-task-delete` | `DELETE tasks/{id}` |

### Get all tasks

Lists all active tasks of the account, optionally only those of one project.

| Payload field | Required | Description |
| --- | --- | --- |
| `project_id` | no | Only tasks of this project |

```json
{ "project_id": "2184202398" }
```

Output: `msg.payload.data` = array of tasks. An empty payload (`{}`) returns all tasks.

### Get tasks by filter

Lists active tasks matching a [Todoist filter query](https://todoist.com/help/articles/introduction-to-filters-V98wIH).

| Payload field | Required | Description |
| --- | --- | --- |
| `query` | **yes** | Filter query, e.g. `today \| overdue`, `p1 & #Work`, `@home` |
| `lang` | no | Language of the query (e.g. `en`, `de`) |

```json
{ "query": "today | overdue", "lang": "en" }
```

Output: `msg.payload.data` = array of tasks.

### Get a task

| Payload field | Required | Description |
| --- | --- | --- |
| `id` | **yes** | Task ID |

```json
{ "id": "6X7rM8997g3RQmvh" }
```

Output: `msg.payload.data` = the task.

### Create a task

Creates a task. The whole payload is sent as the request body.

| Payload field | Required | Description |
| --- | --- | --- |
| `content` | **yes** | Task title (Markdown supported) |
| `description` | no | Longer description |
| `project_id` | no | Target project (Inbox if omitted) |
| `section_id` | no | Target section |
| `parent_id` | no | Parent task (creates a sub-task) |
| `labels` | no | Array of label names, e.g. `["home","urgent"]` |
| `priority` | no | `1` (normal) to `4` (most urgent, shown as p1 in the app) |
| `due_string` | no | Natural language date, e.g. `tomorrow at 12:00`, `every monday` |
| `due_date` | no | `YYYY-MM-DD` |
| `due_datetime` | no | RFC 3339 date and time, e.g. `2026-11-08T10:00:00Z` |
| `due_lang` | no | Language of `due_string` |
| `assignee_id` | no | User ID in shared projects |
| `order` | no | Position inside the project/section |
| `duration`, `duration_unit` | no | e.g. `30`, `minute` (or `day`) |
| `deadline_date`, `deadline_lang` | no | Deadline (`YYYY-MM-DD`) |

```json
{
  "content": "Buy milk",
  "project_id": "2184202398",
  "labels": ["home"],
  "priority": 3,
  "due_string": "tomorrow at 10:00"
}
```

Output: `msg.payload.data` = the created task (contains the new `id`).

### Quick add task

Adds a task from natural language like the Quick Add in the Todoist app. Project (`#Name`), labels (`@name`), priority (`p1`..`p4`), due date and assignee are parsed from the text.

| Payload field | Required | Description |
| --- | --- | --- |
| `text` | **yes** | Quick-add text, e.g. `Buy milk tomorrow #Shopping @home p1` |
| `note` | no | Comment added to the task |
| `reminder` | no | Reminder text (natural language) |
| `auto_reminder` | no | `true`/`false`: add the default reminder for tasks with a due time |

```json
{ "text": "Buy milk tomorrow #Shopping @home p1" }
```

Output: `msg.payload.data` = the created task. (The node adds `meta: true` to the request.)

### Update a task

Changes fields of a task. `id` selects the task; all other payload fields are sent as the request body (only the fields you send are changed).

| Payload field | Required | Description |
| --- | --- | --- |
| `id` | **yes** | Task ID |
| `content` | no | New title |
| `description` | no | New description |
| `labels` | no | New array of label names (replaces existing labels) |
| `priority` | no | `1`..`4` |
| `due_string`, `due_date`, `due_datetime`, `due_lang` | no | New due date (see *Create a task*) |
| `assignee_id` | no | New assignee |
| `child_order`, `day_order`, `is_collapsed` | no | Ordering / collapsed state |
| `duration`, `duration_unit` | no | Duration |
| `deadline_date`, `deadline_lang` | no | Deadline |

```json
{ "id": "6X7rM8997g3RQmvh", "content": "Buy oat milk", "priority": 4 }
```

Output: `msg.payload.data` = the updated task. To change the project or section use [Move a task](#move-a-task).

### Move a task

Moves a task to another project, section or parent task. Provide **exactly one** of `project_id`, `section_id`, `parent_id`.

| Payload field | Required | Description |
| --- | --- | --- |
| `id` | **yes** | Task ID |
| `project_id` | one of | Move into this project |
| `section_id` | one of | Move into this section |
| `parent_id` | one of | Make it a sub-task of this task |

```json
{ "id": "6X7rM8997g3RQmvh", "section_id": "7025" }
```

### Complete a task

Marks a task as completed (recurring tasks move to their next due date).

| Payload field | Required | Description |
| --- | --- | --- |
| `id` | **yes** | Task ID |

```json
{ "id": "6X7rM8997g3RQmvh" }
```

Output: `msg.payload.status` = `204`.

### Reopen a task

Reopens a completed task. Payload: `{ "id": "..." }`. Output: `msg.payload.status` = `204`.

### Delete a task

Permanently deletes a task. Payload: `{ "id": "..." }`. Output: `msg.payload.status` = `204`.

---

## Projects

| Node | Type id | Request |
| --- | --- | --- |
| [Get all projects](#get-all-projects) | `todoist-project-get-all` | `GET projects` (all pages) |
| [Get a project](#get-a-project) | `todoist-project-get` | `GET projects/{id}` |
| [Create a project](#create-a-project) | `todoist-project-create` | `POST projects` |
| [Update a project](#update-a-project) | `todoist-project-update` | `POST projects/{id}` |
| [Archive a project](#archive--unarchive-a-project) | `todoist-project-archive` | `POST projects/{id}/archive` |
| [Unarchive a project](#archive--unarchive-a-project) | `todoist-project-unarchive` | `POST projects/{id}/unarchive` |
| [Delete a project](#delete-a-project) | `todoist-project-delete` | `DELETE projects/{id}` |

### Get all projects

Lists all projects of the account. The payload is not used. Output: `msg.payload.data` = array of projects.

### Get a project

Payload: `{ "id": "..." }` (required). Output: `msg.payload.data` = the project.

### Create a project

| Payload field | Required | Description |
| --- | --- | --- |
| `name` | **yes** | Project name |
| `parent_id` | no | Parent project (creates a sub-project) |
| `description` | no | Description |
| `color` | no | Todoist color name, e.g. `berry_red`, `blue`, `grey` |
| `is_favorite` | no | `true`/`false` |
| `view_style` | no | e.g. `list` or `board` |

```json
{ "name": "Shopping", "color": "berry_red", "is_favorite": true }
```

Output: `msg.payload.data` = the created project (contains the new `id`).

### Update a project

`id` is required; optional fields: `name`, `description`, `color`, `is_favorite`, `view_style`, `child_order`, `is_collapsed`.

```json
{ "id": "2184202398", "name": "Groceries" }
```

### Archive / unarchive a project

Payload: `{ "id": "..." }` (required). Archived projects disappear from the active lists and can be restored with *Unarchive a project*.

### Delete a project

Payload: `{ "id": "..." }` (required). **Deletes the project including all its tasks, sections and comments.** Output: `msg.payload.status` = `204`.

---

## Sections

| Node | Type id | Request |
| --- | --- | --- |
| [List all sections](#list-all-sections) | `todoist-section-get-all` | `GET sections` (all pages) |
| [Get a section](#get-a-section) | `todoist-section-get` | `GET sections/{id}` |
| [Create a section](#create-a-section) | `todoist-section-create` | `POST sections` |
| [Update a section](#update-a-section) | `todoist-section-update` | `POST sections/{id}` |
| [Delete a section](#delete-a-section) | `todoist-section-delete` | `DELETE sections/{id}` |

### List all sections

| Payload field | Required | Description |
| --- | --- | --- |
| `project_id` | no | Only sections of this project |

Output: `msg.payload.data` = array of sections.

### Get a section

Payload: `{ "id": "..." }` (required). Output: `msg.payload.data` = the section.

### Create a section

| Payload field | Required | Description |
| --- | --- | --- |
| `name` | **yes** | Section name |
| `project_id` | **yes** | Project the section belongs to |
| `order` | no | Position inside the project |

```json
{ "name": "Groceries", "project_id": "2184202398" }
```

### Update a section

`id` is required; optional fields: `name`, `section_order`, `is_collapsed`.

```json
{ "id": "7025", "name": "Food" }
```

### Delete a section

Payload: `{ "id": "..." }` (required). **Deletes the section including its tasks.**

---

## Labels

Personal labels of the account.

| Node | Type id | Request |
| --- | --- | --- |
| [List all labels](#list-all-labels) | `todoist-label-get-all` | `GET labels` (all pages) |
| [Get a label](#get-a-label) | `todoist-label-get` | `GET labels/{id}` |
| [Create a label](#create-a-label) | `todoist-label-create` | `POST labels` |
| [Update a label](#update-a-label) | `todoist-label-update` | `POST labels/{id}` |
| [Delete a label](#delete-a-label) | `todoist-label-delete` | `DELETE labels/{id}` |

### List all labels

Payload is not used. Output: `msg.payload.data` = array of labels.

### Get a label

Payload: `{ "id": "..." }` (required).

### Create a label

| Payload field | Required | Description |
| --- | --- | --- |
| `name` | **yes** | Label name (without `@`) |
| `color` | no | Todoist color name |
| `order` | no | Position in the label list |
| `is_favorite` | no | `true`/`false` |

```json
{ "name": "home", "color": "berry_red" }
```

### Update a label

`id` is required; optional fields: `name`, `color`, `order`, `is_favorite`.

### Delete a label

Payload: `{ "id": "..." }` (required). The label is removed from all tasks.

---

## Comments

| Node | Type id | Request |
| --- | --- | --- |
| [List comments](#list-comments) | `todoist-comment-get-all` | `GET comments` (all pages) |
| [Create a comment](#create-a-comment) | `todoist-comment-create` | `POST comments` |
| [Update a comment](#update-a-comment) | `todoist-comment-update` | `POST comments/{id}` |
| [Delete a comment](#delete-a-comment) | `todoist-comment-delete` | `DELETE comments/{id}` |

### List comments

Todoist needs **either** `task_id` **or** `project_id`.

| Payload field | Required | Description |
| --- | --- | --- |
| `task_id` | one of | Comments of this task |
| `project_id` | one of | Comments of this project |

Output: `msg.payload.data` = array of comments.

### Create a comment

| Payload field | Required | Description |
| --- | --- | --- |
| `content` | **yes** | Comment text (Markdown supported) |
| `task_id` | one of | Task to comment on |
| `project_id` | one of | Project to comment on |
| `uids_to_notify` | no | Array of user IDs to notify (shared projects) |

```json
{ "content": "Remember the receipt", "task_id": "6X7rM8997g3RQmvh" }
```

### Update a comment

Payload: `{ "id": "...", "content": "new text" }` (both required).

### Delete a comment

Payload: `{ "id": "..." }` (required).

---

## Generic query

Node **Custom query** (`todoist-query-api`) calls any endpoint of the Todoist API v1. Use it for everything without a dedicated node (reminders, collaborators, completed tasks, ...).

| Payload field | Required | Description |
| --- | --- | --- |
| `endpoint` | **yes** | Path relative to `https://api.todoist.com/api/v1/`, **without** a leading slash. Query parameters go in the string, e.g. `tasks/completed/by_completion_date?since=2026-11-01T00:00:00Z` |
| `method` | no | `GET` (default), `POST`, `DELETE`, ... |
| `data` | no | Request body for `POST` requests |

```json
{ "endpoint": "projects/2184202398/collaborators", "method": "GET" }
```

```json
{ "endpoint": "reminders", "method": "POST", "data": { "task_id": "6X7rM8997g3RQmvh", "minute_offset": 30 } }
```

The query node does **not** follow pagination: for list endpoints `msg.payload.data` is the raw page `{ "results": [...], "next_cursor": "..." }`. Pass `next_cursor` as `cursor=...` in the next request to fetch the following page.

---

## Field reference

| Field | Meaning |
| --- | --- |
| `id` | ID of the object the node works on |
| `project_id`, `section_id`, `parent_id`, `task_id` | IDs of related objects |
| `priority` | `1` = normal ... `4` = most urgent (appears as *p1* in the app) |
| `due_string` | Natural-language date, handled by Todoist (`tomorrow`, `every other friday`) |
| `due_date` | Date only, `YYYY-MM-DD` |
| `due_datetime` | Date and time, RFC 3339 (`2026-11-08T10:00:00Z`) |
| `labels` | Array of label **names** (not IDs) |
| `color` | Todoist color name such as `berry_red`, `orange`, `blue`, `grey` |

The authoritative list of all fields and their values is the [Todoist API v1 documentation](https://developer.todoist.com/api/v1/).

## Examples

- [`examples/todoist-test-flow.json`](../examples/todoist-test-flow.json): importable flow with one inject per node, shared debug output and an automatic test of all nodes.
- [`examples/examples.json`](../examples/examples.json): the original example flows.
