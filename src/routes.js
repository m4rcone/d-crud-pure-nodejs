import { randomUUID } from "node:crypto";
import { buildRoutePath } from "./utils/build-route-path.js";
import { Database } from "./database.js";

const database = new Database();

export const routes = [
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (
        typeof title !== "string" ||
        typeof description !== "string" ||
        !title.trim() ||
        !description.trim()
      ) {
        return res.writeHead(400).end(
          JSON.stringify({
            name: "ValidationError",
            message: "Ocorreu algum erro de validação.",
            action: "Ajuste os dados enviados e tente novamente.",
            status_code: 400,
          })
        );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        created_at: new Date(),
        updated_at: new Date(),
        completed_at: null,
      };

      database.insert("tasks", task);

      return res.writeHead(201).end(JSON.stringify(task));
    },
  },
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query;

      const tasks = database.select("tasks", search);

      return res.writeHead(200).end(JSON.stringify(tasks));
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const data = req.body;

      if (
        (data.title && typeof data.title !== "string") ||
        (data.description && typeof data.description !== "string") ||
        (data.completed_at && typeof data.completed_at !== "boolean")
      ) {
        return res.writeHead(400).end(
          JSON.stringify({
            name: "ValidationError",
            message: "Ocorreu algum erro de validação.",
            action: "Ajuste os dados enviados e tente novamente.",
            status_code: 400,
          })
        );
      }

      const updatedTask = database.update("tasks", id, data);

      if (!updatedTask) {
        return res.writeHead(404).end(
          JSON.stringify({
            name: "NotFoundError",
            message: "O recurso não foi encontrado.",
            action: "Verifique os dados e tente novamente.",
            status_code: 404,
          })
        );
      }

      return res.writeHead(200).end(JSON.stringify(updatedTask));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const taskFoundAndDeleted = database.delete("tasks", id);

      if (!taskFoundAndDeleted) {
        return res.writeHead(404).end(
          JSON.stringify({
            name: "NotFoundError",
            message: "O recurso não foi encontrado.",
            action: "Verifique os dados e tente novamente.",
            status_code: 404,
          })
        );
      }

      return res.writeHead(204).end();
    },
  },
];
