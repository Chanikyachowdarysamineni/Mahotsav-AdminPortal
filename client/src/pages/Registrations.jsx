import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { reportsAPI } from '../api';

const Registrations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [pages, setPages] = useState(1);
  const [limit, setLimit] = useState(parseInt(searchParams.get('limit') || '20'));
  // Filters
  const [name, setName] = useState(searchParams.get('name') || '');
  const [college, setCollege] = useState(searchParams.get('college') || '');
  const [event, setEvent] = useState(searchParams.get('event') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get('paymentStatus') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Sync state from URL search params (supports deep link navigation)
  useEffect(() => {
    const p = parseInt(searchParams.get('page') || '1');
    const l = parseInt(searchParams.get('limit') || '20');
    const n = searchParams.get('name') || '';
    const c = searchParams.get('college') || '';
    const e = searchParams.get('event') || '';
    const g = searchParams.get('gender') || '';
    const pay = searchParams.get('paymentStatus') || '';
    const t = searchParams.get('type') || '';
    setPage(p);
    setLimit(l);
    setName(n);
    setCollege(c);
    setEvent(e);
    setGender(g);
    setPaymentStatus(pay);
    setType(t);
  }, [searchParams]);

  // Fetch whenever pagination or filters change
  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, name, college, event, gender, paymentStatus, type]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        name: name || undefined,
        college: college || undefined,
        event: event || undefined,
        gender: gender || undefined,
        paymentStatus: paymentStatus || undefined,
        type: type || undefined,
      };
      const response = await reportsAPI.getRegistrations(params);
      setRegistrations(response.data.registrations || []);
      setTotal(response.data.total || 0);
      setPages(response.data.pages || 1);
      // sync URL
      const sp = new URLSearchParams();
      if (name) sp.set('name', name);
      if (college) sp.set('college', college);
      if (event) sp.set('event', event);
      if (gender) sp.set('gender', gender);
      if (paymentStatus) sp.set('paymentStatus', paymentStatus);
      if (type) sp.set('type', type);
      sp.set('page', String(page));
      sp.set('limit', String(limit));
      setSearchParams(sp);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const onSearch = async (e) => {
    e?.preventDefault();
    setPage(1);
    await fetchRegistrations();
  };

  const clearFilters = async () => {
    setName('');
    setCollege('');
    setEvent('');
    setGender('');
    setPaymentStatus('');
    setType('');
    setPage(1);
    await fetchRegistrations();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">Registrations</h1>
                <p className="text-indigo-100 text-lg">Filterable and paginated registrations</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-6 py-4 rounded-xl backdrop-blur-sm">
              <p className="text-indigo-100 text-sm font-semibold mb-1">Total</p>
              <p className="text-white font-bold text-3xl">{total}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <form onSubmit={onSearch} className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Name contains..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
              />
              <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="College contains..."
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            />
            <input
              type="text"
              placeholder="Event name contains..."
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            />
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            >
              <option value="">All Payment Status</option>
              <option value="paid">✅ Paid</option>
              <option value="pending">⏳ Pending</option>
              <option value="failed">❌ Failed</option>
              <option value="refunded">🔄 Refunded</option>
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            >
              <option value="">All Types</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
          <div className="mt-4 flex items-center justify-between">
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
              <button type="button" onClick={clearFilters} className="px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Clear</button>
              <button type="submit" className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow">Search</button>
            </div>
          </div>
        </form>

        {/* Registrations Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading registrations...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-2xl font-black mb-3">No registrations found</p>
            <p className="text-gray-400 text-lg">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Participant</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">College Details</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Reg Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {registrations.map((reg, index) => (
                    <tr 
                      key={reg._id} 
                      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors cursor-pointer`}
                      onClick={() => viewDetails(reg)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {(reg.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{reg.name || 'N/A'}</div>
                            <div className="text-xs text-indigo-600 font-semibold">
                              ID: {reg.rollNumber || reg.mahotsavId || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {reg.branch || reg.department || 'MECH'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{reg.email || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{reg.phone || reg.phoneNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{reg.college || 'N/A'}</div>
                        <div className="text-xs text-gray-600">
                          Year: {reg.year || 'N/A'} • Roll: {reg.collegeRollNo || reg.rollNumber || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">
                          {reg.registrationStatus || 'approved'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900">
                          ₹{reg.amountPaid || reg.amount || 0}
                        </div>
                        <div className="text-xs text-gray-500">
                          of ₹{reg.totalAmount || reg.amount || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 inline-flex text-xs leading-5 font-bold rounded-full uppercase ${
                          (reg.paymentStatus || '').toLowerCase() === 'paid' ? 'bg-green-100 text-green-800 border border-green-300' :
                          (reg.paymentStatus || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                          (reg.paymentStatus || '').toLowerCase() === 'failed' ? 'bg-red-100 text-red-800 border border-red-300' :
                          (reg.paymentStatus || '').toLowerCase() === 'refunded' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                          'bg-gray-100 text-gray-800 border border-gray-300'
                        }`}>
                          {(reg.paymentStatus || '').toLowerCase() === 'paid' ? '✅ Paid' :
                           (reg.paymentStatus || '').toLowerCase() === 'pending' ? '⏳ Pending' :
                           (reg.paymentStatus || '').toLowerCase() === 'failed' ? '❌ Failed' :
                           (reg.paymentStatus || '').toLowerCase() === 'refunded' ? '🔄 Refunded' :
                           reg.paymentStatus || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">Page {page} of {pages} • {total} results</p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-2 rounded-lg border-2 border-gray-200 disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-2xl font-black text-white">Registration Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-30 rounded-xl p-3 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Full Name</p>
                    <p className="text-xl font-black text-gray-900">{selectedRegistration.name}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Email</p>
                    <p className="text-sm font-semibold text-gray-900 break-all">{selectedRegistration.email || 'N/A'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Phone</p>
                    <p className="text-lg font-black text-gray-900">{selectedRegistration.phone || selectedRegistration.phoneNumber || 'N/A'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">College</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRegistration.college || 'N/A'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">Mahotsav ID / Roll No</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRegistration.rollNumber || selectedRegistration.mahotsavId || 'N/A'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Year / Branch</p>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedRegistration.year || 'N/A'} • {selectedRegistration.branch || selectedRegistration.department || 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-teal-600 mb-2 uppercase tracking-wide">Payment Status</p>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-lg uppercase ${
                        (selectedRegistration.paymentStatus || '').toLowerCase() === 'paid' ? 'bg-green-100 text-green-800 border border-green-300' :
                        (selectedRegistration.paymentStatus || '').toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        (selectedRegistration.paymentStatus || '').toLowerCase() === 'failed' ? 'bg-red-100 text-red-800 border border-red-300' :
                        (selectedRegistration.paymentStatus || '').toLowerCase() === 'refunded' ? 'bg-purple-100 text-purple-800 border border-purple-300' :
                        'bg-gray-100 text-gray-800 border border-gray-300'
                      }`}>
                        {(selectedRegistration.paymentStatus || '').toLowerCase() === 'paid' ? '✅ Paid' :
                         (selectedRegistration.paymentStatus || '').toLowerCase() === 'pending' ? '⏳ Pending' :
                         (selectedRegistration.paymentStatus || '').toLowerCase() === 'failed' ? '❌ Failed' :
                         (selectedRegistration.paymentStatus || '').toLowerCase() === 'refunded' ? '🔄 Refunded' :
                         selectedRegistration.paymentStatus || 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">₹{selectedRegistration.amountPaid || 0} of ₹{selectedRegistration.totalAmount || 0}</p>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-violet-600 mb-2 uppercase tracking-wide">Registration Status</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRegistration.registrationStatus || 'approved'}</p>
                  </div>

                  {selectedRegistration.events && selectedRegistration.events.length > 0 && (
                    <div className="col-span-2 bg-gradient-to-br from-sky-50 to-blue-50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-sky-600 mb-3 uppercase tracking-wide">Registered Events ({selectedRegistration.events.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedRegistration.events.map((event, idx) => (
                          <span key={idx} className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-gray-800 shadow-sm">
                            {event}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations;
