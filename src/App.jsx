import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = L.divIcon({
  className: 'custom-marker',
  html: '<span></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

function App() {
  const [issues, setIssues] = useState([]);
  const [dashboard, setDashboard] = useState({ counts: {}, revenue: [], priorityQueue: [] });
  const [news, setNews] = useState({ featuredNews: [], patronAdvertisements: [], fundAllocations: [] });
  const [activeView, setActiveView] = useState('home');
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    lat: '28.6139',
    lng: '77.2090'
  });
  const [statusMessage, setStatusMessage] = useState('');

  const fetchData = async () => {
    const [issuesRes, dashboardRes, newsRes] = await Promise.all([
      fetch('/api/issues'),
      fetch('/api/dashboard'),
      fetch('/api/news')
    ]);

    const [issuesData, dashboardData, newsData] = await Promise.all([
      issuesRes.json(),
      dashboardRes.json(),
      newsRes.json()
    ]);

    setIssues(issuesData);
    setDashboard(dashboardData);
    setNews(newsData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const highestSeverityIssue = useMemo(() => {
    const severityRank = { High: 3, Medium: 2, Low: 1 };
    return [...issues].sort((a, b) => severityRank[b.severity] - severityRank[a.severity])[0];
  }, [issues]);

  const submitIssue = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    const payload = await response.json();
    setStatusMessage(payload.message || 'Issue reported');
    await fetchData();
    setForm({
      title: '',
      description: '',
      location: '',
      lat: '28.6139',
      lng: '77.2090'
    });
  };

  const removeIssue = async (issueId) => {
    const response = await fetch(`/api/issues/${issueId}`, {
      method: 'DELETE'
    });

    const payload = await response.json();
    setStatusMessage(payload.message || 'Issue removed');
    await fetchData();
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">India’s community-powered infrastructure OS</p>
          <h1>CivicPulse Bharat</h1>
          <p className="subtitle">
            Citizens become the eyes of the city. AI turns reports into actionable work orders while communities, contractors, and authorities collaborate transparently.
          </p>
          <div className="view-switcher">
            <button type="button" className={activeView === 'home' ? 'active-view' : ''} onClick={() => setActiveView('home')}>Home dashboard</button>
            <button type="button" className={activeView === 'news' ? 'active-view' : ''} onClick={() => setActiveView('news')}>News & patrons</button>
          </div>
        </div>
      </header>

      {activeView === 'news' ? (
        <section className="news-page-grid">
          <div className="panel">
            <div className="panel-header">
              <h2>Patron advertisements</h2>
              <p>Business and institute patron placements for civic sponsorship visibility</p>
            </div>
            <div className="news-list">
              {news.patronAdvertisements.map((item) => (
                <div key={item.name} className="news-item sponsor-card">
                  <span>{item.type}</span>
                  <strong>{item.name}</strong>
                  <p>{item.tagline}</p>
                  <small>{item.region}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>Government fund allocation news</h2>
              <p>Transparent allocation updates for civic works and public infrastructure delivery</p>
            </div>
            <div className="news-list">
              {news.fundAllocations.map((item) => (
                <div key={item.title} className="news-item">
                  <span>{item.amount}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="stats-grid">
            <div className="stat-box">
              <span>Open issues</span>
              <strong>{dashboard.counts.openIssues ?? 0}</strong>
            </div>
            <div className="stat-box">
              <span>High severity</span>
              <strong>{dashboard.counts.highSeverity ?? 0}</strong>
            </div>
            <div className="stat-box">
              <span>Verified cases</span>
              <strong>{dashboard.counts.verified ?? 0}</strong>
            </div>
            <div className="stat-box">
              <span>Funding raised</span>
              <strong>{dashboard.counts.funding ?? '₹0'}</strong>
            </div>
          </section>

          <section className="content-grid">
            <div className="panel map-panel">
              <div className="panel-header">
                <h2>Interactive map</h2>
                <p>OpenStreetMap tiles keep the prototype free and usable without paid map keys</p>
              </div>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom className="map-card">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {issues.map((issue) => (
                  <Marker key={issue.id} position={[issue.lat, issue.lng]} icon={markerIcon}>
                    <Popup>
                      <strong>{issue.title}</strong><br />
                      {issue.severity} • {issue.category}<br />
                      {issue.location}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Citizen issue intake</h2>
                <p>Use the demo form to simulate an AI-classified report</p>
              </div>
              <form className="report-form" onSubmit={submitIssue}>
                <input placeholder="Issue title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                <textarea placeholder="Describe the issue" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
                <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                <div className="inline-fields">
                  <input placeholder="Latitude" value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} />
                  <input placeholder="Longitude" value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} />
                </div>
                <button type="submit">Submit for AI classification</button>
                <p className="status-line">{statusMessage}</p>
              </form>
            </div>
          </section>

          <section className="content-grid lower-grid">
            <div className="panel">
              <div className="panel-header">
                <h2>Priority queue</h2>
                <p>Homepage listing uses a severity-first ranking</p>
              </div>
              <div className="issue-list">
                {issues.map((issue) => (
                  <article key={issue.id} className="issue-card">
                    <div className="issue-topline">
                      <span className={`badge ${issue.severity.toLowerCase()}`}>{issue.severity}</span>
                      <span>{issue.category}</span>
                    </div>
                    <h3>{issue.title}</h3>
                    <p>{issue.description}</p>
                    {issue.summary ? <p className="summary-text">AI summary: {issue.summary}</p> : null}
                    <div className="meta-row">
                      <span>{issue.location}</span>
                      <span>{issue.affectedPeople} people</span>
                    </div>
                    <div className="meta-row">
                      <span>{issue.authenticity}</span>
                      <span>{issue.status}</span>
                    </div>
                    <button type="button" className="remove-issue-btn" onClick={() => removeIssue(issue.id)}>
                      Remove entry
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>Transparent progress dashboard</h2>
                <p>{highestSeverityIssue?.title || 'No reported issue yet'}</p>
              </div>
              <div className="dashboard-list">
                {dashboard.priorityQueue.map((issue) => (
                  <div key={issue.id} className="dashboard-item">
                    <strong>{issue.title}</strong>
                    <span>{issue.status} • {issue.contractor}</span>
                  </div>
                ))}
              </div>
              <div className="revenue-list">
                <h3>Revenue channels</h3>
                {dashboard.revenue.map((entry) => (
                  <div key={entry.channel} className="revenue-item">
                    <span>{entry.channel}</span>
                    <strong>{entry.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel news-section">
            <div className="panel-header">
              <h2>News & funding updates</h2>
              <p>Public transparency feed for patrons and governing bodies</p>
            </div>
            <div className="news-list">
              {news.featuredNews.map((item) => (
                <div key={item.title} className="news-item">
                  <span>{item.type}</span>
                  <strong>{item.title}</strong>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default App;
