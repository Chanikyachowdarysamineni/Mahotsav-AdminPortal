import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { reportsAPI } from '../api';

const Colleges = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [college, setCollege] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching colleges with params:', { college, page, limit });
      const response = await reportsAPI.getCollegesSummary({ college, page, limit });
      console.log('Colleges API response:', response.data);
      setItems(response.data.colleges || []);
      setTotal(response.data.total || 0);
      setPages(response.data.pages || 1);
      setError(null);
    } catch (e) {
      console.error('Colleges fetch error:', e);
      console.error('Error details:', e.response?.data);
      setError(e.response?.data?.message || e.message || 'Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const openParticipantsForCollege = (name) => {
    navigate(`/participants?college=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">Colleges</h1>
                <p className="text-blue-100 text-lg">Participants by college from MongoDB Atlas</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-6 py-4 rounded-xl backdrop-blur-sm">
              <p className="text-blue-100 text-sm font-semibold mb-1">Total Colleges</p>
              <p className="text-white font-bold text-3xl">{total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Filter college name..."
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Per page</label>
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-3 py-2 border-2 border-gray-200 rounded-xl bg-gray-50"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setPage(1); fetchData(); }} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow">Search</button>
              <button onClick={() => { setCollege(''); setPage(1); fetchData(); }} className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Clear</button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-bold">Error loading colleges</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading colleges...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            <p className="text-gray-500 text-2xl font-black mb-3">No colleges found</p>
            <p className="text-gray-400 text-lg">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">College</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Participants</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((row, idx) => (
                    <tr key={row._id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors`}>
                      <td className="px-6 py-4 font-bold">{row._id || 'N/A'}</td>
                      <td className="px-6 py-4">{row.participants || 0}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => openParticipantsForCollege(row._id)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">View Participants</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">Page {page} of {pages} • {total} colleges</p>
              <div className="flex gap-2">
                <button className="px-3 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</button>
                <button className="px-3 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page >= pages}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
