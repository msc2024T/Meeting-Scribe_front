import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

// HTTP Response interface
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  status?: number;
}

// HTTP Error interface
export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// HTTP Request config interface
export interface HttpRequestConfig extends AxiosRequestConfig {
  requiresAuth?: boolean;
}

class HttpService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(
          `Making ${config.method?.toUpperCase()} request to: ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`Response received from: ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error("Response interceptor error:", error);

        // Handle common error scenarios
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.handleUnauthorized();
        } else if (error.response?.status === 403) {
          // Handle forbidden access
          console.error("Access forbidden");
        } else if (error.response?.status >= 500) {
          // Handle server errors
          console.error("Server error occurred");
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private getAuthToken(): string | null {
    // Get token from localStorage, sessionStorage, or cookies
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      );
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear auth token and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
      // You can add redirect logic here
      // window.location.href = '/login';
    }
  }

  private formatError(error: any): ApiError {
    return {
      message:
        error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status,
      data: error.response?.data,
    };
  }

  // GET request
  public async get<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // POST request
  public async post<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // PUT request
  public async put<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // PATCH request
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: HttpRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // DELETE request
  public async delete<T = any>(
    url: string,
    config?: HttpRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<T>(url, config);
      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // Upload file
  public async uploadFile<T = any>(
    url: string,
    file: File,
    fieldName: string = "file",
    config?: HttpRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await this.api.post<T>(url, formData, {
        ...config,
        headers: {
          "Content-Type": "multipart/form-data",
          ...config?.headers,
        },
      });

      return {
        data: response.data,
        status: response.status,
        success: true,
      };
    } catch (error) {
      throw error;
    }
  }

  // Set auth token
  public setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  // Clear auth token
  public clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      sessionStorage.removeItem("authToken");
    }
  }

  // Get base URL
  public getBaseURL(): string {
    return this.baseURL;
  }
}

// Create and export a singleton instance
const httpService = new HttpService();
export default httpService;

// Export the class for creating new instances if needed
export { HttpService };
