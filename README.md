# json-rpc-api-provider

Provider for any JSON RPC API.

## Installation

```bash
# npm
npm i @budarin/json-rpc-api-provider

# pnpm
pnpm add @budarin/json-rpc-api-provider
```

## Usage

Create an API provider for your API:

```ts
// apiProvider.ts

import type { Todo } from '../types';
import type { JsonRpcResponse } from '@budarin/json-rpc-request';
import { request } from '../../request';
import { createApiProvider } from '@budarin/json-rpc-api-provider';

// Describe your API interface
interface API {
    getTodo: () => Promise<JsonRpcResponse<Todo>>;
    createTodo: (category: object) => Promise<JsonRpcResponse<Todo>>;
    // ... other methods
}

// UUID generator function
const generateUuid = () => crypto.randomUUID();

export const apiProvider = createApiProvider<API>(request, generateUuid);
```

And somewhere in your code:

```ts
import { apiProvider } from '../providers/apiProvider';

const { error, result } = await apiProvider.getTodo(); // => calls 'get_todo' POST method
if (error) {
    // log the error
    return;
}

// ...

const newTodo = {
    /* ... */
};
const createTodoResponse = await apiProvider.createTodo(newTodo); // => calls 'create_todo' POST method

if (createTodoResponse.error) {
    // log the error
    return;
}
```

## API

### `createApiProvider<T>(request, uuidGenerator)`

Creates a proxy object that automatically converts camelCase method names to snake_case for JSON-RPC calls.

**Parameters:**

- `request`: A request function that handles HTTP requests
- `uuidGenerator`: A function that generates unique IDs for JSON-RPC requests

**Returns:** A proxy object with typed methods that correspond to your API interface.
