import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api, { participantsAPI, eventRegistrationsAPI } from '../api';

const Participants = () => {
  const [activeTab, setActiveTab] = useState('individuals'); // 'individuals' or 'teams'
  const [individuals, setIndividuals] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    totalIndividuals: 0,
    paidIndividuals: 0,
    pendingIndividuals: 0,
    totalTeams: 0,
    paidTeams: 0,
    pendingTeams: 0
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch individual participants from 'participants' collection
      const individualsResponse = await api.get('/participants');
      const individualsData = individualsResponse.data;
      setIndividuals(individualsData);

      // Fetch team registrations from 'event-registrations' collection
      const teamsResponse = await api.get('/event-registrations');
      const teamsData = teamsResponse.data;
      setTeams(teamsData);

      // Calculate statistics
      calculateStats(individualsData, teamsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (individualsData, teamsData) => {
    setStats({
      totalIndividuals: individualsData.length,
      paidIndividuals: individualsData.filter(p => p.paymentStatus === 'paid').length,
      pendingIndividuals: individualsData.filter(p => p.paymentStatus === 'pending').length,
      totalTeams: teamsData.length,
      paidTeams: teamsData.filter(t => t.paymentStatus === 'paid').length,
      pendingTeams: teamsData.filter(t => t.paymentStatus === 'pending').length
    });
  };

  // Clear all database records
  const clearDatabase = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This will permanently delete ALL registrations (both individual and team) from the database. This action cannot be undone!\n\nAre you absolutely sure you want to continue?'
    );
    
    if (!confirmed) return;

    const doubleConfirm = window.confirm(
      '🚨 FINAL WARNING: You are about to delete ALL registration data!\n\nType confirmation is required. Click OK to proceed.'
    );

    if (!doubleConfirm) return;

    try {
      setLoading(true);
      
      // Clear both collections
      const [individualsResult, teamsResult] = await Promise.all([
        participantsAPI.clearAll(),
        eventRegistrationsAPI.clearAll()
      ]);

      alert(
        `✅ Database cleared successfully!\n\n` +
        `Individual Registrations Deleted: ${individualsResult.data.deletedCount}\n` +
        `Team Registrations Deleted: ${teamsResult.data.deletedCount}\n\n` +
        `Total: ${individualsResult.data.deletedCount + teamsResult.data.deletedCount} records removed`
      );

      // Refresh data
      await fetchAllData();
    } catch (err) {
      console.error('Error clearing database:', err);
      alert('❌ Error clearing database: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // View details
  const viewDetails = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Filter data based on active tab
  const getFilteredData = () => {
    const data = activeTab === 'individuals' ? individuals : teams;
    
    return data.filter(item => {
      const matchesSearch = activeTab === 'individuals'
        ? (
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.phoneNumber?.includes(searchTerm) ||
          item.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.participantId?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : (
          item.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.captainName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesPayment = filterPaymentStatus === 'all' || item.paymentStatus === filterPaymentStatus;

      return matchesSearch && matchesPayment;
    });
  };

  const filteredData = getFilteredData();

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
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-bold flex items-center">
            <svg className="w-10 h-10 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Event Registrations
          </h1>
          <p className="text-indigo-100 mt-2 text-lg">All event registrations - Individual participants and team registrations with payment tracking</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-lg">
            <button
              onClick={() => setActiveTab('individuals')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'individuals'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Individual Registrations</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'individuals' ? 'bg-white text-indigo-600' : 'bg-gray-200 text-gray-700'
              }`}>
                {stats.totalIndividuals}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('teams')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                activeTab === 'teams'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Team Registrations</span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                activeTab === 'teams' ? 'bg-white text-indigo-600' : 'bg-gray-200 text-gray-700'
              }`}>
                {stats.totalTeams}
              </span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
                  {activeTab === 'individuals' ? 'Individual Registrations' : 'Team Registrations'}
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2">
                  {activeTab === 'individuals' ? stats.totalIndividuals : stats.totalTeams}
                </p>
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
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">
                  {activeTab === 'individuals' ? stats.paidIndividuals : stats.paidTeams}
                </p>
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
                <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mt-2">
                  {activeTab === 'individuals' ? stats.pendingIndividuals : stats.pendingTeams}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                {activeTab === 'individuals' ? 'Search Individual Registrations' : 'Search Team Registrations'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={activeTab === 'individuals' 
                    ? "Search by name, email, phone, college..." 
                    : "Search by team name, event, college, captain..."}
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
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50 font-medium"
              >
                <option value="all">All Status</option>
                <option value="paid">✅ Paid</option>
                <option value="pending">⏳ Pending</option>
                <option value="failed">❌ Failed</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 pt-6 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600 bg-indigo-50 px-4 py-2 rounded-lg">
              Showing <span className="font-bold text-indigo-600 text-lg">{filteredData.length}</span> {activeTab === 'individuals' ? 'individual registrations' : 'team registrations'}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchAllData}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
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

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {filteredData.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-500 text-xl font-bold mb-2">No {activeTab === 'individuals' ? 'individual registrations' : 'team registrations'} found</p>
              <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
            </div>
          ) : activeTab === 'individuals' ? (
            /* Individual Participants Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-800 via-gray-900 to-black">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Participant (Individual Registration)</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">College</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((participant) => (
                    <tr key={participant._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">{participant.name?.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{participant.name}</div>
                            <div className="text-xs text-gray-500">ID: {participant.participantId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{participant.email}</div>
                        <div className="text-sm text-gray-600">{participant.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{participant.college}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                          participant.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          participant.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {participant.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewDetails(participant)}
                          className="text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-all"
                          title="View Details"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Teams Table */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-800 via-gray-900 to-black">
                  <tr>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Team Name (Team Registration)</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Event</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Captain</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">College</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((team) => (
                    <tr key={team._id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-gray-900">{team.teamName}</div>
                            <div className="text-xs text-gray-500">{team.teamMembers?.length || 0} members</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{team.eventName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{team.captainName}</div>
                        <div className="text-sm text-gray-600">{team.captainEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{team.college}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                          team.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          team.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {team.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewDetails(team)}
                          className="text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-2 rounded-lg transition-all"
                          title="View Details"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-2xl font-black text-white">
                {activeTab === 'individuals' ? 'Individual Registration Details' : 'Team Registration Details'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-30 rounded-xl p-3 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8">
              {activeTab === 'individuals' ? (
                /* Individual Details */
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Name</label>
                    <p className="text-gray-900 font-bold text-lg">{selectedItem.name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Participant ID</label>
                    <p className="text-gray-900 font-bold text-lg">{selectedItem.participantId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Email</label>
                    <p className="text-gray-900 font-semibold">{selectedItem.email}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Phone</label>
                    <p className="text-gray-900 font-bold">{selectedItem.phoneNumber}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">College</label>
                    <p className="text-gray-900 font-bold">{selectedItem.college}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Payment Status</label>
                    <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-full ${
                      selectedItem.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      selectedItem.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedItem.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Amount</label>
                    <p className="text-gray-900 font-black text-2xl">₹{selectedItem.paidAmount || 0}</p>
                  </div>
                </div>
              ) : (
                /* Team Details */
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Team Name</label>
                      <p className="text-gray-900 font-bold text-lg">{selectedItem.teamName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Event</label>
                      <p className="text-gray-900 font-bold text-lg">{selectedItem.eventName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Captain Name</label>
                      <p className="text-gray-900 font-bold">{selectedItem.captainName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Captain Email</label>
                      <p className="text-gray-900 font-semibold">{selectedItem.captainEmail}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">College</label>
                      <p className="text-gray-900 font-bold">{selectedItem.college}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Payment Status</label>
                      <span className={`px-4 py-2 inline-flex text-sm font-bold rounded-full ${
                        selectedItem.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                        selectedItem.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedItem.paymentStatus?.toUpperCase()}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-xs font-bold text-gray-600 mb-2 uppercase">Total Members</label>
                      <p className="text-gray-900 font-black text-2xl">{selectedItem.teamMembers?.length || 0}</p>
                    </div>
                  </div>
                  
                  {/* Team Members List */}
                  {selectedItem.teamMembers && selectedItem.teamMembers.length > 0 && (
                    <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200">
                      <h4 className="font-bold text-lg text-indigo-900 mb-4">Team Members</h4>
                      <div className="space-y-3">
                        {selectedItem.teamMembers.map((member, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <p className="font-bold text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <p className="text-sm text-gray-600">{member.phoneNumber}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-slate-200 text-gray-800 rounded-xl hover:from-gray-300 hover:to-slate-300 transition-all font-bold shadow-lg"
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
