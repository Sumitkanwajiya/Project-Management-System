import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, uploadFile } from "../../store/slices/studentSlice";
import { axiosInstance } from "../../lib/axios";
import {
  UploadCloud,
  File,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Trash2,
  Download,
  Code,
  Presentation,
  FileType,
  Eye
} from "lucide-react";

const UploadFiles = () => {
  const dispatch = useDispatch();
  const { project, loading } = useSelector((state) => state.student);

  // State for different file categories
  const [reportFile, setReportFile] = useState(null);
  const [presentationFile, setPresentationFile] = useState(null);
  const [codeFiles, setCodeFiles] = useState([]);

  // Dragging states
  const [dragActive, setDragActive] = useState({
    report: false,
    presentation: false,
    code: false
  });

  useEffect(() => {
    if (!project) {
      dispatch(fetchProject());
    }
  }, [dispatch, project]);

  // File Handlers
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === 'report') setReportFile(files[0]);
    if (type === 'presentation') setPresentationFile(files[0]);
    if (type === 'code') setCodeFiles(prev => [...prev, ...files]);
  };

  const handleDrag = (e, type, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: active }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (type === 'report') setReportFile(files[0]);
      if (type === 'presentation') setPresentationFile(files[0]);
      if (type === 'code') setCodeFiles(prev => [...prev, ...files]);
    }
  };

  const removeCodeFile = (index) => {
    setCodeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!project) return;
    if (!reportFile && !presentationFile && codeFiles.length === 0) return;

    try {
      const payload = {
        projectId: project._id,
        files: {
          reportFile,
          presentationFile,
          codeFiles
        }
      };

      const resultAction = await dispatch(uploadFile(payload));

      if (resultAction && uploadFile.fulfilled.match(resultAction)) {
        setReportFile(null);
        setPresentationFile(null);
        setCodeFiles([]);
      }
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading && !project) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">No Active Project</h3>
          <p className="text-slate-500 mb-8">
            You need to create a project proposal before you can upload deliverables.
          </p>
          <a href="/student/submit-proposal" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all">
            Create Proposal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20 md:pb-12">
      <div className="bg-slate-900 pt-8 pb-20 px-4 md:px-6 lg:px-8 shadow-md relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Project Deliverables</h1>
          <p className="text-slate-400 mt-2 text-sm md:text-lg">Upload your project reports, presentations, and source code.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 -mt-12 md:-mt-16 space-y-6 md:space-y-8 relative z-20">

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Report File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-800">Report File</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {!reportFile ? (
                <div
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all ${dragActive.report ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400"
                    }`}
                  onDragOver={(e) => handleDrag(e, 'report', true)}
                  onDragLeave={(e) => handleDrag(e, 'report', false)}
                  onDrop={(e) => handleDrop(e, 'report')}
                >
                  <input type="file" id="report-upload" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'report')} />
                  <label htmlFor="report-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Upload Report</p>
                    <p className="text-xs text-slate-400 mt-1">PDF or DOCX</p>
                  </label>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText className="w-8 h-8 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm">{reportFile.name}</p>
                      <p className="text-xs text-slate-500">{formatSize(reportFile.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => setReportFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Presentation File Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Presentation className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-800">Presentation</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              {!presentationFile ? (
                <div
                  className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all ${dragActive.presentation ? "border-purple-500 bg-purple-50" : "border-slate-200 hover:border-purple-400"
                    }`}
                  onDragOver={(e) => handleDrag(e, 'presentation', true)}
                  onDragLeave={(e) => handleDrag(e, 'presentation', false)}
                  onDrop={(e) => handleDrop(e, 'presentation')}
                >
                  <input type="file" id="ppt-upload" className="hidden" accept=".ppt,.pptx,.pdf" onChange={(e) => handleFileChange(e, 'presentation')} />
                  <label htmlFor="ppt-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-700 text-sm">Upload Slide</p>
                    <p className="text-xs text-slate-400 mt-1">PPTX or PDF</p>
                  </label>
                </div>
              ) : (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Presentation className="w-8 h-8 text-purple-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate text-sm">{presentationFile.name}</p>
                      <p className="text-xs text-slate-500">{formatSize(presentationFile.size)}</p>
                    </div>
                  </div>
                  <button onClick={() => setPresentationFile(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Code Files Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <Code className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-slate-800">Source Code</h3>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div
                className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all cursor-pointer mb-4 ${dragActive.code ? "border-green-500 bg-green-50" : "border-slate-200 hover:border-green-400"
                  }`}
                onDragOver={(e) => handleDrag(e, 'code', true)}
                onDragLeave={(e) => handleDrag(e, 'code', false)}
                onDrop={(e) => handleDrop(e, 'code')}
              >
                <input type="file" id="code-upload" className="hidden" multiple onChange={(e) => handleFileChange(e, 'code')} />
                <label htmlFor="code-upload" className="cursor-pointer w-full h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">Add Code Files</p>
                  <p className="text-xs text-slate-400 mt-1">ZIP or Source Files</p>
                </label>
              </div>

              {/* File List for Code */}
              <div className="flex-1 overflow-y-auto max-h-40 space-y-2 pr-1 custom-scrollbar">
                {codeFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-green-50/50 rounded-lg border border-green-100 text-sm">
                    <span className="truncate flex-1 font-medium text-green-900">{file.name}</span>
                    <button onClick={() => removeCodeFile(idx)} className="text-green-400 hover:text-red-500 ml-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Action */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleUpload}
            disabled={loading || (!reportFile && !presentationFile && codeFiles.length === 0)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-3"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5" /> Upload All Files
              </>
            )}
          </button>
        </div>

        {/* Previously Uploaded Files Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <FileType className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-900">Uploaded Documents</h2>
          </div>
          {project.files && project.files.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {project.files.map((file, index) => (
                <div key={index} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold border transition-colors ${file.category === 'Report' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      file.category === 'Presentation' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                        file.category === 'Code' ? 'bg-green-50 text-green-600 border-green-100' :
                          'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                      {file.category === 'Report' ? <FileText className="w-6 h-6" /> :
                        file.category === 'Presentation' ? <Presentation className="w-6 h-6" /> :
                          file.category === 'Code' ? <Code className="w-6 h-6" /> :
                            <File className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors px-1">
                        {file.originalName || "Untitled File"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${file.category === 'Report' ? 'bg-blue-100 text-blue-700' :
                          file.category === 'Presentation' ? 'bg-purple-100 text-purple-700' :
                            file.category === 'Code' ? 'bg-green-100 text-green-700' :
                              'bg-slate-100 text-slate-600'
                          }`}>
                          {file.category || 'OTHER'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={`${axiosInstance.defaults.baseURL}/student/view-file/${project._id}/${file._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                      title="View File"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                    <a
                      href={`${axiosInstance.defaults.baseURL}/student/download-file/${project._id}/${file._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                      title="Download File"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p className="font-medium">No documents uploaded yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFiles;
