const express = require('express');
const router = express.Router();
const controller = require('./resource-coordination.controller');

// Resource Dashboard route
router.get('/resource-dashboard/:districtId', controller.getResourceDashboard);

// Shelter routes
router.post('/shelters', controller.registerShelter);
router.patch('/shelters/:id/occupancy', controller.updateShelterOccupancy);

// Rescue Team routes
router.get('/rescue-teams', controller.getRescueTeams);
router.patch('/rescue-teams/:id/dispatch', controller.dispatchRescueTeam);
router.patch('/rescue-teams/:id/return', controller.returnRescueTeam);

// Relief Supply routes
router.post('/relief-supplies/distribute', controller.distributeReliefSupply);

module.exports = router;
