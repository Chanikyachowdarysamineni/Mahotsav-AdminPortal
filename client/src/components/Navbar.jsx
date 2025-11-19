import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { collegesAPI } from '../api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [colleges, setColleges] = useState([]);
  const [showCollegesDropdown, setShowCollegesDropdown] = useState(false);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCollegesDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchColleges = async () => {
    try {
      setLoadingColleges(true);
      const { data } = await collegesAPI.getAll();
      setColleges(data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    } finally {
      setLoadingColleges(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b-2 border-indigo-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Admin Portal</h1>
            </div>
            <div className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/dashboard')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/events"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/events')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Events
              </Link>
              <Link
                to="/participants"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/participants')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Participants
              </Link>
              <Link
                to="/registrations"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/registrations')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Registrations
              </Link>
              <Link
                to="/coordinators"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/coordinators')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Coordinators
              </Link>
              <Link
                to="/sports"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/sports')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Sports
              </Link>
              <Link
                to="/cultural"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/cultural')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Cultural
              </Link>
              <Link
                to="/reports"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/reports')
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                Reports
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowCollegesDropdown(!showCollegesDropdown)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1 ${
                    isActive('/colleges')
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  <span>Colleges</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showCollegesDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showCollegesDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-lg">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-semibold text-sm">Registered Colleges</h3>
                        <Link
                          to="/colleges"
                          onClick={() => setShowCollegesDropdown(false)}
                          className="text-white hover:text-indigo-100 text-xs underline"
                        >
                          View All
                        </Link>
                      </div>
                      <p className="text-indigo-100 text-xs mt-1">Total: {colleges.length} colleges</p>
                    </div>
                    
                    {loadingColleges ? (
                      <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="text-gray-500 text-sm mt-2">Loading colleges...</p>
                      </div>
                    ) : colleges.length === 0 ? (
                      <div className="p-6 text-center">
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-gray-500 text-sm">No colleges found</p>
                        <Link
                          to="/colleges"
                          onClick={() => setShowCollegesDropdown(false)}
                          className="mt-3 inline-block text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                        >
                          Add College
                        </Link>
                      </div>
                    ) : (
                      <div className="py-2">
                        {colleges.map((college, index) => (
                          <div
                            key={college._id}
                            className="px-4 py-3 hover:bg-indigo-50 transition cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              navigate('/colleges');
                              setShowCollegesDropdown(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                                    #{index + 1}
                                  </span>
                                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                    {college.collegeName}
                                  </h4>
                                </div>
                                <div className="mt-2 flex items-center space-x-3">
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-xs text-gray-600">{college.district}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-3 h-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                      {college.state}
                                    </span>
                                  </div>
                                </div>
                                {college.totalRegistrations > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-semibold">
                                      📊 {college.totalRegistrations} registrations
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">{user?.name?.charAt(0)}</span>
              </div>
              <span className="text-gray-700 font-medium">Welcome, <span className="text-indigo-600 font-semibold">{user?.name}</span></span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-5 py-2 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
