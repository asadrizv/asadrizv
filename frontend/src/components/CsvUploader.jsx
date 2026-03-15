import { useState, useRef } from "react";
import { uploadLeads } from "../api/client";

export default function CsvUploader({ campaignId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const leads = await uploadLeads(campaignId, file);
      onUploaded(leads);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      <div
        className={`drop-zone ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          hidden
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {uploading ? (
          <p>Uploading...</p>
        ) : (
          <p>Drop a CSV file here or click to browse</p>
        )}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
