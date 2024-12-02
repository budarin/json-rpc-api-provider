# json-rpc-api-provider

Provider for any JSON RPC API.

Install the package^

```cmd
// npm
npm i @budarin/json-rpc-api-provider;

// pnpm
pnpm add @budarin/json-rpc-api-provider;
```

Create an API provider for your API:

```ts
//apiProvider.ts

import type { Todo } from '../types.ts';
import type { JsonRpcResponse } from '@budarin/json-rpc-request';

import { request } from '../../request.ts';
import { createApiProvider } from '@budarin/json-rpc-api-provider';


// Describe your API interface
interface API {
    getTodo: () => Promise<JsonRpcResponse<Todo>>;
    createTodo: (category: object) => Promise<JsonRpcResponse<Todo>>;
    ...
}


export const apiProvider = createApiProvider<API>(request); // optional you can pass a pino logger instance
```

And somwhere in the code:

```ts
import { apiProvider } from '../providers/apiProvider.ts'

const { error, result} = apiProvider.getTodo();
if (error) {
    // log the error
    return;
}

...

const newTodo = { ... }
const createTodoResponse = apiProvider.createTodo(newTodo);

if (createTodoResponse.error) {
    //
    // log the error
    return;
}
...
```
