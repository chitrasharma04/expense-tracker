async function request(url, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  // Parse JSON response
  let data = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const errorMessage = (data && data.error) || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  get: (url, options) => request(url, { ...options, method: "GET" }),
  post: (url, body, options) => request(url, { ...options, method: "POST", body }),
  put: (url, body, options) => request(url, { ...options, method: "PUT", body }),
  delete: (url, options) => request(url, { ...options, method: "DELETE" }),
};

export default api;
