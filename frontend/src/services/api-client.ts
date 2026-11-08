import Taro from '@tarojs/taro';

// 声明构建时注入的常量（通过 defineConstants 配置）
declare const TARO_APP_API_URL: string;

// API Base URL Configuration
// H5: Use relative path, Vite proxy forwards /api to backend
// MiniProgram: Use full URL to backend server
const getBaseUrl = (): string => {
    // Use Taro.getEnv() for runtime environment detection
    const env = Taro.getEnv();
    // MiniProgram: 优先使用环境变量配置的 API URL，否则使用默认值
    // 可通过 .env 文件配置 TARO_APP_API_URL
    if (typeof TARO_APP_API_URL !== 'undefined' && TARO_APP_API_URL) {
        return TARO_APP_API_URL;
    }
    if (env === Taro.ENV_TYPE.WEB) {
        // H5: Empty base, use full path like '/api/users/list'
        return '';
    }
    return 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

interface RequestConfig {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  header?: Record<string, string>;
}

/**
 * API Client for making HTTP requests
 *
 * URL paths should include '/api' prefix, matching backend routes.
 *
 * @example
 * apiClient.post('/api/users/list', { page: 1 });
 * apiClient.get('/api/health');
 */
class ApiClient {
  private baseURL: string;
  private networkTipShown = false;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    try {
      return Taro.getStorageSync('auth_token');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  /** 设备级用户标识：付费权益、发布记录按此隔离（演示环境无真实登录） */
  private getUserId(): string {
    try {
      let id = Taro.getStorageSync('device_id');
      if (!id) {
        id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        Taro.setStorageSync('device_id', id);
      }
      return id;
    } catch (error) {
      return 'guest';
    }
  }

  private async request<T>(config: RequestConfig): Promise<T> {
    const { url, method = 'GET', data, header = {} } = config;

    const token = this.getAuthToken();
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }
    header['x-user-id'] = this.getUserId();

    try {
      const response = await Taro.request({
        url: `${this.baseURL}${url}`,
        method,
        data,
        header: {
          'Content-Type': 'application/json',
          ...header
        }
      });

      if (response.statusCode === 401) {
        // Token expired or invalid
        Taro.removeStorageSync('auth_token');
        Taro.showToast({
          title: 'Please login again',
          icon: 'none'
        });
        throw new Error('Unauthorized');
      }

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data as T;
      }

      // Extract error message from response
      const errorData = response.data as any;
      let errorMessage =
        errorData?.message ||
        (typeof errorData?.error === 'string' ? errorData.error : null) ||
        `Request failed with status ${response.statusCode}`;
      // Zod 校验失败时展示第一条具体字段错误
      if (Array.isArray(errorData?.errors) && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0]?.message || errorMessage;
      }
      const err = new Error(errorMessage) as Error & { statusCode?: number };
      err.statusCode = response.statusCode;
      throw err;
    } catch (error) {
      console.error('API request error:', error);
      // 后端未启动时给出明确提示，避免小程序白屏无从排查（仅提示一次）
      const msg = String((error as any)?.errMsg || (error as any)?.message || '');
      if (
        !this.networkTipShown &&
        /request:fail|ECONNREFUSED|Failed to fetch|NetworkError|timeout/i.test(msg)
      ) {
        this.networkTipShown = true;
        Taro.showToast({
          title: '未连接后端服务，请先启动 start-backend.bat',
          icon: 'none',
          duration: 4000,
        });
      }
      throw error;
    }
  }

  get<T>(url: string, header?: Record<string, string>): Promise<T> {
    return this.request<T>({ url, method: 'GET', header });
  }

  post<T>(url: string, data?: any, header?: Record<string, string>): Promise<T> {
    return this.request<T>({ url, method: 'POST', data, header });
  }

  put<T>(url: string, data?: any, header?: Record<string, string>): Promise<T> {
    return this.request<T>({ url, method: 'PUT', data, header });
  }

  patch<T>(url: string, data?: any, header?: Record<string, string>): Promise<T> {
    return this.request<T>({ url, method: 'PATCH', data, header });
  }

  delete<T>(url: string, header?: Record<string, string>): Promise<T> {
    return this.request<T>({ url, method: 'DELETE', header });
  }
}

export const apiClient = new ApiClient(BASE_URL);
export default apiClient;
