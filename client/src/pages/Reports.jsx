import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { reportsAPI, participantsAPI, registrationsAPI, eventRegistrationsAPI, collegesAPI } from '../api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('all-registrations');
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [allData, setAllData] = useState({
    registrations: [],
    participants: [],
    eventTeams: [],
    colleges: [],
  });
  
  // Filtered Data
  const [filteredData, setFilteredData] = useState([]);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    college: '',
    paymentStatus: '',
    category: '',
    eventType: '',
    dateFrom: '',
    dateTo: '',
  });

  // Sort State
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Selection State
  const [selectedRows, setSelectedRows] = useState([]);

  // Stats
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [activeTab, searchTerm, filters, allData]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching all reports data...');
      const [statsRes, regsRes, partsRes, teamsRes, collegesRes] = await Promise.all([
        reportsAPI.getAdminMetrics(),
        registrationsAPI.getAll(),
        participantsAPI.getAll(),
        eventRegistrationsAPI.getAll(),
        collegesAPI.getAll(),
      ]);
      
      const eventTeams = teamsRes.data || [];
      console.log('Event Teams Data:', eventTeams);
      console.log('Total event teams:', eventTeams.length);
      
      // Log category distribution
      const categoryDistribution = eventTeams.reduce((acc, team) => {
        const cat = team.category || 'unknown';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});
      console.log('Category distribution:', categoryDistribution);
      
      // Log some sample teams
      if (eventTeams.length > 0) {
        console.log('Sample teams:', eventTeams.slice(0, 3).map(t => ({
          teamName: t.teamName,
          eventName: t.eventName,
          category: t.category
        })));
      }
      
      setStats(statsRes.data);
      setAllData({
        registrations: regsRes.data || [],
        participants: partsRes.data || [],
        eventTeams: eventTeams,
        colleges: collegesRes.data || [],
      });
      setLastUpdated(new Date());
      console.log('✓ All data fetched successfully');
    } catch (error) {
      console.error('Error fetching reports data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSearch = () => {
    let data = [];
    
    // Select data based on active tab
    switch(activeTab) {
      case 'all-registrations':
        data = allData.registrations;
        break;
      case 'participants':
        data = allData.participants;
        break;
      case 'males':
        data = allData.registrations.filter(r => r.gender === 'Male');
        break;
      case 'females':
        data = allData.registrations.filter(r => r.gender === 'Female');
        break;
      case 'sports':
        data = allData.eventTeams.filter(t => {
          const category = (t.category || '').toLowerCase();
          const eventName = (t.eventName || '').toLowerCase();
          // Check category field or event name for sports keywords
          return category === 'sports' || 
                 eventName.includes('cricket') || 
                 eventName.includes('athletic') ||
                 eventName.includes('football') ||
                 eventName.includes('basketball') ||
                 eventName.includes('volleyball') ||
                 eventName.includes('badminton') ||
                 eventName.includes('kabaddi') ||
                 eventName.includes('tennis') ||
                 eventName.includes('hockey') ||
                 eventName.includes('swimming');
        });
        break;
      case 'cultural':
        data = allData.eventTeams.filter(t => {
          const category = (t.category || '').toLowerCase();
          const eventName = (t.eventName || '').toLowerCase();
          // Check category field or event name for cultural keywords
          return category === 'cultural' ||
                 eventName.includes('dance') ||
                 eventName.includes('music') ||
                 eventName.includes('singing') ||
                 eventName.includes('drama') ||
                 eventName.includes('art') ||
                 eventName.includes('fashion') ||
                 eventName.includes('quiz') ||
                 eventName.includes('debate');
        });
        break;
      case 'event-teams':
        data = allData.eventTeams;
        break;
      case 'colleges':
        data = allData.colleges;
        break;
      default:
        data = [];
    }

    // Apply search
    if (searchTerm) {
      data = data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.gender) {
      data = data.filter(item => item.gender === filters.gender);
    }
    if (filters.college) {
      data = data.filter(item => 
        (item.college || item.collegeName || '').toLowerCase().includes(filters.college.toLowerCase())
      );
    }
    if (filters.paymentStatus) {
      data = data.filter(item => item.paymentStatus === filters.paymentStatus);
    }
    if (filters.category) {
      data = data.filter(item => item.category === filters.category);
    }
    if (filters.eventType) {
      data = data.filter(item => item.eventType === filters.eventType);
    }
    if (filters.dateFrom) {
      data = data.filter(item => {
        const itemDate = new Date(item.createdAt || item.registrationDate);
        return itemDate >= new Date(filters.dateFrom);
      });
    }
    if (filters.dateTo) {
      data = data.filter(item => {
        const itemDate = new Date(item.createdAt || item.registrationDate);
        return itemDate <= new Date(filters.dateTo);
      });
    }

    // Apply sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key] || '';
        const bVal = b[sortConfig.key] || '';
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredData(data);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      gender: '',
      college: '',
      paymentStatus: '',
      category: '',
      eventType: '',
      dateFrom: '',
      dateTo: '',
    });
    setSortConfig({ key: null, direction: 'asc' });
    setSelectedRows([]);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((_, idx) => idx));
    }
  };

  const handleSelectRow = (index) => {
    setSelectedRows(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const exportSelected = () => {
    const dataToExport = selectedRows.map(idx => filteredData[idx]);
    exportToCSV(dataToExport, `selected_${activeTab}_${new Date().toISOString().split('T')[0]}`);
  };

  const handleRefresh = () => {
    fetchAllData();
    setLastUpdated(new Date());
  };

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (filteredData.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No data found</p>
        </div>
      );
    }

    // Render based on tab
    switch(activeTab) {
      case 'all-registrations':
      case 'males':
      case 'females':
        return renderRegistrationsTable();
      case 'participants':
        return renderParticipantsTable();
      case 'sports':
      case 'cultural':
      case 'event-teams':
        return renderEventTeamsTable();
      case 'colleges':
        return renderCollegesTable();
      default:
        return null;
    }
  };

  const renderRegistrationsTable = () => (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">#</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">Mobile</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">College</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">Gender</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">Amount</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-indigo-500">Payment</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y-2 divide-gray-100">
          {filteredData.map((reg, index) => (
            <tr key={reg._id || index} className="hover:bg-indigo-50 transition-colors duration-150 border-l-4 border-transparent hover:border-indigo-500">
              <td className="px-6 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{reg.fullName || reg.name || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{reg.email || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{reg.mobile || reg.phone || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{reg.college || reg.collegeName || 'N/A'}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  reg.gender === 'Male' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                  reg.gender === 'Female' ? 'bg-pink-100 text-pink-800 border border-pink-300' : 
                  'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                  {reg.gender === 'Male' ? '👨 Male' : reg.gender === 'Female' ? '👩 Female' : reg.gender || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-black text-green-600 text-lg">₹{reg.amountPaid || reg.amount || 0}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  reg.paymentStatus === 'paid' || reg.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 border border-green-300' : 
                  reg.paymentStatus === 'pending' || reg.paymentStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : 
                  'bg-red-100 text-red-800 border border-red-300'
                }`}>
                  {(reg.paymentStatus === 'paid' || reg.paymentStatus === 'Paid') ? '✅ Paid' : 
                   (reg.paymentStatus === 'pending' || reg.paymentStatus === 'Pending') ? '⏳ Pending' : 
                   '❌ ' + (reg.paymentStatus || 'N/A')}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderParticipantsTable = () => (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-green-500">#</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-green-500">Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-green-500">Email</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-green-500">College</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-green-500">Event</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-green-500">Payment</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y-2 divide-gray-100">
          {filteredData.map((part, index) => (
            <tr key={part._id || index} className="hover:bg-green-50 transition-colors duration-150 border-l-4 border-transparent hover:border-green-500">
              <td className="px-6 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{part.fullName || part.name || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{part.email || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{part.college || part.collegeName || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{part.eventId?.eventName || part.eventName || 'N/A'}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  part.paymentStatus === 'paid' || part.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800 border border-green-300' : 
                  'bg-yellow-100 text-yellow-800 border border-yellow-300'
                }`}>
                  {(part.paymentStatus === 'paid' || part.paymentStatus === 'Paid') ? '✅ Paid' : '⏳ ' + (part.paymentStatus || 'N/A')}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  part.registrationStatus === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-300' : 
                  'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                  {part.registrationStatus === 'confirmed' ? '✅ Confirmed' : part.registrationStatus || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEventTeamsTable = () => (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">#</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">Team Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">Event</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">Category</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">College</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">Members</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-orange-500">Captain</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y-2 divide-gray-100">
          {filteredData.map((team, index) => (
            <tr key={team._id || index} className="hover:bg-orange-50 transition-colors duration-150 border-l-4 border-transparent hover:border-orange-500">
              <td className="px-6 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{team.teamName || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{team.eventName || 'N/A'}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  team.category === 'sports' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                  'bg-purple-100 text-purple-800 border border-purple-300'
                }`}>
                  {team.category === 'sports' ? '⚽ Sports' : team.category === 'cultural' ? '🎭 Cultural' : team.category || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{team.college || team.collegeName || 'N/A'}</td>
              <td className="px-6 py-4 text-sm">
                <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-3 py-1.5 rounded-lg text-xs font-black shadow-sm">
                  👥 {team.teamSize || team.totalMembers || 0}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{team.captainName || team.captain?.name || 'N/A'}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                  team.status === 'confirmed' || team.status === 'active' ? 'bg-green-100 text-green-800 border border-green-300' : 
                  'bg-gray-100 text-gray-800 border border-gray-300'
                }`}>
                  {(team.status === 'confirmed' || team.status === 'active') ? '✅ Active' : team.status || 'N/A'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCollegesTable = () => (
    <div className="overflow-x-auto rounded-xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">#</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">College Name</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">District</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">State</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider border-r border-blue-500">Total Registrations</th>
            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Contact</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y-2 divide-gray-100">
          {filteredData.map((college, index) => (
            <tr key={college._id || index} className="hover:bg-blue-50 transition-colors duration-150 border-l-4 border-transparent hover:border-blue-500">
              <td className="px-6 py-4 text-sm font-bold text-gray-500">{index + 1}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">{college.collegeName || college.name || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700">{college.district || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-700 font-medium">{college.state || 'N/A'}</td>
              <td className="px-6 py-4 text-sm">
                <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-4 py-2 rounded-lg text-sm font-black shadow-sm">
                  📊 {college.totalRegistrations || 0}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-700">{college.contactEmail || college.email || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const tabs = [
    { id: 'all-registrations', label: 'All Registrations', icon: '📋', count: allData.registrations.length },
    { id: 'participants', label: 'Participants', icon: '👤', count: allData.participants.length },
    { id: 'males', label: 'Males', icon: '👨', count: allData.registrations.filter(r => r.gender === 'Male').length },
    { id: 'females', label: 'Females', icon: '👩', count: allData.registrations.filter(r => r.gender === 'Female').length },
    { id: 'sports', label: 'Sports Teams', icon: '⚽', count: allData.eventTeams.filter(t => {
      const category = (t.category || '').toLowerCase();
      const eventName = (t.eventName || '').toLowerCase();
      return category === 'sports' || eventName.includes('cricket') || eventName.includes('athletic') ||
             eventName.includes('football') || eventName.includes('basketball') || eventName.includes('volleyball') ||
             eventName.includes('badminton') || eventName.includes('kabaddi') || eventName.includes('tennis') ||
             eventName.includes('hockey') || eventName.includes('swimming');
    }).length },
    { id: 'cultural', label: 'Cultural Teams', icon: '🎭', count: allData.eventTeams.filter(t => {
      const category = (t.category || '').toLowerCase();
      const eventName = (t.eventName || '').toLowerCase();
      return category === 'cultural' || eventName.includes('dance') || eventName.includes('music') ||
             eventName.includes('singing') || eventName.includes('drama') || eventName.includes('art') ||
             eventName.includes('fashion') || eventName.includes('quiz') || eventName.includes('debate');
    }).length },
    { id: 'event-teams', label: 'All Event Teams', icon: '👥', count: allData.eventTeams.length },
    { id: 'colleges', label: 'Colleges', icon: '🏫', count: allData.colleges.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-10 mb-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-2xl backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-5xl font-black mb-2 tracking-tight">Analytics Dashboard</h1>
                <p className="text-indigo-100 text-lg font-medium">Comprehensive reports with advanced filtering & export capabilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-blue-500 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Total Participants</p>
              <p className="text-4xl font-black text-gray-900 mb-1">{stats.totals?.participants || 0}</p>
              <p className="text-xs text-blue-600 font-medium">Active users in system</p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-green-500 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-green-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Total Registrations</p>
              <p className="text-4xl font-black text-gray-900 mb-1">{stats.totals?.registrations || 0}</p>
              <p className="text-xs text-green-600 font-medium">Confirmed bookings</p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-orange-500 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Event Teams</p>
              <p className="text-4xl font-black text-gray-900 mb-1">{(stats.sports?.teams || 0) + (stats.cultural?.teams || 0)}</p>
              <p className="text-xs text-orange-600 font-medium">Sports & Cultural groups</p>
            </div>
            
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 border-purple-500 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-500 text-sm font-semibold mb-1 uppercase tracking-wide">Participating Colleges</p>
              <p className="text-4xl font-black text-gray-900 mb-1">{stats.totals?.colleges || 0}</p>
              <p className="text-xs text-purple-600 font-medium">Institutions registered</p>
            </div>
          </div>
        )}

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-8 overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Data Categories</span>
            </h2>
          </div>
          <div className="flex overflow-x-auto bg-white scrollbar-thin scrollbar-thumb-gray-300">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-5 font-bold text-sm transition-all duration-300 whitespace-nowrap flex items-center space-x-3 border-b-4 relative group ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-700 bg-indigo-50 shadow-inner'
                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300'
                }`}
              >
                <span className="text-2xl transform group-hover:scale-110 transition-transform">{tab.icon}</span>
                <div className="flex flex-col items-start">
                  <span className="text-sm">{tab.label}</span>
                  <span className={`text-xs font-normal ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {tab.count} records
                  </span>
                </div>
                {activeTab === tab.id && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-600 rounded-full"></span>
                )}
              </button>
            ))}
          </div>

          {/* Enhanced Filters and Search */}
          <div className="p-8 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 border-b-2 border-indigo-100">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Advanced Filters</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search anything..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-sm hover:border-indigo-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-sm hover:border-indigo-300 bg-white"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">👨 Male</option>
                    <option value="Female">👩 Female</option>
                    <option value="Other">⚧ Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">College</label>
                  <input
                    type="text"
                    placeholder="Filter by college name"
                    value={filters.college}
                    onChange={(e) => setFilters({ ...filters, college: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-sm hover:border-indigo-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">Payment Status</label>
                  <select
                    value={filters.paymentStatus}
                    onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-sm hover:border-indigo-300 bg-white"
                  >
                    <option value="">All Status</option>
                    <option value="paid">✅ Paid</option>
                    <option value="Paid">✅ Paid</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="Pending">⏳ Pending</option>
                    <option value="failed">❌ Failed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">📅 Date From</label>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-sm hover:border-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">📅 Date To</label>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-sm hover:border-indigo-300"
                  />
                </div>
              </div>
            </div>

            {/* Quick Filter Chips */}
            {(searchTerm || filters.gender || filters.college || filters.paymentStatus || filters.dateFrom || filters.dateTo) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <p className="text-sm font-semibold text-gray-600 mr-2">Active Filters:</p>
                {searchTerm && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold flex items-center gap-1">
                    🔍 Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:bg-indigo-200 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                  </span>
                )}
                {filters.gender && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1">
                    Gender: {filters.gender}
                    <button onClick={() => setFilters({...filters, gender: ''})} className="ml-1 hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                  </span>
                )}
                {filters.college && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold flex items-center gap-1">
                    🏫 College: {filters.college}
                    <button onClick={() => setFilters({...filters, college: ''})} className="ml-1 hover:bg-purple-200 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                  </span>
                )}
                {filters.paymentStatus && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1">
                    💳 Payment: {filters.paymentStatus}
                    <button onClick={() => setFilters({...filters, paymentStatus: ''})} className="ml-1 hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                  </span>
                )}
                {(filters.dateFrom || filters.dateTo) && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1">
                    📅 {filters.dateFrom || 'Start'} → {filters.dateTo || 'End'}
                    <button onClick={() => setFilters({...filters, dateFrom: '', dateTo: ''})} className="ml-1 hover:bg-orange-200 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                  </span>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-6">
              <button
                onClick={clearFilters}
                className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg border-2 border-gray-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Clear All</span>
              </button>

              <button
                onClick={handleRefresh}
                className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg border-2 border-gray-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
              
              <button
                onClick={() => exportToCSV(filteredData, `${activeTab}_${new Date().toISOString().split('T')[0]}`)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export All</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg text-xs font-black">{filteredData.length}</span>
              </button>

              {selectedRows.length > 0 && (
                <button
                  onClick={exportSelected}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Export Selected</span>
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-lg text-xs font-black">{selectedRows.length}</span>
                </button>
              )}

              <button
                onClick={() => window.print()}
                className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg border-2 border-gray-300 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print</span>
              </button>

              {lastUpdated && (
                <div className="bg-gray-100 px-4 py-2 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Last updated:</span> {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              )}

              <div className="ml-auto bg-white px-6 py-3 rounded-xl shadow-md border-2 border-indigo-100">
                <p className="text-sm font-bold text-gray-800">
                  <span className="text-indigo-600 text-lg">{filteredData.length}</span>
                  <span className="text-gray-500 mx-2">/</span>
                  <span className="text-gray-600">{
                    activeTab === 'all-registrations' ? allData.registrations.length :
                    activeTab === 'participants' ? allData.participants.length :
                    activeTab === 'males' ? allData.registrations.filter(r => r.gender === 'Male').length :
                    activeTab === 'females' ? allData.registrations.filter(r => r.gender === 'Female').length :
                    activeTab === 'sports' ? allData.eventTeams.filter(t => {
                      const category = (t.category || '').toLowerCase();
                      const eventName = (t.eventName || '').toLowerCase();
                      return category === 'sports' || eventName.includes('cricket') || eventName.includes('athletic') ||
                             eventName.includes('football') || eventName.includes('basketball') || eventName.includes('volleyball');
                    }).length :
                    activeTab === 'cultural' ? allData.eventTeams.filter(t => {
                      const category = (t.category || '').toLowerCase();
                      const eventName = (t.eventName || '').toLowerCase();
                      return category === 'cultural' || eventName.includes('dance') || eventName.includes('music') ||
                             eventName.includes('singing') || eventName.includes('drama') || eventName.includes('art');
                    }).length :
                    activeTab === 'event-teams' ? allData.eventTeams.length :
                    activeTab === 'colleges' ? allData.colleges.length : 0
                  }</span>
                  <span className="text-gray-500 text-xs ml-2">records</span>
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Table Content */}
          <div className="p-8 bg-white">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-gray-800 flex items-center space-x-3">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-lg">
                    {tabs.find(t => t.id === activeTab)?.icon}
                  </span>
                  <span>{tabs.find(t => t.id === activeTab)?.label}</span>
                </h3>
                {filteredData.length > 0 && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border-2 border-indigo-200">
                    <p className="text-sm font-bold text-indigo-800">
                      <span className="text-indigo-600">{filteredData.length}</span> {filteredData.length === 1 ? 'record' : 'records'} found
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-2 h-1 w-32 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"></div>
            </div>
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
