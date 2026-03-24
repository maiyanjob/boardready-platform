import { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { Upload, Download, FileText, Users, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';

export default function ImportExport() {
  const [importType, setImportType] = useState('candidates'); // 'candidates' or 'boards'
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
        `http://localhost:5000/api/csv/import/${importType}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );

      setResult({
        success: true,
        added: response.data.added,
        errors: response.data.errors || []
      });
      setFile(null);
    } catch (error) {
      setResult({
        success: false,
        error: error.response?.data?.error || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/csv/export/${type}`,
        {
          responseType: 'blob',
          withCredentials: true
        }
      );

      // Create download link
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
        <div className="mb-10">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Import & Export
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Bulk upload and download your data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 opacity-50 blur-[2px]" />
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Download className="h-8 w-8 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white">Export Data</h2>
              </div>

              <p className="text-slate-300 mb-6">
                Download your candidates and boards as CSV files for backup or analysis.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => handleExport('candidates')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-emerald-400" />
                    <span className="text-white font-semibold">Export Candidates</span>
                  </div>
                  <Download className="h-5 w-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </button>

                <button
                  onClick={() => handleExport('boards')}
                  className="w-full flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-cyan-400" />
                    <span className="text-white font-semibold">Export Boards</span>
                  </div>
                  <Download className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </button>
              </div>
            </div>
          </div>

          {/* Import Section */}
          <div className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-50 blur-[2px]" />
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Upload className="h-8 w-8 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">Import Data</h2>
              </div>

              <p className="text-slate-300 mb-6">
                Upload CSV files to bulk import candidates or boards with AI embeddings.
              </p>

              {/* Import Type Selector */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setImportType('candidates')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    importType === 'candidates'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Candidates
                </button>
                <button
                  onClick={() => setImportType('boards')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    importType === 'boards'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  Boards
                </button>
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block mb-3">
                  <div className="relative border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-blue-500/50 transition-all cursor-pointer">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <FileText className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-white font-semibold mb-1">
                      {file ? file.name : 'Choose CSV file'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Click or drag file to upload
                    </p>
                  </div>
                </label>

                <button
                  onClick={handleImport}
                  disabled={!file || uploading}
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all ${
                    file && !uploading
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Importing...
                    </span>
                  ) : (
                    `Import ${importType}`
                  )}
                </button>
              </div>

              {/* Result */}
              {result && (
                <div className={`p-4 rounded-xl border ${
                  result.success
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      {result.success ? (
                        <>
                          <p className="text-emerald-300 font-semibold mb-1">
                            Successfully imported {result.added} {importType}!
                          </p>
                          {result.errors.length > 0 && (
                            <div className="mt-2">
                              <p className="text-yellow-300 text-sm font-semibold mb-1">
                                {result.errors.length} errors:
                              </p>
                              <ul className="text-xs text-yellow-200 space-y-1">
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CSV Format Guide */}
        <div className="mt-8 relative group">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-slate-600 to-slate-700 opacity-30 blur-[2px]" />
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">CSV Format Guide</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-bold text-cyan-400 uppercase mb-2">Candidates CSV</h4>
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300">
                  <div>Name,Title,Company,Bio,Years Experience,Board Count,Industries,Skills</div>
                  <div className="text-slate-500">John Doe,CEO,TechCorp,Bio text...,15,3,Tech,Leadership</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-purple-400 uppercase mb-2">Boards CSV</h4>
                <div className="bg-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300">
                  <div>Company Name,Ticker,Sector,Description,Last Proxy Date</div>
                  <div className="text-slate-500">TechCo,TECH,Technology,Description...,2025-01-15</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
