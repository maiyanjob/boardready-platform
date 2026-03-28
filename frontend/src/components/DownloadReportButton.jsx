import { useState } from 'react';
import { FileDown, Loader, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function DownloadReportButton({ projectId, clientName }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await axios.post(
        `/api/projects/${projectId}/generate-report`,
        {},
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${clientName.replace(/ /g, '_')}_Board_Analysis_${new Date().toISOString().split('T')[0]}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleDownload}
      disabled={loading}
      className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
        success
          ? 'bg-emerald-500 text-white'
          : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/50'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          <span>Generating Report...</span>
        </>
      ) : success ? (
        <>
          <CheckCircle className="h-5 w-5" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <FileDown className="h-5 w-5" />
          <span>Download Report</span>
        </>
      )}
    </motion.button>
  );
}
