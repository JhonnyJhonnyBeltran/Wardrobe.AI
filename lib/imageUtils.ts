/**
 * Normalizes any image URL (Supabase relative storage keys, proxy paths, http vs https, nulls)
 * into a valid, loadable image URL.
 */
export function resolveImageUrl(url?: string | null, fallback: string = '/placeholder.png'): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }

  const cleaned = url.trim();

  // If already absolute URL or base64 data URI or root-relative path
  if (
    cleaned.startsWith('http://') ||
    cleaned.startsWith('https://') ||
    cleaned.startsWith('data:') ||
    cleaned.startsWith('blob:') ||
    (cleaned.startsWith('/') && !cleaned.startsWith('//'))
  ) {
    return cleaned;
  }

  // Handle Supabase storage relative keys like "clothing/user_id/item.png" or "avatars/..."
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lfxjdfwvvswvmsmscjtu.supabase.co';
  const cleanSupabaseUrl = supabaseUrl.replace(/\/+$/, '');
  
  if (
    cleaned.startsWith('clothing/') ||
    cleaned.startsWith('avatars/') ||
    cleaned.startsWith('posts/') ||
    cleaned.startsWith('outfits/') ||
    cleaned.startsWith('user_avatars/')
  ) {
    return `${cleanSupabaseUrl}/storage/v1/object/public/${cleaned}`;
  }

  // Generic relative path
  return `/${cleaned.replace(/^\/+/, '')}`;
}
