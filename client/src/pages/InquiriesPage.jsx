import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, CheckCircle2, Clock, MessageSquare, X } from 'lucide-react';
import { inquiriesApi } from '../api/inquiries.api.js';
import { LoadingSpinner } from '../components/common/LoadingSpinner.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { formatDate } from '../utils/formatters.js';
import toast from 'react-hot-toast';

export const InquiriesPage = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
  const [receivedInquiries, setReceivedInquiries] = useState([]);
  const [sentInquiries, setSentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal detail
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const [receivedRes, sentRes] = await Promise.all([
        inquiriesApi.getReceivedInquiries(),
        inquiriesApi.getSentInquiries(),
      ]);
      setReceivedInquiries(receivedRes.data?.inquiries || []);
      setSentInquiries(sentRes.data?.inquiries || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await inquiriesApi.updateStatus(id, status);
      toast.success(`Inquiry marked as ${status}`);
      setReceivedInquiries(
        receivedInquiries.map((inq) => (inq._id === id ? { ...inq, status } : inq))
      );
      if (selectedInquiry?._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update inquiry status');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving inquiries..." />;
  }

  const currentList = activeTab === 'received' ? receivedInquiries : sentInquiries;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Client Inquiries
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
          View and reply to project inquiries sent between clients and freelancers.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('received')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'received'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Received ({receivedInquiries.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Sent by You ({sentInquiries.length})</span>
        </button>
      </div>

      {/* Inquiries List */}
      {currentList.length > 0 ? (
        <div className="space-y-3">
          {currentList.map((inquiry) => (
            <div
              key={inquiry._id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="font-bold text-sm text-slate-900">
                    {activeTab === 'received'
                      ? `From: ${inquiry.sender?.name} (@${inquiry.sender?.username})`
                      : `To: ${inquiry.recipient?.name} (@${inquiry.recipient?.username})`}
                  </span>
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider capitalize ${
                      inquiry.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : inquiry.status === 'replied'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {inquiry.status}
                  </span>
                </div>

                {inquiry.service && (
                  <p className="text-xs text-indigo-600 font-medium mb-1">
                    Service: {inquiry.service.title}
                  </p>
                )}

                <p className="text-xs text-slate-600 line-clamp-2 max-w-2xl">
                  {inquiry.message}
                </p>

                <span className="text-[10px] text-slate-400 block mt-2">
                  {formatDate(inquiry.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setSelectedInquiry(inquiry)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={activeTab === 'received' ? Mail : Send}
          title={
            activeTab === 'received'
              ? "You haven't received any inquiries yet"
              : "You haven't sent any inquiries yet"
          }
          description={
            activeTab === 'received'
              ? 'When clients discover your services on CampusGig and contact you, inquiries will appear here.'
              : 'Browse published services in the marketplace to find student freelancers and send project inquiries.'
          }
          actionLabel={activeTab === 'sent' ? 'Explore Services' : undefined}
          actionLink={activeTab === 'sent' ? '/services' : undefined}
        />
      )}

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Inquiry Details</h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                  Service Listing
                </span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">
                  {selectedInquiry.service?.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                    Sender
                  </span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {selectedInquiry.sender?.name} (@{selectedInquiry.sender?.username})
                  </p>
                  {selectedInquiry.sender?.email && (
                    <p className="text-slate-500 mt-0.5">{selectedInquiry.sender.email}</p>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase tracking-wider block">
                    Recipient
                  </span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {selectedInquiry.recipient?.name} (@{selectedInquiry.recipient?.username})
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Message
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 text-slate-800 whitespace-pre-line leading-relaxed border border-slate-200/80">
                  {selectedInquiry.message}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-400 text-[11px]">
                  Sent on {formatDate(selectedInquiry.createdAt)}
                </span>
                <div className="flex gap-2">
                  {activeTab === 'received' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(selectedInquiry._id, 'replied')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-colors"
                      >
                        Mark as Replied
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedInquiry._id, 'closed')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
