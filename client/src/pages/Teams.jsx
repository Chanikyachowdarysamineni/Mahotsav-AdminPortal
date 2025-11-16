import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { teamsAPI } from '../api';

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalMembers: 0
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getAll();
      const data = response.data;
      setTeams(data);
      calculateStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      active: data.filter(t => t.status === 'active').length,
      inactive: data.filter(t => t.status === 'inactive').length,
      totalMembers: data.reduce((sum, t) => sum + (t.totalMembers || t.members?.length || 0), 0)
    };
    setStats(stats);
  };

  const viewDetails = (team) => {
    setSelectedTeam(team);
    setShowModal(true);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = 
      team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.teamId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.captain?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || team.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    const headers = ['Team ID', 'Team Name', 'Captain Name', 'Captain Email', 'Captain Phone', 'College', 'Event', 'Status', 'Total Members', 'Members Count'];
    const csvData = filteredTeams.map(t => [
      t.teamId || '',
      t.teamName,
      t.captain?.name || '',
      t.captain?.email || '',
      t.captain?.phoneNumber || '',
      t.college,
      t.eventName || '',
      t.status,
      t.totalMembers || 0,
      t.members?.length || 0
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teams_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-600 mx-auto"></div>
            <p className="mt-6 text-gray-700 font-bold text-lg">Loading teams...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with gradient */}
        <div className="mb-8 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black flex items-center">
                <svg className="w-12 h-12 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Teams Management
              </h1>
              <p className="text-orange-100 mt-2 text-lg">View and manage all registered teams</p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 text-center shadow-xl">
                <p className="text-6xl font-black">{stats.total}</p>
                <p className="text-sm text-orange-100 mt-2 font-semibold">Total Teams</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Total Teams</p>
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mt-2">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Active Teams</p>
                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-2">{stats.active}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-gray-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Inactive</p>
                <p className="text-4xl font-black bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent mt-2">{stats.inactive}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-wide">Total Members</p>
                <p className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">{stats.totalMembers}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Search Teams</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by team name, ID, college, or captain..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 bg-gray-50 font-medium"
                />
                <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Team Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all duration-200 bg-gray-50 font-medium"
              >
                <option value="all">All Status</option>
                <option value="active">✅ Active</option>
                <option value="inactive">⏸️ Inactive</option>
                <option value="disqualified">❌ Disqualified</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 pt-6 border-t border-gray-200 gap-4">
            <div className="text-sm text-gray-600 bg-orange-50 px-4 py-2 rounded-lg">
              Showing <span className="font-bold text-orange-600 text-lg">{filteredTeams.length}</span> of <span className="font-bold text-gray-800">{teams.length}</span> teams
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchTeams}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
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

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-xl shadow-lg">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-red-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-700 font-bold text-lg">{error}</p>
            </div>
          </div>
        )}

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-2xl font-black mb-3">No teams found</p>
            <p className="text-gray-400 text-lg">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div 
                key={team._id} 
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden group cursor-pointer"
                onClick={() => viewDetails(team)}
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-2 group-hover:scale-105 transition-transform">{team.teamName}</h3>
                      <p className="text-orange-100 text-sm font-semibold">ID: {team.teamId}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg ${
                      team.status === 'active' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                      team.status === 'inactive' ? 'bg-gray-100 text-gray-800 border-2 border-gray-300' :
                      'bg-red-100 text-red-800 border-2 border-red-300'
                    }`}>
                      {team.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  {team.eventName && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wide">Event</p>
                      <p className="text-sm text-gray-900 font-bold">{team.eventName}</p>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Team Captain</p>
                    <p className="text-sm text-gray-900 font-black">{team.captain?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-600 mt-1 font-semibold">{team.captain?.email || ''}</p>
                    {team.captain?.phoneNumber && (
                      <p className="text-xs text-gray-600 font-semibold">{team.captain.phoneNumber}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-600 mb-1 uppercase tracking-wide">College</p>
                    <p className="text-sm text-gray-900 font-bold">{team.college}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                    <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-xl text-center border border-orange-200">
                      <p className="text-xs text-orange-600 font-bold uppercase tracking-wide mb-1">Team Size</p>
                      <p className="text-3xl font-black text-orange-700">{team.totalMembers || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-100 to-purple-100 p-4 rounded-xl text-center border border-indigo-200">
                      <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">Members</p>
                      <p className="text-3xl font-black text-indigo-700">{team.members?.length || 0}</p>
                    </div>
                  </div>

                  {team.members && team.members.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Team Members</p>
                      <ul className="space-y-2">
                        {team.members.slice(0, 3).map((member, index) => (
                          <li key={index} className="text-sm text-gray-700 font-semibold flex items-center">
                            <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {member.name}
                          </li>
                        ))}
                        {team.members.length > 3 && (
                          <li className="text-sm text-orange-600 font-black pl-6">
                            + {team.members.length - 3} more members
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Details Modal */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 px-8 py-6 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-xl bg-white bg-opacity-20 flex items-center justify-center shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black text-white">Team Details</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-30 rounded-xl p-3 transition-all duration-200 transform hover:scale-110 shadow-lg"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-200 shadow-lg">
                  <label className="block text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">Team ID</label>
                  <p className="text-gray-900 font-black text-2xl">{selectedTeam.teamId}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 shadow-lg">
                  <label className="block text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Team Name</label>
                  <p className="text-gray-900 font-black text-2xl">{selectedTeam.teamName}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200 shadow-lg col-span-2">
                  <label className="block text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">College</label>
                  <p className="text-gray-900 font-bold text-xl">{selectedTeam.college}</p>
                </div>
                {selectedTeam.eventName && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-lg col-span-2">
                    <label className="block text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Event</label>
                    <p className="text-gray-900 font-black text-xl">{selectedTeam.eventName}</p>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-200 shadow-xl mb-8">
                <h4 className="font-black text-2xl text-indigo-900 mb-4 flex items-center space-x-3">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Team Captain</span>
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Name</p>
                    <p className="text-gray-900 font-black text-lg">{selectedTeam.captain?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-md">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-900 font-semibold text-sm break-all">{selectedTeam.captain?.email || 'N/A'}</p>
                  </div>
                  {selectedTeam.captain?.phoneNumber && (
                    <div className="bg-white p-4 rounded-xl shadow-md col-span-2">
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-wide mb-1">Phone</p>
                      <p className="text-gray-900 font-black text-lg">{selectedTeam.captain.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedTeam.members && selectedTeam.members.length > 0 && (
                <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-6 rounded-2xl border-2 border-orange-200 shadow-xl">
                  <h4 className="font-black text-2xl text-orange-900 mb-4 flex items-center space-x-3">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>All Team Members ({selectedTeam.members.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTeam.members.map((member, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl shadow-lg border-l-4 border-orange-400 hover:shadow-xl transition-shadow">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                            <span className="text-white font-black text-lg">{member.name?.charAt(0) || '?'}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 font-black text-lg">{member.name}</p>
                            {member.email && <p className="text-gray-600 text-xs font-semibold">{member.email}</p>}
                            {member.phoneNumber && <p className="text-gray-600 text-xs font-semibold">{member.phoneNumber}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-8 py-4 bg-gradient-to-r from-gray-200 to-slate-200 text-gray-800 rounded-xl hover:from-gray-300 hover:to-slate-300 transition-all duration-200 font-black shadow-lg hover:shadow-xl transform hover:scale-105"
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

export default Teams;
