import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchNotices, createNotice, updateNotice, deleteNotice } from '../../../api/noticeApi';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Plus,
  AlertCircle,
  MoreVertical,
  ExternalLink,
  Clock,
  X,
  Edit2,
  Trash2
} from 'lucide-react';

const AdminNoticesPage = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination and Filtering State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'General', body: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle category change
  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
    setPage(1); // Reset to first page on filter change
  };

  const loadNotices = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
      };
      
      const response = await fetchNotices(params);
      
      if (response.success) {
        setNotices(response.data.notices);
        setTotalPages(response.data.pages);
        setTotalCount(response.data.total);
      } else {
        setError(response.message || 'Failed to fetch notices.');
      }
    } catch (err) {
      console.error('Error fetching notices:', err);
      setError(err.response?.data?.message || 'An error occurred while fetching notices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [page, debouncedSearch, categoryFilter]);

  const handleOpenModal = (mode, notice = null) => {
    setModalMode(mode);
    if (mode === 'edit' && notice) {
      setEditingId(notice._id);
      setFormData({
        title: notice.title,
        category: notice.category,
        body: notice.body || '',
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', category: 'General', body: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', category: 'General', body: '' });
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.category || !formData.body.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      if (modalMode === 'create') {
        await createNotice(formData);
        toast.success('Notice created successfully');
      } else {
        await updateNotice(editingId, formData);
        toast.success('Notice updated successfully');
      }
      handleCloseModal();
      loadNotices(); // Refresh list
    } catch (err) {
      console.error('Error saving notice:', err);
      toast.error(err.response?.data?.message || 'Failed to save notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await deleteNotice(deletingId);
      toast.success('Notice deleted successfully');
      setShowDeleteConfirm(false);
      setDeletingId(null);
      loadNotices(); // Refresh list
    } catch (err) {
      console.error('Error deleting notice:', err);
      toast.error(err.response?.data?.message || 'Failed to delete notice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case 'Urgent':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Placement':
        return 'bg-brand-blue-light text-brand-blue border-brand-blue-light';
      case 'General':
        return 'bg-green-50 text-green-700 border-green-100';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Notice Board</h1>
          <p className="text-neutral-500 mt-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Manage official announcements and placement alerts
          </p>
        </div>
        <button
          onClick={() => handleOpenModal('create')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-2xl hover:bg-brand-orange/90 transition-all duration-300 font-semibold shadow-lg shadow-brand-orange/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Create New Notice
        </button>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            placeholder="Search by title or content..."
            className="block w-full pl-12 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none shadow-sm placeholder:text-neutral-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="md:col-span-4 relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-neutral-400" />
          </div>
          <select
            className="block w-full pl-12 pr-10 py-3.5 bg-white border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none shadow-sm appearance-none cursor-pointer"
            value={categoryFilter}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="Urgent">Urgent Priority</option>
            <option value="Placement">Placement Drive</option>
            <option value="General">General Notice</option>
          </select>
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <ChevronRight className="h-4 w-4 text-neutral-400 rotate-90" />
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-3 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50/50">
                <th className="px-8 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Announcement Details
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Category
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Date Published
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-xs font-bold text-neutral-500 uppercase tracking-widest border-b border-neutral-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              <AnimatePresence mode="wait">
                {loading ? (
                  [...Array(5)].map((_, index) => (
                    <motion.tr 
                      key={`skeleton-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="animate-pulse"
                    >
                      <td className="px-8 py-6">
                        <div className="h-4 w-64 bg-neutral-100 rounded-full mb-3"></div>
                        <div className="h-3 w-40 bg-neutral-50 rounded-full"></div>
                      </td>
                      <td className="px-6 py-6"><div className="h-7 w-24 bg-neutral-100 rounded-xl"></div></td>
                      <td className="px-6 py-6"><div className="h-4 w-32 bg-neutral-100 rounded-full"></div></td>
                      <td className="px-6 py-6"><div className="h-7 w-20 bg-neutral-100 rounded-xl"></div></td>
                      <td className="px-8 py-6"><div className="h-10 w-24 bg-neutral-100 rounded-xl ml-auto"></div></td>
                    </motion.tr>
                  ))
                ) : notices.length > 0 ? (
                  notices.map((notice) => (
                    <motion.tr 
                      key={notice._id}
                      variants={itemVariants}
                      className="group hover:bg-neutral-50/80 transition-all duration-300"
                    >
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-neutral-900 group-hover:text-brand-blue transition-colors leading-relaxed">
                            {notice.title}
                          </span>
                          <span className="text-xs text-neutral-500 mt-1.5 flex items-center gap-1.5 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300"></div>
                            Posted by {notice.postedBy?.fullName || 'Academic Office'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-3.5 py-1.5 inline-flex text-[11px] font-bold rounded-xl border ${getCategoryStyles(notice.category)} uppercase tracking-wider`}>
                          {notice.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 text-sm text-neutral-600 font-medium">
                          <Calendar className="w-4 h-4 text-neutral-400" />
                          {formatDate(notice.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${notice.isActive !== false ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-neutral-300'}`}></div>
                          <span className={`text-xs font-bold uppercase tracking-widest ${notice.isActive !== false ? 'text-green-700' : 'text-neutral-500'}`}>
                            {notice.isActive !== false ? 'Live' : 'Hidden'}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button 
                            onClick={() => handleOpenModal('edit', notice)}
                            className="p-2.5 text-brand-blue hover:bg-brand-blue-light rounded-xl transition-all" 
                            title="Edit Notice"
                          >
                            <Edit2 className="w-4.5 h-4.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(notice._id)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                            title="Delete Notice"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td colSpan="5" className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
                        <motion.div 
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          className="w-24 h-24 bg-brand-blue/5 rounded-[2rem] flex items-center justify-center mb-6 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue/10 to-transparent"></div>
                          <FileText className="h-10 w-10 text-brand-blue relative z-10" />
                        </motion.div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-2">No Notices Displayed</h3>
                        <p className="text-neutral-500 text-sm leading-relaxed">
                          There are currently no announcements matching your filters. Clear your search or create a new notice to keep everyone informed.
                        </p>
                        {searchQuery || categoryFilter ? (
                          <button 
                            onClick={() => { setSearchQuery(''); setCategoryFilter(''); }}
                            className="mt-6 px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-semibold rounded-xl transition-colors"
                          >
                            Clear Filters
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        {!loading && notices.length > 0 && (
          <div className="px-8 py-6 bg-neutral-50/30 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-sm font-medium text-neutral-500">
              Showing <span className="text-neutral-900 font-bold">{(page - 1) * limit + 1}</span> to{' '}
              <span className="text-neutral-900 font-bold">{Math.min(page * limit, totalCount)}</span> of{' '}
              <span className="text-neutral-900 font-bold">{totalCount}</span>
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`min-w-[40px] h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                      page === i + 1
                        ? 'bg-brand-blue text-white shadow-brand-blue/20'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-brand-blue/30 hover:text-brand-blue'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-2 rounded-xl border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notice Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                <h2 className="text-xl font-bold text-neutral-900">
                  {modalMode === 'create' ? 'Draft New Notice' : 'Edit Notice'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <form id="noticeForm" onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Notice Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter a clear, descriptive title"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Category <span className="text-red-500">*</span></label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none appearance-none"
                      required
                    >
                      <option value="General">General</option>
                      <option value="Placement">Placement</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">Notice Content <span className="text-red-500">*</span></label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      placeholder="Write the full details of the notice here..."
                      rows="6"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all outline-none resize-none"
                      required
                    ></textarea>
                  </div>
                </form>
              </div>
              
              <div className="px-8 py-6 border-t border-neutral-100 bg-neutral-50/50 flex justify-end gap-3 mt-auto">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-xl font-semibold text-neutral-600 hover:bg-neutral-200 transition-all"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="noticeForm"
                  className="px-6 py-2.5 rounded-xl font-semibold bg-brand-blue text-white hover:bg-brand-blue/90 shadow-lg shadow-brand-blue/20 transition-all flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : null}
                  {modalMode === 'create' ? 'Publish Notice' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Delete Notice?</h2>
              <p className="text-neutral-500 mb-8 leading-relaxed">
                Are you sure you want to delete this notice? This action will hide it from students and cannot be undone easily.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-3 rounded-xl font-semibold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-all flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex-1 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : 'Yes, Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminNoticesPage;

