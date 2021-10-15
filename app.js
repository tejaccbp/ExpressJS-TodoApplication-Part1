const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());
db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("http server starts at localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

/*const hasPriorityAndStatusProperties = (queryObject) => {
  return queryObject.priority !== undefined && queryObject.status !== undefined;
};
const hasPriorityProperties = (queryObject) => {
  return queryObject.priority !== undefined;
};

const hasStatusProperties = (queryObject) => {
  return queryObject.status !== undefined;
};*/

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "" } = request.query;
  let getStatusQuery = "";
  let sai = null;

  if (request.query.priority !== undefined) {
    getStatusQuery = `SELECT * FROM todo WHERE priority='${priority}' 
    AND todo LIKE '%${search_q}%';`;
  } else if (request.query.status !== undefined) {
    getStatusQuery = `SELECT * FROM todo WHERE status='${status}'
    AND todo LIKE '%${search_q}%';`;
  } else if (
    (request.query.status !== undefined) &
    (request.query.priority !== undefined)
  ) {
    getStatusQuery = `SELECT * FROM todo
     WHERE priority='${priority}' AND status='${status}' 
     AND todo LIKE '%${search_q}%';`;
  } else {
    getStatusQuery = `SELECT * FROM todo
     WHERE todo LIKE '%${search_q}%';`;
  }
  sai = await db.all(getStatusQuery);
  response.send(sai);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const oneTodoQuery = `SELECT * FROM todo WHERE id=${todoId}`;
  const sai1 = await db.get(oneTodoQuery);
  response.send(sai1);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, status, priority } = request.body;
  const saiPostQuery = `INSERT INTO todo (id,todo,status,priority) 
  VALUES (${id},'${todo}','${status}','${priority}');`;
  await db.run(saiPostQuery);
  response.send("Todo Successfully Added");
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId}`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  let tejesh = "";

  if (request.body.status !== undefined) {
    tejesh = "Status";
  } else if (request.body.todo !== undefined) {
    tejesh = "Todo";
  } else {
    tejesh = "Priority";
  }

  const previousTodoQuery = `SELECT * FROM todo`;
  const previousTodo = await db.get(previousTodoQuery);
  const {
    status = previousTodo.status,
    priority = previousTodo.priority,
    todo = previousTodo.todo,
  } = request.body;

  const updateQuery = `UPDATE todo 
SET status="${status}",priority="${priority}",
todo ="${todo}" 
WHERE id=${todoId};`;
  await db.run(updateQuery);
  response.send(`${tejesh} Updated`);
});

module.exports = app;
