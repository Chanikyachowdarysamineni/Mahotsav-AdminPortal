import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { reportsAPI } from '../api';

const PAGE_SIZE = 10;

export default function Sports() {
  const [tab, setTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [individuals, setIndividuals] = useState([]);
  const [teamsTotal, setTeamsTotal] = useState(0);
  const [individualsTotal, setIndividualsTotal] = useState(0);
  const [teamsPage, setTeamsPage] = useState(1);
  const [individualsPage, setIndividualsPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchTeams(teamsPage); }, [teamsPage]);
  useEffect(() => { fetchIndividuals(individualsPage); }, [individualsPage]);

  const fetchTeams = async (page=1) => {
    try {
      setLoading(true);
      const res = await reportsAPI.getTeams({ type: 'sports', page, limit: PAGE_SIZE });
      setTeams(res.data.items || res.data.teams || []);
      setTeamsTotal(res.data.total || 0);
    } catch (e) {
      console.error('Failed to fetch sports teams', e);
    } finally { setLoading(false); }
  };

  const fetchIndividuals = async (page=1) => {
    try {
      setLoading(true);
      const res = await reportsAPI.getIndividuals({ type: 'sports', page, limit: PAGE_SIZE });
      setIndividuals(res.data.items || res.data.individuals || []);
      setIndividualsTotal(res.data.total || 0);
    } catch (e) {
      console.error('Failed to fetch sports individuals', e);
    } finally { setLoading(false); }
  };

  const pages = (total) => Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-gray-800">Sports</h1>
          <div className="bg-white rounded-xl shadow p-1">
            <button onClick={() => setTab('teams')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab==='teams'?'bg-indigo-600 text-white':'text-gray-700'}`}>Teams</button>
            <button onClick={() => setTab('individuals')} className={`px-4 py-2 rounded-lg text-sm font-semibold ${tab==='individuals'?'bg-indigo-600 text-white':'text-gray-700'}`}>Individuals</button>
          </div>
        </div>

        {tab==='teams' ? (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Teams ({teamsTotal})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-3">Event</th>
                    <th className="py-2 px-3">Captain</th>
                    <th className="py-2 px-3">Members</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(teams||[]).map((t, idx) => (
                    <tr key={idx} className="border-t text-sm">
                      <td className="py-2 px-3">{t.eventName || t.event?.name || '-'}</td>
                      <td className="py-2 px-3">{t.captain?.name || t.captainName || '-'}</td>
                      <td className="py-2 px-3">
                        {(t.teamMembers||[]).length > 0 ? (
                          <div className="space-y-1">
                            {t.teamMembers.map((m, i) => (
                              <div key={i} className="text-gray-700">{m.name || m.fullName || m}</div>
                            ))}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="py-2 px-3">{t.status || t.paymentStatus || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center gap-2 mt-4">
              <button disabled={teamsPage<=1 || loading} onClick={() => setTeamsPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border">Prev</button>
              <span className="text-sm">Page {teamsPage} / {pages(teamsTotal)}</span>
              <button disabled={teamsPage>=pages(teamsTotal) || loading} onClick={() => setTeamsPage(p=>p+1)} className="px-3 py-1 rounded border">Next</button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Individuals ({individualsTotal})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-600">
                    <th className="py-2 px-3">Name</th>
                    <th className="py-2 px-3">College</th>
                    <th className="py-2 px-3">Event</th>
                    <th className="py-2 px-3">Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {(individuals||[]).map((r, idx) => (
                    <tr key={idx} className="border-t text-sm">
                      <td className="py-2 px-3">{r.name || r.fullName || `${r.firstName||''} ${r.lastName||''}`}</td>
                      <td className="py-2 px-3">{r.college || '-'}</td>
                      <td className="py-2 px-3">{r.eventName || r.event?.name || '-'}</td>
                      <td className="py-2 px-3">{r.gender || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end items-center gap-2 mt-4">
              <button disabled={individualsPage<=1 || loading} onClick={() => setIndividualsPage(p=>Math.max(1,p-1))} className="px-3 py-1 rounded border">Prev</button>
              <span className="text-sm">Page {individualsPage} / {pages(individualsTotal)}</span>
              <button disabled={individualsPage>=pages(individualsTotal) || loading} onClick={() => setIndividualsPage(p=>p+1)} className="px-3 py-1 rounded border">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
