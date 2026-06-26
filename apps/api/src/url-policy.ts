const BLOCKED_HOSTS = new Set(["localhost", "0.0.0.0", "::1"]);
const PRIVATE_IPV4 =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/;

export function validateReceiptUrl(value: string): URL {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Informe um link válido.");
  }

  if (url.protocol !== "https:") {
    throw new Error("O link do cupom deve usar HTTPS.");
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    BLOCKED_HOSTS.has(hostname) ||
    PRIVATE_IPV4.test(hostname) ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal")
  ) {
    throw new Error("Este endereço não pode ser acessado.");
  }

  return url;
}
