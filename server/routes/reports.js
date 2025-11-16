const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Team = require('../models/Team');
const Participant = require('../models/Participant');
const College = require('../models/College');
const EventRegistration = require('../models/EventRegistration');
const auth = require('../middleware/auth');

// Get Overall Statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    const totalAmount = await Registration.aggregate([
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);

    const genderStats = await Registration.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const paymentStats = await Registration.aggregate([
      { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
    ]);

    // Calculate colleges and states (exclude null/empty values)
    const collegesAgg = await Registration.aggregate([
      { $match: { college: { $ne: null, $ne: '' } } },
      { $group: { _id: '$college' } },
      { $count: 'total' }
    ]);
    const totalColleges = collegesAgg[0]?.total || 0;

    const statesAgg = await Registration.aggregate([
      { $match: { state: { $ne: null, $ne: '' } } },
      { $group: { _id: '$state' } },
      { $count: 'total' }
    ]);
    const totalStates = statesAgg[0]?.total || 0;

    // Calculate paid/pending counts and amounts (handle both capitalized and lowercase)
    const paidStats = await Registration.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'Paid'] } } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amountPaid' } } }
    ]);
    const paidCount = paidStats[0]?.count || 0;
    const paidAmount = paidStats[0]?.amount || 0;

    const pendingStats = await Registration.aggregate([
      { $match: { paymentStatus: { $in: ['pending', 'Pending', 'unpaid', 'Unpaid'] } } },
      { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: '$amountPaid' } } }
    ]);
    const pendingCount = pendingStats[0]?.count || 0;
    const pendingAmount = pendingStats[0]?.amount || 0;

    res.json({
      totalRegistrations,
      totalAmount: totalAmount[0]?.total || 0,
      genderStats,
      paymentStats,
      totalColleges,
      totalStates,
      paidCount,
      paidAmount,
      pendingCount,
      pendingAmount
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Gender-based Reports
router.get('/gender-report', auth, async (req, res) => {
  try {
    const genderReport = await Registration.aggregate([
      {
        $group: {
          _id: '$gender',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(genderReport);
  } catch (error) {
    console.error('Gender report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get College-wise Report
router.get('/college-report', auth, async (req, res) => {
  try {
    const collegeReport = await Registration.aggregate([
      {
        $group: {
          _id: '$college',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' },
          states: { $addToSet: '$state' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(collegeReport);
  } catch (error) {
    console.error('College report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get State-wise Report
router.get('/state-report', auth, async (req, res) => {
  try {
    const stateReport = await Registration.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
          colleges: { $addToSet: '$college' },
          totalAmount: { $sum: '$amountPaid' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(stateReport);
  } catch (error) {
    console.error('State report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Event-wise Report
router.get('/event-report', auth, async (req, res) => {
  try {
    const eventReport = await Registration.aggregate([
      { $unwind: '$events' },
      {
        $group: {
          _id: {
            eventId: '$events.eventId',
            eventName: '$events.eventName'
          },
          participantCount: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' }
        }
      },
      { $sort: { participantCount: -1 } }
    ]);

    // Get team counts per event
    const teamCounts = await Team.aggregate([
      {
        $group: {
          _id: '$eventId',
          teamCount: { $sum: 1 }
        }
      }
    ]);

    // Merge the data
    const mergedReport = eventReport.map(event => {
      const teamData = teamCounts.find(t => t._id === event._id.eventId);
      return {
        ...event,
        teamCount: teamData?.teamCount || 0
      };
    });

    res.json(mergedReport);
  } catch (error) {
    console.error('Event report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Team Reports
router.get('/team-report', auth, async (req, res) => {
  try {
    const teams = await Team.find()
      .select('teamId teamName eventName captain members totalMembers college status')
      .sort({ createdAt: -1 });

    res.json(teams);
  } catch (error) {
    console.error('Team report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get All Registrations with Filters
router.get('/registrations', auth, async (req, res) => {
  try {
    const {
      name,
      college,
      state,
      gender,
      paymentStatus,
      event,
      type, // sports | cultural
      page = 1,
      limit = 50
    } = req.query;

    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (college) query.college = { $regex: college, $options: 'i' };
    if (state) query.state = { $regex: state, $options: 'i' };
    if (gender) query.gender = gender;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (event) query['events.eventName'] = { $regex: event, $options: 'i' };

    const skip = (page - 1) * limit;

    // If filtering by type, join with Events to match eventType
    let registrations;
    let total;
    if (type && (type === 'sports' || type === 'cultural')) {
      const pipeline = [
        { $match: query },
        { $unwind: { path: '$events', preserveNullAndEmptyArrays: false } },
        { $lookup: { from: 'events', localField: 'events.eventId', foreignField: 'eventId', as: 'eventInfo' } },
        { $unwind: '$eventInfo' },
        { $match: { 'eventInfo.eventType': type } },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) }
      ];
      const countPipeline = [
        { $match: query },
        { $unwind: { path: '$events', preserveNullAndEmptyArrays: false } },
        { $lookup: { from: 'events', localField: 'events.eventId', foreignField: 'eventId', as: 'eventInfo' } },
        { $unwind: '$eventInfo' },
        { $match: { 'eventInfo.eventType': type } },
        { $count: 'total' }
      ];
      const [result, countResult] = await Promise.all([
        Registration.aggregate(pipeline),
        Registration.aggregate(countPipeline)
      ]);
      registrations = result;
      total = countResult[0]?.total || 0;
    } else {
      registrations = await Registration.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      total = await Registration.countDocuments(query);
    }

    res.json({
      registrations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin metrics: dashboard counters for quick overview
router.get('/admin-metrics', auth, async (req, res) => {
  try {
    const [
      totalRegistrations,
      totalParticipants,
      totalColleges,
      totalEvents
    ] = await Promise.all([
      Registration.countDocuments(),
      Participant.countDocuments(),
      College.countDocuments({ isActive: true }),
      Event.countDocuments()
    ]);

    // Gender counts from registrations
    const genderAgg = await Registration.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);
    const gender = {
      male: genderAgg.find(g => (g._id || '').toLowerCase() === 'male')?.count || 0,
      female: genderAgg.find(g => (g._id || '').toLowerCase() === 'female')?.count || 0,
      other: genderAgg.find(g => (g._id || '').toLowerCase() === 'other')?.count || 0,
    };

    // Sports/Cultural breakdown
    // Teams: use EventRegistration collection by eventType
    // Be tolerant to possible eventType variations in data (e.g., 'culturals')
    const [sportsTeams, culturalTeams] = await Promise.all([
      EventRegistration.countDocuments({ eventType: { $in: ['sports', 'Sport', 'Sports'] } }),
      EventRegistration.countDocuments({ eventType: { $in: ['cultural', 'culturals', 'Cultural', 'Culturals'] } })
    ]);

    // Individuals: registrations joined with events where isTeamEvent=false
    const indivAgg = await Registration.aggregate([
      { $unwind: '$events' },
      { $lookup: { from: 'events', localField: 'events.eventId', foreignField: 'eventId', as: 'eventInfo' } },
      { $unwind: '$eventInfo' },
      { $match: { 'eventInfo.isTeamEvent': false } },
      { $group: { _id: '$eventInfo.eventType', count: { $sum: 1 } } }
    ]);
    const sportsIndividuals = indivAgg.find(x => x._id === 'sports')?.count || 0;
    const culturalIndividuals = indivAgg.find(x => x._id === 'cultural')?.count || 0;

    res.json({
      totals: {
        registrations: totalRegistrations,
        participants: totalParticipants,
        colleges: totalColleges,
        events: totalEvents
      },
      sports: {
        teams: sportsTeams,
        individuals: sportsIndividuals
      },
      cultural: {
        teams: culturalTeams,
        individuals: culturalIndividuals
      },
      gender
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Teams list by type (sports / cultural)
router.get('/teams', auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const q = {};
    if (type === 'sports') q.eventType = { $in: ['sports', 'Sport', 'Sports'] };
    if (type === 'cultural') q.eventType = { $in: ['cultural', 'culturals', 'Cultural', 'Culturals'] };

    const [items, total] = await Promise.all([
      EventRegistration.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      EventRegistration.countDocuments(q)
    ]);
    res.json({ teams: items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Teams list fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Individuals list by type (sports / cultural) using events lookup and isTeamEvent=false
router.get('/individuals', auth, async (req, res) => {
  try {
    const { type, page = 1, limit = 50, name, college, gender, paymentStatus } = req.query;
    const matchReg = {};
    if (name) matchReg.name = { $regex: name, $options: 'i' };
    if (college) matchReg.college = { $regex: college, $options: 'i' };
    if (gender) matchReg.gender = gender;
    if (paymentStatus) matchReg.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: matchReg },
      { $unwind: '$events' },
      { $lookup: { from: 'events', localField: 'events.eventId', foreignField: 'eventId', as: 'eventInfo' } },
      { $unwind: '$eventInfo' },
      { $match: { 'eventInfo.isTeamEvent': false, ...(type ? { 'eventInfo.eventType': type } : {}) } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $project: { name: 1, email: 1, phone: 1, college: 1, gender: 1, amountPaid: 1, paymentStatus: 1, createdAt: 1, event: '$events', eventInfo: '$eventInfo' } }
    ];
    const countPipeline = [
      { $match: matchReg },
      { $unwind: '$events' },
      { $lookup: { from: 'events', localField: 'events.eventId', foreignField: 'eventId', as: 'eventInfo' } },
      { $unwind: '$eventInfo' },
      { $match: { 'eventInfo.isTeamEvent': false, ...(type ? { 'eventInfo.eventType': type } : {}) } },
      { $count: 'total' }
    ];
    const [items, countArr] = await Promise.all([
      Registration.aggregate(pipeline),
      Registration.aggregate(countPipeline)
    ]);

    const total = countArr[0]?.total || 0;
    res.json({ individuals: items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Individuals list fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Colleges summary (participants per college)
router.get('/colleges-summary', auth, async (req, res) => {
  try {
    const { page = 1, limit = 50, college } = req.query;
    const skip = (page - 1) * limit;
    const collegeRegex = college ? { $regex: college, $options: 'i' } : undefined;

    // Participants count per college using 'participants' collection
    const baseMatch = collegeRegex ? { college: collegeRegex } : {};
    const agg = [
      { $match: baseMatch },
      { $group: { _id: '$college', participants: { $sum: 1 } } },
      { $sort: { participants: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ];
    const totalAgg = [
      { $match: baseMatch },
      { $group: { _id: '$college' } },
      { $count: 'total' }
    ];

    const [items, totalArr] = await Promise.all([
      Participant.aggregate(agg),
      Participant.aggregate(totalAgg)
    ]);
    const total = totalArr[0]?.total || 0;
    res.json({ colleges: items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Colleges summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Gender lists (male/female) from registrations
router.get('/gender-list', auth, async (req, res) => {
  try {
    const { gender, page = 1, limit = 50 } = req.query;
    if (!gender) return res.status(400).json({ message: 'gender is required' });
    const normalized = gender.toLowerCase();
    const map = { male: 'Male', female: 'Female', other: 'Other' };
    const g = map[normalized] || gender;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Registration.find({ gender: g }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Registration.countDocuments({ gender: g })
    ]);
    res.json({ registrations: items, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Gender list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Events overview: include team and individual counts per event
router.get('/events-overview', auth, async (req, res) => {
  try {
    const events = await Event.find().lean();

    // Build maps for quicker lookups
    const indivCounts = await Registration.aggregate([
      { $unwind: '$events' },
      { $lookup: { from: 'events', localField: 'events.eventId', foreignField: 'eventId', as: 'eventInfo' } },
      { $unwind: '$eventInfo' },
      { $match: { 'eventInfo.isTeamEvent': false } },
      { $group: { _id: '$events.eventId', count: { $sum: 1 } } }
    ]);
    const indivMap = new Map(indivCounts.map(x => [x._id, x.count]));

    // Team counts from EventRegistration by eventId if present, else by eventName
    const teamCountsByEventId = await EventRegistration.aggregate([
      { $group: { _id: '$eventId', count: { $sum: 1 } } }
    ]);
    const teamMapById = new Map(teamCountsByEventId.filter(x => x._id).map(x => [x._id, x.count]));

    const teamCountsByName = await EventRegistration.aggregate([
      { $group: { _id: '$eventName', count: { $sum: 1 } } }
    ]);
    const teamMapByName = new Map(teamCountsByName.map(x => [x._id, x.count]));

    const merged = events.map(ev => ({
      ...ev,
      teamCount: teamMapById.get(ev.eventId) || teamMapByName.get(ev.eventName || ev.eventSubtype) || 0,
      individualCount: indivMap.get(ev.eventId) || 0,
      category: ev.isTeamEvent ? 'team' : 'individual',
    }));

    res.json(merged);
  } catch (error) {
    console.error('Events overview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Amount Report by Multiple Criteria
router.get('/amount-report', auth, async (req, res) => {
  try {
    const { groupBy = 'gender' } = req.query;

    let groupField;
    switch (groupBy) {
      case 'college':
        groupField = '$college';
        break;
      case 'state':
        groupField = '$state';
        break;
      case 'gender':
        groupField = '$gender';
        break;
      case 'paymentStatus':
        groupField = '$paymentStatus';
        break;
      default:
        groupField = '$gender';
    }

    const amountReport = await Registration.aggregate([
      {
        $group: {
          _id: groupField,
          totalAmount: { $sum: '$amountPaid' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amountPaid' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    res.json(amountReport);
  } catch (error) {
    console.error('Amount report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export data endpoint (will be used by frontend to generate PDF/Excel)
router.get('/export-data', auth, async (req, res) => {
  try {
    const { type } = req.query; // 'all', 'gender', 'college', 'state', 'event', 'team'

    let data;

    switch (type) {
      case 'all':
        data = await Registration.find().select('-__v');
        break;
      case 'gender':
        data = await Registration.aggregate([
          { $group: { _id: '$gender', count: { $sum: 1 }, totalAmount: { $sum: '$amountPaid' } } }
        ]);
        break;
      case 'college':
        data = await Registration.aggregate([
          { $group: { _id: '$college', count: { $sum: 1 }, totalAmount: { $sum: '$amountPaid' } } }
        ]);
        break;
      case 'state':
        data = await Registration.aggregate([
          { $group: { _id: '$state', count: { $sum: 1 }, totalAmount: { $sum: '$amountPaid' } } }
        ]);
        break;
      case 'team':
        data = await Team.find().select('-__v');
        break;
      default:
        data = await Registration.find().select('-__v');
    }

    res.json(data);
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Participants list by college with pagination
router.get('/college-participants', auth, async (req, res) => {
  try {
    const { college, page = 1, limit = 50 } = req.query;
    const q = {};
    if (college) q.college = { $regex: college, $options: 'i' };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Participant.find(q).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Participant.countDocuments(q)
    ]);

    res.json({
      participants: items,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('College participants fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
