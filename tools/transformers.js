export function formatJson(value) {
  const parsed = JSON.parse(value);
  return JSON.stringify(parsed, null, 2);
}
export function minifyJson(value) {
  return JSON.stringify(JSON.parse(value));
}
export function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}
export function decodeBase64(value) {
  const binary = atob(value.trim());
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
export function encodeUrl(value) { return encodeURIComponent(value); }
export function decodeUrl(value) { return decodeURIComponent(value); }

function decodeBase64Url(part) {
  let s = part.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return decodeBase64(s);
}
export function inspectJwt(value) {
  const parts = value.trim().split(".");
  if (parts.length < 2) throw new Error("JWT inválido.");
  const header = JSON.parse(decodeBase64Url(parts[0]));
  const payload = JSON.parse(decodeBase64Url(parts[1]));
  return JSON.stringify({ header, payload, signaturePresent: Boolean(parts[2]) }, null, 2);
}
export function convertTimestamp(value) {
  const raw = value.trim();
  if (/^\d{10,13}$/.test(raw)) {
    let n = Number(raw);
    if (raw.length === 10) n *= 1000;
    const d = new Date(n);
    if (Number.isNaN(d.getTime())) throw new Error("Timestamp inválido.");
    return `${d.toISOString()}\nLocal: ${d.toLocaleString()}`;
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) throw new Error("Data/timestamp inválido.");
  return `Unix (s): ${Math.floor(d.getTime()/1000)}\nUnix (ms): ${d.getTime()}\nISO: ${d.toISOString()}`;
}
export function transform(action, value) {
  switch (action) {
    case "json-format": return formatJson(value);
    case "json-minify": return minifyJson(value);
    case "base64-encode": return encodeBase64(value);
    case "base64-decode": return decodeBase64(value);
    case "url-encode": return encodeUrl(value);
    case "url-decode": return decodeUrl(value);
    case "jwt-inspect": return inspectJwt(value);
    case "timestamp": return convertTimestamp(value);
    default: throw new Error("Ferramenta desconhecida.");
  }
}
