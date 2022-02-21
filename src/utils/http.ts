import {
  Axios,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
} from "axios";

const client = new Axios({ timeout: 10000 });
async function request(
  method: Method,
  url: string,
  data: object,
  headers: AxiosRequestHeaders
) {
  client.interceptors.request.use((config: AxiosRequestConfig) => {
    config.headers = config.headers ?? {};
    for (const [k, v] of Object.entries(headers)) {
      config.headers![k] = v;
    }
    return config;
  });
  const requestConf: AxiosRequestConfig = {
    method: method,
    url: url,
  };
  switch (requestConf.method?.toUpperCase()) {
    case "GET":
    case "DELETE":
      requestConf.params = data;
      break;
    case "POST":
    case "PUT":
      requestConf.data = data;
      break;
  }
  return await client.request(requestConf);
}

function isOK(response: AxiosResponse, otherCondition: Function = () => true) {
  return response.status >= 200 && response.status < 300 && otherCondition();
}

export { request, isOK };
