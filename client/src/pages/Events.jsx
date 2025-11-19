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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('men'); // 'men', 'women', 'para'
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'sports', 'cultural'
  const [formData, setFormData] = useState({
    eventId: '',
    eventType: '',
    gender: '',
    category: ''
  });

  // Event categories with complete event lists
  const eventsByCategory = {
    men: {
      sports: [
        { name: '100 M', medals: 3 },
        { name: '400 M', medals: 3 },
        { name: '800 M', medals: 3 },
        { name: '3 K', medals: 3 },
        { name: '4 x 100 M Relay', medals: 12 },
        { name: '4 x 400 M Relay', medals: 12 },
        { name: 'Long jump', medals: 3 },
        { name: 'Shot put', medals: 3 },
        { name: 'Chess', medals: 2 },
        { name: 'Table Tennis', medals: 2 },
        { name: 'Traditional Yogasana', medals: 2 },
        { name: 'Artistic Yogasana', medals: 2 },
        { name: 'Taekwondo', medals: 16 },
        { name: 'Cricket Championship (13+2)', count: 60 },
        { name: 'Volley ball (8+4)', count: 40 },
        { name: 'Basket ball (5+5)', count: 40 },
        { name: 'Kabaddi (7+3)', count: 40 },
        { name: 'Foot ball (7+3)', count: 20 },
        { name: 'Kho-Kho (3+3)', count: 24 },
        { name: 'Hockey (7+3)', count: 20 }
      ],
      cultural: [
        { name: 'Singing idol', count: 1 },
        { name: 'Group Singing (6 no.)', count: 6 },
        { name: 'Singing Jodi', count: 2 },
        { name: 'Classical/Light Vocal Solo', count: 1 },
        { name: 'Western Vocal Solo', count: 1 },
        { name: 'Anthyakshan Duo', count: 2 },
        { name: 'Instrumental Solo', count: 1 },
        { name: 'Classical Dance Solo', count: 1 },
        { name: 'Dancing Star - Western Solo', count: 1 },
        { name: 'Dancing Jodi - Western Duo', count: 2 },
        { name: 'Spot Dance - Jodi', count: 2 },
        { name: 'Group Dance (10 no.)', count: 10 },
        { name: 'Short film', count: 5 },
        { name: 'Skit (8 no.)', count: 8 },
        { name: 'Mime (6 no.)', count: 6 },
        { name: 'Dialogue Dhamakha', count: 1 },
        { name: 'Mono Action', count: 1 },
        { name: 'On the Spot Ad making', count: 4 },
        { name: 'Master Orator', count: 1 },
        { name: 'Spot Creative writing', count: 1 },
        { name: 'Telugu Vyaasa rachana', count: 1 },
        { name: 'Shayari - Hindi', count: 1 },
        { name: 'Impromptu (JAM)', count: 1 },
        { name: 'Story telling', count: 1 },
        { name: 'Quiz wiz (3 no.)', count: 3 },
        { name: 'Word Master', count: 1 },
        { name: 'Dumb charades (2 no.)', count: 2 },
        { name: 'Theme Painting', count: 1 },
        { name: 'Clay modelling', count: 1 },
        { name: 'Rangoli (2 no.)', count: 2 },
        { name: 'Mehandi', count: 1 },
        { name: 'Photography - Theme', count: 1 },
        { name: 'Collage', count: 1 },
        { name: 'Face Painting', count: 2 },
        { name: 'Pencil Sketching', count: 1 },
        { name: 'Mandala', count: 1 },
        { name: 'Haute Couture - Theme Ramp walk (12 no.)', count: 12 },
        { name: 'Craft villa (Accessory design)', count: 2 },
        { name: 'Texart (Fashion sketching)', count: 1 },
        { name: 'T-Shirt designing', count: 1 },
        { name: 'Mr. Mahotsav', count: 1 },
        { name: 'Mahotsav Got Talent', count: 10 }
      ]
    },
    women: {
      sports: [
        { name: '100 M', medals: 3 },
        { name: '400 M', medals: 3 },
        { name: '800 M', medals: 3 },
        { name: '4 x 100 M Relay', medals: 12 },
        { name: '4 x 400 M Relay', medals: 12 },
        { name: 'Long jump', medals: 3 },
        { name: 'Shot put', medals: 3 },
        { name: 'Chess', medals: 2 },
        { name: 'Table Tennis', medals: 2 },
        { name: 'Traditional Yogasana', medals: 2 },
        { name: 'Artistic Yogasana', medals: 2 },
        { name: 'Taekwondo', medals: 16 },
        { name: 'Tennikoit', medals: 2 },
        { name: 'Volley ball (8+4)', count: 20 },
        { name: 'Basket ball (5+5)', count: 20 },
        { name: 'Kabaddi (7+3)', count: 20 },
        { name: 'Kho-Kho (3+3)', count: 24 },
        { name: 'Throw ball (8+3)', count: 18 }
      ],
      cultural: [
        { name: 'Singing idol', count: 1 },
        { name: 'Group Singing (6 no.)', count: 6 },
        { name: 'Singing Jodi', count: 2 },
        { name: 'Classical/Light Vocal Solo', count: 1 },
        { name: 'Western Vocal Solo', count: 1 },
        { name: 'Anthyakshan Duo', count: 2 },
        { name: 'Instrumental Solo', count: 1 },
        { name: 'Classical Dance Solo', count: 1 },
        { name: 'Dancing Star - Western Solo', count: 1 },
        { name: 'Dancing Jodi - Western Duo', count: 2 },
        { name: 'Spot Dance - Jodi', count: 2 },
        { name: 'Group Dance (10 no.)', count: 10 },
        { name: 'Short film', count: 5 },
        { name: 'Skit (8 no.)', count: 8 },
        { name: 'Mime (6 no.)', count: 6 },
        { name: 'Dialogue Dhamakha', count: 1 },
        { name: 'Mono Action', count: 1 },
        { name: 'On the Spot Ad making', count: 4 },
        { name: 'Master Orator', count: 1 },
        { name: 'Spot Creative writing', count: 1 },
        { name: 'Telugu Vyaasa rachana', count: 1 },
        { name: 'Shayari - Hindi', count: 1 },
        { name: 'Impromptu (JAM)', count: 1 },
        { name: 'Story telling', count: 1 },
        { name: 'Quiz wiz (3 no.)', count: 3 },
        { name: 'Word Master', count: 1 },
        { name: 'Dumb charades (2 no.)', count: 2 },
        { name: 'Theme Painting', count: 1 },
        { name: 'Clay modelling', count: 1 },
        { name: 'Rangoli (2 no.)', count: 2 },
        { name: 'Mehandi', count: 1 },
        { name: 'Photography - Theme', count: 1 },
        { name: 'Collage', count: 1 },
        { name: 'Face Painting', count: 2 },
        { name: 'Pencil Sketching', count: 1 },
        { name: 'Mandala', count: 1 },
        { name: 'Haute Couture - Theme Ramp walk (12 no.)', count: 12 },
        { name: 'Craft villa (Accessory design)', count: 2 },
        { name: 'Texart (Fashion sketching)', count: 1 },
        { name: 'T-Shirt designing', count: 1 },
        { name: 'Ms. Mahotsav', count: 1 },
        { name: 'Mahotsav Got Talent', count: 10 }
      ]
    },
    para: {
      sports: [
        { name: '100 M - Hand Amputee', count: 2 },
        { name: '100 M - Leg Amputee', count: 2 },
        { name: '100 M - Visual impairment', count: 2 },
        { name: '400 M - Hand Amputee', count: 2 },
        { name: '400 M - Leg Amputee', count: 2 },
        { name: '400 M - Visual impairment', count: 2 },
        { name: 'Long jump - Leg Amputee', count: 2 },
        { name: 'Long jump - Hand Amputee', count: 2 },
        { name: 'Shot put - Leg Amputee', count: 2 },
        { name: 'Shot put - Hand Amputee', count: 2 },
        { name: 'Cricket - Physically challenged', count: 25 }
      ],
      cultural: []
    }
  };

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      eventType: event.eventType || ''
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
      eventType: ''
    });
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setFormData({
      eventId: '',
      eventType: ''
    });
    setShowModal(true);
  };

  // Get events for current selection
  const getCurrentEvents = () => {
    const sessionEvents = eventsByCategory[selectedSession];
    if (!sessionEvents) return [];
    
    if (selectedCategory === 'all') {
      return [...(sessionEvents.sports || []), ...(sessionEvents.cultural || [])];
    }
    return sessionEvents[selectedCategory] || [];
  };

  const currentEvents = getCurrentEvents();
  
  // Calculate counts
  const menSportsCount = eventsByCategory.men.sports.length;
  const menCulturalCount = eventsByCategory.men.cultural.length;
  const womenSportsCount = eventsByCategory.women.sports.length;
  const womenCulturalCount = eventsByCategory.women.cultural.length;
  const paraSportsCount = eventsByCategory.para.sports.length;
  const paraCulturalCount = eventsByCategory.para.cultural.length;

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

        {/* Session Selection - Main Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Select Session</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Men Events */}
            <button
              onClick={() => { setSelectedSession('men'); setSelectedCategory('all'); }}
              className={`p-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                selectedSession === 'men'
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl scale-105'
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 hover:from-blue-100 hover:to-blue-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-2xl">Men Events</span>
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${selectedSession === 'men' ? 'bg-white bg-opacity-30' : 'bg-blue-200'}`}>
                  Sports: {menSportsCount}
                </span>
                <span className={`px-3 py-1 rounded-full ${selectedSession === 'men' ? 'bg-white bg-opacity-30' : 'bg-blue-200'}`}>
                  Cultural: {menCulturalCount}
                </span>
              </div>
            </button>

            {/* Women Events */}
            <button
              onClick={() => { setSelectedSession('women'); setSelectedCategory('all'); }}
              className={`p-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                selectedSession === 'women'
                  ? 'bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-2xl scale-105'
                  : 'bg-gradient-to-br from-pink-50 to-pink-100 text-pink-800 hover:from-pink-100 hover:to-pink-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-2xl">Women Events</span>
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${selectedSession === 'women' ? 'bg-white bg-opacity-30' : 'bg-pink-200'}`}>
                  Sports: {womenSportsCount}
                </span>
                <span className={`px-3 py-1 rounded-full ${selectedSession === 'women' ? 'bg-white bg-opacity-30' : 'bg-pink-200'}`}>
                  Cultural: {womenCulturalCount}
                </span>
              </div>
            </button>

            {/* Para Events */}
            <button
              onClick={() => { setSelectedSession('para'); setSelectedCategory('all'); }}
              className={`p-6 rounded-xl font-bold transition-all duration-200 transform hover:scale-105 ${
                selectedSession === 'para'
                  ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white shadow-2xl scale-105'
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 text-purple-800 hover:from-purple-100 hover:to-purple-200'
              }`}
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="text-2xl">Para Events</span>
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <span className={`px-3 py-1 rounded-full ${selectedSession === 'para' ? 'bg-white bg-opacity-30' : 'bg-purple-200'}`}>
                  Sports: {paraSportsCount}
                </span>
                <span className={`px-3 py-1 rounded-full ${selectedSession === 'para' ? 'bg-white bg-opacity-30' : 'bg-purple-200'}`}>
                  Cultural: {paraCulturalCount}
                </span>
              </div>
            </button>
          </div>

          {/* Sub-Category Filter */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Filter by Category</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>All</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedCategory === 'all' ? 'bg-white text-indigo-600' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {(eventsByCategory[selectedSession]?.sports?.length || 0) + (eventsByCategory[selectedSession]?.cultural?.length || 0)}
                  </span>
                </span>
              </button>
              <button
                onClick={() => setSelectedCategory('sports')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                  selectedCategory === 'sports'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Sports</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    selectedCategory === 'sports' ? 'bg-white text-green-600' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {eventsByCategory[selectedSession]?.sports?.length || 0}
                  </span>
                </span>
              </button>
              {eventsByCategory[selectedSession]?.cultural?.length > 0 && (
                <button
                  onClick={() => setSelectedCategory('cultural')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    selectedCategory === 'cultural'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <span>Cultural</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      selectedCategory === 'cultural' ? 'bg-white text-purple-600' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {eventsByCategory[selectedSession]?.cultural?.length || 0}
                    </span>
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 bg-indigo-50 px-4 py-2 rounded-lg inline-block">
              Showing <span className="font-bold text-indigo-600 text-lg">{currentEvents.length}</span> events in <span className="font-semibold capitalize">{selectedSession}</span> • <span className="font-semibold capitalize">{selectedCategory === 'all' ? 'All Categories' : selectedCategory}</span>
            </div>
          </div>
        </div>

        {/* Events List */}
        {currentEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events in This Category</h3>
            <p className="text-gray-600">Try selecting a different category or session</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className={`px-8 py-6 ${
              selectedSession === 'men' ? 'bg-gradient-to-r from-blue-600 to-blue-700' :
              selectedSession === 'women' ? 'bg-gradient-to-r from-pink-600 to-pink-700' :
              'bg-gradient-to-r from-purple-600 to-purple-700'
            }`}>
              <h2 className="text-2xl font-bold text-white capitalize">
                {selectedSession} • {selectedCategory === 'all' ? 'All Events' : selectedCategory}
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Event Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Participants/Medals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentEvents.map((event, index) => {
                    const isFromSports = eventsByCategory[selectedSession]?.sports?.includes(event);
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{index + 1}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isFromSports 
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                                : 'bg-gradient-to-br from-purple-500 to-pink-600'
                            }`}>
                              {isFromSports ? (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{event.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            isFromSports
                              ? 'bg-green-100 text-green-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {isFromSports ? 'Sports' : 'Cultural'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {event.medals !== undefined ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              {event.medals} Medals
                            </span>
                          ) : event.count !== undefined ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              {event.count} Participants
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Removed old event cards and modal - keeping this comment for reference */}
      {/* Old event management system removed - now displaying structured event lists by session */}
    </div>
  );
};

export default Events;

