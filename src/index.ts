import { pino } from 'pino';
import { ulid } from '@budarin/ulid';

import type { Request, DeepReadonly, JsonRpcResponse } from '@budarin/json-rpc-request';


interface Logger {
    info: (...data: unknown[]) => void;
    warn: (...data: unknown[]) => void;
    error: (...data: unknown[]) => void;
    debug: (...data: unknown[]) => void;
    child: (binding: Record<string, string>) => Logger;
    setLevel(level: pino.Level): void;
}

 interface LoggerProvider extends DeepReadonly<Logger> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [x: string]: any;
}


type RequestProvider = DeepReadonly<Request>;

function camelToSnake(str: string): string {
    return str.replace(/([A-Z])/g, ($1) => `_${$1.toLowerCase()}`);
}


export const createApiProvider = <T extends object>(request: RequestProvider, logger: LoggerProvider): DeepReadonly<T> =>
    new Proxy(
        {},
        {
            get(_, method_name: string) {
                return async <P, T = P, E = unknown>(props?: P) => {
                    const id = ulid();
                    const methodName = camelToSnake(method_name);

                    logger.debug(`вызов метода API: ${methodName}`, 'props:', props);

                    const requestParams = {
                        body: {
                            id,
                            method: methodName,
                            params: props,
                        },
                    };

                    return request<P, JsonRpcResponse<T, E>, E>(requestParams);
                };
            },
        },
    ) as DeepReadonly<T>;
