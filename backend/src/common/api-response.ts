export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export function ok<T>(data: T, message?: string): ApiResponse<T> {
  return { success: true, data, message };
}