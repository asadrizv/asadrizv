export default function StatusBadge({ status }) {
  const colors = {
    draft: "badge-gray",
    researching: "badge-blue",
    generating: "badge-yellow",
    ready: "badge-green",
    pending: "badge-gray",
    in_progress: "badge-blue",
    done: "badge-green",
    failed: "badge-red",
    sent: "badge-green",
  };

  return (
    <span className={`badge ${colors[status] || "badge-gray"}`}>
      {status.replace("_", " ")}
    </span>
  );
}
