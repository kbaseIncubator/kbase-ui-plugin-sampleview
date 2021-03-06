import axios, { AxiosResponse } from 'axios';

export interface GenericClientParams {
    url: string;
    module: string;
    token?: string;
    timeout?: number;
}

const DEFAULT_TIMEOUT = 10000;

export interface JSONRPCPayload<T> {
    jsonrpc: string;
    method: string;
    id: string;
    params: T;
}

export interface JSONRPCError<T> {
    code: number;
    message: string;
    data: T;
}

// export interface MethodSuccessResult<T> {
//     result: T;
//     error: null;
// }

// export interface MethodErrorResult {
//     result: null;
//     error: JSONRPCError;
// }

// export type MethodResponse<T> = MethodSuccessResult<T> | MethodErrorResult;

// export type JSONRPCResponse<T> =
//     // success
//     | [T, null, null]
//     // success, but void result
//     | [null, null, null]
//     // error returned by method, not sdk wrapper
//     | [null, MethodErrorResult, null]
//     // error returned by sdk wrapper (caught exception)
//     | [null, null, JSONRPCError];

export class JSONRPCException<T> extends Error {
    code: number;
    // TODO: should be the JSON type, not any; never any!
    data: T;
    constructor({ code, message, data }: JSONRPCError<T>) {
        super(message);
        this.code = code;
        this.data = data;
    }
}

export class classJSONRPCServerException extends Error {
    // constructor(message: string) {
    //     super(message);
    // }
}

export interface JSONRPCResultBase {
    jsonrpc: '2.0',
    id: string;
}

export interface JSONRPCSuccessResult<T> extends JSONRPCResultBase {
    result: T;
}

export interface JSONRPCErrorResult<T> extends JSONRPCResultBase {
    error: JSONRPCError<T>;
}

export type JSONRPCResult<T, E> = JSONRPCSuccessResult<T> | JSONRPCErrorResult<E>;

export class GenericClient {
    url: string;
    token: string | null;
    module: string;
    timeout?: number;

    constructor({ url, token, module, timeout }: GenericClientParams) {
        this.url = url;
        this.token = token || null;
        this.module = module;
        this.timeout = timeout || DEFAULT_TIMEOUT;
    }

    protected makePayload<T>(method: string, param: T): JSONRPCPayload<T> {
        return {
            jsonrpc: '2.0',
            method: this.module + '.' + method,
            id: String(Math.random()).slice(2),
            params: param
        };
    }

    // protected makeEmptyPayload<T>(method: string): JSONPayload<T> {
    //     const params: Array<T> = [];
    //     return {
    //         version: '1.1',
    //         method: this.module + '.' + method,
    //         id: String(Math.random()).slice(2),
    //         params
    //     };
    // }

    protected processResponse<T, E>(response: AxiosResponse<string>): T {
        // if no response, error
        const responseText = response.data;

        if (responseText.length === 0) {
            throw new Error('Empty response');
        }

        // try to parse as json
        let responseData: JSONRPCResult<T, any>;
        try {
            responseData = ((JSON.parse(responseText) as unknown) as JSONRPCResult<T, any>);
        } catch (ex) {
            console.error('error', ex);
            throw new Error('Error parsing response as JSON: ' + ex.message);
        }

        if ('error' in responseData) {
            // Were all good
            console.warn('about to throw error', responseData.error);
            throw new JSONRPCException<E>(responseData.error);
        }
        return responseData.result;

        // if (response.status === 200) {
        //     const { result } = await response.json();
        //     return result as T;
        // }
        // if (response.status === 500) {
        //     if (response.headers.get('Content-Type') === 'application/json') {
        //         const { error } = await response.json();
        //         throw new JSONRPCException(error);
        //     } else {
        //         const text = await response.text();
        //         throw new classJSONRPCServerException(text);
        //     }
        // }
        // throw new Error('Unexpected response: ' + response.status + ', ' + response.statusText);
    }

    // protected async callFunc<T>(func: string, param: any): Promise<T> {
    //     const headers = new Headers();
    //     headers.append('Content-Type', 'application/json');
    //     headers.append('Accept', 'application/json');
    //     if (this.token) {
    //         headers.append('Authorization', this.token);
    //     }
    //     const response = await axios.post(this.url, this.makePayload(func, param), {
    //         // mode: 'cors',
    //         // cache: 'no-store',
    //         headers
    //     });
    //     // The response may be a 200 success, a 200 with method error,
    //     // an sdk 500 error, an internal 500 server error,
    //     // or any other http error code.
    //     return response.data as T
    //     // return this.processResponse<T>(response);
    // }

    async callFunc<P, R, E>(func: string, param: P): Promise<R> {
        // axios headers are ... any
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (this.token) {
            headers['Authorization'] = this.token;
        }
        const params = this.makePayload<P>(func, param);
        const response = await axios.post(this.url, params, {
            headers,
            timeout: this.timeout,
            responseType: 'text'
        });
        return this.processResponse<R, E>(response);
        // return response.data.result as R;
    }
}

export interface AuthorizedGenericClientParams extends GenericClientParams {
    token: string;
}

export class AuthorizedGenericClient extends GenericClient {
    token: string;

    constructor(params: AuthorizedGenericClientParams) {
        super(params);
        if (!params.token) {
            throw new Error('Authorized client requires token');
        }
        this.token = params.token;
    }

    async callFunc<P, R, E>(func: string, param: P): Promise<R> {
        // axios headers are ... any
        const headers: any = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': this.token
        };
        if (this.token) {
            headers['Authorization'] = this.token;
        }
        const params = this.makePayload<P>(func, param);
        const response = await axios.post(this.url, params, {
            headers,
            timeout: this.timeout,
            responseType: 'text',
            transformResponse: (data) => {
                return data;
            }
        });
        return this.processResponse<R, E>(response);
    }
}
