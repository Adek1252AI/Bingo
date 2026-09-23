
/**
 * Encodes/decodes a payload as a compact URL-safe string.
 * Format: base64url(JSON(payload)).
 *
 * Uses TextEncoder/TextDecoder to safely handle unicode characters in both
 * Node.js (tests) and browser environments.
 */
export interface EncodingAdapter {
  encode(payload: object): string;
  decode(encoded: string): object;
}

export class JsonBase64EncodingAdapter implements EncodingAdapter {
  encode(payload: object): string {
    const json = JSON.stringify(payload);
    // TextEncoder handles unicode safely in both browser and Node.js
    const bytes = new TextEncoder().encode(json);
    const binStr = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
    return btoa(binStr)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  decode(encoded: string): object {
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    const binStr = atob(base64);
    const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  }
}
