const express = require('express');
const router = express.Router();
const apiResponse = require('../utils/apiResponse');
const { District, RiverBasin, Citizen, Organisation } = require('../models');

router.get('/districts', async (req, res, next) => {
  try {
    const districts = await District.find().populate('riverBasin');
    return apiResponse.success(res, 'Districts retrieved successfully', districts);
  } catch (err) {
    next(err);
  }
});

router.get('/river-basins', async (req, res, next) => {
  try {
    const basins = await RiverBasin.find().populate('districts');
    return apiResponse.success(res, 'River basins retrieved successfully', basins);
  } catch (err) {
    next(err);
  }
});

router.get('/citizens', async (req, res, next) => {
  try {
    const citizens = await Citizen.find().populate('districtId');
    return apiResponse.success(res, 'Citizens retrieved successfully', citizens);
  } catch (err) {
    next(err);
  }
});

router.get('/organisations', async (req, res, next) => {
  try {
    const orgs = await Organisation.find();
    return apiResponse.success(res, 'Organisations retrieved successfully', orgs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
