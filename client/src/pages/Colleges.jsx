import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { collegesAPI, registrationsAPI } from '../api';

const Colleges = () => {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [filteredColleges, setFilteredColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [collegeStudents, setCollegeStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await collegesAPI.getAll();
      console.log('Colleges fetched:', response.data);
      setColleges(response.data || []);
      setFilteredColleges(response.data || []);
      setError(null);
    } catch (e) {
      console.error('Colleges fetch error:', e);
      setError(e.response?.data?.message || e.message || 'Failed to fetch colleges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = colleges.filter(college => 
        college.collegeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.state?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredColleges(filtered);
    } else {
      setFilteredColleges(colleges);
    }
  }, [searchTerm, colleges]);

  const viewStudents = async (college) => {
    setSelectedCollege(college);
    setShowStudentsModal(true);
    setLoadingStudents(true);
    try {
      const response = await registrationsAPI.getAll();
      const students = response.data.filter(reg => 
        reg.collegeName?.toLowerCase() === college.collegeName?.toLowerCase()
      );
      setCollegeStudents(students);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Failed to fetch students');
    } finally {
      setLoadingStudents(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black mb-2">Colleges List</h1>
              <p className="text-blue-100 text-lg">{colleges.length} colleges • {colleges.reduce((sum, c) => sum + (c.totalRegistrations || 0), 0)} total students</p>
            </div>
          </div>
        </div>

        {/* Simple Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by college name or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all duration-200 bg-gray-50 text-lg"
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-5 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Showing <span className="font-bold text-indigo-600">{filteredColleges.length}</span> of <span className="font-bold">{colleges.length}</span> colleges
            {searchTerm && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">🔍 "{searchTerm}"</span>}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-bold">Error loading colleges</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchColleges}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-500 mt-4 text-lg">Loading colleges...</p>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
            <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 text-2xl font-black mb-3">No colleges found</p>
            <p className="text-gray-400 text-lg">{searchTerm ? 'Try adjusting your search' : 'No colleges registered yet'}</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">#</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">College Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider text-white">State</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider text-white">Students</th>
                    <th className="px-6 py-4 text-center text-sm font-bold uppercase tracking-wider text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredColleges.map((college, idx) => (
                    <tr key={college._id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50 transition-colors`}>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                            {college.collegeName?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{college.collegeName || 'N/A'}</p>
                            {college.district && (
                              <p className="text-xs text-gray-500">{college.district}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          {college.state || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-green-100 to-emerald-100">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="text-lg font-black text-green-700">{college.totalRegistrations || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => viewStudents(college)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center space-x-2 mx-auto"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>View Students</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Students List Modal */}
        {showStudentsModal && selectedCollege && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-6 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-black text-white">Students List</h3>
                  <p className="text-green-100 text-sm mt-1">{selectedCollege.collegeName}</p>
                </div>
                <button
                  onClick={() => {
                    setShowStudentsModal(false);
                    setCollegeStudents([]);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-30 rounded-xl p-3 transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-8">
                {loadingStudents ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-lg">Loading students...</p>
                  </div>
                ) : collegeStudents.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-32 h-32 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <p className="text-gray-500 text-2xl font-black mb-3">No Students Found</p>
                    <p className="text-gray-400 text-lg">No students have registered from this college yet</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-green-600 rounded-xl p-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Total Students Registered</p>
                            <p className="text-4xl font-black text-green-900">{collegeStudents.length}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-green-700 font-semibold mb-1">Payment Status</p>
                          <div className="flex space-x-2">
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">
                              ✅ {collegeStudents.filter(s => s.paymentStatus === 'paid').length} Paid
                            </span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold">
                              ⏳ {collegeStudents.filter(s => s.paymentStatus === 'pending').length} Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gradient-to-r from-green-600 to-emerald-600">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">#</th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Student Name</th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Email</th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Phone</th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Gender</th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Payment</th>
                              <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white">Registration Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {collegeStudents.map((student, idx) => (
                              <tr key={student._id || idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900">{idx + 1}</td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
                                      {student.name?.charAt(0).toUpperCase() || 'S'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-gray-900">{student.name || 'N/A'}</p>
                                      <p className="text-xs text-gray-500">{student.rollNumber || 'No Roll No.'}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-700">{student.email || 'N/A'}</td>
                                <td className="px-6 py-4 text-sm text-gray-700">{student.phone || 'N/A'}</td>
                                <td className="px-6 py-4">
                                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    student.gender === 'male' ? 'bg-blue-100 text-blue-700' :
                                    student.gender === 'female' ? 'bg-pink-100 text-pink-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {student.gender === 'male' ? '👨 Male' : student.gender === 'female' ? '👩 Female' : student.gender || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    student.paymentStatus?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' :
                                    student.paymentStatus?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                    student.paymentStatus?.toLowerCase() === 'failed' ? 'bg-red-100 text-red-700' :
                                    'bg-purple-100 text-purple-700'
                                  }`}>
                                    {student.paymentStatus?.toLowerCase() === 'paid' ? '✅ Paid' :
                                     student.paymentStatus?.toLowerCase() === 'pending' ? '⏳ Pending' :
                                     student.paymentStatus?.toLowerCase() === 'failed' ? '❌ Failed' :
                                     student.paymentStatus || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {student.createdAt ? new Date(student.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  }) : 'N/A'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Colleges;
