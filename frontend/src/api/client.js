const API_BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function createCompany(websiteUrl) {
  return request("/companies", {
    method: "POST",
    body: JSON.stringify({ website_url: websiteUrl }),
  });
}

export async function listCompanies() {
  return request("/companies");
}

export async function createCampaign(companyId, name, category) {
  return request("/campaigns", {
    method: "POST",
    body: JSON.stringify({ company_id: companyId, name, category }),
  });
}

export async function listCampaigns() {
  return request("/campaigns");
}

export async function getCampaign(id) {
  return request(`/campaigns/${id}`);
}

export async function uploadLeads(campaignId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/leads/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function listLeads(campaignId) {
  return request(`/campaigns/${campaignId}/leads`);
}

export async function generateEmails(campaignId) {
  return request(`/campaigns/${campaignId}/generate`, { method: "POST" });
}

export async function listEmails(campaignId) {
  return request(`/campaigns/${campaignId}/emails`);
}

export async function updateEmail(emailId, data) {
  return request(`/emails/${emailId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function getMailto(emailId) {
  return request(`/emails/${emailId}/mailto`);
}

export async function sendAllMailto(campaignId) {
  return request(`/campaigns/${campaignId}/send-all`, { method: "POST" });
}
