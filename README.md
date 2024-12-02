# json-rpc-api-provider

Provider for any JSON Prp API.

Create API provider for your API:

```ts
//apiProvider.ts

import type { Todo } from '../types.ts';
import type { JsonRpcResponse } from '@budarin/json-rpc-request';

import { request } from '../../request.ts';

interface API {
    getTodo: () => Promise<JsonRpcResponse<Todo>>;
    createTodo: (category: object) => Promise<JsonRpcResponse<Todo>>;
    ...
}


export const apiProvider = createApi<API>(request); // optional yaou can pass a logger instance
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
cons createTodoResponse =  apiProvider.createTodo(newTodo);

if (createTodoResponse.error) {
    //
    // log the error
    return;
}
...
```
