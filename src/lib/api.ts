import { getMockData } from '$lib/mockData';

const SERVER_URL = import.meta.env.PUBLIC_SERVER_URL ?? 'https://corsproxy.io/?http://141.164.63.141/apik/login';
const API_DATA_TYPE = import.meta.env.PUBLIC_API_DATA_TYPE ?? 'real';

console.log(`API Data Type: ${API_DATA_TYPE}, Server URL: ${SERVER_URL}`);

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  params?: Record<string, string | number | boolean>;
  body?: unknown;
}

export async function fetcher(
  url: string,
  options: FetchOptions = {}
): Promise<unknown> {
  const { method = 'GET', params, body } = options;

  let fullUrl = url;

  // Attach query params for GET requests
  if (params && method === 'GET') {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

    fullUrl = qs ? `${url}?${qs}` : url;
  }

  if (API_DATA_TYPE === 'dummy') {
    const data = getMockData(fullUrl);
    if (data) return data;
    throw new Error(`No mock data found for URL: ${fullUrl}`);
  }

  const res = await fetch(`${SERVER_URL}${fullUrl}`, {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: method !== 'GET' && body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  return res.json();
}


export const endpoints = {
  auth: { login: '/apik/login' },
  dashboard: {
    nodeList: '/apik/node/list',
    serviceStatus: (node: string) => `/apik/${node}/service/status`,
    diskMetrics: (node: string) => `/apik/${node}/node/metrics/disk`,
    processList: (node: string) => `/apik/${node}/process/list`,
    processDetail: (node: string, process: string) => `/apik/${node}/process/${process}`,
    graph: (node: string) => `/apik/${node}/node/metrics`,
    memoryMetrics: (node: string) => `/apik/${node}/node/metrics/memory`,
  },
  rules: {
    list: (node: string) => `/apik/${node}/rule/list`,
    detail: (node: string, id: string) => `/apik/${node}/rule/${id}`,
  },
  actions: {
    list: (node: string) => `/apik/${node}/action/list`,
    detail: (node: string, id: string) => `/apik/${node}/action/${id}`,
  },
  layouts: {
    list: (node: string) => `/apik/${node}/layout/list`,
    detail: (node: string, id: string) => `/apik/${node}/layout/${id}`,
  },
  spec: {
    list: (node: string) => `/apik/${node}/spec/list`,
    detail: (node: string, id: string) => `/apik/${node}/spec/${id}`,
  },
  identify: {
    list: (node: string) => `/apik/${node}/identify/list`,
    detail: (node: string, id: string) => `/apik/${node}/identify/${id}`,
  },
  function: {
    list: (node: string) => `/apik/${node}/function/list`,
    detail: (node: string, id: string) => `/apik/${node}/function/${id}`,
  },
  replay: {
    info: (node: string) => `/apik/${node}/replay/info`,
    start: (node: string) => `/apik/${node}/replay`,
    terminate: (node: string) => `/apik/${node}/replay/terminate`,
  },
  nodes: {
    channelInbound: { list: (node: string) => `/apik/${node}/channel/list` },
    auditLog: {
      list: (node: string) => `/apik/${node}/auditlog/list`,
      frameList: (node: string) => `/apik/${node}/auditlog/frame-list`,
      frame: (node: string) => `/apik/${node}/auditlog/frame`,
    },
    issues: {
      list: (node: string) => `/apik/${node}/issue/list`,
      search: (node: string) => `/apik/${node}/issue/search`,
      info: (node: string) => `/apik/${node}/issue/info`,
      quote: (node: string) => `/apik/${node}/issue/quote`,
      graph: (node: string) => `/apik/${node}/node/metrics/memory`,
    },
  },
};
