import { UserProfile, UserRole, UserStatus } from '../../types';

// Helper to get authorization headers with JWT token
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const sessionToken = localStorage.getItem('azurlize_session_token');
  if (sessionToken) {
    headers['Authorization'] = `Bearer ${sessionToken}`;
  } else {
    // Scan localStorage keys for any user token as a fallback
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('azurlize_token_')) {
        const val = localStorage.getItem(key);
        if (val) {
          headers['Authorization'] = `Bearer ${val}`;
          break;
        }
      }
    }
  }
  return headers;
}

export async function testFirestoreConnection(): Promise<boolean> {
  return true;
}

export async function getUserProfile(telegramId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/users/profile?telegramId=${encodeURIComponent(telegramId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Gagal mengambil data user.');
    }
    return result.data as UserProfile | null;
  } catch (error) {
    console.error('[userService] getUserProfile failed:', error);
    throw error;
  }
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
  try {
    const res = await fetch('/api/users/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile })
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Gagal menyimpan pendaftaran.');
    }
    return result.data as UserProfile;
  } catch (error) {
    console.error('[userService] createUserProfile failed:', error);
    throw error;
  }
}

export async function updateUserStatus(
  telegramId: string,
  status: UserStatus,
  approved: boolean,
  approvedBy: string
): Promise<void> {
  try {
    const res = await fetch('/api/users/update-status', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ telegramId, status, approved, approvedBy })
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Gagal memperbarui status user.');
    }
  } catch (error) {
    console.error('[userService] updateUserStatus failed:', error);
    throw error;
  }
}

export async function updateUserRole(
  telegramId: string,
  role: UserRole,
  updatedBy: string
): Promise<void> {
  try {
    const res = await fetch('/api/users/update-role', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ telegramId, role, updatedBy })
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Gagal memperbarui role user.');
    }
  } catch (error) {
    console.error('[userService] updateUserRole failed:', error);
    throw error;
  }
}

export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const res = await fetch('/api/users/all', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}`);
    }
    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Gagal mengambil seluruh data user.');
    }
    return result.data as UserProfile[];
  } catch (error) {
    console.error('[userService] getAllUsers failed:', error);
    throw error;
  }
}

export async function getUsersByRole(role: UserRole): Promise<UserProfile[]> {
  try {
    const users = await getAllUsers();
    return users.filter(u => u.role === role);
  } catch (error) {
    console.error('[userService] getUsersByRole failed:', error);
    throw error;
  }
}
