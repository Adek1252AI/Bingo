
/**
 * Encodes/decodes a payload as a compact URL-safe string.
 * Format: base64url(JSON(payload)).
 */
export interface EncodingAdapter {
  encode(payload: object): string;
  decode(encoded: string): object;
}

export class JsonBase64EncodingAdapter implements EncodingAdapter {
  encode(payload: object): string {
    const json = JSON.stringify(payload);
    return btoa(json)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  decode(encoded: string): object {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const json = atob(base64);
    return JSON.parse(json);
  }
}
