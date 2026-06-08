import { useAuth } from '../hooks/useAuth';

export const apiRequest = async (
  url: string, 
  options: RequestInit = {}, 
  authHook?: ReturnType<typeof useAuth>
) => {
  try {
    if (authHook) {
      const headers = await authHook.getAuthHeaders();
      options.headers = {
        ...options.headers,
        ...headers
      };
    }

    const response = await fetch(url, options);

    if (response.status === 401 && authHook) {
      const refreshSuccess = await authHook.refreshAccessToken();
      
      if (refreshSuccess) {
        const newHeaders = await authHook.getAuthHeaders();
        options.headers = {
          ...options.headers,
          ...newHeaders
        };
        
        const retryResponse = await fetch(url, options);
        return retryResponse;
      } else {
        window.location.href = '/login';
        return response;
      }
    }

    return response;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

export const apiGet = (url: string, authHook?: ReturnType<typeof useAuth>) => 
  apiRequest(url, { method: 'GET' }, authHook);

export const apiPost = (url: string, data: any, authHook?: ReturnType<typeof useAuth>) => 
  apiRequest(url, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, authHook);

export const apiPut = (url: string, data: any, authHook?: ReturnType<typeof useAuth>) => 
  apiRequest(url, { 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }, authHook);

export const apiDelete = (url: string, authHook?: ReturnType<typeof useAuth>) => 
  apiRequest(url, { method: 'DELETE' }, authHook);
