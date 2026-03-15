import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NewCampaign from "./pages/NewCampaign";
import CampaignDetail from "./pages/CampaignDetail";

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="top-nav">
          <a href="/" className="logo">Rippleberry</a>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/campaigns/new" element={<NewCampaign />} />
            <Route path="/campaigns/:id" element={<CampaignDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
