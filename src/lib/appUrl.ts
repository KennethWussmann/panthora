export const appUrl = () => {
  const envVar = process.env.APP_BASE_URL;
  if (envVar) {
    return envVar;
  } else if (window) {
    const { protocol, hostname, port } = window.location;
    let baseUrl = `${protocol}//${hostname}`;
    if (port) {
      baseUrl += `:${port}`;
    }
    return baseUrl;
  } else {
    throw new Error("No APP_BASE_URL env var or window.location available");
  }
};
