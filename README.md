## Desafio

Desenvolver uma API para realizar o CRUD de suas _tasks_ (tarefas) utilizando `Node.js puro`.

A API deve conter as seguintes funcionalidades:

- [✔] Criação de uma task
- [✔] Listagem de todas as tasks
- [✔] Atualização de uma task pelo `id`
- [✔] Remover uma task pelo `id`
- [✔] Marcar pelo `id` uma task como completa
- [✔] E o verdadeiro desafio: Importação de tasks em massa por um arquivo CSV

### Rotas e regras de negócio

Antes das rotas, vamos entender qual a estrutura (propriedades) que uma task deve ter:

- `id` - Identificador único de cada task
- `title` - Título da task
- `description` - Descrição detalhada da task
- `completed_at` - Data de quando a task foi concluída. O valor inicial deve ser `null`
- `created_at` - Data de quando a task foi criada.
- `updated_at` - Deve ser sempre alterado para a data de quando a task foi atualizada.

Rotas:

- `POST - /tasks`
  Deve ser possível criar uma task no banco de dados, enviando os campos `title` e `description` por meio do `body` da requisição.
  Ao criar uma task, os campos: `id`, `created_at`, `updated_at` e `completed_at` devem ser preenchidos automaticamente, conforme a orientação das propriedades acima.
- `GET - /tasks`
  Deve ser possível listar todas as tasks salvas no banco de dados.
  Também deve ser possível realizar uma busca, filtrando as tasks pelo `title` e `description`
- `PUT - /tasks/:id`
  Deve ser possível atualizar uma task pelo `id`.
  No `body` da requisição, deve receber somente o `title` e/ou `description` para serem atualizados.
  Se for enviado somente o `title`, significa que o `description` não pode ser atualizado e vice-versa.
  Antes de realizar a atualização, deve ser feito uma validação se o `id` pertence a uma task salva no banco de dados.
- `DELETE - /tasks/:id`
  Deve ser possível remover uma task pelo `id`.
  Antes de realizar a remoção, deve ser feito uma validação se o `id` pertence a uma task salva no banco de dados.
- `PATCH - /tasks/:id/complete`
  Deve ser possível marcar a task como completa ou não. Isso significa que se a task estiver concluída, deve voltar ao seu estado “normal”.
  Antes da alteração, deve ser feito uma validação se o `id` pertence a uma task salva no banco de dados.

### E a importação do CSV?

Normalmente em uma API, a importação de um CSV acontece enviando o arquivo pela rota, por meio de outro formato, chamado `multipart/form-data`.

Como ainda não vimos isso em aula, a importação será feita de outra forma. Acesse a página abaixo para a explicação:

[Criação via CSV com Stream](https://www.notion.so/Cria-o-via-CSV-com-Stream-21ba6d279991473792787d9265212181?pvs=21)

### Indo além

Algumas sugestões do que pode ser implementado:

- [x] Validar se as propriedades `title` e `description` das rotas `POST` e `PUT` estão presentes no `body` da requisição.
- [x] Nas rotas que recebem o `/:id`, além de validar se o `id` existe no banco de dados, retornar a requisição com uma mensagem informando que o registro não existe.

## ✅ Resultado do desafio

Este desafio permitiu que eu compreendesse principalmente o conceito de `streams` do Node.js, que acaba sendo abstraído no uso de frameworks.

- Referente a estrutura das propriedades, segui exatamente o especificado no desafio.
- Referente as rotas, optei por não utilizar a rota `PUT` e deixei apenas a rota `PATCH` para atualização, deixando o agente da requisição optar por qual propriedade ele quer atualizar (title, description e/ou completed_at). Este último é enviado um valor `boolean` e caso seja true, ele salva a data atual através do `new Date()`. Confira o método `update` no arquivo `database.js` e o objeto com `method: "PATCH"` no arquivo `routes.js`. As rotas restantes implementei como a especificação do desafio.
- Referente a importação do arquivo CSV, fiz como sugerido: através de um arquivo separado em `utils/upload-tasks-csv.js`. Para realizar a importação das tasks pelo arquivo csv, basta deixar o servidor rodando e executar o script `npm run upload`.

```js
import fs from "node:fs";
import { parse } from "csv-parse";

const csvPath = new URL("../../tasks-upload.csv", import.meta.url);

async function processFile() {
  const records = [];
  const parser = fs.createReadStream(csvPath).pipe(parse({ columns: true }));

  for await (const record of parser) {
    const response = await fetch("http://localhost:3333/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(record),
    });

    const responseBody = await response.json();

    records.push(responseBody);
  }

  return records;
}

const createdTasks = await processFile();

console.log("Created tasks in database: \n", createdTasks);
```

- Referente a sugestão de "ir além" e validar as propriedades `title` e `description`, também validei a propriedade `completed_at` e criei retornos de erros customizados `NotFoundError` e `ValidationError` no body.

```js
{
  name: "NotFoundError",
  message: "O recurso não foi encontrado.",
  action: "Verifique os dados e tente novamente.",
  status_code: 404,
},
{
  name: "ValidationError",
  message: "Ocorreu algum erro de validação.",
  action: "Ajuste os dados enviados e tente novamente.",
  tatus_code: 400,
}
```

## Executar o projeto

```bash
npm i
npm run dev
```
