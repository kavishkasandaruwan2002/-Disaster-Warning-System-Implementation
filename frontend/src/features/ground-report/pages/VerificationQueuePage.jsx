import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Filter, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Paperclip, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Calendar, 
  User, 
  AlertTriangle 
} from 'lucide-react';
import { getReports, verifyReport, rejectReport, requestInfo, addEvidence } from '../api/groundReportApi';
import { getDistricts } from '../../../shared/api/commonApi';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Badge from '../../../shared/components/Badge';
import Reveal from '../../../shared/components/Reveal';
import EmptyState from '../../../shared/components/EmptyState';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

export const VerificationQueuePage = () => {
  useDocumentTitle('Duty Verification Queue');

  const [reports, setReports] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [districtFilter, setDistrictFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Form states for inline actions
  const [verifySeverity, setVerifySeverity] = useState('LOW');
  const [rejectionReason, setRejectionReason] = useState('');
  const [evidenceData, setEvidenceData] = useState({ photoUrl: '', comment: '' });
  const [activeAction, setActiveAction] = useState(null);

  const fetchQueue = async () => {
    try {
      const res = await getReports({ district: districtFilter, status: statusFilter });
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Failed to load queue:', err);
    }
  };

  useEffect(() => {
    getDistricts().then(res => {
      if (res.success) setDistricts(res.data);
    });
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [districtFilter, statusFilter]);

  const handleVerify = async (reportId) => {
    try {
      const res = await verifyReport(reportId, verifySeverity);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Report verified with severity ${verifySeverity}.` });
        setActiveAction(null);
        fetchQueue();
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error verifying report: ' + err.message });
    }
  };

  const handleReject = async (reportId) => {
    if (!rejectionReason) {
      alert('Please enter a rejection reason.');
      return;
    }
    try {
      const res = await rejectReport(reportId, rejectionReason);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Report rejected.' });
        setRejectionReason('');
        setActiveAction(null);
        fetchQueue();
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error rejecting report: ' + err.message });
    }
  };

  const handleRequestInfo = async (reportId) => {
    try {
      const res = await requestInfo(reportId);
      if (res.success) {
        setActionMessage({ type: 'info', text: 'Requested more information from submitter.' });
        fetchQueue();
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error: ' + err.message });
    }
  };

  const handleAddEvidence = async (reportId) => {
    try {
      const res = await addEvidence(reportId, evidenceData);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Evidence added and report status reset to PENDING for re-review.' });
        setEvidenceData({ photoUrl: '', comment: '' });
        setActiveAction(null);
        fetchQueue();
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error adding evidence: ' + err.message });
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        badge="Duty Officer Operations (UC2)"
        icon={ClipboardList}
        title="Duty Officer Verification Queue"
        subtitle="Review field hazard reports, verify severity levels, inspect corroborating evidence, request supplemental info, or reject reports."
      />

      {/* Filter Control Bar */}
      <Reveal>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Filter className="w-4 h-4 text-blue-500" />
              <span>Filter Queue Reports</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <select
                  value={districtFilter}
                  onChange={(e) => setDistrictFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Districts</option>
                  {districts.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="NEEDS_MORE_INFO">NEEDS_MORE_INFO</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : actionMessage.type === 'info'
            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Queue List / Table */}
      <Reveal>
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Ground Reports ({reports.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Click any report to expand full details &amp; action controls
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No Reports Found" description="There are no ground reports matching the selected district and status filters." />
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {reports.map((report) => {
                const isExpanded = selectedReportId === report._id;
                return (
                  <motion.div layout key={report._id} className="transition-colors">
                    {/* Header Row Bar */}
                    <div
                      onClick={() => setSelectedReportId(isExpanded ? null : report._id)}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isExpanded ? 'bg-blue-50/50 dark:bg-slate-800/60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge status={report.hazardType}>{report.hazardType}</Badge>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                              {report.reportId}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                              {report.districtId?.name || 'Unknown District'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center">
                        <Badge status={report.verificationStatus}>{report.verificationStatus}</Badge>
                        {report.severityLevel && (
                          <Badge status={report.severityLevel}>Sev: {report.severityLevel}</Badge>
                        )}
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(report.submittedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Drawer */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200/80 dark:border-slate-800 p-6 space-y-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column: Details & GPS Map Placeholder */}
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                                  Description &amp; Location
                                </h4>
                                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                  {report.description}
                                </p>
                              </div>

                              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                  <MapPin className="w-4 h-4 text-rose-500" />
                                  <span>GPS Coordinates: Lat {report.gpsLat}, Lng {report.gpsLng}</span>
                                </div>

                                {/* GPS Map Placeholder */}
                                <div className="h-28 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400 gap-2">
                                  <MapPin className="w-4 h-4 text-blue-500 animate-bounce" />
                                  <span>Map Location Preview ({report.gpsLat}, {report.gpsLng})</span>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Evidence & Corroboration */}
                            <div className="space-y-4">
                              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                                <h4 className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                                  Verification Metadata
                                </h4>
                                <div className="flex justify-between">
                                  <span>Submitted By:</span>
                                  <strong>{report.submittedBy?.name || 'Anonymous'} ({report.submittedBy?.nationalId || 'N/A'})</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span>Verified By:</span>
                                  <strong>{report.verifiedBy || 'N/A'}</strong>
                                </div>
                                {report.rejectionReason && (
                                  <div className="text-rose-600 dark:text-rose-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                                    <strong>Rejection Reason:</strong> {report.rejectionReason}
                                  </div>
                                )}
                              </div>

                              {/* Photo Attachment Thumbnail */}
                              <div className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                                  <ImageIcon className="w-4 h-4 text-indigo-500" />
                                  <span>Photo Evidence: {report.photoUrl || 'None attached'}</span>
                                </div>
                              </div>

                              {/* Corroborating Reports Link Box */}
                              {report.corroboratingReportIds && report.corroboratingReportIds.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800 text-xs space-y-1">
                                  <div className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-300">
                                    <LinkIcon className="w-3.5 h-3.5" />
                                    <span>Corroborating Reports Linked ({report.corroboratingReportIds.length}):</span>
                                  </div>
                                  <ul className="pl-4 list-disc space-y-0.5 text-slate-600 dark:text-slate-300">
                                    {report.corroboratingReportIds.map(cr => (
                                      <li key={cr._id}>{cr.reportId || cr._id} — {cr.hazardType} ({cr.verificationStatus})</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Toolbar */}
                          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => setActiveAction(activeAction === 'verify' ? null : 'verify')}
                            >
                              Verify Severity
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XCircle}
                              onClick={() => setActiveAction(activeAction === 'reject' ? null : 'reject')}
                            >
                              Reject Report
                            </Button>
                            <Button
                              variant="warning"
                              size="sm"
                              icon={HelpCircle}
                              onClick={() => handleRequestInfo(report._id)}
                            >
                              Request Info
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              icon={Paperclip}
                              onClick={() => setActiveAction(activeAction === 'evidence' ? null : 'evidence')}
                            >
                              Add Evidence
                            </Button>
                          </div>

                          {/* Inline Action Forms */}
                          {activeAction === 'verify' && (
                            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                                Select Verified Severity Level
                              </h5>
                              <div className="flex gap-4 text-xs font-bold">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" name="sev" value="LOW" checked={verifySeverity === 'LOW'} onChange={() => setVerifySeverity('LOW')} />
                                  <span>LOW Severity</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-rose-600 dark:text-rose-400">
                                  <input type="radio" name="sev" value="HIGH" checked={verifySeverity === 'HIGH'} onChange={() => setVerifySeverity('HIGH')} />
                                  <span>HIGH Severity (Flag for UC1 Broadcast)</span>
                                </label>
                              </div>
                              <Button variant="success" size="sm" onClick={() => handleVerify(report._id)}>
                                Confirm Verification
                              </Button>
                            </div>
                          )}

                          {activeAction === 'reject' && (
                            <div className="p-4 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-3">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-300">
                                Rejection Reason
                              </h5>
                              <textarea
                                rows="2"
                                placeholder="Specify reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                              />
                              <Button variant="danger" size="sm" onClick={() => handleReject(report._id)}>
                                Confirm Rejection
                              </Button>
                            </div>
                          )}

                          {activeAction === 'evidence' && (
                            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 space-y-3">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                Attach Supplemental Evidence
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <input
                                  type="text"
                                  placeholder="Photo filename / URL"
                                  value={evidenceData.photoUrl}
                                  onChange={(e) => setEvidenceData({ ...evidenceData, photoUrl: e.target.value })}
                                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                                <input
                                  type="text"
                                  placeholder="Officer comment"
                                  value={evidenceData.comment}
                                  onChange={(e) => setEvidenceData({ ...evidenceData, comment: e.target.value })}
                                  className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                                />
                              </div>
                              <Button variant="primary" size="sm" onClick={() => handleAddEvidence(report._id)}>
                                Submit Evidence &amp; Reset to Pending
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>
      </Reveal>
    </div>
  );
};

export default VerificationQueuePage;
