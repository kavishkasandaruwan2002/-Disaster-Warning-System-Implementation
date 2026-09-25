import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Calendar, 
  Building2, 
  ShieldAlert, 
  Check, 
  AlertTriangle, 
  CheckCircle2 
} from 'lucide-react';
import { generateReport } from '../api/analysisReportApi';
import { getDistricts } from '../../../shared/api/commonApi';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Reveal from '../../../shared/components/Reveal';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

const hazardOptions = ['All Hazards', 'Flood', 'Landslide', 'Cyclone', 'Drought'];

export const GenerateReportPage = () => {
  useDocumentTitle('Generate Report');

  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    periodFrom: thirtyDaysAgo,
    periodTo: today,
    districtFilter: '',
    hazardTypeFilter: ''
  });

  const [statusMessage, setStatusMessage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    getDistricts().then(res => {
      if (res.success) setDistricts(res.data);
    });
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setStatusMessage(null);

    try {
      const res = await generateReport(formData);
      if (res.success) {
        if (res.data.noActivity) {
          setStatusMessage({
            type: 'warning',
            text: '⚠️ No activity recorded in selected period. Created report with all-zero counts.'
          });
        } else {
          setStatusMessage({
            type: 'success',
            text: 'Post-event analysis report generated successfully!'
          });
        }

        setTimeout(() => {
          navigate(`/analysis-reports?reportId=${res.data.report._id}`);
        }, 1200);
      } else {
        setStatusMessage({ type: 'danger', text: res.message || 'Generation failed' });
      }
    } catch (err) {
      setStatusMessage({ type: 'danger', text: 'Error generating report: ' + err.message });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHero
        badge="Post-Event Analytics (UC4)"
        icon={BarChart3}
        title="Generate Post-Event Analysis Report"
        subtitle="Aggregate disaster metrics across date ranges, evaluate shelter activation efficiency, and compile cross-agency evaluation reports."
      />

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
            : statusMessage.type === 'warning'
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 text-amber-800 dark:text-amber-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
        }`}>
          <span>{statusMessage.text}</span>
        </div>
      )}

      <Reveal>
        <div className="max-w-3xl mx-auto">
          <Card className="p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Report Filter Parameters
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select evaluation timeframe, target district, and hazard filter
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Evaluation Period From *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.periodFrom}
                    onChange={(e) => setFormData({ ...formData, periodFrom: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span>Evaluation Period To *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.periodTo}
                    onChange={(e) => setFormData({ ...formData, periodTo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>District Filter (Optional)</span>
                </label>
                <select
                  value={formData.districtFilter}
                  onChange={(e) => setFormData({ ...formData, districtFilter: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">All Districts (National Summary)</option>
                  {districts.map(d => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              {/* Hazard Type Animated Filter Chips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hazard Classification Filter (Optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {hazardOptions.map((h) => {
                    const val = h === 'All Hazards' ? '' : h;
                    const isSelected = formData.hazardTypeFilter === val;
                    return (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setFormData({ ...formData, hazardTypeFilter: val })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{h}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  icon={BarChart3}
                  isLoading={isGenerating}
                  className="w-full"
                >
                  Generate Post-Event Analytics
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </Reveal>
    </div>
  );
};

export default GenerateReportPage;
