import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { participantsAPI } from '../api';

const Participants = () => {
  const [searchParams] = useSearchParams();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGender, setFilterGender] = useState('all');
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalRevenue: 0
  });

  // Fetch participants from database
  useEffect(() => {
    fetchParticipants();
  }, []);

  // Prefill search by college if provided in URL
  useEffect(() => {
    const col = searchParams.get('college');
    if (col) {
      setSearchTerm(col);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await participantsAPI.getAll();
      const data = response.data;
      setParticipants(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      paid: data.filter(p => p.paymentStatus === 'paid').length,
      pending: data.filter(p => p.paymentStatus === 'pending').length,
      totalRevenue: data.reduce((sum, p) => {
        return p.paymentStatus === 'paid' ? sum + (p.paidAmount || 0) : sum;
      }, 0)
    };
    setStats(stats);
  };

  // View participant details
  const viewDetails = (participant) => {
    setSelectedParticipant(participant);
    setShowModal(true);
  };

  // Update payment status
  const updatePaymentStatus = async (id, newStatus) => {
    try {
      await participantsAPI.update(id, { paymentStatus: newStatus });
      await fetchParticipants();
      alert('Payment status updated successfully!');
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert(err.response?.data?.message || 'Failed to update payment status');
    }
  };

  // Delete participant
  const deleteParticipant = async (id) => {
    if (!window.confirm('Are you sure you want to delete this participant?')) {
      return;
    }

    try {
      await participantsAPI.delete(id);
      await fetchParticipants();
      alert('Participant deleted successfully!');
    } catch (err) {
      console.error('Error deleting participant:', err);
      alert(err.response?.data?.message || 'Failed to delete participant');
    }
  };

  // Filter participants
  const filteredParticipants = participants.filter(participant => {
    const matchesSearch = 
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.phoneNumber.includes(searchTerm) ||
      participant.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (participant.participantId && participant.participantId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || participant.paymentStatus === filterStatus;
    const matchesGender = filterGender === 'all' || participant.registrationStatus === filterGender;

    return matchesSearch && matchesStatus && matchesGender;
  });

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Participant ID', 'Name', 'Email', 'Phone', 'College', 'Department', 'Year', 'Roll Number', 'Registration Status', 'Payment Status', 'Payment Amount', 'Paid Amount'];
    const csvData = filteredParticipants.map(p => [
      p.participantId || '',
      p.name,
      p.email,
      p.phoneNumber,
      p.college,
      p.department || '',
      p.year || '',
      p.rollNumber || '',
      p.registrationStatus,
      p.paymentStatus,
      p.paymentAmount || 0,
      p.paidAmount || 0
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `participants_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading participants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold flex items-center">
                <svg className="w-10 h-10 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Participants Management
              </h1>
              <p className="text-indigo-100 mt-2 text-lg">View and manage all event participants and registrations</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-4 text-center">
                <p className="text-5xl font-bold">{stats.total}</p>
                <p className="text-sm text-indigo-100 mt-1">Total Participants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Participants</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Paid</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">{stats.paid}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Pending</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-2">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Search Participants</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, phone, college, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
                />
                <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Payment Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50 font-medium"
              >
                <option value="all">All Status</option>
                <option value="paid">✅ Paid</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
                <option value="refunded">↩️ Refunded</option>
              </select>
            </div>

            {/* Registration Status Filter */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Registration Status</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50 font-medium"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Approved</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 pt-6 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600 bg-indigo-50 px-4 py-2 rounded-lg">
              Showing <span className="font-bold text-indigo-600 text-lg">{filteredParticipants.length}</span> of <span className="font-bold text-gray-800">{participants.length}</span> participants
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchParticipants}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Participants Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {filteredParticipants.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-xl font-bold mb-2">No participants found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-800 via-gray-900 to-black">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Participant</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">College Details</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Reg Status</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParticipants.map((participant) => (
                    <tr key={participant._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 transform hover:scale-[1.01]">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">{participant.name.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{participant.name}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200">
                                ID: {participant.participantId}
                              </span>
                              {participant.department && (
                                <>
                                  <span className="text-gray-400">•</span>
                                  <span className="font-medium">{participant.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participant.email}</div>
                        <div className="text-sm text-gray-600 font-semibold">{participant.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{participant.college}</div>
                        <div className="text-sm text-gray-500">
                          {participant.year && `Year: ${participant.year}`}
                          {participant.rollNumber && ` • Roll: ${participant.rollNumber}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${
                          participant.registrationStatus === 'approved' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                          participant.registrationStatus === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300' :
                          'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300'
                        }`}>
                          {participant.registrationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-black text-gray-900">₹{participant.paidAmount || 0}</div>
                        <div className="text-xs text-gray-500 font-semibold">of ₹{participant.paymentAmount || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3.5 py-1.5 inline-flex text-xs leading-5 font-bold rounded-full border ${
                          participant.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                          participant.paymentStatus === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300' :
                          participant.paymentStatus === 'failed' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300' :
                          'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300'
                        }`}>
                          {participant.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewDetails(participant)}
                            className="text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-lg"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          {participant.paymentStatus !== 'paid' && (
                            <button
                              onClick={() => updatePaymentStatus(participant._id, 'paid')}
                              className="text-green-600 hover:text-white bg-green-50 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-lg"
                              title="Mark as Paid"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => deleteParticipant(participant._id)}
                            className="text-red-600 hover:text-red-900 transition"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Participant Details */}
      {showModal && selectedParticipant && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-white bg-opacity-20 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white">Participant Details</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-30 rounded-xl p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                  <label className="block text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Participant ID</label>
                  <p className="text-gray-900 font-black text-lg">{selectedParticipant.participantId}</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-xl border border-gray-200">
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Full Name</label>
                  <p className="text-gray-900 font-black text-lg">{selectedParticipant.name}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                  <label className="block text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Email</label>
                  <p className="text-gray-900 font-semibold text-sm break-all">{selectedParticipant.email}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                  <label className="block text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Phone</label>
                  <p className="text-gray-900 font-black text-lg">{selectedParticipant.phoneNumber}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 col-span-2">
                  <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">College</label>
                  <p className="text-gray-900 font-bold text-lg">{selectedParticipant.college}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                  <label className="block text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">Department</label>
                  <p className="text-gray-900 font-bold text-lg">{selectedParticipant.department || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl border border-rose-100">
                  <label className="block text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Year</label>
                  <p className="text-gray-900 font-black text-lg">{selectedParticipant.year || 'N/A'}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100 col-span-2">
                  <label className="block text-xs font-bold text-teal-600 mb-2 uppercase tracking-wide">Roll Number</label>
                  <p className="text-gray-900 font-black text-lg">{selectedParticipant.rollNumber || 'N/A'}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                  <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Registration Status</label>
                  <span className={`px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-xl border-2 ${
                    selectedParticipant.registrationStatus === 'approved' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                    selectedParticipant.registrationStatus === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300' :
                    'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300'
                  }`}>
                    {selectedParticipant.registrationStatus.toUpperCase()}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 shadow-lg">
                  <label className="block text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Payment Status</label>
                  <span className={`px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-xl border-2 ${
                    selectedParticipant.paymentStatus === 'paid' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300' :
                    selectedParticipant.paymentStatus === 'pending' ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300' :
                    selectedParticipant.paymentStatus === 'failed' ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-300' :
                    'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300'
                  }`}>
                    {selectedParticipant.paymentStatus.toUpperCase()}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-lg">
                  <label className="block text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Payment Amount</label>
                  <p className="text-green-700 font-black text-3xl">₹{selectedParticipant.paymentAmount || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border-2 border-indigo-200 shadow-lg">
                  <label className="block text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Paid Amount</label>
                  <p className="text-indigo-700 font-black text-3xl">₹{selectedParticipant.paidAmount || 0}</p>
                </div>
              </div>

              {selectedParticipant.eventId && (
                <div className="mt-8 p-6 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 rounded-2xl border-2 border-indigo-200 shadow-lg">
                  <h4 className="font-black text-xl text-indigo-900 mb-3 flex items-center space-x-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Event Information</span>
                  </h4>
                  <p className="text-gray-800 font-bold text-lg">Event ID: {selectedParticipant.eventId}</p>
                </div>
              )}

              <div className="mt-8 flex justify-end space-x-4">
                {selectedParticipant.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => {
                      updatePaymentStatus(selectedParticipant._id, 'paid');
                      setShowModal(false);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✅ Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-slate-200 text-gray-800 rounded-xl hover:from-gray-300 hover:to-slate-300 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Participants;
