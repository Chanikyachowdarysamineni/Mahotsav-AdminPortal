import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import api, { reportsAPI } from '../api';

const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventId: '',
    eventType: '',
    eventSubtype: '',
    eventSubtypeOther: '',
    subEvents: [],
    description: '',
    rules: '',
    malesFee: '',
    femalesFee: '',
    minParticipants: '',
    maxParticipants: '',
    isTeamEvent: false,
    teamSize: '',
    status: 'active',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
    venue: '',
    venueOther: '',
    date: '',
    time: ''
  });

  // Event subtype options
  const eventSubtypes = {
    sports: [
      'Cricket',
      'Football',
      'Basketball',
      'Volleyball',
      'Badminton',
      'Table Tennis',
      'Chess',
      'Carrom',
      'Athletics',
      'Kabaddi',
      'Kho-Kho',
      'Throwball',
      'Swimming',
      'Tennis'
    ],
    cultural: [
      'Dance',
      'Music',
      'Drama',
      'Fashion Show',
      'Singing',
      'Stand-up Comedy',
      'Painting',
      'Photography',
      'Short Film',
      'Poetry',
      'Debate',
      'Elocution',
      'Mime',
      'Skit'
    ]
  };

  // State for managing subevents in form
  const [currentSubEvent, setCurrentSubEvent] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Prefer overview with counts; fallback to plain list
      try {
        const { data } = await reportsAPI.getEventsOverview();
        setEvents(data);
      } catch (e) {
        const response = await api.get('/events');
        setEvents(response.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      alert('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Reset subtype when event type changes
      if (name === 'eventType') {
        updated.eventSubtype = '';
        updated.eventSubtypeOther = '';
        if (value === 'sports') {
          updated.malesFee = '350';
          updated.femalesFee = '250';
        } else if (value === 'cultural') {
          updated.malesFee = '250';
          updated.femalesFee = '250';
        }
      }
      
      // Clear other field when changing from Other
      if (name === 'eventSubtype' && value !== 'Other') {
        updated.eventSubtypeOther = '';
      }
      
      if (name === 'venue' && value !== 'Other') {
        updated.venueOther = '';
      }
      
      // Reset team size when switching from team to individual
      if (name === 'isTeamEvent' && !checked) {
        updated.teamSize = '';
      }
      
      return updated;
    });
  };

  // Add subevent to the list
  const addSubEvent = () => {
    if (currentSubEvent.name.trim()) {
      setFormData(prev => ({
        ...prev,
        subEvents: [...prev.subEvents, { ...currentSubEvent }]
      }));
      setCurrentSubEvent({ name: '', description: '' });
    }
  };

  // Remove subevent from the list
  const removeSubEvent = (index) => {
    setFormData(prev => ({
      ...prev,
      subEvents: prev.subEvents.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        // Update existing event
        await api.put(`/events/${editingEvent._id}`, formData);
        alert('Event updated successfully!');
      } else {
        // Create new event
        await api.post('/events', formData);
        alert('Event created successfully!');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.message || 'Failed to save event');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      eventId: event.eventId,
      eventType: event.eventType || '',
      eventSubtype: event.eventSubtype || '',
      eventSubtypeOther: event.eventSubtypeOther || '',
      subEvents: event.subEvents || [],
      description: event.description || '',
      rules: event.rules || '',
      malesFee: event.malesFee || '',
      femalesFee: event.femalesFee || '',
      minParticipants: event.minParticipants,
      maxParticipants: event.maxParticipants,
      isTeamEvent: event.isTeamEvent,
      teamSize: event.teamSize || '',
      status: event.status,
      coordinatorName: event.coordinatorName || '',
      coordinatorEmail: event.coordinatorEmail || '',
      coordinatorPhone: event.coordinatorPhone || '',
      venue: event.venue || '',
      venueOther: event.venueOther || '',
      date: event.date || '',
      time: event.time || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await api.delete(`/events/${eventId}`);
        alert('Event deleted successfully!');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      eventId: '',
      eventType: '',
      eventSubtype: '',
      eventSubtypeOther: '',
      subEvents: [],
      description: '',
      rules: '',
      malesFee: '',
      femalesFee: '',
      minParticipants: '',
      maxParticipants: '',
      isTeamEvent: false,
      teamSize: '',
      status: 'active',
      coordinatorName: '',
      coordinatorEmail: '',
      coordinatorPhone: '',
      venue: '',
      venueOther: '',
      date: '',
      time: ''
    });
    setCurrentSubEvent({ name: '', description: '' });
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      eventId: '',
      eventType: '',
      eventSubtype: '',
      eventSubtypeOther: '',
      subEvents: [],
      description: '',
      rules: '',
      malesFee: '',
      femalesFee: '',
      minParticipants: '',
      maxParticipants: '',
      isTeamEvent: false,
      teamSize: '',
      status: 'active',
      coordinatorName: '',
      coordinatorEmail: '',
      coordinatorPhone: '',
      venue: '',
      venueOther: '',
      date: '',
      time: ''
    });
    setCurrentSubEvent({ name: '', description: '' });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <svg className="w-8 h-8 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Event Management
            </h1>
            <p className="text-gray-600 mt-1">Manage all events, coordinators, and event details</p>
            <div className="mt-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 max-w-2xl">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-green-800">One-Time Registration Fee</p>
                  <p className="text-xs text-gray-700 mt-1">
                    <span className="font-semibold">Sports:</span> Males ₹350, Females ₹250 | 
                    <span className="font-semibold ml-2">Cultural:</span> Males/Females ₹250
                  </p>
                  <p className="text-xs text-gray-600 mt-1 italic">Participants can join unlimited events with one registration payment!</p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Event</span>
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first event</p>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Add First Event
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
                <div className={`h-2 ${event.status === 'active' ? 'bg-gradient-to-r from-green-500 to-green-600' : event.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}></div>
                
                <div className="p-6">
                  {/* Event Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                          {event.eventId}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                          event.status === 'active' ? 'bg-green-100 text-green-700' :
                          event.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {event.eventSubtype === 'Other' && event.eventSubtypeOther 
                          ? event.eventSubtypeOther 
                          : event.eventSubtype || 'Event'}
                      </h3>
                      <div className="flex items-center space-x-2 mb-2">
                        {event.eventType && (
                          <span className={`text-xs font-semibold px-2 py-1 rounded ${
                            event.eventType === 'sports' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {event.eventType.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SubEvents */}
                  {event.subEvents && event.subEvents.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-700 mb-2">SUB-EVENTS:</p>
                      <div className="space-y-1">
                        {event.subEvents.map((subEvent, idx) => (
                          <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-2">
                            <p className="text-sm font-semibold text-gray-800">{subEvent.name}</p>
                            {subEvent.description && (
                              <p className="text-xs text-gray-600 mt-1">{subEvent.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                    {event.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>
                  )}

                  {/* Rules and Regulations */}
                  {event.rules && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-yellow-800 mb-1">RULES & REGULATIONS</p>
                          <p className="text-xs text-gray-700 line-clamp-3 whitespace-pre-line">{event.rules}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2 mb-4">
                    {/* Counts */}
                    {(typeof event.teamCount !== 'undefined' || typeof event.individualCount !== 'undefined') && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="px-2 py-1 rounded bg-orange-50 text-orange-700 border border-orange-200 font-semibold">Teams: {event.teamCount || 0}</span>
                        <span className="px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200 font-semibold">Individuals: {event.individualCount || 0}</span>
                        <span className="px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200 font-semibold">Category: {event.isTeamEvent ? 'team' : 'individual'}</span>
                      </div>
                    )}
                    {/* Registration Fee Info */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase">One-Time Registration Fee</p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-700">Males: <span className="font-bold text-blue-700">₹{event.malesFee}</span></span>
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-gray-700">Females: <span className="font-bold text-pink-700">₹{event.femalesFee}</span></span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mt-2 italic">* Participate in unlimited events with one registration</p>
                    </div>
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="text-gray-700">
                        {event.minParticipants}-{event.maxParticipants} participants
                      </span>
                    </div>
                    {event.isTeamEvent && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-indigo-600 font-semibold">
                          Team Event {event.teamSize && `(${event.teamSize} members)`}
                        </span>
                      </div>
                    )}
                    {!event.isTeamEvent && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-green-600 font-semibold">Individual Event</span>
                      </div>
                    )}
                    {event.venue && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-700">
                          {event.venue === 'Other' && event.venueOther 
                            ? event.venueOther 
                            : event.venue}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Coordinator Info */}
                  {event.coordinatorName && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-4 border border-indigo-100">
                      <p className="text-xs font-semibold text-indigo-600 mb-2 uppercase">Coordinator</p>
                      <p className="text-sm font-semibold text-gray-900 mb-1">{event.coordinatorName}</p>
                      {event.coordinatorEmail && (
                        <a href={`mailto:${event.coordinatorEmail}`} className="text-xs text-gray-600 hover:text-indigo-600 flex items-center mb-1">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {event.coordinatorEmail}
                        </a>
                      )}
                      {event.coordinatorPhone && (
                        <a href={`tel:${event.coordinatorPhone}`} className="text-xs text-gray-600 hover:text-indigo-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {event.coordinatorPhone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingEvent ? 'Edit Event' : 'Add New Event'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Event ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event ID *</label>
                  <input
                    type="text"
                    name="eventId"
                    value={formData.eventId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="E001"
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Type *</label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Event Type</option>
                    <option value="sports">Sports</option>
                    <option value="cultural">Cultural</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Sports: Males ₹350, Females ₹250 | Cultural: Males/Females ₹250</p>
                </div>

                {/* Event Subtype */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Event Subtype *</label>
                  <select
                    name="eventSubtype"
                    value={formData.eventSubtype}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.eventType}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Event Subtype</option>
                    {formData.eventType && eventSubtypes[formData.eventType]?.map((subtype) => (
                      <option key={subtype} value={subtype}>{subtype}</option>
                    ))}
                    {formData.eventType && <option value="Other">Other</option>}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Select the main event category (e.g., Cricket, Dance) or choose Other</p>
                </div>

                {/* Event Subtype Other - Conditional */}
                {formData.eventSubtype === 'Other' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specify Event Subtype *</label>
                    <input
                      type="text"
                      name="eventSubtypeOther"
                      value={formData.eventSubtypeOther}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter event subtype name"
                    />
                  </div>
                )}

                {/* Males Fee */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Males Registration Fee (₹) *</label>
                  <input
                    type="number"
                    name="malesFee"
                    value={formData.malesFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="350"
                  />
                </div>

                {/* Females Fee */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Females Registration Fee (₹) *</label>
                  <input
                    type="number"
                    name="femalesFee"
                    value={formData.femalesFee}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="250"
                  />
                </div>

                {/* Min Participants */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Participants *</label>
                  <input
                    type="number"
                    name="minParticipants"
                    value={formData.minParticipants}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>

                {/* Max Participants */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Participants *</label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="4"
                  />
                </div>

                {/* Venue */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Venue</label>
                  <select
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Venue</option>
                    <option value="Sangamam Seminar Hall - A Block 5th Floor">Sangamam Seminar Hall - A Block 5th Floor</option>
                    <option value="Spoorthi Seminar Hall - A Block 4th Floor">Spoorthi Seminar Hall - A Block 4th Floor</option>
                    <option value="Srujana Seminar Hall - H Block 1st Floor">Srujana Seminar Hall - H Block 1st Floor</option>
                    <option value="N Block 1st Floor Seminar Hall">N Block 1st Floor Seminar Hall</option>
                    <option value="N Block 2nd Floor Seminar Hall">N Block 2nd Floor Seminar Hall</option>
                    <option value="H Block Ground">H Block Ground</option>
                    <option value="Main Ground">Main Ground</option>
                    <option value="Hockey Ground">Hockey Ground</option>
                    <option value="Cricket Nets">Cricket Nets</option>
                    <option value="Convocation Hall">Convocation Hall</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Kabaddi Ground">Kabaddi Ground</option>
                    <option value="Volleyball Ground">Volleyball Ground</option>
                    <option value="Basketball Ground">Basketball Ground</option>
                    <option value="H Block">H Block</option>
                    <option value="U Block">U Block</option>
                    <option value="A Block">A Block</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Venue Other - Conditional */}
                {formData.venue === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specify Venue *</label>
                    <input
                      type="text"
                      name="venueOther"
                      value={formData.venueOther}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter venue name"
                    />
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Event description and details..."
                  ></textarea>
                </div>

                {/* Rules and Regulations */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rules and Regulations *</label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter all rules and regulations for this event...&#10;- Rule 1&#10;- Rule 2&#10;- Rule 3"
                  ></textarea>
                  <p className="mt-1 text-sm text-gray-500">Specify all rules, regulations, eligibility criteria, and judging criteria</p>
                </div>

                {/* Sub-Events Section */}
                <div className="md:col-span-2">
                  <div className="border-t-2 border-indigo-200 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Sub-Events (Optional)
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">Add specific sub-events or categories within this main event (e.g., T20, ODI for Cricket)</p>
                    
                    {/* Add Sub-Event Form */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Event Name</label>
                          <input
                            type="text"
                            value={currentSubEvent.name}
                            onChange={(e) => setCurrentSubEvent(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., T20 Match, Solo Dance"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <input
                            type="text"
                            value={currentSubEvent.description}
                            onChange={(e) => setCurrentSubEvent(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Brief description (optional)"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addSubEvent}
                        disabled={!currentSubEvent.name.trim()}
                        className="mt-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Sub-Event</span>
                      </button>
                    </div>

                    {/* Display Added Sub-Events */}
                    {formData.subEvents.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Added Sub-Events ({formData.subEvents.length}):</p>
                        {formData.subEvents.map((subEvent, index) => (
                          <div key={index} className="bg-white border border-gray-300 rounded-lg p-3 flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{subEvent.name}</p>
                              {subEvent.description && (
                                <p className="text-sm text-gray-600 mt-1">{subEvent.description}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSubEvent(index)}
                              className="ml-4 text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-all duration-200"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Team Event Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isTeamEvent"
                      checked={formData.isTeamEvent}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-semibold text-gray-700">This is a Team Event</span>
                  </label>
                </div>

                {/* Team Size - Only show if team event */}
                {formData.isTeamEvent && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Team Size *</label>
                    <input
                      type="number"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleInputChange}
                      required={formData.isTeamEvent}
                      min="2"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="e.g., 4 for a team of 4 members"
                    />
                    <p className="mt-1 text-sm text-gray-500">Specify the fixed number of members required per team</p>
                  </div>
                )}

                {/* Coordinator Section */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center border-b-2 border-indigo-200 pb-2">
                    <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Coordinator Information
                  </h3>
                </div>

                {/* Coordinator Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Coordinator Name</label>
                  <input
                    type="text"
                    name="coordinatorName"
                    value={formData.coordinatorName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                {/* Coordinator Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Coordinator Email</label>
                  <input
                    type="email"
                    name="coordinatorEmail"
                    value={formData.coordinatorEmail}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="coordinator@example.com"
                  />
                </div>

                {/* Coordinator Phone */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Coordinator Phone</label>
                  <input
                    type="tel"
                    name="coordinatorPhone"
                    value={formData.coordinatorPhone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
