import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Home, 
  Users, 
  Package, 
  PlusCircle, 
  Navigation, 
  RotateCcw, 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Edit3, 
  Search,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import {
  getResourceDashboard,
  registerShelter,
  updateShelterOccupancy,
  dispatchRescueTeam,
  returnRescueTeam,
  distributeReliefSupply
} from '../api/resourceCoordinationApi';
import { getDistricts, getOrganisations } from '../../../shared/api/commonApi';
import PageHero from '../../../shared/components/PageHero';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Badge from '../../../shared/components/Badge';
import Modal from '../../../shared/components/Modal';
import Reveal from '../../../shared/components/Reveal';
import EmptyState from '../../../shared/components/EmptyState';
import useDocumentTitle from '../../../shared/hooks/useDocumentTitle';

export const ResourceDashboardPage = () => {
  useDocumentTitle('Resource Coordination');

  const [districts, setDistricts] = useState([]);
  const [organisations, setOrganisations] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');

  const [dashboardData, setDashboardData] = useState({ shelters: [], rescueTeams: [], reliefSupplies: [] });
  const [actionMessage, setActionMessage] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'registerShelter', 'updateOccupancy', 'dispatchTeam', 'distributeSupply'
  const [modalTargetItem, setModalTargetItem] = useState(null);
  const [isFormInvalid, setIsFormInvalid] = useState(false);

  // Exception Banners State
  const [conflictResolved, setConflictResolved] = useState(false);

  // Form states for modals
  const [newShelterData, setNewShelterData] = useState({ name: '', location: '', capacity: 100, ownerOrgId: '' });
  const [newOccupancy, setNewOccupancy] = useState(0);
  const [dispatchLocation, setDispatchLocation] = useState('');
  const [distributionData, setDistributionData] = useState({ supplyId: '', shelterId: '', quantity: 10 });

  useEffect(() => {
    getDistricts().then(res => {
      if (res.success && res.data.length > 0) {
        setDistricts(res.data);
        setSelectedDistrictId(res.data[0]._id);
      }
    });
    getOrganisations().then(res => {
      if (res.success && res.data.length > 0) {
        setOrganisations(res.data);
        setNewShelterData(prev => ({ ...prev, ownerOrgId: res.data[0]._id }));
      }
    });
  }, []);

  const fetchDashboard = async () => {
    if (!selectedDistrictId) return;
    try {
      const res = await getResourceDashboard(selectedDistrictId);
      if (res.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load resource dashboard:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedDistrictId]);

  // Derived KPI numbers
  const totalShelters = dashboardData.shelters.length;
  const availableTeams = dashboardData.rescueTeams.filter(t => t.status === 'AVAILABLE').length;
  const lowStockSupplies = dashboardData.reliefSupplies.filter(s => (s.quantity - s.distributedQuantity) < 50).length;
  const hasFullShelter = dashboardData.shelters.some(s => s.status === 'FULL' || s.currentOccupancy >= s.capacity);
  const noTeamsAvailable = dashboardData.rescueTeams.length > 0 && availableTeams === 0;

  const triggerShake = () => {
    setIsFormInvalid(true);
    setTimeout(() => setIsFormInvalid(false), 500);
  };

  // Handler: Register Shelter
  const handleRegisterShelterSubmit = async (e) => {
    e.preventDefault();
    setActionMessage(null);
    if (!newShelterData.name || !newShelterData.location) {
      triggerShake();
      return;
    }
    try {
      const payload = { ...newShelterData, districtId: selectedDistrictId };
      const res = await registerShelter(payload);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'New shelter registered successfully!' });
        setActiveModal(null);
        fetchDashboard();
      } else {
        triggerShake();
        setActionMessage({ type: 'danger', text: res.message || 'Registration failed' });
      }
    } catch (err) {
      triggerShake();
      setActionMessage({ type: 'danger', text: 'Registration error: ' + err.message });
    }
  };

  // Handler: Update Occupancy
  const handleUpdateOccupancySubmit = async (e) => {
    e.preventDefault();
    setActionMessage(null);
    if (Number(newOccupancy) > modalTargetItem.capacity) {
      triggerShake();
      setActionMessage({ type: 'danger', text: `Shelter at capacity! Cannot set occupancy (${newOccupancy}) higher than capacity (${modalTargetItem.capacity}).` });
      return;
    }
    try {
      const res = await updateShelterOccupancy(modalTargetItem._id, newOccupancy);
      if (res.success) {
        setActionMessage({ type: 'success', text: 'Shelter occupancy updated.' });
        setActiveModal(null);
        fetchDashboard();
      } else {
        triggerShake();
        setActionMessage({ type: 'danger', text: res.message || 'Occupancy update rejected' });
      }
    } catch (err) {
      triggerShake();
      setActionMessage({ type: 'danger', text: 'Occupancy update rejected: ' + err.message });
    }
  };

  // Handler: Dispatch Team
  const handleDispatchTeamSubmit = async (e) => {
    e.preventDefault();
    setActionMessage(null);
    if (!dispatchLocation) {
      triggerShake();
      return;
    }
    try {
      const res = await dispatchRescueTeam(modalTargetItem._id, dispatchLocation);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Rescue team ${res.data.name} dispatched to ${dispatchLocation}.` });
        setActiveModal(null);
        fetchDashboard();
      } else {
        triggerShake();
        setActionMessage({ type: 'danger', text: res.message || 'Dispatch rejected' });
      }
    } catch (err) {
      triggerShake();
      setActionMessage({ type: 'danger', text: 'Dispatch rejected: ' + err.message });
    }
  };

  // Handler: Return Team
  const handleReturnTeam = async (teamId) => {
    setActionMessage(null);
    try {
      const res = await returnRescueTeam(teamId);
      if (res.success) {
        setActionMessage({ type: 'info', text: `Rescue team status updated to ${res.data.status}.` });
        fetchDashboard();
      }
    } catch (err) {
      setActionMessage({ type: 'danger', text: 'Error updating team status: ' + err.message });
    }
  };

  // Handler: Distribute Relief Supply
  const handleDistributeSupplySubmit = async (e) => {
    e.preventDefault();
    setActionMessage(null);
    const remaining = modalTargetItem.quantity - modalTargetItem.distributedQuantity;
    if (Number(distributionData.quantity) > remaining) {
      triggerShake();
      setActionMessage({ type: 'danger', text: `Insufficient stock! Cannot distribute ${distributionData.quantity} units (only ${remaining} remaining).` });
      return;
    }
    try {
      const payload = {
        supplyId: modalTargetItem._id,
        shelterId: distributionData.shelterId || null,
        quantity: Number(distributionData.quantity)
      };
      const res = await distributeReliefSupply(payload);
      if (res.success) {
        setActionMessage({ type: 'success', text: `Distributed ${distributionData.quantity} units of ${modalTargetItem.supplyType}.` });
        setActiveModal(null);
        fetchDashboard();
      } else {
        triggerShake();
        setActionMessage({ type: 'danger', text: res.message || 'Distribution rejected' });
      }
    } catch (err) {
      triggerShake();
      setActionMessage({ type: 'danger', text: 'Distribution rejected: ' + err.message });
    }
  };

  const filteredDistricts = districts.filter(d => 
    d.name.toLowerCase().includes(districtSearch.toLowerCase()) || 
    d.districtId.toLowerCase().includes(districtSearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <PageHero
        badge="Emergency Coordination (UC3)"
        icon={Truck}
        title="Emergency Resource Coordination Dashboard"
        subtitle="Manage shelter capacity safeguards, dispatch military/NGO rescue units, and log relief supply distributions across districts."
        actions={
          <Button
            variant="success"
            icon={PlusCircle}
            onClick={() => setActiveModal('registerShelter')}
          >
            Register New Shelter
          </Button>
        }
      />

      {/* Top 3 Animated KPI Summary Cards */}
      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card glow glowColor="blue" className="border-l-4 border-l-blue-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Shelters Count
                </p>
                <motion.h3
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                >
                  {totalShelters}
                </motion.h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                  ● District Facilities Registered
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Home className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card glow glowColor="green" className="border-l-4 border-l-emerald-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Available Rescue Teams
                </p>
                <motion.h3
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                >
                  {availableTeams}
                </motion.h3>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  ● Ready for Emergency Dispatch
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card glow glowColor="red" className="border-l-4 border-l-amber-500">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Low-Stock Relief Items
                </p>
                <motion.h3
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-3xl font-black text-slate-900 dark:text-white mt-1"
                >
                  {lowStockSupplies}
                </motion.h3>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-1">
                  ● &lt; 50 Units Remaining
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Package className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>
      </Reveal>

      {/* District Selector & Search Bar */}
      <Reveal>
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Building2 className="w-4 h-4 text-blue-500" />
              <span>Target District Selection</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search district..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <select
                value={selectedDistrictId}
                onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {filteredDistricts.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.districtId})</option>
                ))}
              </select>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* Action Toast Notification */}
      {actionMessage && (
        <div className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800 dark:text-emerald-300'
            : actionMessage.type === 'info'
            ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 text-sky-800 dark:text-sky-300'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-800 dark:text-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {/* EXCEPTION BANNERS */}
      <AnimatePresence>
        {/* Banner 1: Shelter at Capacity Warning */}
        {hasFullShelter && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/40 text-rose-700 dark:text-rose-300 flex items-center gap-3"
          >
            <AlertOctagon className="w-6 h-6 text-rose-500 shrink-0 animate-bounce" />
            <div className="text-xs">
              <strong className="font-bold text-sm block">EXCEPTION: Shelter Capacity Safeguard Triggered!</strong>
              One or more shelters in this district have reached maximum occupancy (`status=FULL`). Redirect incoming evacuees to secondary facilities.
            </div>
          </motion.div>
        )}

        {/* Banner 2: No Teams Available Warning */}
        {noTeamsAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 flex items-center gap-3"
          >
            <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="text-xs">
              <strong className="font-bold text-sm block font-mono">No Rescue Teams Currently Available</strong>
              All registered rescue units are currently DISPATCHED or RETURNING. Cycle team status when units return to base.
            </div>
          </motion.div>
        )}

        {/* Banner 3: Conflict Detected Warning */}
        {!conflictResolved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-500 shrink-0" />
              <div className="text-xs">
                <strong className="font-bold text-sm block">Conflict Detected — Multi-Agency Coordination Review Needed</strong>
                Overlapping relief supply distributions detected between NGO &amp; Armed Forces units in Sector 2.
              </div>
            </div>
            <Button
              variant="warning"
              size="sm"
              onClick={() => { setConflictResolved(true); setActionMessage({ type: 'success', text: 'Multi-agency resource conflict marked as resolved.' }); }}
            >
              Resolve Conflict
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 1: EMERGENCY SHELTERS */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-500" />
                <span>1. Emergency Shelters ({dashboardData.shelters.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Occupancy capacity safeguards and real-time shelter tracking
              </p>
            </div>
          </div>

          {dashboardData.shelters.length === 0 ? (
            <Card>
              <EmptyState title="No Shelters Registered" description="No emergency shelters have been registered for the selected district yet." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dashboardData.shelters.map((shelter) => {
                const occupancyPercent = Math.min(100, Math.round((shelter.currentOccupancy / shelter.capacity) * 100));
                const isFull = shelter.status === 'FULL' || occupancyPercent >= 100;
                const isNearCapacity = occupancyPercent >= 80 && !isFull;

                const progressBg = isFull ? 'bg-rose-500' : isNearCapacity ? 'bg-amber-500' : 'bg-emerald-500';

                return (
                  <Card key={shelter._id} className="space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {shelter.name}
                          </h4>
                          <span className="font-mono text-xs text-slate-400">
                            {shelter.shelterId} • 📍 {shelter.location}
                          </span>
                        </div>
                        <Badge status={shelter.status}>{shelter.status}</Badge>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                        Owner: {shelter.ownerOrgId?.name || 'N/A'}
                      </p>

                      {/* Animated Occupancy Capacity Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700 dark:text-slate-300">Occupancy Level</span>
                          <span className={isFull ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-slate-900 dark:text-white'}>
                            {shelter.currentOccupancy} / {shelter.capacity} ({occupancyPercent}%)
                          </span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${occupancyPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${progressBg}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit3}
                        onClick={() => {
                          setModalTargetItem(shelter);
                          setNewOccupancy(shelter.currentOccupancy);
                          setActiveModal('updateOccupancy');
                        }}
                      >
                        Update Occupancy
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      {/* SECTION 2: RESCUE TEAMS */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-500" />
                <span>2. Rescue Units &amp; Emergency Teams ({dashboardData.rescueTeams.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Dispatch lifecycle (AVAILABLE → DISPATCHED → RETURNING)
              </p>
            </div>
          </div>

          {dashboardData.rescueTeams.length === 0 ? (
            <Card>
              <EmptyState title="No Rescue Teams Found" description="No military or NGO rescue units registered for this district." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {dashboardData.rescueTeams.map((team) => {
                const isDispatched = team.status === 'DISPATCHED';
                return (
                  <Card key={team._id} className="space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {team.name}
                          </h4>
                          <span className="font-mono text-xs text-slate-400">{team.teamId}</span>
                        </div>
                        <Badge status={team.status}>{team.status}</Badge>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>Location: {team.currentLocation || 'Base Station'}</span>
                        </div>
                        <p>Owner: {team.ownerOrgId?.name || 'N/A'}</p>
                      </div>

                      {/* Dispatched Route Line Animation */}
                      {isDispatched && (
                        <div className="mt-3 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-blue-500 animate-spin" />
                          <span>En route to {team.currentLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Navigation}
                        disabled={team.status !== 'AVAILABLE'}
                        onClick={() => {
                          setModalTargetItem(team);
                          setDispatchLocation('Emergency Sector 4');
                          setActiveModal('dispatchTeam');
                        }}
                      >
                        Dispatch
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={RotateCcw}
                        disabled={team.status === 'AVAILABLE'}
                        onClick={() => handleReturnTeam(team._id)}
                      >
                        Cycle Status
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      {/* SECTION 3: RELIEF SUPPLY INVENTORY */}
      <Reveal>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-500" />
                <span>3. Relief Supply Inventory ({dashboardData.reliefSupplies.length})</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                On-hand stock vs distributed quantities log
              </p>
            </div>
          </div>

          {dashboardData.reliefSupplies.length === 0 ? (
            <Card>
              <EmptyState title="No Relief Stock Logged" description="No relief supply inventory recorded for this district." />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {dashboardData.reliefSupplies.map((supply) => {
                const remaining = supply.quantity - supply.distributedQuantity;
                const distributedPercent = Math.min(100, Math.round((supply.distributedQuantity / supply.quantity) * 100));

                return (
                  <Card key={supply._id} className="space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white">
                            {supply.supplyType}
                          </h4>
                          <span className="font-mono text-xs text-slate-400">{supply.supplyId}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          remaining < 50
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                        }`}>
                          {remaining} Units On-Hand
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                        Owner Org: {supply.ownerOrgId?.name || 'N/A'}
                      </p>

                      {/* Stacked Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>Distributed vs Total</span>
                          <span>{supply.distributedQuantity} / {supply.quantity} ({distributedPercent}%)</span>
                        </div>
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${distributedPercent}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full bg-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <Button
                        variant="success"
                        size="sm"
                        icon={Package}
                        disabled={remaining <= 0}
                        onClick={() => {
                          setModalTargetItem(supply);
                          setDistributionData({
                            supplyId: supply._id,
                            shelterId: dashboardData.shelters[0]?._id || '',
                            quantity: 50
                          });
                          setActiveModal('distributeSupply');
                        }}
                      >
                        Log Distribution
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Reveal>

      {/* ANIMATED MODALS WITH SHAKE VALIDATION */}
      
      {/* Modal 1: Register Shelter */}
      <Modal
        isOpen={activeModal === 'registerShelter'}
        onClose={() => setActiveModal(null)}
        title="Register New Emergency Shelter"
        subtitle="Add a new shelter facility to target district"
      >
        <motion.form
          animate={isFormInvalid ? { x: [0, -8, 8, -8, 0] } : {}}
          transition={{ duration: 0.4 }}
          onSubmit={handleRegisterShelterSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Shelter Facility Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kalutara Secondary Relief Center"
              value={newShelterData.name}
              onChange={(e) => setNewShelterData({ ...newShelterData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Location / Address *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 45 Main Street, Sector 2"
              value={newShelterData.location}
              onChange={(e) => setNewShelterData({ ...newShelterData, location: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Maximum Capacity *
              </label>
              <input
                type="number"
                required
                value={newShelterData.capacity}
                onChange={(e) => setNewShelterData({ ...newShelterData, capacity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Owner Organisation *
              </label>
              <select
                value={newShelterData.ownerOrgId}
                onChange={(e) => setNewShelterData({ ...newShelterData, ownerOrgId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {organisations.map(o => (
                  <option key={o._id} value={o._id}>{o.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Register Facility</Button>
          </div>
        </motion.form>
      </Modal>

      {/* Modal 2: Update Occupancy */}
      <Modal
        isOpen={activeModal === 'updateOccupancy' && !!modalTargetItem}
        onClose={() => setActiveModal(null)}
        title={`Update Occupancy — ${modalTargetItem?.name}`}
        subtitle={`Shelter Capacity Limit: ${modalTargetItem?.capacity}`}
      >
        <motion.form
          animate={isFormInvalid ? { x: [0, -8, 8, -8, 0] } : {}}
          transition={{ duration: 0.4 }}
          onSubmit={handleUpdateOccupancySubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              New Occupant Count *
            </label>
            <input
              type="number"
              min="0"
              value={newOccupancy}
              onChange={(e) => setNewOccupancy(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Entering an occupant count greater than capacity ({modalTargetItem?.capacity}) will trigger the "Shelter at capacity" exception banner.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Save Occupancy</Button>
          </div>
        </motion.form>
      </Modal>

      {/* Modal 3: Dispatch Team */}
      <Modal
        isOpen={activeModal === 'dispatchTeam' && !!modalTargetItem}
        onClose={() => setActiveModal(null)}
        title={`Dispatch Rescue Team — ${modalTargetItem?.name}`}
        subtitle="Set deployment destination and dispatch status"
      >
        <motion.form
          animate={isFormInvalid ? { x: [0, -8, 8, -8, 0] } : {}}
          transition={{ duration: 0.4 }}
          onSubmit={handleDispatchTeamSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Dispatch Destination / Location *
            </label>
            <input
              type="text"
              required
              value={dispatchLocation}
              onChange={(e) => setDispatchLocation(e.target.value)}
              placeholder="e.g. Sector 4 Flood Plain"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="primary">Confirm Dispatch</Button>
          </div>
        </motion.form>
      </Modal>

      {/* Modal 4: Distribute Supply */}
      <Modal
        isOpen={activeModal === 'distributeSupply' && !!modalTargetItem}
        onClose={() => setActiveModal(null)}
        title={`Log Relief Supply Distribution — ${modalTargetItem?.supplyType}`}
        subtitle={`On-Hand Stock Available: ${modalTargetItem ? modalTargetItem.quantity - modalTargetItem.distributedQuantity : 0} units`}
      >
        <motion.form
          animate={isFormInvalid ? { x: [0, -8, 8, -8, 0] } : {}}
          transition={{ duration: 0.4 }}
          onSubmit={handleDistributeSupplySubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Destination Shelter (Optional)
            </label>
            <select
              value={distributionData.shelterId}
              onChange={(e) => setDistributionData({ ...distributionData, shelterId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- Direct Field Distribution --</option>
              {dashboardData.shelters.map(s => (
                <option key={s._id} value={s._id}>{s.name} ({s.currentOccupancy}/{s.capacity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Quantity to Distribute *
            </label>
            <input
              type="number"
              min="1"
              required
              value={distributionData.quantity}
              onChange={(e) => setDistributionData({ ...distributionData, quantity: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Distributing more than remaining stock will be rejected with "Insufficient stock".
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setActiveModal(null)}>Cancel</Button>
            <Button type="submit" variant="success">Confirm Distribution</Button>
          </div>
        </motion.form>
      </Modal>
    </div>
  );
};

export default ResourceDashboardPage;
