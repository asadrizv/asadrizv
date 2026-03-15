import StatusBadge from "./StatusBadge";

export default function LeadTable({ leads }) {
  if (leads.length === 0) {
    return <p className="text-muted">No leads uploaded yet.</p>;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Title</th>
            <th>Company</th>
            <th>Research</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.title || "-"}</td>
              <td>{lead.company_name || "-"}</td>
              <td><StatusBadge status={lead.research_status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
