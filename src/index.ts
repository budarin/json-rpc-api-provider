import { ulid } from '@budarin/ulid';

import type { Request, DeepReadonly, JsonRpcResponse } from '@budarin/json-rpc-request';

type RequestProvider = DeepReadonly<Request>;

function camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`);
}

export const createApiProvider = <T extends object>(request: RequestProvider): DeepReadonly<T> =>
    new Proxy(
        {},
        {
            get(_, method_name: string) {
                return async <P, T = P, E = unknown>(props?: P) => {
                    const id = ulid();
                    const methodName = camelToSnake(method_name);

                    const requestParams = {
                        body: {
                            id,
                            method: methodName,
                            ...(props !== undefined && { params: props }),
                        },
                    };

                    return request<P, JsonRpcResponse<T, E>, E>(requestParams);
                };
            },
        },
    ) as DeepReadonly<T>;

export type { JsonRpcResponse, RequestProvider, DeepReadonly };
