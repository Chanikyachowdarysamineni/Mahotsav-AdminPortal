import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api';

const Coordinators = () => {
  const [coordinators, setCoordinators] = useState([]);
  const [coordinatorStats, setCoordinatorStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoordinator, setNewCoordinator] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    role: '',
    password: ''
  });

  useEffect(() => {
    fetchCoordinators();
    const interval = setInterval(fetchCoordinators, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCoordinators = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coordinators');
      const coordinatorsData = response.data;
      setCoordinators(coordinatorsData);
      
      // Fetch stats for each coordinator
      const statsPromises = coordinatorsData.map(coord => 
        api.get(`/coordinators/${coord._id}/stats`).catch(err => null)
      );
      const statsResponses = await Promise.all(statsPromises);
      
      const stats = {};
      coordinatorsData.forEach((coord, index) => {
        if (statsResponses[index]?.data) {
          stats[coord._id] = statsResponses[index].data;
        }
      });
      setCoordinatorStats(stats);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSessionDuration = (loginHistory) => {
    if (!loginHistory || loginHistory.length === 0) return 0;
    
    let totalMinutes = 0;
    loginHistory.forEach(session => {
      if (session.loginAt) {
        const loginTime = new Date(session.loginAt);
        const logoutTime = session.logoutAt ? new Date(session.logoutAt) : new Date();
        const diffMs = logoutTime - loginTime;
        totalMinutes += Math.floor(diffMs / 60000); // Convert to minutes
      }
    });
    return totalMinutes;
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const viewDetails = (coordinator) => {
    setSelectedCoordinator(coordinator);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (coordinator) => {
    setSelectedCoordinator(coordinator);
    setIsEditing(true);
    setIsAdding(false);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setNewCoordinator({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      department: '',
      role: '',
      password: ''
    });
    setIsAdding(true);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coordinators', newCoordinator);
      fetchCoordinators();
      setShowModal(false);
      setIsAdding(false);
      alert('Coordinator added successfully!');
    } catch (error) {
      console.error('Error creating coordinator:', error);
      alert(error.response?.data?.message || 'Failed to add coordinator');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coordinator?')) {
      return;
    }

    try {
      await api.delete(`/coordinators/${id}`);
      fetchCoordinators();
      alert('Coordinator deleted successfully!');
    } catch (error) {
      console.error('Error deleting coordinator:', error);
      alert('Failed to delete coordinator');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/coordinators/${selectedCoordinator._id}`, selectedCoordinator);
      fetchCoordinators();
      setShowModal(false);
      alert('Coordinator updated successfully!');
    } catch (error) {
      console.error('Error updating coordinator:', error);
      alert('Failed to update coordinator');
    }
  };

  const filteredCoordinators = coordinators.filter(coordinator =>
    coordinator.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coordinator.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const departmentStats = coordinators.reduce((acc, coord) => {
    acc[coord.department] = (acc[coord.department] || 0) + 1;
    return acc;
  }, {});

  const onlineCount = coordinators.filter(c => c.loginStatus === 'online').length;
  const totalRegistrations = Object.values(coordinatorStats).reduce((sum, stat) => sum + (stat.registrationsHandled || 0), 0);
  const totalAmountCollected = Object.values(coordinatorStats).reduce((sum, stat) => sum + (stat.collections?.totalAmountCollected || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-white bg-opacity-20 p-5 rounded-2xl backdrop-blur-sm shadow-2xl">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-black mb-2 tracking-tight">Coordinators Dashboard</h1>
                <p className="text-indigo-100 text-lg font-medium">Real-time monitoring & management system</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-8 py-5 rounded-2xl backdrop-blur-sm shadow-xl">
              <p className="text-indigo-100 text-sm font-semibold mb-2">Total Coordinators</p>
              <p className="text-white font-black text-5xl">{coordinators.length}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-green-500 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Online Now</p>
            <p className="text-4xl font-black text-gray-900 mb-1">{onlineCount}</p>
            <p className="text-xs text-green-600 font-medium">Active coordinators</p>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-blue-500 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-xl">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Total Registrations</p>
            <p className="text-4xl font-black text-gray-900 mb-1">{totalRegistrations}</p>
            <p className="text-xs text-blue-600 font-medium">Handled by coordinators</p>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-emerald-500 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-100 p-3 rounded-xl">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Amount Collected</p>
            <p className="text-4xl font-black text-gray-900 mb-1">₹{totalAmountCollected.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 font-medium">Total revenue</p>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-indigo-500 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Departments</p>
            <p className="text-4xl font-black text-gray-900 mb-1">{Object.keys(departmentStats).length}</p>
            <p className="text-xs text-indigo-600 font-medium">Active departments</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Search by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
              />
              <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Coordinator</span>
            </button>
          </div>
        </div>

        {/* Coordinators Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading coordinators...</p>
          </div>
        ) : filteredCoordinators.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-2xl font-black mb-3">No coordinators found</p>
            <p className="text-gray-400 text-lg mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first coordinator'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddNew}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Your First Coordinator</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCoordinators.map((coordinator) => {
              const stats = coordinatorStats[coordinator._id] || {};
              const isOnline = coordinator.loginStatus === 'online';
              const sessionDuration = calculateSessionDuration(stats.loginHistory || []);
              
              return (
                <div key={coordinator._id} className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Header with Status */}
                  <div className={`p-6 ${isOnline ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white">
                        {coordinator.firstName?.charAt(0)}{coordinator.lastName?.charAt(0)}
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg flex items-center space-x-2 ${
                          isOnline ? 'bg-white text-green-700' : 'bg-white text-gray-700'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
                          <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                        </span>
                        <span className="px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-lg text-xs font-bold">
                          {coordinator.role}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white mb-1">
                      {coordinator.firstName} {coordinator.lastName}
                    </h3>
                    <p className="text-white text-opacity-90 text-sm font-semibold">{coordinator.department}</p>
                  </div>

                  {/* Stats Grid */}
                  <div className="p-6 space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{coordinator.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-700 font-medium">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{coordinator.phoneNumber}</span>
                      </div>
                    </div>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-100">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-200">
                        <p className="text-xs font-bold text-blue-600 mb-1 uppercase">Registrations</p>
                        <p className="text-2xl font-black text-gray-900">{stats.registrationsHandled || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-3 rounded-xl border border-emerald-200">
                        <p className="text-xs font-bold text-emerald-600 mb-1 uppercase">Collections</p>
                        <p className="text-lg font-black text-gray-900">₹{(stats.collections?.totalAmountCollected || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Time Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200">
                        <p className="text-xs font-bold text-purple-600 mb-1 uppercase">Session Time</p>
                        <p className="text-xl font-black text-gray-900">{formatDuration(sessionDuration)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-200">
                        <p className="text-xs font-bold text-amber-600 mb-1 uppercase">Payments</p>
                        <p className="text-2xl font-black text-gray-900">{stats.collections?.paymentsHandled || 0}</p>
                      </div>
                    </div>

                    {/* Last Login */}
                    {stats.lastLoginAt && (
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-3 rounded-xl border border-gray-200">
                        <p className="text-xs font-bold text-gray-600 mb-1 uppercase">Last Login</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(stats.lastLoginAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-3">
                      <button
                        onClick={() => viewDetails(coordinator)}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-bold text-sm shadow-lg"
                      >
                        📊 Details
                      </button>
                      <button
                        onClick={() => handleEdit(coordinator)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-bold text-sm shadow-lg"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDelete(coordinator._id)}
                        className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-bold text-sm shadow-lg"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-8 py-6 flex justify-between items-center rounded-t-2xl">
                <h3 className="text-2xl font-black text-white">
                  {isAdding ? 'Add New Coordinator' : isEditing ? 'Edit Coordinator' : 'Coordinator Details'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setIsAdding(false);
                    setIsEditing(false);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-30 rounded-xl p-3 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                {(isEditing || isAdding) ? (
                  <form onSubmit={isAdding ? handleCreate : handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Username *</label>
                        <input
                          type="text"
                          required
                          value={isAdding ? newCoordinator.username : selectedCoordinator?.username || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, username: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, username: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                        <input
                          type="email"
                          required
                          value={isAdding ? newCoordinator.email : selectedCoordinator?.email || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, email: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, email: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="coordinator@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                        <input
                          type="text"
                          value={isAdding ? newCoordinator.firstName : selectedCoordinator?.firstName || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, firstName: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, firstName: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                        <input
                          type="text"
                          value={isAdding ? newCoordinator.lastName : selectedCoordinator?.lastName || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, lastName: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, lastName: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={isAdding ? newCoordinator.phoneNumber : selectedCoordinator?.phoneNumber || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, phoneNumber: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, phoneNumber: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="+1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                        <input
                          type="text"
                          value={isAdding ? newCoordinator.department : selectedCoordinator?.department || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, department: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, department: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Technical, Marketing"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Password *</label>
                        <input
                          type="password"
                          required={isAdding}
                          minLength={6}
                          value={isAdding ? newCoordinator.password : ''}
                          onChange={(e) => isAdding && setNewCoordinator({...newCoordinator, password: e.target.value})}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Enter password (min 6 chars)"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Role</label>
                        <input
                          type="text"
                          value={isAdding ? newCoordinator.role : selectedCoordinator?.role || ''}
                          onChange={(e) => isAdding ? 
                            setNewCoordinator({...newCoordinator, role: e.target.value}) :
                            setSelectedCoordinator({...selectedCoordinator, role: e.target.value})
                          }
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g., Event Coordinator, Team Lead"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setIsAdding(false);
                          setIsEditing(false);
                        }}
                        className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 font-bold transform hover:scale-105 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{isAdding ? 'Add Coordinator' : 'Save Changes'}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    {/* Status Banner */}
                    {selectedCoordinator && (
                      <div className={`p-6 rounded-2xl ${
                        selectedCoordinator.loginStatus === 'online' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      } text-white`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                              {selectedCoordinator.firstName?.charAt(0)}{selectedCoordinator.lastName?.charAt(0)}
                            </div>
                            <div>
                              <h2 className="text-3xl font-black">{selectedCoordinator.firstName} {selectedCoordinator.lastName}</h2>
                              <p className="text-white text-opacity-90 font-semibold">{selectedCoordinator.role}</p>
                            </div>
                          </div>
                          <div className={`px-6 py-3 rounded-xl font-black text-lg shadow-xl flex items-center space-x-3 ${
                            selectedCoordinator.loginStatus === 'online'
                              ? 'bg-white text-green-700'
                              : 'bg-white text-gray-700'
                          }`}>
                            <span className={`w-3 h-3 rounded-full ${
                              selectedCoordinator.loginStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                            }`}></span>
                            <span>{selectedCoordinator.loginStatus === 'online' ? 'ONLINE' : 'OFFLINE'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
                        <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email
                        </p>
                        <p className="text-sm font-bold text-gray-900 break-all">{selectedCoordinator?.email}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200">
                        <p className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone
                        </p>
                        <p className="text-lg font-black text-gray-900">{selectedCoordinator?.phoneNumber}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
                        <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Department</p>
                        <p className="text-lg font-black text-gray-900">{selectedCoordinator?.department}</p>
                      </div>
                      <div className="bg-gradient-to-br from-rose-50 to-red-50 p-5 rounded-xl border-2 border-rose-200">
                        <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">Username</p>
                        <p className="text-lg font-black text-gray-900">{selectedCoordinator?.username}</p>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    {selectedCoordinator && coordinatorStats[selectedCoordinator._id] && (
                      <>
                        <div className="border-t-2 border-gray-200 pt-6">
                          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Performance Metrics
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 p-6 rounded-xl border-2 border-indigo-300 text-center">
                              <p className="text-sm font-bold text-indigo-700 mb-2">REGISTRATIONS HANDLED</p>
                              <p className="text-5xl font-black text-gray-900">{coordinatorStats[selectedCoordinator._id].registrationsHandled || 0}</p>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-100 to-green-100 p-6 rounded-xl border-2 border-emerald-300 text-center">
                              <p className="text-sm font-bold text-emerald-700 mb-2">TOTAL COLLECTIONS</p>
                              <p className="text-3xl font-black text-gray-900">₹{(coordinatorStats[selectedCoordinator._id].collections?.totalAmountCollected || 0).toLocaleString()}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-xl border-2 border-purple-300 text-center">
                              <p className="text-sm font-bold text-purple-700 mb-2">SESSION TIME</p>
                              <p className="text-4xl font-black text-gray-900">{formatDuration(calculateSessionDuration(coordinatorStats[selectedCoordinator._id].loginHistory || []))}</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-6 rounded-xl border-2 border-amber-300 text-center">
                              <p className="text-sm font-bold text-amber-700 mb-2">PAYMENTS HANDLED</p>
                              <p className="text-5xl font-black text-gray-900">{coordinatorStats[selectedCoordinator._id].collections?.paymentsHandled || 0}</p>
                            </div>
                          </div>
                        </div>

                        {/* Time Information */}
                        <div className="border-t-2 border-gray-200 pt-6">
                          <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Login Activity
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            {coordinatorStats[selectedCoordinator._id].lastLoginAt && (
                              <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-5 rounded-xl border-2 border-gray-300">
                                <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Last Login</p>
                                <p className="text-lg font-black text-gray-900">
                                  {new Date(coordinatorStats[selectedCoordinator._id].lastLoginAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            )}
                            {coordinatorStats[selectedCoordinator._id].lastLogoutAt && (
                              <div className="bg-gradient-to-br from-gray-50 to-slate-100 p-5 rounded-xl border-2 border-gray-300">
                                <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Last Logout</p>
                                <p className="text-lg font-black text-gray-900">
                                  {new Date(coordinatorStats[selectedCoordinator._id].lastLogoutAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coordinators;
