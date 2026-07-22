import { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

export async function verifyTelegramInitDataApi(initData: string): Promise<ApiResponse<{
  token: string;
  telegramUser: { id: number; first_name: string; last_name?: string; username?: string; photo_url?: string };
  verified: boolean;
}>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-telegram`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ initData })
    });

    const data = await response.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error connecting to backend API'
    };
  }
}

export async function verifySessionApi(token: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/session-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to verify backend session token'
    };
  }
}
