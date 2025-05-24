import fs from "node:fs/promises";

const databasePath = new URL("../db.json", import.meta.url);

export class Database {
  #database = {};

  constructor() {
    fs.readFile(databasePath, "utf8")
      .then((data) => {
        this.#database = JSON.parse(data);
      })
      .catch(() => {
        this.#persist();
      });
  }

  #persist() {
    fs.writeFile(databasePath, JSON.stringify(this.#database));
  }

  insert(table, data) {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }

    this.#persist();

    return data;
  }

  select(table, search) {
    let data = this.#database[table];

    if (!data) {
      return [];
    }

    if (search) {
      const searchValue = decodeURIComponent(search.toLowerCase());

      data = data.filter((task) =>
        Object.values(task).some((field) =>
          String(field).toLowerCase().includes(searchValue)
        )
      );
    }

    return data;
  }

  update(table, id, data) {
    if (!this.#database[table]) {
      return;
    }

    const taskFound = this.#database[table].find((task) => task.id === id);
    const taskIndex = this.#database[table].findIndex((task) => task.id === id);

    if (data.completed_at === true) {
      data.completed_at = new Date();
    }

    if (taskFound && taskIndex > -1) {
      this.#database[table][taskIndex] = {
        ...taskFound,
        ...data,
        updated_at: new Date(),
      };
      this.#persist();
    }

    return this.#database[table][taskIndex];
  }

  delete(table, id) {
    if (!this.#database[table]) {
      return;
    }

    const taskIndex = this.#database[table].findIndex((task) => task.id === id);

    if (taskIndex > -1) {
      this.#database[table].splice(taskIndex, 1);
      this.#persist();

      return true;
    }

    return false;
  }
}
