# json-rpc-api-provider

A lightweight, zero-configuration TypeScript library that transforms your interface definitions into fully-typed JSON-RPC API clients. No code generation, no boilerplate—just pure Proxy magic.

> **Elegant, type-safe JSON-RPC API provider with automatic camelCase to snake_case conversion**

[![npm version](https://badge.fury.io/js/@budarin%2Fjson-rpc-api-provider.svg)](https://www.npmjs.com/package/@budarin/json-rpc-api-provider)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🎯 Full Type Safety** - Complete TypeScript support with type inference for requests and responses
- **🔄 Smart Name Conversion** - Automatic camelCase → snake_case transformation for method names
- **📦 Lightweight** - Minimal footprint with only essential dependencies
- **🎭 Proxy-Based Magic** - No code generation or build step required
- **🆔 Flexible ID Generation** - Bring your own UUID generator (UUID v4, v7, nanoid, etc.)
- **✨ Clean API** - Write idiomatic JavaScript/TypeScript, let the library handle JSON-RPC protocol details
- **🔒 Immutable by Design** - Deep readonly types ensure request integrity

## 📦 Installation

```bash
# npm
npm install @budarin/json-rpc-api-provider

# pnpm
pnpm add @budarin/json-rpc-api-provider

# yarn
yarn add @budarin/json-rpc-api-provider
```

## 🚀 Quick Start

```ts
import { uuidv7 } from 'uuidv7';
import { createApiProvider } from '@budarin/json-rpc-api-provider';
import type { JsonRpcResponse } from '@budarin/json-rpc-request';

// Define your API interface
interface TodoAPI {
    getTodo: (id: string) => Promise<JsonRpcResponse<Todo>>;
    createTodo: (todo: NewTodo) => Promise<JsonRpcResponse<Todo>>;
    updateTodo: (id: string, updates: Partial<Todo>) => Promise<JsonRpcResponse<Todo>>;
    deleteTodo: (id: string) => Promise<JsonRpcResponse<void>>;
}

// Create your API provider
const api = createApiProvider<TodoAPI>(request, uuidv7);

// Use it with full type safety
const { result, error } = await api.getTodo('123');
//     ^? { result?: Todo; error?: JsonRpcError }
```

## 💡 Why Use This?

### Before: Manual JSON-RPC Calls

```ts
// Repetitive, error-prone, no type safety
const response = await fetch('/api', {
    method: 'POST',
    body: JSON.stringify({
        jsonrpc: '2.0',
        id: generateId(),
        method: 'get_todo', // Easy to mistype
        params: { id: todoId },
    }),
});
const data = await response.json();
// No type checking on response
if (data.error) {
    /* ... */
}
```

### After: With json-rpc-api-provider

```ts
// Clean, type-safe, idiomatic
const { result, error } = await api.getTodo(todoId);
//     ^? Fully typed!
if (error) {
    /* TypeScript knows the error shape */
}
```

## 📖 Usage Guide

### Step 1: Define Your Request Function

The request function handles the actual HTTP communication:

```ts
import type { Request, JsonRpcResponse } from '@budarin/json-rpc-request';

const request = async <P, R, E = unknown>(params: Request): Promise<JsonRpcResponse<R, E>> => {
    try {
        const response = await fetch('/api/jsonrpc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                ...params.body,
            }),
        });

        return await response.json();
    } catch (error) {
        return {
            error: {
                code: -32000,
                message: error.message,
            },
        };
    }
};
```

### Step 2: Define Your API Interface

```ts
import type { JsonRpcResponse } from '@budarin/json-rpc-request';

interface User {
    id: string;
    name: string;
    email: string;
}

interface UserAPI {
    // Simple method without parameters
    getCurrentUser: () => Promise<JsonRpcResponse<User>>;

    // Method with single parameter
    getUser: (userId: string) => Promise<JsonRpcResponse<User>>;

    // Method with object parameter
    createUser: (data: { name: string; email: string }) => Promise<JsonRpcResponse<User>>;

    // Method with multiple properties in parameter
    updateUser: (params: { id: string; updates: Partial<User> }) => Promise<JsonRpcResponse<User>>;

    // Method returning void
    deleteUser: (userId: string) => Promise<JsonRpcResponse<void>>;
}
```

### Step 3: Create the API Provider

```ts
import { uuidv7 } from 'uuidv7';
import { createApiProvider } from '@budarin/json-rpc-api-provider';

export const userApi = createApiProvider<UserAPI>(request, uuidv7);
```

### Step 4: Use in Your Application

```ts
// Get current user
const { result: user, error } = await userApi.getCurrentUser();
// Calls JSON-RPC method: "get_current_user"

if (error) {
    console.error('Failed to fetch user:', error.message);
    return;
}

console.log('User:', user);

// Create new user
const createResponse = await userApi.createUser({
    name: 'John Doe',
    email: 'john@example.com',
});
// Calls JSON-RPC method: "create_user"

// Update user
const updateResponse = await userApi.updateUser({
    id: user.id,
    updates: { name: 'Jane Doe' },
});
// Calls JSON-RPC method: "update_user"
```

## 🔧 Advanced Examples

### Custom Error Handling

```ts
interface ApiError {
    code: number;
    message: string;
    details?: Record<string, unknown>;
}

interface API {
    riskyOperation: (data: unknown) => Promise<JsonRpcResponse<Result, ApiError>>;
}

const api = createApiProvider<API>(request, uuidv7);

const { result, error } = await api.riskyOperation(data);

if (error) {
    switch (error.code) {
        case 404:
            console.error('Not found:', error.message);
            break;
        case 500:
            console.error('Server error:', error.details);
            break;
        default:
            console.error('Unknown error:', error);
    }
}
```

### Multiple API Providers

```ts
// Separate providers for different services
const userApi = createApiProvider<UserAPI>(createRequest('/api/users'), uuidv7);
const todoApi = createApiProvider<TodoAPI>(createRequest('/api/todos'), uuidv7);
const authApi = createApiProvider<AuthAPI>(createRequest('/api/auth'), uuidv7);

// Use them independently
await userApi.getUser('123');
await todoApi.getTodo('456');
await authApi.login({ username, password });
```

## 🎯 Method Name Conversion

The library automatically converts your camelCase method names to snake_case for JSON-RPC:

| JavaScript/TypeScript | JSON-RPC Method    |
| --------------------- | ------------------ |
| `getTodo()`           | `get_todo`         |
| `createTodo()`        | `create_todo`      |
| `getUserProfile()`    | `get_user_profile` |
| `updateAPIKey()`      | `update_a_p_i_key` |
| `deleteOldData()`     | `delete_old_data`  |

This allows you to write idiomatic JavaScript/TypeScript while adhering to JSON-RPC naming conventions.

## 📚 API Reference

### `createApiProvider<T>(request, uuidGenerator)`

Creates a type-safe proxy object that converts method calls into JSON-RPC requests.

#### Parameters

- **`request`**: `Request` (from `@budarin/json-rpc-request`)
    - A function that handles HTTP communication
    - Must accept a `Request` object with a `body` property
    - Should return a `Promise<JsonRpcResponse<T, E>>`

- **`uuidGenerator`**: `() => string`
    - A function that generates unique identifiers for each request
    - Called once per API method invocation
    - Common choices: `uuidv4`, `uuidv7`, `nanoid`, or custom implementations

#### Returns

- **`DeepReadonly<T>`**: A proxy object with methods matching your API interface
    - All methods are deeply immutable to prevent accidental modifications
    - Each method call automatically:
        - Generates a unique ID using `uuidGenerator`
        - Converts the method name from camelCase to snake_case
        - Wraps parameters in the JSON-RPC format
        - Returns a properly typed `JsonRpcResponse<Result, Error>`

#### Type Definitions

```ts
import type { JsonRpcResponse, RequestProvider, DeepReadonly } from '@budarin/json-rpc-api-provider';

// JsonRpcResponse<T, E = unknown>
interface JsonRpcResponse<T, E = unknown> {
    result?: T;
    error?: {
        code: number;
        message: string;
        data?: E;
    };
}

// Request object structure
interface Request {
    body: {
        id: string;
        method: string;
        params?: unknown;
    };
}
```

## 🔒 TypeScript Support

This library is written in TypeScript and provides full type safety:

- **Generic API Interfaces**: Define your entire API surface with TypeScript interfaces
- **Type Inference**: Response types are automatically inferred from your interface
- **Deep Readonly**: Request objects are deeply immutable to prevent accidental mutations
- **Error Types**: Support for custom error types via generics
- **No `any` Types**: Strict typing throughout the library

### Example with Full Type Safety

```ts
interface Product {
    id: string;
    name: string;
    price: number;
}

interface ValidationError {
    field: string;
    message: string;
}

interface ProductAPI {
    getProduct: (id: string) => Promise<JsonRpcResponse<Product, ValidationError>>;
}

const api = createApiProvider<ProductAPI>(request, uuidv7);

const response = await api.getProduct('123');
//    ^? JsonRpcResponse<Product, ValidationError>

if (response.error) {
    //  ^? { code: number; message: string; data?: ValidationError }
    console.error(response.error.data?.field);
    //                              ^? string | undefined
}

if (response.result) {
    //  ^? Product | undefined
    console.log(response.result.name);
    //                          ^? string
}
```

## 🤝 Integration with @budarin/json-rpc-request

This library is designed to work seamlessly with [`@budarin/json-rpc-request`](https://github.com/budarin/json-rpc-request), which provides:

- Type definitions for JSON-RPC protocol
- Request/Response interfaces
- Utility types for building JSON-RPC clients

Together, they provide a complete, type-safe solution for JSON-RPC APIs.

## 📄 License

MIT © [Vadim Budarin](https://github.com/budarin)

## 🔗 Related Packages

- [@budarin/json-rpc-request](https://www.npmjs.com/package/@budarin/json-rpc-request) - Core types and utilities for JSON-RPC
