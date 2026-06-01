import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getDriveApplications } from '../../../api/applicationApi';
import { Download, Search, ArrowLeft, GraduationCap, Building2, ExternalLink } from 'lucide-react';
import ApplicationStatusManager from './components/ApplicationStatusManager';
import { toast } from 'react-hot-toast';

const exportToCSV = (applications, driveName) => {
  if (!applications || !applications.length) {
    toast.error('No applications to export');
    return;
  }

  const headers = ['Name', 'Email', 'Roll Number', 'Branch', 'CGPA', 'Backlogs', 'Status', 'Applied At', 'Resume URL'];
  const rows = applications.map(app => [
    app.studentId?.name || 'N/A',
    app.studentId?.email || 'N/A',
    app.studentId?.rollNumber || 'N/A',
    app.studentProfile?.department || app.studentId?.department || 'N/A',
    app.studentProfile?.cgpa || 'N/A',
    app.studentProfile?.backlogs || '0',
    app.status,
    new Date(app.appliedAt).toLocaleDateString(),
    app.resumeSnapshot || app.studentProfile?.resumeUrl || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  const safeDriveName = (driveName || 'Drive').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  link.setAttribute('download', `${safeDriveName}_applications.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const DriveApplicationsPage = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'appliedAt', direction: 'desc' });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true);
        const res = await getDriveApplications(id);
        if (res.success) {
          setApplications(res.data);
        }
      } catch (error) {
        toast.error('Failed to load applications');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchApplications();
  }, [id]);

  const handleStatusUpdateLocally = (appId, newStatus) => {
    setApplications(prev => prev.map(app => 
      app._id === appId ? { ...app, status: newStatus } : app
    ));
  };

  const filteredAndSortedApps = useMemo(() => {
    let result = [...applications];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(app => 
        app.studentId?.name?.toLowerCase().includes(q) ||
        app.studentId?.rollNumber?.toLowerCase().includes(q) ||
        app.studentId?.department?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal, bVal;
      switch (sortConfig.key) {
        case 'name':
          aVal = a.studentId?.name || '';
          bVal = b.studentId?.name || '';
          break;
        case 'cgpa':
          aVal = a.studentProfile?.cgpa || 0;
          bVal = b.studentProfile?.cgpa || 0;
          break;
        case 'appliedAt':
          aVal = new Date(a.appliedAt).getTime();
          bVal = new Date(b.appliedAt).getTime();
          break;
        default:
          aVal = 0; bVal = 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [applications, searchQuery, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return <div className="p-8 text-center text-neutral-500">Loading applications...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <Link to="/dashboard/admin/drives" className="inline-flex items-center text-neutral-500 hover:text-brand-blue mb-4 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Drives
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Applications</h1>
            <p className="text-neutral-500 mt-2 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Drive ID: {id} • <GraduationCap className="w-4 h-4 ml-2" /> {applications.length} Total Applicants
            </p>
          </div>
          <button
            onClick={() => exportToCSV(filteredAndSortedApps, `Drive_${id}`)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by name, roll number, or branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border-neutral-200 text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-600">
            <thead className="text-xs uppercase bg-neutral-50/80 text-neutral-500 font-semibold border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 cursor-pointer hover:text-brand-blue" onClick={() => requestSort('name')}>
                  Applicant {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4 cursor-pointer hover:text-brand-blue" onClick={() => requestSort('cgpa')}>
                  Academics {sortConfig.key === 'cgpa' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4 cursor-pointer hover:text-brand-blue" onClick={() => requestSort('appliedAt')}>
                  Applied Date {sortConfig.key === 'appliedAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-4">Resume</th>
                <th className="px-6 py-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100/80">
              {filteredAndSortedApps.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-400">
                    No applicants found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedApps.map((app) => (
                  <tr key={app._id} className="hover:bg-neutral-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-neutral-900">{app.studentId?.name || 'Unknown'}</div>
                      <div className="text-xs text-neutral-500 font-medium mt-0.5">{app.studentId?.rollNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-600">{app.studentId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-neutral-800">{app.studentProfile?.cgpa || 'N/A'} CGPA</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{app.studentProfile?.department || app.studentId?.department || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(app.appliedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      {(app.resumeSnapshot || app.studentProfile?.resumeUrl) ? (
                        <a 
                          href={app.resumeSnapshot || app.studentProfile?.resumeUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-brand-blue hover:text-white transition-colors"
                          title="View Resume"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-neutral-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ApplicationStatusManager application={app} onStatusChange={handleStatusUpdateLocally} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriveApplicationsPage;
