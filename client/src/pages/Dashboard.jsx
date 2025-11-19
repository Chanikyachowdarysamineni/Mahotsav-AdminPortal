import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { participantsAPI, registrationsAPI, eventRegistrationsAPI, reportsAPI } from '../api';

const Dashboard = () => {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [eventTeams, setEventTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminMetrics, setAdminMetrics] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, participantsResponse, registrationsResponse, eventTeamsResponse, adminMetricsResponse] = await Promise.all([
        reportsAPI.getStatistics(),
        participantsAPI.getAll(),
        registrationsAPI.getAll(),
        eventRegistrationsAPI.getAll(),
        reportsAPI.getAdminMetrics()
      ]);
      
      setStatistics(statsResponse.data);
      setParticipants(participantsResponse.data);
      setRegistrations(registrationsResponse.data);
      setEventTeams(eventTeamsResponse.data);
      setAdminMetrics(adminMetricsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate participant statistics
  const participantStats = {
    total: participants.length,
    paid: participants.filter(p => p.paymentStatus === 'paid').length,
    pending: participants.filter(p => p.paymentStatus === 'pending').length,
    revenue: participants.reduce((sum, p) => sum + (p.paidAmount || 0), 0)
  };

  // Calculate event team statistics
  const eventTeamStats = {
    total: adminMetrics?.sports?.teams + adminMetrics?.cultural?.teams || eventTeams.length,
    active: eventTeams.filter(t => t.status === 'active' || t.status === 'confirmed').length,
    totalMembers: eventTeams.reduce((sum, t) => sum + (t.teamSize || t.totalMembers || t.teamMembers?.length || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />

      {/* Header Section */}
      <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">Admin Dashboard</h1>
                <p className="text-indigo-100 text-lg">Welcome back, {user?.name}! 🎉</p>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white bg-opacity-20 px-6 py-4 rounded-xl backdrop-blur-sm">
                <p className="text-indigo-100 text-sm font-semibold mb-1">Last Updated</p>
                <p className="text-white font-bold text-lg">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Cards - Participants, Registrations, Teams, Events */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Participants */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-indigo-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">Participants</p>
                <p className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {loading ? '...' : (adminMetrics?.totals?.participants ?? participantStats.total)}
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                  💰 ₹{participantStats.revenue.toLocaleString()} Revenue
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Registrations (from website) */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">Registrations</p>
                <p className="text-4xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {loading ? '...' : (adminMetrics?.totals?.registrations ?? registrations.length)}
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                  From Website
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Event Teams */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-orange-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">Event Teams</p>
                <p className="text-4xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {loading ? '...' : (adminMetrics ? (adminMetrics.sports.teams + adminMetrics.cultural.teams) : eventTeamStats.total)}
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                  👥 {eventTeamStats.totalMembers} Members
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Colleges */}
          <Link to="/colleges" className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-blue-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-bold mb-2 uppercase tracking-wide">Colleges</p>
                <p className="text-4xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {loading ? '...' : (adminMetrics?.totals?.colleges ?? 0)}
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                  Total Events: {loading ? '...' : (adminMetrics?.totals?.events ?? 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-4 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Payment & Registration Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Paid Count */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-green-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Paid Participants</p>
                <p className="text-3xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {loading ? '...' : participantStats.paid}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-yellow-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Pending Payments</p>
                <p className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                  {loading ? '...' : participantStats.pending}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Sports summary (click to Sports module) */}
          <Link to="/sports" className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Sports</p>
                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {loading ? '...' : `${adminMetrics?.sports?.teams || 0} Teams • ${adminMetrics?.sports?.individuals || 0} Individuals`}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Cultural summary (click to Cultural module) */}
          <Link to="/cultural" className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-red-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Cultural</p>
                <p className="text-3xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  {loading ? '...' : `${adminMetrics?.cultural?.teams || 0} Teams • ${adminMetrics?.cultural?.individuals || 0} Individuals`}
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Gender Drill-down */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to={{ pathname: '/registrations', search: '?gender=Male' }} className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-indigo-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Male</p>
                <p className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {loading ? '...' : (adminMetrics?.gender?.male || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link to={{ pathname: '/registrations', search: '?gender=Female' }} className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-pink-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Female</p>
                <p className="text-3xl font-black bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  {loading ? '...' : (adminMetrics?.gender?.female || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </Link>
          <Link to={{ pathname: '/registrations', search: '?gender=Other' }} className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-gray-500 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs font-bold mb-2 uppercase tracking-wide">Other</p>
                <p className="text-3xl font-black bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                  {loading ? '...' : (adminMetrics?.gender?.other || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-gray-500 to-slate-600 rounded-xl p-3 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-4"></div>
              Quick Access
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                to="/participants" 
                className="bg-gradient-to-br from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200 rounded-xl p-6 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-gray-800 font-bold text-lg">Participants</p>
                <p className="text-gray-500 text-sm mt-1">{participantStats.total} total</p>
              </Link>

              <Link 
                to={{ pathname: '/registrations', search: '' }} 
                className="bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 rounded-xl p-6 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-800 font-bold text-lg">Registrations</p>
                <p className="text-gray-500 text-sm mt-1">{registrations.length} total</p>
              </Link>

              <Link 
                to={{ pathname: '/event-registrations', search: '' }} 
                className="bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 rounded-xl p-6 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-orange-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-800 font-bold text-lg">Event Teams</p>
                <p className="text-gray-500 text-sm mt-1">{eventTeamStats.total} teams</p>
              </Link>

              <Link 
                to="/events" 
                className="bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-2 border-blue-200 rounded-xl p-6 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl group"
              >
                <div className="flex items-center justify-between mb-3">
                  <svg className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-800 font-bold text-lg">Events</p>
                <p className="text-gray-500 text-sm mt-1">Manage all events</p>
              </Link>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center">
              <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-4"></div>
              Summary Statistics
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-l-4 border-blue-500 shadow-lg">
                  <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Total Colleges</p>
                  <p className="text-3xl font-black text-gray-800">
                    {loading ? '...' : (adminMetrics?.totals?.colleges ?? statistics?.totalColleges ?? 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-500 shadow-lg">
                  <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Total States</p>
                  <p className="text-3xl font-black text-gray-800">
                    {loading ? '...' : (statistics?.totalStates ?? 1)}
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-l-4 border-purple-500 shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Paid Registrations</p>
                    <p className="text-3xl font-black text-gray-800">
                      {loading ? '...' : (statistics?.paidCount ?? participantStats.paid ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Amount</p>
                    <p className="text-2xl font-black text-green-600">
                      ₹{loading ? '...' : (statistics?.paidAmount ?? participantStats.revenue ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border-l-4 border-yellow-500 shadow-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Pending Payments</p>
                    <p className="text-3xl font-black text-gray-800">
                      {loading ? '...' : (statistics?.pendingCount ?? participantStats.pending ?? 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 font-bold mb-2 uppercase tracking-wide">Expected</p>
                    <p className="text-2xl font-black text-orange-600">
                      ₹{loading ? '...' : (statistics?.pendingAmount ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <Link 
                to="/reports" 
                className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black py-4 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl text-center text-lg"
              >
                View Detailed Reports →
              </Link>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black flex items-center">
              <svg className="w-8 h-8 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your Profile
            </h2>
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-200">
              <span className="text-5xl font-black bg-gradient-to-br from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                {user?.name?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-xl p-5 backdrop-blur-sm shadow-lg border border-white border-opacity-30">
              <p className="text-indigo-100 text-sm font-bold mb-2 uppercase tracking-wide">Full Name</p>
              <p className="text-xl font-black">{user?.name}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-5 backdrop-blur-sm shadow-lg border border-white border-opacity-30">
              <p className="text-indigo-100 text-sm font-bold mb-2 uppercase tracking-wide">Email Address</p>
              <p className="text-xl font-black truncate">{user?.email}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-5 backdrop-blur-sm shadow-lg border border-white border-opacity-30">
              <p className="text-indigo-100 text-sm font-bold mb-2 uppercase tracking-wide">Role</p>
              <span className="inline-block bg-white text-indigo-600 px-5 py-2 rounded-xl text-sm font-black uppercase tracking-wide shadow-xl transform hover:scale-105 transition-transform">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
