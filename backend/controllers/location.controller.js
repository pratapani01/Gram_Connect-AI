const { State, District, Village } = require('../models/Location');
const { asyncHandler } = require('../middleware/error.middleware');

exports.getStates = asyncHandler(async (req, res) => {
  const states = await State.find({ isActive: true }).sort({ name: 1 });
  res.json({ success: true, states });
});

exports.getDistricts = asyncHandler(async (req, res) => {
  const { stateId } = req.params;
  const districts = await District.find({ state: stateId, isActive: true }).sort({ name: 1 });
  res.json({ success: true, districts });
});

exports.getVillages = asyncHandler(async (req, res) => {
  const { districtId } = req.params;
  const villages = await Village.find({ district: districtId, isActive: true }).sort({ name: 1 });
  res.json({ success: true, villages });
});

exports.addState = asyncHandler(async (req, res) => {
  const state = await State.create(req.body);
  res.status(201).json({ success: true, state });
});

exports.addDistrict = asyncHandler(async (req, res) => {
  const district = await District.create(req.body);
  res.status(201).json({ success: true, district });
});

exports.addVillage = asyncHandler(async (req, res) => {
  const village = await Village.create(req.body);
  res.status(201).json({ success: true, village });
});
