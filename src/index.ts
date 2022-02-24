import express from "express";
import { Method } from 'axios';
import bodyParser from "body-parser";
import fs from 'fs';
import http from 'http';
import https from 'https';


import axios, {
    AxiosRequestConfig,
    AxiosResponse,
} from 'axios';
const port = 443; // default port to listen

const privateKey = fs.readFileSync('sslcert/server.key');
const certificate = fs.readFileSync('sslcert/server.crt');

const credentials = { key: privateKey, cert: certificate };

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

export function getAxiosMethod(method: string): Method {
    let result: Method;
    switch (method.toLowerCase()) {
        case 'get':
            result = 'get';
            break;
        case 'delete':
            result = 'delete';
            break;
        case 'head':
            result = 'head';
            break;
        case 'options':
            result = 'options';
            break;
        case 'post':
            result = 'post';
            break;
        case 'put':
            result = 'put';
            break;
        case 'patch':
            result = 'patch';
            break;
        case 'purge':
            result = 'purge';
            break;
        case 'link':
            result = 'link';
            break;
        case 'unlink':
            result = 'unlink';
            break;
        default:
            result = 'get';
            break;
    }

    return result;
}

export class HttpClient {
    /**
     * APi Data is the data required for setting up httpclient.
     */
    apiData: RestReq;

    public constructor(apiData: RestReq) {
        this.apiData = apiData;
    }

    /**
     * Execute the API call with parameters received in constructor in RestReq object.
     * @returns Promise<RestRes>.
     */
    public async execute(): Promise<RestRes> {
        const config: AxiosRequestConfig = {};
        config.baseURL = this.apiData.baseURL;
        config.headers = this.apiData.headers;

        config.method = getAxiosMethod(this.apiData.method);
        config.url = this.apiData.path;

        if (config.method !== 'get') {
            config.data = this.apiData.data;
        }

        const res: AxiosResponse = await axios(config);
        const response: RestRes = {
            statusCode: res.status,
            message: res.statusText,
            body: res.data,
            headers: res.headers,
            isSuccess: res.status === 200
        };

        return response;
    }
};


export type BasicAuth = {
    username: string,
    password: string
};

export type RestReq = {
    baseURL: string,
    path: string,
    headers: Record<string, string>,
    data: any,
    method: string,
}

export type RestRes = {
    statusCode: number,
    isSuccess: boolean,
    message: string,
    headers: Record<string, string>,
    body: any,
}

app.post("/rest", async (req: { body: { data: RestReq; }; headers: any; }, res: { send: (arg0: RestRes) => void; }) => {
    // tslint:disable-next-line:no-console
    console.log("Request body is ", req.body);
    // tslint:disable-next-line:no-console
    console.log("Request headers are ", req.headers);
    if (req.headers.authorization === 'Bearer Z29sZHNldHU6Z29sZHNldHUK') {
        const body = req.body;
        // tslint:disable-next-line:no-console
        console.log("Body is ", body);
        const apiData: RestReq = req.body.data;

        const client: HttpClient = new HttpClient(apiData);
        const response: RestRes = await client.execute();
        res.send(response);
    }
});
// start the Express server
const httpsServer = https.createServer(credentials, app);
const httpServer = http.createServer(app);
httpServer.listen(8080,()=>{
     // tslint:disable-next-line:no-console
     console.log("server starting on port : " + 8080);
});
httpsServer.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log("server starting on port : " + port)
});