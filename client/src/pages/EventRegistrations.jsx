import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { eventRegistrationsAPI } from '../api';

const EventRegistrations = () => {
  const [searchParams] = useSearchParams();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching event registrations from API...');
      console.log('API URL:', '/api/event-registrations');
      console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const response = await eventRegistrationsAPI.getAll();
      
      console.log('✓ Event registrations received:', response.data.length, 'teams');
      
      if (response.data.length > 0) {
        console.log('✓ Sample data:', response.data[0]);
      } else {
        console.warn('⚠ No teams found in eventRegistrations collection');
      }
      
      setRegistrations(response.data);
    } catch (error) {
      console.error('✗ Error fetching event registrations:', error);
      console.error('✗ Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        alert(`Failed to load registrations: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) {
      return;
    }

    try {
      await eventRegistrationsAPI.delete(id);
      fetchRegistrations();
      alert('Registration deleted successfully!');
    } catch (error) {
      console.error('Error deleting registration:', error);
      alert('Failed to delete registration');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const captainName = reg.captain?.name || reg.captainName || '';
    const captainEmail = reg.captain?.email || reg.captainEmail || '';
    const college = reg.captain?.college || reg.college || reg.collegeName || '';
    
    const matchesSearch = 
      (reg.teamName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.eventName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      captainName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      captainEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      college.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = !filterEvent || (reg.eventName || '').toLowerCase().includes(filterEvent.toLowerCase());
    const matchesStatus = !filterStatus || reg.status === filterStatus;
    const matchesType = !typeFilter || (reg.eventType || '').toLowerCase().startsWith(typeFilter.toLowerCase());
    
    return matchesSearch && matchesEvent && matchesStatus && matchesType;
  });

  const uniqueEvents = [...new Set(registrations.map(r => r.eventName).filter(Boolean))];
  const statusOptions = ['pending', 'approved', 'rejected', 'active', 'inactive'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-black mb-2">Event Registrations</h1>
                <p className="text-blue-100 text-lg">Team registrations from MongoDB Atlas</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-6 py-4 rounded-xl backdrop-blur-sm">
              <p className="text-blue-100 text-sm font-semibold mb-1">Total Teams</p>
              <p className="text-white font-bold text-3xl">{registrations.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by team, event, captain, email, or college..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
              />
              <svg className="w-6 h-6 text-gray-400 absolute left-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            >
              <option value="">All Events</option>
              {uniqueEvents.map(event => (
                <option key={event} value={event}>{event}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50"
            >
              <option value="">All Types</option>
              <option value="sports">Sports</option>
              <option value="cultural">Cultural</option>
            </select>
          </div>
        </div>

        {/* Teams Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading registrations...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-500 text-2xl font-black mb-3">No registrations found</p>
            <p className="text-gray-400 text-lg">
              {searchTerm || filterEvent || filterStatus ? 'Try adjusting your filters' : 'No teams registered yet'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Team Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Event</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Captain</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">College</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRegistrations.map((reg, index) => {
                    const captainName = reg.captain?.name || reg.captainName || 'N/A';
                    const captainEmail = reg.captain?.email || reg.captainEmail || '';
                    const captainPhone = reg.captain?.phone || reg.captainPhone || '';
                    const college = reg.captain?.college || reg.collegeName || reg.college || 'N/A';
                    const memberCount = reg.teamSize || reg.totalMembers || reg.teamMembers?.length || reg.members?.length || 0;
                    
                    return (
                    <tr key={reg._id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{reg.teamName || 'N/A'}</div>
                        {reg.registrationId && <div className="text-xs text-gray-500">ID: {reg.registrationId}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{reg.eventName || 'N/A'}</div>
                        {reg.eventType && <div className="text-xs text-gray-500">{reg.eventType}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{captainName}</div>
                        <div className="text-xs text-gray-500">{captainEmail}</div>
                        {captainPhone && <div className="text-xs text-gray-500">{captainPhone}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{college}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.status === 'approved' || reg.status === 'active' || reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(reg.status || 'pending').charAt(0).toUpperCase() + (reg.status || 'pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          reg.paymentStatus === 'Paid' || reg.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          reg.paymentStatus === 'Pending' || reg.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          reg.paymentStatus === 'unpaid' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {(reg.paymentStatus || 'Pending').charAt(0).toUpperCase() + (reg.paymentStatus || 'Pending').slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => viewDetails(reg)}
                          className="text-indigo-600 hover:text-indigo-900 font-semibold mr-3"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(reg._id)}
                          className="text-red-600 hover:text-red-900 font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
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
                    <p className="text-xs font-bold text-indigo-600 mb-2 uppercase tracking-wide">Team Name</p>
                    <p className="text-xl font-black text-gray-900">{selectedRegistration.teamName}</p>
                    {selectedRegistration.registrationId && (
                      <p className="text-xs text-indigo-600 mt-1">ID: {selectedRegistration.registrationId}</p>
                    )}
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wide">Event</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRegistration.eventName || 'N/A'}</p>
                    {selectedRegistration.eventType && (
                      <p className="text-xs text-blue-600 mt-1">{selectedRegistration.eventType}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wide">Status</p>
                    <p className="text-lg font-black text-gray-900">{selectedRegistration.status || 'pending'}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-purple-600 mb-2 uppercase tracking-wide">Captain</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRegistration.captain?.name || selectedRegistration.captainName}</p>
                    <p className="text-xs text-gray-600">{selectedRegistration.captain?.email || selectedRegistration.captainEmail}</p>
                    <p className="text-xs text-gray-600">{selectedRegistration.captain?.phone || selectedRegistration.captainPhone}</p>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-amber-600 mb-2 uppercase tracking-wide">College</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRegistration.captain?.college || selectedRegistration.collegeName || selectedRegistration.college || 'N/A'}</p>
                  </div>

                  <div className="col-span-2 bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-rose-600 mb-2 uppercase tracking-wide">
                      Team Members ({selectedRegistration.teamSize || selectedRegistration.teamMembers?.length || selectedRegistration.members?.length || 0})
                    </p>
                    <div className="space-y-2 mt-3">
                      {(selectedRegistration.teamMembers || selectedRegistration.members || []).map((member, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm">
                          <p className="text-sm font-bold text-gray-900">{member.name}</p>
                          {member.role && member.role !== 'member' && (
                            <span className="inline-block px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full mt-1">
                              {member.role}
                            </span>
                          )}
                          <p className="text-xs text-gray-600">{member.email}</p>
                          <p className="text-xs text-gray-600">{member.phone}</p>
                          {member.rollNumber && <p className="text-xs text-gray-600">Roll: {member.rollNumber}</p>}
                          {member.college && <p className="text-xs text-gray-600">College: {member.college}</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-teal-600 mb-2 uppercase tracking-wide">Payment Status</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRegistration.paymentStatus || 'Pending'}</p>
                    {selectedRegistration.paymentAmount && (
                      <p className="text-sm text-gray-600">₹{selectedRegistration.paymentAmount}</p>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-violet-600 mb-2 uppercase tracking-wide">Registration Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {selectedRegistration.registrationDate 
                        ? new Date(selectedRegistration.registrationDate).toLocaleDateString()
                        : new Date(selectedRegistration.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;
