const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "/api/v1" : "http://localhost:8000/api/v1")).replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof data === "object" && data?.detail
      ? data.detail
      : `API request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
}

export const api = {
  baseUrl: API_BASE_URL,
  health: () => fetch(`${API_BASE_URL.replace(/\/api\/v1$/, "")}/health`).then((r) => {
    if (!r.ok) throw new Error(`Health check failed (${r.status})`);
    return r.json();
  }),
  summary: () => request("/erp/summary"),
  employees: () => request("/erp/employees"),
  clients: () => request("/erp/clients"),
  sites: () => request("/erp/sites"),
  rosters: () => request("/erp/rosters"),
  attendance: () => request("/erp/attendance"),
  payroll: (month) => request(`/erp/payroll${month ? `?month=${encodeURIComponent(month)}` : ""}`),
  createInvoice: (payload) => request("/accounts/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
  updateInvoice: (invoiceId, payload) => request(`/accounts/invoices/${invoiceId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }),
};

export default api;
