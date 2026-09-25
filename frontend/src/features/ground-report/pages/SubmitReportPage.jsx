import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Radio, 
  MapPin, 
  Upload, 
  WifiOff, 
  CheckCircle2, 
  AlertCircle, 
  Link as LinkIcon, 
  Waves, 
  Mountain, 
  Wind, 
  Sun, 
  HelpCircle,
  User,
  Building2,
  FileText
} from 'lucide-react';
import { submitReport } from '../api/groundReportApi';
import { getDistricts, getCitizens } from '../../../shared/api/commonApi';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Reveal from '../../../shared/components/Reveal';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

const hazardOptions = [
  { id: 'Flood', label: 'Flood', icon: Waves, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800' },
  { id: 'Landslide', label: 'Landslide', icon: Mountain, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800' },
  { id: 'Cyclone', label: 'Cyclone', icon: Wind, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800' },
  { id: 'Drought', label: 'Drought', icon: Sun, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800' },
  { id: 'Other', label: 'Other Hazard', icon: HelpCircle, color: 'text-slate-500 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800' }
];

export const SubmitReportPage = () => {
  useDocumentTitle('Submit Ground Report');

  const [districts, setDistricts] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [formData, setFormData] = useState({
    hazardType: 'Flood',
    description: '',
    photoUrl: 'flood_photo_sample.jpg',
    gpsLat: '6.9271',
    gpsLng: '79.8612',
    districtId: '',
    submittedBy: ''
  });
  const [statusMessage, setStatusMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const distRes = await getDistricts();
        if (distRes.success && distRes.data) {
          setDistricts(distRes.data);
          if (distRes.data.length > 0) {
            setFormData(prev => ({ ...prev, districtId: distRes.data[0]._id }));
          }
        }
        const citRes = await getCitizens();
        if (citRes.success && citRes.data) {
          setCitizens(citRes.data);
          if (citRes.data.length > 0) {
            setFormData(prev => ({ ...prev, submittedBy: citRes.data[0]._id }));
          }
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      }
    };
    fetchData();
  }, []);

  const handleUseCurrentLocation = () => {
    setFormData(prev => ({
      ...prev,
      gpsLat: '6.9271',
      gpsLng: '79.8612'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    if (isOffline) {
      setStatusMessage({
        type: 'warning',
        text: 'Device is offline. Report stored in local queue and will auto-sync when connection is restored.'
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await submitReport(formData);
      if (res.success) {
        setStatusMessage({
          type: res.data.isCorroborating ? 'info' : 'success',
          text: res.message,
          data: res.data
        });
        setFormData(prev => ({
          ...prev,
          description: ''
        }));
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Submission failed'
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: 'Error submitting report: ' + err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        badge="Use Case 2 (UC2)"
        icon={Radio}
        title="Submit Ground Hazard Report"
        subtitle="Citizens and field officers can report observed ground hazards with GPS coordinates and photo evidence for auto-corroboration and duty officer review."
      />

      <Reveal>
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Hazard Observation Form
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fill details accurately to trigger ~1km &amp; &lt;6h spatio-temporal duplicate detection
                </p>
              </div>

              {/* Offline Simulation Toggle */}
              <label className="inline-flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors">
                <input
                  type="checkbox"
                  checked={isOffline}
                  onChange={(e) => setIsOffline(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <WifiOff className={`w-3.5 h-3.5 ${isOffline ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                <span>Simulate Offline Mode</span>
              </label>
            </div>

            {/* Status Message Alert Toast */}
            <AnimatePresence>
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-xl border mb-6 text-sm flex items-start gap-3 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : statusMessage.type === 'info'
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300'
                      : statusMessage.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' || statusMessage.type === 'info' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="font-bold">{statusMessage.text}</strong>
                    {statusMessage.data && statusMessage.data.corroboratesWith && (
                      <div className="mt-2 text-xs font-mono bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-current/20 flex items-center gap-1.5">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Corroborates with Report ID: {statusMessage.data.corroboratesWith}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hazard Type Card Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Select Observed Hazard Type *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {hazardOptions.map((opt) => {
                    const IconComp = opt.icon;
                    const isSelected = formData.hazardType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, hazardType: opt.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/50 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mb-1.5 ${opt.color}`}>
                          <IconComp className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* District & Submitter Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target District *</span>
                  </label>
                  <select
                    value={formData.districtId}
                    onChange={(e) => setFormData({ ...formData, districtId: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {districts.map(d => (
                      <option key={d._id} value={d._id}>{d.name} ({d.districtId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted By (Citizen) *</span>
                  </label>
                  <select
                    value={formData.submittedBy}
                    onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {citizens.map(c => (
                      <option key={c._id} value={c._id}>{c.name} - {c.nationalId}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hazard Description *</span>
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe observed ground hazard conditions, affected roads, water level, structural risks..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* GPS Coordinates */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>GPS Location Coordinates *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Use Current GPS</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={formData.gpsLat}
                    onChange={(e) => setFormData({ ...formData, gpsLat: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={formData.gpsLng}
                    onChange={(e) => setFormData({ ...formData, gpsLng: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Drag and Drop Styled Upload Zone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Photo Evidence Attachment
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/40 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    Drag and drop photo evidence file here, or enter filename below
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. flood_colombo_photo.jpg"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="mt-3 w-full max-w-md mx-auto px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs text-center focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit CTA Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full"
                >
                  Submit Ground Hazard Report
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Reveal>
    </div>
  );
};

export default SubmitReportPage;
