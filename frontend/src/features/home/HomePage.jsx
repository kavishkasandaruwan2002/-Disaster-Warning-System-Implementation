import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Radio, 
  ShieldAlert, 
  Truck, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  AlertTriangle, 
  Activity, 
  Flame,
  Waves,
  Mountain,
  Zap,
  ChevronRight
} from 'lucide-react';
import PageHero from '../../shared/components/PageHero';
import Card from '../../shared/components/Card';
import Button from '../../shared/components/Button';
import Badge from '../../shared/components/Badge';
import Reveal from '../../shared/components/Reveal';
import useDocumentTitle from '../../shared/hooks/useDocumentTitle';

export const HomePage = () => {
  useDocumentTitle('Home Dashboard');

  const [stats, setStats] = useState({
    activeAlertsCount: 2,
    pendingReportsCount: 3,
    citizensCovered: 5240,
    shelterOccupancy: 38,
  });

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const [alertsRes, reportsRes, distRes] = await Promise.allSettled([
          fetch('/api/hazard-alerts'),
          fetch('/api/ground-reports?status=PENDING'),
          fetch('/api/districts')
        ]);

        let alertsCount = 2;
        let pendingCount = 3;
        let citizens = 5240;

        if (alertsRes.status === 'fulfilled' && alertsRes.value.ok) {
          const data = await alertsRes.value.json();
          if (data.success && Array.isArray(data.data)) {
            alertsCount = data.data.filter(a => a.status === 'ACTIVE' || a.status === 'ESCALATED').length;
          }
        }
        if (reportsRes.status === 'fulfilled' && reportsRes.value.ok) {
          const data = await reportsRes.value.json();
          if (data.success && Array.isArray(data.data)) {
            pendingCount = data.data.length;
          }
        }
        if (distRes.status === 'fulfilled' && distRes.value.ok) {
          const data = await distRes.value.json();
          if (data.success && Array.isArray(data.data)) {
            citizens = data.data.reduce((sum, d) => sum + (d.citizenCount || 0), 0) || 5240;
          }
        }

        setStats({
          activeAlertsCount: alertsCount,
          pendingReportsCount: pendingCount,
          citizensCovered: citizens,
          shelterOccupancy: 38
        });
      } catch (err) {
        console.warn('Using default demo stats:', err);
      }
    };

    fetchLiveStats();
  }, []);

  const featureCards = [
    {
      uc: 'UC2',
      title: 'Ground Report & Verification',
      description: 'Submit field hazard reports with photo evidence & GPS. Spatio-temporal duplicate detection within ~1km & <6 hours.',
      icon: Radio,
      color: 'blue',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      actionPrimary: { label: 'Submit Report', path: '/ground-reports/submit' },
      actionSecondary: { label: 'Duty Queue', path: '/ground-reports/queue' },
      highlights: ['Auto ~1km & <6h duplicate detection', 'Duty Officer verification queue', 'Evidence timeline & info requests']
    },
    {
      uc: 'UC1',
      title: 'Location Hazard Warning',
      description: 'Broadcast location-specific emergency warnings with 3-channel fan-out (PUSH, SMS, Audible Siren) and escalation controls.',
      icon: ShieldAlert,
      color: 'rose',
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      actionPrimary: { label: 'Issue Warning', path: '/hazard-warnings/issue' },
      actionSecondary: { label: 'Active Alerts', path: '/hazard-warnings/active' },
      highlights: ['Live target reach preview', '3-Channel multi-fanout gateway', 'Progressive alert escalation']
    },
    {
      uc: 'UC3',
      title: 'Resource Coordination',
      description: 'Coordinate shelter capacities, dispatch military/NGO rescue units, and log relief supply distributions without stock overflow.',
      icon: Truck,
      color: 'emerald',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      actionPrimary: { label: 'Open Dashboard', path: '/resources' },
      actionSecondary: null,
      highlights: ['Real-time shelter capacity safeguard', 'Rescue team dispatch lifecycle', 'Relief supply distribution logs']
    },
    {
      uc: 'UC4',
      title: 'Analysis & Partner Reports',
      description: 'Aggregate post-event metrics, visualize weekly alert trends, evaluate shelter activations, and export reports for partner agencies.',
      icon: BarChart3,
      color: 'purple',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
      actionPrimary: { label: 'Report Summary', path: '/analysis-reports' },
      actionSecondary: { label: 'Generate PDF', path: '/analysis-reports/generate' },
      highlights: ['Recharts trend breakdown', 'Supply distribution % metrics', 'Cross-agency partner sharing']
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="space-y-10">
      {/* Top Banner Ticker */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 border border-rose-700/50 rounded-2xl p-4 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="bg-rose-950 text-rose-300 text-xs font-black uppercase px-2.5 py-1 rounded-md border border-rose-800">
            Critical Alert
          </span>
          <p className="text-sm font-medium text-rose-100">
            <strong>FLASH FLOOD WARNING:</strong> Kelani River Basin water level reached 5.8m. Emergency broadcast active for Colombo District.
          </p>
        </div>
        <Link 
          to="/hazard-warnings/active" 
          className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap"
        >
          <span>View Active Alerts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </motion.div>

      {/* Hero Section */}
      <PageHero
        badge="SE3070 MERN Architecture"
        icon={Zap}
        title="Smart Disaster Early-Warning and Emergency Coordination System"
        subtitle="An integrated platform powering ground hazard reporting, multi-channel broadcast warnings (PUSH, SMS, Sirens), emergency resource allocation, and post-event analytical intelligence."
        actions={
          <>
            <Link to="/ground-reports/submit">
              <Button variant="primary" icon={Radio} size="lg">
                Submit Ground Report
              </Button>
            </Link>
            <Link to="/hazard-warnings/issue">
              <Button variant="danger" icon={ShieldAlert} size="lg">
                Issue Broadcast Alert
              </Button>
            </Link>
            <Link to="/resources">
              <Button variant="outline" icon={Truck} size="lg" className="text-white border-slate-600 hover:bg-white/10">
                Resource Dashboard
              </Button>
            </Link>
          </>
        }
      />

      {/* Live Operational Metrics Grid */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Live System Telemetry
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Real-time operational status across monitored districts &amp; rescue units
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE UPDATES</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Card glow glowColor="blue" className="border-l-4 border-l-blue-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Citizens Protected
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {stats.citizensCovered.toLocaleString()}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    ↑ 3 Target Districts Registered
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card glow glowColor="red" className="border-l-4 border-l-rose-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Active Warnings
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {stats.activeAlertsCount}
                  </h3>
                  <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                    ● 3-Channel Fan-out Active
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card glow glowColor="blue" className="border-l-4 border-l-amber-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Pending Duty Queue
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {stats.pendingReportsCount}
                  </h3>
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                    ● Verification Required
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </Card>

            <Card glow glowColor="green" className="border-l-4 border-l-emerald-500">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Shelter Occupancy
                  </p>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {stats.shelterOccupancy}%
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    ● Capacity Safeguard Active
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Truck className="w-6 h-6" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Reveal>

      {/* 4 Feature Module Cards (UC1 - UC4) */}
      <Reveal>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Core System Modules &amp; Use Cases
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Explore the 4 core disaster management modules
              </p>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {featureCards.map((card) => {
              const IconComp = card.icon;
              return (
                <motion.div key={card.uc} variants={itemVariants}>
                  <Card className="h-full flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${card.badgeColor}`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {card.uc}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                        {card.description}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {card.highlights.map((hl, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>{hl}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                      <Link to={card.actionPrimary.path} className="flex-1">
                        <Button variant="primary" size="sm" className="w-full">
                          <span>{card.actionPrimary.label}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      {card.actionSecondary && (
                        <Link to={card.actionSecondary.path} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <span>{card.actionSecondary.label}</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Reveal>

      {/* District Hazard Risk Overview Widget */}
      <Reveal>
        <Card className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Waves className="w-4 h-4" />
                <span>Geographic Telemetry Radar</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                District Hazard Status &amp; River Basin Levels
              </h3>
            </div>
            <Link to="/ground-reports/queue">
              <Button variant="outline" size="sm" className="text-white border-slate-700 hover:bg-slate-800">
                View Duty Officer Queue
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/80 border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-base">Colombo District</h4>
                  <Badge status="HIGH">CRITICAL FLOOD</Badge>
                </div>
                <p className="text-xs text-slate-400">DIST-001 • Western Province</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Kelani River Level:</span>
                    <strong className="text-rose-400">5.8m (High)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Registered Citizens:</span>
                    <strong>2,500</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-amber-500/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-base">Kalutara District</h4>
                  <Badge status="PENDING">LANDSLIDE WATCH</Badge>
                </div>
                <p className="text-xs text-slate-400">DIST-002 • Western Province</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Kalu Ganga Basin:</span>
                    <strong className="text-amber-400">Slope Level 2</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Registered Citizens:</span>
                    <strong>1,800</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white text-base">Gampaha District</h4>
                  <Badge status="VERIFIED">NORMAL</Badge>
                </div>
                <p className="text-xs text-slate-400">DIST-003 • Western Province</p>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Attanagalu Oya:</span>
                    <strong className="text-emerald-400">2.1m (Normal)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Registered Citizens:</span>
                    <strong>940</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Reveal>
    </div>
  );
};

export default HomePage;
