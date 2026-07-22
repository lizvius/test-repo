export function formatUsername(username?: string | null): string {
  if (!username) return 'tanpa_username';
  // Remove all existing @ symbols and add exactly one at the start
  const clean = username.replace(/@/g, '').trim();
  if (!clean) return 'tanpa_username';
  return `@${clean}`;
}

export function formatWIBDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // It might be YYYY-MM-DD
      const parts = dateString.split('-');
      if (parts.length === 3) {
        return `${parts[2]} ${parts[1]} ${parts[0]}`;
      }
      return dateString;
    }
    
    // Format to WIB (Asia/Jakarta)
    return date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, ' '); // id-ID normally uses dd/mm/yyyy, convert to dd mm yyyy
  } catch (e) {
    return dateString;
  }
}

export function formatWIBDateTime(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    // Format to WIB (Asia/Jakarta)
    const datePart = date.toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, ' ');

    const timePart = date.toLocaleTimeString('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `${datePart} ${timePart} WIB`;
  } catch (e) {
    return dateString;
  }
}
