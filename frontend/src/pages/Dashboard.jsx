import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listCampaigns } from "../api/client";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    listCampaigns()
      .then(setCampaigns)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Campaigns</h1>
        <button className="btn btn-primary" onClick={() => navigate("/campaigns/new")}>
          New Campaign
        </button>
      </div>

      {loading ? (
        <p className="text-muted">Loading...</p>
      ) : campaigns.length === 0 ? (
        <div className="empty-state">
          <h2>No campaigns yet</h2>
          <p>Create your first campaign to start generating personalized outreach emails.</p>
          <button className="btn btn-primary" onClick={() => navigate("/campaigns/new")}>
            Create Campaign
          </button>
        </div>
      ) : (
        <div className="campaign-grid">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="campaign-card"
              onClick={() => navigate(`/campaigns/${c.id}`)}
            >
              <div className="campaign-card-header">
                <h3>{c.name}</h3>
                <StatusBadge status={c.status} />
              </div>
              <div className="campaign-card-meta">
                <span>{c.category}</span>
                <span>{c.lead_count} leads</span>
                <span>{c.emails_ready} emails ready</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
