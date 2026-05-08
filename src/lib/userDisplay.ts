export function profileDisplayName(
  user: { name: string | null; email: string } | null | undefined,
): string {
  if (!user) return 'Profile';
  const n = user.name?.trim();
  if (n) return n;
  return user.email;
}

export function profileInitials(
  user: { name: string | null; email: string } | null | undefined,
): string {
  if (!user) return '?';
  const n = user.name?.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0][0];
      const b = parts[parts.length - 1][0];
      if (a && b) return (a + b).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}
