import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Search, 
  Send, 
  Users, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Bell, 
  Smartphone, 
  Volume2, 
  Building2, 
  Check 
} from 'lucide-react';
import { previewReach, issueWarning } from '../api/hazardWarningApi';
import { getDistricts, getRiverBasins } from '../../../shared/api/commonApi';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Badge from '../../../shared/components/Badge';
import Reveal from '../../../shared/components/Reveal';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

const severityLevels = [
  { id: 'Advisory', label: 'Advisory', color: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300', activeColor: 'bg-emerald-600 text-white ring-emerald-500' },
  { id: 'Watch', label: 'Watch', color: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300', activeColor: 'bg-amber-600 text-white ring-amber-500' },
  { id: 'Warning', label: 'Warning', color: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300', activeColor: 'bg-orange-600 text-white ring-orange-500' },
  { id: 'Emergency', label: 'Emergency', color: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300', activeColor: 'bg-rose-600 text-white ring-rose-500 animate-pulse' }
];

export const IssueWarningPage = () => {
  useDocumentTitle('Issue Hazard Warning');

  const [districts, setDistricts] = useState([]);
  const [riverBasins, setRiverBasins] = useState([]);

  const [targetType, setTargetType] = useState('districts');
  const [selectedDistrictIds, setSelectedDistrictIds] = useState([]);
  const [selectedRiverBasinId, setSelectedRiverBasinId] = useState('');

  const [formData, setFormData] = useState({
    hazardType: 'Flood',
    severityLevel: 'Watch',
    message: 'Flash flood warning issued for vulnerable low-lying river areas. Move to high ground immediately.'
  });

  const [previewResult, setPreviewResult] = useState(null);
  const [broadcastResult, setBroadcastResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getDistricts().then(res => {
      if (res.success) {
        setDistricts(res.data);
        if (res.data.length > 0) setSelectedDistrictIds([res.data[0]._id]);
      }
    });
    getRiverBasins().then(res => {
      if (res.success) {
        setRiverBasins(res.data);
        if (res.data.length > 0) setSelectedRiverBasinId(res.data[0]._id);
      }
    });
  }, []);

  const handleDistrictCheckboxChange = (districtId) => {
    if (selectedDistrictIds.includes(districtId)) {
      setSelectedDistrictIds(selectedDistrictIds.filter(id => id !== districtId));
    } else {
      setSelectedDistrictIds([...selectedDistrictIds, districtId]);
    }
  };

  const handlePreview = async () => {
    setStatusMessage(null);
    setBroadcastResult(null);

    const payload = {
      hazardType: formData.hazardType,
      severityLevel: formData.severityLevel,
      message: formData.message,
      targetDistrictIds: targetType === 'districts' ? selectedDistrictIds : [],
      targetRiverBasinId: targetType === 'riverBasin' ? selectedRiverBasinId : null
    };

    try {
      const res = await previewReach(payload);
      if (res.success) {
        setPreviewResult(res.data);
      } else {
        setStatusMessage({ type: 'danger', text: res.message });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'Preview calculation failed: ' + err.message });
    }
  };

  const handleConfirmBroadcast = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    const payload = {
      hazardType: formData.hazardType,
      severityLevel: formData.severityLevel,
      message: formData.message,
      targetDistrictIds: targetType === 'districts' ? selectedDistrictIds : [],
      targetRiverBasinId: targetType === 'riverBasin' ? selectedRiverBasinId : null
    };

    try {
      const res = await issueWarning(payload);
      if (res.success) {
        setBroadcastResult(res.data);
        setStatusMessage({
          type: 'success',
          text: `Hazard Warning ${res.data.alertId} successfully issued and broadcasted!`
        });
      } else {
        setStatusMessage({ type: 'danger', text: res.message || 'Failed to issue warning' });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'Error broadcasting warning: ' + err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        badge="Multi-Channel Fan-out (UC1)"
        icon={ShieldAlert}
        title="Issue Location-Specific Hazard Warning"
        subtitle="Compose and broadcast targeted emergency alerts to citizens across districts or river basins with 3-channel fan-out (PUSH, SMS, AUDIBLE SIREN)."
      />

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Broadcast Result Card */}
      <AnimatePresence>
        {broadcastResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 border border-emerald-500 text-white shadow-xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Broadcast Dispatch Successful</h3>
                <p className="text-xs text-emerald-300">
                  Alert ID: <code className="font-mono bg-black/40 px-2 py-0.5 rounded">{broadcastResult.alertId}</code>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-emerald-800/80">
              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/50">
                <div className="text-xs text-emerald-400">Success Receipts (90%)</div>
                <div className="text-xl font-black text-white">{broadcastResult.notifiedCount}</div>
              </div>
              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/50">
                <div className="text-xs text-rose-400">Delivery Failures (10%)</div>
                <div className="text-xl font-black text-rose-300">{broadcastResult.failedCount}</div>
              </div>
              <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-800/50">
                <div className="text-xs text-amber-400">Active Fan-out Channels</div>
                <div className="text-xs font-bold text-white mt-1">PUSH • SMS • SIREN</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Reveal>
        <Card className="p-6 md:p-8 space-y-8">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Warning Broadcast Configuration Wizard
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select hazard parameters, severity scale, target geographic area, and broadcast message
            </p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Step 1: Hazard Type & Severity Scale */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Hazard Classification *
                </label>
                <select
                  value={formData.hazardType}
                  onChange={(e) => setFormData({ ...formData, hazardType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Flood">Flood</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Cyclone">Cyclone</option>
                  <option value="Drought">Drought</option>
                </select>
              </div>

              {/* Severity Level Animated Pills */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Severity Scale Pill Selector *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {severityLevels.map((lvl) => {
                    const isSelected = formData.severityLevel === lvl.id;
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, severityLevel: lvl.id })}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? `${lvl.activeColor} shadow-md ring-2`
                            : `${lvl.color} hover:opacity-80`
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{lvl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 2: Target Area Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Geographic Area *
              </label>

              <div className="flex gap-4 mb-3">
                <label className={`flex-1 p-3 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${
                  targetType === 'districts'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/50'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="targetType"
                    value="districts"
                    checked={targetType === 'districts'}
                    onChange={() => setTargetType('districts')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <Building2 className="w-4 h-4" />
                  <span>Target Specific Districts</span>
                </label>

                <label className={`flex-1 p-3 rounded-xl border cursor-pointer text-xs font-bold flex items-center gap-2 transition-all ${
                  targetType === 'riverBasin'
                    ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/50'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="targetType"
                    value="riverBasin"
                    checked={targetType === 'riverBasin'}
                    onChange={() => setTargetType('riverBasin')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <MapPin className="w-4 h-4" />
                  <span>Target Entire River Basin</span>
                </label>
              </div>

              {/* District Multi-Select Animated Chips */}
              {targetType === 'districts' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {districts.map(d => {
                    const isChecked = selectedDistrictIds.includes(d._id);
                    return (
                      <button
                        key={d._id}
                        type="button"
                        onClick={() => handleDistrictCheckboxChange(d._id)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                          isChecked
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 ring-2 ring-blue-500/40'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>{d.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {d.citizenCount} Citizens
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <select
                    value={selectedRiverBasinId}
                    onChange={(e) => setSelectedRiverBasinId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {riverBasins.map(rb => (
                      <option key={rb._id} value={rb._id}>
                        {rb.name} ({rb.basinId}) — Spans {rb.districts?.length || 0} Districts
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Broadcast Channel Indicators */}
            <div className="p-4 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Active 3-Channel Multi-Fanout Channels
              </label>
              <div className="grid grid-cols-3 gap-3 text-xs font-bold">
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                  <Smartphone className="w-4 h-4" />
                  <span>1. PUSH Notification</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                  <Bell className="w-4 h-4" />
                  <span>2. SMS SMS Gateway</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400">
                  <Volume2 className="w-4 h-4" />
                  <span>3. Audible Siren</span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Warning Broadcast Message Body *
              </label>
              <textarea
                rows="3"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="secondary"
                icon={Search}
                onClick={handlePreview}
              >
                Preview Estimated Reach
              </Button>
              <Button
                type="button"
                variant="danger"
                icon={Send}
                isLoading={isLoading}
                onClick={handleConfirmBroadcast}
              >
                Confirm &amp; Broadcast Warning
              </Button>
            </div>
          </form>

          {/* Reach Estimation Preview Result */}
          <AnimatePresence>
            {previewResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-950 text-white border border-blue-700/50 shadow-lg space-y-4"
              >
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
                  <Users className="w-4 h-4" />
                  <span>Reach Estimation Preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/50">
                    <span className="text-xs text-blue-300 font-semibold">Estimated Target Citizens</span>
                    <div className="text-3xl font-black text-white mt-1">
                      {previewResult.estimatedReach.toLocaleString()}
                    </div>
                    <span className="text-[10px] text-emerald-400">Direct Citizen Coverage</span>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-950/60 border border-blue-800/50">
                    <span className="text-xs text-blue-300 font-semibold">Total Notifications Dispatched</span>
                    <div className="text-3xl font-black text-white mt-1">
                      {(previewResult.estimatedReach * 3).toLocaleString()}
                    </div>
                    <span className="text-[10px] text-amber-300">3 Channels per Citizen</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </Reveal>
    </div>
  );
};

export default IssueWarningPage;
