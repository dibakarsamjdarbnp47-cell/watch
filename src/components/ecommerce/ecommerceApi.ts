export function getAuthHeaders(userId?: string | null): Record<string, string> {
  const storedId = typeof window !== 'undefined' ? localStorage.getItem('wdh_auth_user_id') : '';
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('wdh_auth_token') : '';
  const activeId = userId || storedId || '';
  const token = storedToken || (activeId ? `demo-jwt-token-${activeId}` : '');

  return {
    'Content-Type': 'application/json',
    ...(activeId ? { 'x-user-id': activeId } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function getEffectivePrice(price: number, discountedPrice: number | null): number {
  if (discountedPrice !== null && discountedPrice > 0 && discountedPrice < price) {
    return discountedPrice;
  }
  return price;
}

export function formatInr(amount: number): string {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}
