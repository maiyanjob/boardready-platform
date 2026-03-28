import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import { Upload, Download, FileText, Users, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ImportExport() {
  const [importType, setImportType] = useState('candidates');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `/api/csv/import/${importType}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true }
      );
      setResult({
        success: true,
        added: response.data.added,
        skipped: response.data.skipped,
        errors: response.data.errors || [],
      });
      setFile(null);
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await axios.get(`/api/csv/export/${type}`, {
        responseType: 'blob',
        withCredentials: true,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Import & Export
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Bulk upload and download your data</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group relative"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <Download className="h-6 w-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Export Data</h2>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Download your candidates and boards as CSV files for backup or analysis.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport('candidates')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-emerald-500/40 hover:bg-slate-800 transition-all duration-200 group/btn"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-semibold">Export Candidates</span>
                  </div>
                  <Download className="h-5 w-5 text-slate-500 group-hover/btn:text-emerald-400 transition-colors" />
                </button>

                <button
                  onClick={() => handleExport('boards')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl hover:border-cyan-500/40 hover:bg-slate-800 transition-all duration-200 group/btn"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    <span className="text-white font-semibold">Export Boards</span>
                  </div>
                  <Download className="h-5 w-5 text-slate-500 group-hover/btn:text-cyan-400 transition-colors" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Import Section */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group relative"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  <Upload className="h-6 w-6 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Import Data</h2>
              </div>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Upload CSV files to bulk import candidates or boards with AI embeddings.
              </p>

              {/* Type toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-slate-800/60 rounded-xl">
                <button
                  onClick={() => setImportType('candidates')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    importType === 'candidates'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Candidates
                </button>
                <button
                  onClick={() => setImportType('boards')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    importType === 'boards'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Boards
                </button>
              </div>

              {/* Drop zone */}
              <div className="mb-5">
                <label className="block mb-4">
                  <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                    file
                      ? 'border-blue-500/50 bg-blue-500/5'
                      : 'border-slate-700 hover:border-blue-500/40 hover:bg-slate-800/40'
                  }`}>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className={`w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center transition-colors ${
                      file ? 'bg-blue-500/20' : 'bg-slate-800'
                    }`}>
                      <FileText className={`h-7 w-7 ${file ? 'text-blue-400' : 'text-slate-500'}`} />
                    </div>
                    <p className="text-white font-semibold mb-1">
                      {file ? file.name : 'Choose CSV file'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {file ? 'Click to change file' : 'Click or drag file to upload'}
                    </p>
                  </div>
                </label>

                <button
                  onClick={handleImport}
                  disabled={!file || uploading}
                  className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm transition-all duration-200 ${
                    file && !uploading
                      ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-[1.02]'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Importing with AI embeddings...
                    </span>
                  ) : (
                    `Import ${importType === 'candidates' ? 'Candidates' : 'Boards'}`
                  )}
                </button>
              </div>

              {/* Result */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border ${
                    result.success
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      {result.success ? (
                        <>
                          <p className="text-emerald-300 font-bold mb-1">
                            Imported {result.added} new {importType}
                          </p>
                          {result.skipped > 0 && (
                            <p className="text-yellow-300 text-sm">
                              Skipped {result.skipped} duplicate{result.skipped !== 1 ? 's' : ''}
                            </p>
                          )}
                          {result.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-red-300 text-sm font-semibold mb-1">
                                {result.errors.length} error{result.errors.length !== 1 ? 's' : ''}:
                              </p>
                              <ul className="text-xs text-red-200 space-y-1">
                                {result.errors.slice(0, 5).map((error, i) => (
                                  <li key={i}>• {error}</li>
                                ))}
                                {result.errors.length > 5 && (
                                  <li>• ...and {result.errors.length - 5} more</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-red-300">{result.error}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* CSV Format Guide */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 group relative"
        >
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 opacity-0 group-hover:opacity-40 blur-sm transition-all duration-500" />
          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-6">CSV Format Guide</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Candidates CSV</h4>
                <div className="bg-slate-800/60 rounded-xl p-4 font-mono text-xs border border-white/5">
                  <div className="text-slate-300">Name,Title,Company,Bio,Years Experience,Board Count,Industries,Skills</div>
                  <div className="text-slate-500 mt-1">John Doe,CEO,TechCorp,Bio text...,15,3,Tech,Leadership</div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3">Boards CSV</h4>
                <div className="bg-slate-800/60 rounded-xl p-4 font-mono text-xs border border-white/5">
                  <div className="text-slate-300">Company Name,Ticker,Sector,Description,Last Proxy Date</div>
                  <div className="text-slate-500 mt-1">TechCo,TECH,Technology,Description...,2025-01-15</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
