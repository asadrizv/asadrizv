import { useState } from "react";
import { updateEmail, getMailto } from "../api/client";

export default function EmailCard({ email, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(email.subject);
  const [body, setBody] = useState(email.body);
  const [saving, setSaving] = useState(false);

  async function handleSend() {
    try {
      const data = await getMailto(email.id);
      window.open(data.mailto, "_blank");
      await updateEmail(email.id, { status: "sent" });
      onUpdate();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateEmail(email.id, { subject, body });
      setEditing(false);
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={`email-card ${email.status === "sent" ? "email-sent" : ""}`}>
      <div className="email-card-header">
        <div className="email-card-recipient">
          <strong>{email.lead_name}</strong>
          <span className="text-muted">{email.lead_email}</span>
          {email.lead_company && (
            <span className="text-muted">at {email.lead_company}</span>
          )}
        </div>
        <div className="email-card-actions">
          {email.status === "sent" ? (
            <span className="badge badge-green">Sent</span>
          ) : (
            <>
              <button
                className="btn btn-small btn-outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? "Cancel" : "Edit"}
              </button>
              <button className="btn btn-small btn-primary" onClick={handleSend}>
                Send
              </button>
            </>
          )}
        </div>
      </div>

      {editing ? (
        <div className="email-edit">
          <input
            className="input"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
          />
          <textarea
            className="textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
          />
          <button
            className="btn btn-primary btn-small"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      ) : (
        <div className="email-preview">
          <div className="email-subject">Subject: {email.subject}</div>
          <div className="email-body">{email.body}</div>
        </div>
      )}
    </div>
  );
}
