import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  getCampaign,
  listLeads,
  listEmails,
  generateEmails,
  sendAllMailto,
  updateEmail,
} from "../api/client";
import StatusBadge from "../components/StatusBadge";
import EmailCard from "../components/EmailCard";
import LeadTable from "../components/LeadTable";

export default function CampaignDetail() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [leads, setLeads] = useState([]);
  const [emails, setEmails] = useState([]);
  const [tab, setTab] = useState("leads");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [c, l, e] = await Promise.all([
        getCampaign(id),
        listLeads(id),
        listEmails(id),
      ]);
      setCampaign(c);
      setLeads(l);
      setEmails(e);

      if (c.status === "researching" || c.status === "generating") {
        setGenerating(true);
      } else {
        setGenerating(false);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Poll while generating
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [generating, refresh]);

  async function handleGenerate() {
    setError("");
    try {
      await generateEmails(id);
      setGenerating(true);
      setTab("leads");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendAll() {
    try {
      const data = await sendAllMailto(id);
      // Open mailto links with small delays
      for (let i = 0; i < data.links.length; i++) {
        setTimeout(() => {
          window.open(data.links[i].mailto, "_blank");
        }, i * 500);
      }
      // Mark all as sent
      for (const link of data.links) {
        await updateEmail(link.email_id, { status: "sent" });
      }
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!campaign) return <p className="text-muted">Loading...</p>;

  const draftCount = emails.filter((e) => e.status === "draft").length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{campaign.name}</h1>
          <div className="campaign-meta-row">
            <StatusBadge status={campaign.status} />
            <span className="text-muted">{campaign.category}</span>
            <span className="text-muted">{campaign.lead_count} leads</span>
            <span className="text-muted">{campaign.emails_ready} emails ready</span>
          </div>
        </div>
        <div className="header-actions">
          {campaign.status === "draft" && leads.length > 0 && (
            <button className="btn btn-primary" onClick={handleGenerate}>
              Generate Emails
            </button>
          )}
          {emails.length > 0 && draftCount > 0 && (
            <button className="btn btn-success" onClick={handleSendAll}>
              Send All ({draftCount})
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {generating && (
        <div className="processing-banner">
          Researching leads and generating emails... This page updates automatically.
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${tab === "leads" ? "active" : ""}`}
          onClick={() => setTab("leads")}
        >
          Leads ({leads.length})
        </button>
        <button
          className={`tab ${tab === "emails" ? "active" : ""}`}
          onClick={() => setTab("emails")}
        >
          Emails ({emails.length})
        </button>
      </div>

      {tab === "leads" && <LeadTable leads={leads} />}
      {tab === "emails" && (
        <div className="email-list">
          {emails.length === 0 ? (
            <p className="text-muted">No emails generated yet. Click "Generate Emails" to start.</p>
          ) : (
            emails.map((email) => (
              <EmailCard key={email.id} email={email} onUpdate={refresh} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
