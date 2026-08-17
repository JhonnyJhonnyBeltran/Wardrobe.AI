export type StyleGender = 'woman' | 'man' | 'other' | '';

export interface StyleImageSource {
  image_url?: string | null;
  image_url_man?: string | null;
  image_url_woman?: string | null;
}

/** Pick style card image based on selected gender */
export function getStyleImageForGender(
  style: StyleImageSource,
  gender: StyleGender,
  index = 0
): string {
  const fallback =
    style.image_url_woman ||
    style.image_url ||
    style.image_url_man ||
    '';

  if (gender === 'woman') {
    return style.image_url_woman || style.image_url || fallback;
  }
  if (gender === 'man') {
    return style.image_url_man || style.image_url || fallback;
  }
  if (gender === 'other') {
    return index % 2 === 0
      ? style.image_url_woman || style.image_url || style.image_url_man || fallback
      : style.image_url_man || style.image_url || style.image_url_woman || fallback;
  }
  return fallback;
}
