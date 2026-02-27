import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisors,
  getSupervisor,
  requestSupervisorChange,
  fetchProject
} from "../../store/slices/studentSlice";
import {
  User,
  Mail,
  Building2,
  Award,
  Send,
  CheckCircle,
  AlertCircle,
  Search,
  UserCheck,
  X,
  FileText,
  Calendar,
  Clock,
  Briefcase,
  ChevronRight
} from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { supervisors, supervisor, project, loading } = useSelector((state) => state.student);

  // State for request modal
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [message, setMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(getSupervisor());
    dispatch(fetchAllSupervisors());
    dispatch(fetchProject());
  }, [dispatch]);

  const handleRequestClick = (sup) => {
    setSelectedSupervisor(sup);
    setMessage("");
  };

  const handleCloseModal = () => {
    setSelectedSupervisor(null);
    setMessage("");
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedSupervisor) return;

    setRequestLoading(true);
    try {
      const resultAction = await dispatch(requestSupervisorChange({
        teacherId: selectedSupervisor._id,
        message: message
      }));

      if (requestSupervisorChange.fulfilled.match(resultAction)) {
        handleCloseModal();
      }
    } catch (error) {
      console.error("Failed to request supervisor:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  // Filter supervisors
  const filteredSupervisors = supervisors?.filter(sup =>
    sup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.department?.toLowerCase()?.includes(searchTerm.toLowerCase())
  ) || [];

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20 md:pb-8">
      {/* Page Header Background */}
      <div className="bg-slate-900 pb-20 pt-8 px-4 md:px-6 lg:px-8 shadow-md relative overflow-hidden">
        {/* Abstract Background Elements - Subtle */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute left-10 bottom-0 w-[400px] h-[400px] bg-slate-700/10 rounded-full blur-[100px] translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Supervisor Management</h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-lg">
            Oversee your final year project supervision and track your project milestones effectively.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 -mt-12 md:-mt-24 space-y-6 md:space-y-8 pb-12 relative z-20">

        {/* Main Dashboard Grid */}
        {supervisor ? (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* Supervisor Card - Modern & Clean */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <UserCheck className="text-blue-600 w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Assigned Supervisor</h2>
                </div>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">Active</span>
              </div>

              <div className="p-8">
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-4xl font-light border-4 border-white shadow-lg ring-1 ring-slate-100">
                      {supervisor.name.charAt(0)}
                    </div>
                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>

                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{supervisor.name}</h3>
                      <p className="text-blue-600 font-medium text-sm mt-1">{supervisor.department}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 truncate">{supervisor.email}</span>
                      </div>
                      {supervisor.experties && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                          <Award className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-600 truncate">{supervisor.experties}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Details Card - Compact & Info-rich */}
            {project && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Briefcase className="text-blue-600 w-4 h-4" />
                    </div>
                    <h2 className="text-base font-bold text-slate-800">Project Details</h2>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${project.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                    project.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      project.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                    {project.status}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">{project.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-4">{project.description}</p>

                  <div className="mt-auto space-y-3 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" /> Created
                      </span>
                      <span className="font-semibold text-slate-700">{formatDate(project.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-4 h-4" /> Deadline
                      </span>
                      <span className={`font-semibold ${project.deadline ? 'text-blue-600' : 'text-slate-400'}`}>
                        {project.deadline ? formatDate(project.deadline) : "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Action Required Banner */}
            <div className="bg-white border-l-4 border-yellow-500 rounded-r-xl shadow-sm p-6 flex flex-col md:flex-row gap-6 items-center">
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900">Action Required: No Supervisor Assigned</h3>
                <p className="text-slate-500 text-base mt-1">
                  You currently do not have a supervisor for your Final Year Project. Please browse the directory below and send a request to a faculty member.
                </p>
              </div>
            </div>

            {/* Project Details Card (When no supervisor) */}
            {project && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <Building2 className="text-slate-700 w-5 h-5" />
                    <span className="font-bold text-slate-700">My Project Overview</span>
                  </div>
                </div>
                <div className="p-8 grid md:grid-cols-4 gap-8">
                  <div className="md:col-span-3">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{project.title}</h3>
                    <p className="text-slate-600 leading-relaxed max-w-3xl">{project.description}</p>
                  </div>
                  <div className="space-y-4 border-l border-slate-100 pl-8">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${project.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' :
                        project.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          project.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Created</p>
                      <p className="font-medium text-slate-700 text-sm">{formatDate(project.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Files</p>
                      <p className="font-medium text-slate-700 text-sm">{project.files?.length || 0} Uploaded</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search and List */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Faculty Directory</h2>
                  <p className="text-slate-500 text-sm mt-1">Connect with professors for project supervision.</p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search faculty..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSupervisors.length > 0 ? (
                  filteredSupervisors.map((sup) => (
                    <div key={sup._id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 bg-slate-100/50 rounded-lg flex items-center justify-center text-slate-500 font-bold text-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                            {sup.name.charAt(0)}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full uppercase tracking-wider">{sup.department}</span>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 mb-1">{sup.name}</h3>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-4">Faculty Member</p>

                        <div className="space-y-2 pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2.5 text-sm text-slate-600">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span className="truncate">{sup.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-gray-50/50 border-t border-slate-100">
                        <button
                          onClick={() => handleRequestClick(sup)}
                          className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-semibold py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm"
                        >
                          View & Request <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-medium">No results found</h3>
                    <p className="text-slate-500 text-sm mt-1">We couldn't find any supervisors matching "{searchTerm}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Request Modal - Polished */}
      {selectedSupervisor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300">
          <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-md overflow-hidden animate-in slide-in-from-bottom duration-200 ring-1 ring-slate-900/5">
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-slate-900 font-bold text-lg">Send Request</h3>
                <p className="text-slate-500 text-sm">Start a conversation</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="p-6">
              <div className="flex items-center gap-4 mb-6 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  {selectedSupervisor.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400 uppercase tracking-wide">Recipient</p>
                  <p className="font-semibold text-slate-900">{selectedSupervisor.name}</p>
                </div>
              </div>

              <div className="mb-6 space-y-2">
                <label htmlFor="message" className="block text-sm font-semibold text-slate-700">
                  Message
                </label>
                <textarea
                  id="message"
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none text-slate-700 text-sm"
                  placeholder="Write a brief introduction..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="flex-1 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  {requestLoading ? (
                    <span className="opacity-80">Sending...</span>
                  ) : (
                    <>Send Request</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorPage;
