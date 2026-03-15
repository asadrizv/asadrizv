import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCompany, listCompanies, createCampaign, uploadLeads } from "../api/client";
import CsvUploader from "../components/CsvUploader";

export default function NewCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Company
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [company, setCompany] = useState(null);

  // Step 2: Campaign
  const [campaignName, setCampaignName] = useState("");
  const [category, setCategory] = useState("sales");
  const [campaign, setCampaign] = useState(null);

  // Step 3: Leads
  const [leads, setLeads] = useState([]);

  async function handleAnalyzeWebsite(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const c = await createCompany(websiteUrl);
      setCompany(c);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCampaign(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const c = await createCampaign(company.id, campaignName, category);
      setCampaign(c);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadsUploaded(uploadedLeads) {
    setLeads(uploadedLeads);
  }

  function handleFinish() {
    navigate(`/campaigns/${campaign.id}`);
  }

  return (
    <div className="page">
      <h1>New Campaign</h1>
      <div className="stepper">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. Your Company</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. Campaign</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3. Upload Leads</div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {step === 1 && (
        <form onSubmit={handleAnalyzeWebsite} className="form-card">
          <h2>What does your company do?</h2>
          <p className="text-muted">Paste your website URL and we'll analyze your product.</p>
          <input
            type="text"
            placeholder="https://yourcompany.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            className="input"
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Website"}
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <div className="company-preview">
            <h3>{company.name}</h3>
            <p>{company.description}</p>
            <p className="text-muted"><strong>Value prop:</strong> {company.value_proposition}</p>
          </div>
          <form onSubmit={handleCreateCampaign} className="form-card">
            <h2>Campaign Details</h2>
            <input
              type="text"
              placeholder="Campaign name (e.g. March 2026 Outreach)"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              className="input"
            />
            <div className="category-select">
              <label className={`category-option ${category === "sales" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="category"
                  value="sales"
                  checked={category === "sales"}
                  onChange={(e) => setCategory(e.target.value)}
                />
                Sales
              </label>
              <label className={`category-option ${category === "recruitment" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="category"
                  value="recruitment"
                  checked={category === "recruitment"}
                  onChange={(e) => setCategory(e.target.value)}
                />
                Recruitment
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="form-card">
          <h2>Upload Your Leads</h2>
          <p className="text-muted">
            Upload a CSV with columns: name, email, title, company, website (at minimum name + email).
          </p>
          <CsvUploader campaignId={campaign.id} onUploaded={handleLeadsUploaded} />
          {leads.length > 0 && (
            <div>
              <p className="success-text">{leads.length} leads uploaded successfully.</p>
              <button className="btn btn-primary" onClick={handleFinish}>
                Go to Campaign
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
