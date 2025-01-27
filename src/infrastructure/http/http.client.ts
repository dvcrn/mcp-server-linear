/**
 * HTTP Client
 * 
 * Provides a wrapper around fetch with interceptors and error handling.
 */

import { Logger } from '../../utils/logger';

export interface HttpClientConfig {
  baseURL?: string;
  headers?: Record<string, string>;
  timeout?: number;
  logger?: Logger;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  headers: Headers;
}

interface ExtendedRequestInit extends RequestInit {
  headers?: Record<string, string>;
}

type RequestInterceptor = (config: ExtendedRequestInit) => ExtendedRequestInit;
type ResponseInterceptor = (response: Response) => Promise<Response>;

export class HttpClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeout: number;
  private readonly logger: Logger;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: HttpClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
    this.timeout = config.timeout || 30000;
    this.logger = config.logger || new Logger();
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Make GET request
   */
  async get<T = unknown>(url: string, config?: ExtendedRequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * Make POST request
   */
  async post<T = unknown>(url: string, data?: unknown, config?: ExtendedRequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make PUT request
   */
  async put<T = unknown>(url: string, data?: unknown, config?: ExtendedRequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Make DELETE request
   */
  async delete<T = unknown>(url: string, config?: ExtendedRequestInit): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * Make HTTP request
   */
  private async request<T>(url: string, config: ExtendedRequestInit): Promise<HttpResponse<T>> {
    const fullUrl = this.buildUrl(url);
    let requestConfig: ExtendedRequestInit = {
      ...config,
      headers: {
        ...this.defaultHeaders,
        ...(config.headers || {}),
      },
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      let response = await fetch(fullUrl, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      this.logger.error('HTTP request failed', error as Error);
      throw error;
    }
  }

  /**
   * Build full URL
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }

    const baseURL = this.baseURL.endsWith('/')
      ? this.baseURL.slice(0, -1)
      : this.baseURL;

    const path = url.startsWith('/') ? url : `/${url}`;

    return `${baseURL}${path}`;
  }
}
