import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  PlusCircle, 
  Share2, 
  ShieldAlert, 
  Users, 
  ClipboardCheck, 
  Home, 
  FileText, 
  CheckCircle2, 
  Download,
  Building2,
  Calendar
} from 'lucide-react';
import { getReports, getReportById, shareReport } from '../api/analysisReportApi';
import { getOrganisations } from '../../../shared/api/commonApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Badge from '../../../shared/components/Badge';
import Modal from '../../../shared/components/Modal';
import Reveal from '../../../shared/components/Reveal';
import EmptyState from '../../../shared/components/EmptyState';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

export const ReportSummaryPage = () => {
  useDocumentTitle('Analysis Report Summary');

  const [searchParams] = useSearchParams();
  const reportIdParam = searchParams.get('reportId');

  const [reportsList, setReportsList] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [reportDetails, setReportDetails] = useState(null);
  const [organisations, setOrganisations] = useState([]);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOrgIds, setSelectedOrgIds] = useState([]);
  const [shareFeedback, setShareFeedback] = useState(null);

  useEffect(() => {
    getReports().then(res => {
      if (res.success && res.data) {
        setReportsList(res.data);
        if (reportIdParam) {
          setSelectedReportId(reportIdParam);
        } else if (res.data.length > 0) {
          setSelectedReportId(res.data[0]._id);
        }
      }
    });
    getOrganisations().then(res => {
      if (res.success) setOrganisations(res.data);
    });
  }, [reportIdParam]);

  useEffect(() => {
    if (!selectedReportId) return;
    getReportById(selectedReportId).then(res => {
      if (res.success) {
        setReportDetails(res.data);
      }
    });
  }, [selectedReportId]);

  const handleOrgCheckboxChange = (orgId) => {
    if (selectedOrgIds.includes(orgId)) {
      setSelectedOrgIds(selectedOrgIds.filter(id => id !== orgId));
    } else {
      setSelectedOrgIds([...selectedOrgIds, orgId]);
    }
  };

  const handleShareSubmit = async () => {
    if (!selectedReportId) return;
    setShareFeedback(null);
    try {
      const res = await shareReport(selectedReportId, selectedOrgIds);
      if (res.success) {
        setShareFeedback({
          type: 'success',
          text: res.message,
          downloadUrl: res.data.downloadUrl
        });
        getReportById(selectedReportId).then(r => {
          if (r.success) setReportDetails(r.data);
        });
      }
    } catch (err) {
      setShareFeedback({ type: 'danger', text: 'Failed to share report: ' + err.message });
    }
  };

  const report = reportDetails?.report;
  const weeklyAlerts = reportDetails?.weeklyAlertBreakdown || [];
  const supplyStats = reportDetails?.supplyDistribution || [];

  return (
    <div className="space-y-8">
      <PageHero
        badge="Analytical Intelligence (UC4)"
        icon={BarChart3}
        title="Post-Event Analysis Report Summary"
        subtitle="Evaluate disaster response effectiveness, weekly alert trends, shelter activation counts, and supply distribution breakdown."
        actions={
          <Link to="/analysis-reports/generate">
            <Button variant="primary" icon={PlusCircle}>
              Generate New Report
            </Button>
          </Link>
        }
      />

      {/* Select Report Selector Bar */}
      <Reveal>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Select Generated Evaluation Report</span>
            </div>

            <div className="w-full sm:w-80">
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {reportsList.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.reportId} ({new Date(r.periodFrom).toLocaleDateString()} - {new Date(r.periodTo).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </Reveal>

      {report ? (
        <div className="space-y-8">
          {/* Metadata Banner Card */}
          <Reveal>
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Report: {report.reportId}
                    </h3>
                    <Badge status="VERIFIED">COMPLETED</Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <span><strong>Period:</strong> {new Date(report.periodFrom).toLocaleDateString()} to {new Date(report.periodTo).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{report.districtFilter ? `District: ${report.districtFilter.name}` : 'National Summary (All Districts)'}</span>
                    <span>•</span>
                    <span>{report.hazardTypeFilter ? `Hazard: ${report.hazardTypeFilter}` : 'All Hazard Types'}</span>
                  </p>
                </div>

                <Button
                  variant="secondary"
                  icon={Share2}
                  onClick={() => { setIsShareModalOpen(true); setShareFeedback(null); }}
                >
                  Share &amp; Export PDF
                </Button>
              </div>

              {report.sharedWithOrgIds && report.sharedWithOrgIds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <strong>Shared with Partner Agencies ({report.sharedWithOrgIds.length}):</strong>{' '}
                  {report.sharedWithOrgIds.map(o => o.name).join(', ')}
                </div>
              )}
            </Card>
          </Reveal>

          {/* KPI Summary Tiles */}
          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Card glow glowColor="blue" className="border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Hazard Alerts Issued
                    </p>
                    <motion.h3
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                    >
                      {report.alertsIssuedCount}
                    </motion.h3>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>
              </Card>

              <Card glow glowColor="green" className="border-l-4 border-l-emerald-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Citizens Reached
                    </p>
                    <motion.h3
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                    >
                      {report.citizensReachedCount.toLocaleString()}
                    </motion.h3>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </Card>

              <Card glow glowColor="red" className="border-l-4 border-l-rose-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Verified Reports
                    </p>
                    <motion.h3
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                    >
                      {report.reportsVerifiedCount}
                    </motion.h3>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                </div>
              </Card>

              <Card glow glowColor="blue" className="border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Shelters Activated
                    </p>
                    <motion.h3
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                    >
                      {report.sheltersActivatedCount}
                    </motion.h3>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Home className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </div>
          </Reveal>

          {/* Charts & Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recharts Bar Chart */}
            <Reveal>
              <Card className="h-full">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                  Weekly Alert Issue Breakdown
                </h3>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyAlerts}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
                      <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Alerts Issued" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Reveal>

            {/* Relief Supply Horizontal Progress Bars */}
            <Reveal>
              <Card className="h-full space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Relief Supply Distribution Breakdown
                </h3>
                <div className="space-y-4">
                  {supplyStats.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-900 dark:text-white">{item.supplyType}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {item.distributedQuantity} / {item.totalQuantity} Units ({item.distributionPercentage}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.distributionPercentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      ) : (
        <Card>
          <EmptyState title="No Report Selected" description="Select a generated report from the dropdown above or generate a new evaluation report." />
        </Card>
      )}

      {/* Share Modal with Success Micro-Animation */}
      <Modal
        isOpen={isShareModalOpen && !!report}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Report & Export PDF"
        subtitle="Select partner organisations (Armed Forces, NGOs, Donors) to grant access"
      >
        <div className="space-y-4">
          <AnimatePresence>
            {shareFeedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`p-4 rounded-xl border text-xs font-semibold flex flex-col gap-2 ${
                  shareFeedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 text-rose-800 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>{shareFeedback.text}</span>
                </div>
                {shareFeedback.downloadUrl && (
                  <div className="mt-1 pt-2 border-t border-current/20 flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-500" />
                    <span className="font-bold">Simulated PDF Download:</span>
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); alert("Simulated PDF export file downloaded!"); }}
                      className="text-blue-600 dark:text-blue-400 underline font-mono"
                    >
                      {shareFeedback.downloadUrl}
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-60 overflow-y-auto p-1">
            {organisations.map(org => {
              const isChecked = selectedOrgIds.includes(org._id) || (report?.sharedWithOrgIds && report.sharedWithOrgIds.some(o => o._id === org._id || o === org._id));
              return (
                <label key={org._id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleOrgCheckboxChange(org._id)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <strong className="block text-slate-900 dark:text-white font-bold">{org.name}</strong>
                    <span className="text-slate-500 dark:text-slate-400">{org.type}</span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsShareModalOpen(false)}>Close</Button>
            <Button variant="primary" icon={Share2} onClick={handleShareSubmit}>Confirm Share &amp; Export</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReportSummaryPage;
