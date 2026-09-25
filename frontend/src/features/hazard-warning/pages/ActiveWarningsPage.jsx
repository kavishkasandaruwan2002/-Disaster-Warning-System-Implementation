import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Filter, 
  Zap, 
  Ban, 
  BarChart2, 
  Radio, 
  Calendar, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  AlertTriangle,
  Smartphone,
  Bell,
  Volume2
} from 'lucide-react';
import { getActiveWarnings, escalateWarning, cancelWarning, getNotificationStats } from '../api/hazardWarningApi';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Badge from '../../../shared/components/Badge';
import Modal from '../../../shared/components/Modal';
import Reveal from '../../../shared/components/Reveal';
import EmptyState from '../../../shared/components/EmptyState';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

export const ActiveWarningsPage = () => {
  useDocumentTitle('Active Warnings');

  const [warnings, setWarnings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  const [escalateSeverity, setEscalateSeverity] = useState('Warning');
  const [activeModal, setActiveModal] = useState(null); // 'escalate' or 'stats'

  const fetchWarnings = async () => {
    try {
      const res = await getActiveWarnings(statusFilter);
      if (res.success) {
        setWarnings(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch warnings:', err);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, [statusFilter]);

  const handleEscalate = async (warningId) => {
    setActionMessage(null);
    try {
      const res = await escalateWarning(warningId, escalateSeverity);
      if (res.success) {
        setActionMessage({
          type: 'warning',
          text: `Warning escalated to ${escalateSeverity}! ${res.data.reNotifiedCount} re-notification messages dispatched to citizens.`
        });
        setActiveModal(null);
        fetchWarnings();
      } else {
        setActionMessage({ type: 'danger', text: res.message || 'Escalation rejected' });
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Escalation rejected: ' + err.message });
    }
  };

  const handleCancel = async (warningId) => {
    if (!window.confirm('Are you sure you want to cancel this hazard warning? This will issue a "hazard has passed" follow-up notification.')) return;
    setActionMessage(null);
    try {
      const res = await cancelWarning(warningId);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Hazard warning cancelled. Follow-up notifications issued.' });
        fetchWarnings();
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error cancelling warning: ' + err.message });
    }
  };

  const handleViewStats = async (warning) => {
    setSelectedWarning(warning);
    setActiveModal('stats');
    setStatsData(null);

    try {
      const res = await getNotificationStats(warning._id);
      if (res.success) {
        setStatsData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch notification stats:', err);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        badge="Live Operations (UC1)"
        icon={Radio}
        title="Active Hazard Warnings &amp; Escalation Controls"
        subtitle="Monitor live warning broadcasts, escalate severity levels when ground conditions deteriorate, issue cancellations, and review 3-channel fan-out delivery analytics."
      />

      {/* Filter Control */}
      <Reveal>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Filter className="w-4 h-4 text-blue-500" />
              <span>Filter Warning Alerts</span>
            </div>

            <div className="w-full sm:w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">All Statuses (Active / Escalated / Cancelled)</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ESCALATED">ESCALATED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
          actionMessage.type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
            : actionMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Warnings Elevated Cards Grid */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Active Warnings ({warnings.length})
            </h3>
          </div>

          {warnings.length === 0 ? (
            <Card>
              <EmptyState title="No Active Warnings" description="There are no broadcast warnings matching the active filter." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {warnings.map((warning) => {
                const isActive = warning.status === 'ACTIVE' || warning.status === 'ESCALATED';
                return (
                  <Card
                    key={warning._id}
                    glow={isActive}
                    glowColor={warning.status === 'ESCALATED' ? 'red' : 'blue'}
                    className="flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="flex h-3 w-3 relative">
                            {isActive && (
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            )}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          </span>
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            {warning.alertId}
                          </span>
                          <Badge status={warning.hazardType}>{warning.hazardType}</Badge>
                        </div>
                        <Badge status={warning.status}>{warning.status}</Badge>
                      </div>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Severity Level:
                          </span>
                          <Badge status={warning.severityLevel}>{warning.severityLevel}</Badge>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                          "{warning.message}"
                        </div>

                        <div className="space-y-1 pt-1 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              Target: {warning.targetDistrictIds?.map(d => d.name).join(', ') || 'N/A'}
                              {warning.targetRiverBasinId ? ` (${warning.targetRiverBasinId.name})` : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Issued: {new Date(warning.issuedTime).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                      <Button
                        variant="warning"
                        size="sm"
                        icon={Zap}
                        onClick={() => { setSelectedWarning(warning); setActiveModal('escalate'); }}
                        disabled={warning.status === 'CANCELLED' || warning.severityLevel === 'Emergency'}
                      >
                        Escalate
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={Ban}
                        onClick={() => handleCancel(warning._id)}
                        disabled={warning.status === 'CANCELLED'}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={BarChart2}
                        onClick={() => handleViewStats(warning)}
                      >
                        Reach Stats
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      {/* Escalate Animated Modal */}
      <Modal
        isOpen={activeModal === 'escalate' && !!selectedWarning}
        onClose={() => setActiveModal(null)}
        title={`Escalate Hazard Warning ${selectedWarning?.alertId}`}
        subtitle="Escalating warning will update severity level and dispatch re-notifications to citizens."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Select New Escalated Severity Level *
            </label>
            <select
              value={escalateSeverity}
              onChange={(e) => setEscalateSeverity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Watch">Watch</option>
              <option value="Warning">Warning</option>
              <option value="Emergency">Emergency (Highest Alert)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button variant="warning" icon={Zap} onClick={() => handleEscalate(selectedWarning._id)}>
              Confirm Escalation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reach Stats Animated Modal */}
      <Modal
        isOpen={activeModal === 'stats' && !!selectedWarning}
        onClose={() => setActiveModal(null)}
        title={`Notification Reach Breakdown — ${selectedWarning?.alertId}`}
        subtitle="Delivery stats and 3-channel (PUSH, SMS, AUDIBLE) breakdown"
        maxWidth="max-w-2xl"
      >
        {statsData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Notifications</span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{statsData.total}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Delivered (90%)</span>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{statsData.sent}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Failures (10%)</span>
                <div className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{statsData.failed}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                3-Channel Fan-out Delivery Breakdown
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                    <tr>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Total Dispatched</th>
                      <th className="p-3 text-emerald-600 dark:text-emerald-400">Delivered</th>
                      <th className="p-3 text-rose-600 dark:text-rose-400">Failed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.keys(statsData.channelBreakdown).map(ch => (
                      <tr key={ch}>
                        <td className="p-3 font-bold">{ch}</td>
                        <td className="p-3">{statsData.channelBreakdown[ch].total}</td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{statsData.channelBreakdown[ch].sent}</td>
                        <td className="p-3 font-bold text-rose-600 dark:text-rose-400">{statsData.channelBreakdown[ch].failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setActiveModal(null)}>
                Close Breakdown
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-slate-500">
            Loading notification statistics...
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ActiveWarningsPage;
