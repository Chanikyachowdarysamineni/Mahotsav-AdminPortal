const express = require('express');
const router = express.Router();
const User = require('../models/User');
const College = require('../models/College');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const auth = require('../middleware/auth');

/**
 * GET /api/dashboard/statistics
 * Complete Dashboard Statistics
 * Returns all required metrics for the admin dashboard
 */
router.get('/statistics', auth, async (req, res) => {
  try {
    // 1. Total Users Registered (Students only)
    const totalUsers = await User.countDocuments({ role: 'student' });

    // 2. Total Colleges
    const totalColleges = await College.countDocuments();

    // 3. Total Events
    const totalEvents = await Event.countDocuments({ status: 'active' });

    // 4. Sports Statistics
    const sportsTeamEvents = await Event.countDocuments({ 
      category: 'sports', 
      eventType: 'team',
      status: 'active'
    });
    
    const sportsIndividualEvents = await Event.countDocuments({ 
      category: 'sports', 
      eventType: 'individual',
      status: 'active'
    });

    const sportsParticipants = await Registration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' },
      { $match: { 'eventDetails.category': 'sports' } },
      { $count: 'total' }
    ]);

    // 5. Cultural Statistics
    const culturalTeamEvents = await Event.countDocuments({ 
      category: 'cultural', 
      eventType: 'team',
      status: 'active'
    });
    
    const culturalIndividualEvents = await Event.countDocuments({ 
      category: 'cultural', 
      eventType: 'individual',
      status: 'active'
    });

    const culturalParticipants = await Registration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' },
      { $match: { 'eventDetails.category': 'cultural' } },
      { $count: 'total' }
    ]);

    // 6. Gender-wise Statistics (from Users collection)
    const genderStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const genderBreakdown = {
      male: genderStats.find(g => g._id === 'Male')?.count || 0,
      female: genderStats.find(g => g._id === 'Female')?.count || 0,
      other: genderStats.find(g => g._id === 'Other')?.count || 0
    };

    // 7. College-wise Statistics
    const collegeStats = await User.aggregate([
      { $match: { role: 'student' } },
      { 
        $group: { 
          _id: '$collegeName', 
          registrations: { $sum: 1 }
        } 
      },
      { $sort: { registrations: -1 } }
    ]);

    // Get participant count per college (from registrations)
    const collegeParticipants = await Registration.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $group: {
          _id: '$userDetails.collegeName',
          participants: { $sum: 1 }
        }
      },
      { $sort: { participants: -1 } }
    ]);

    // Merge college registration and participation data
    const collegeWiseData = collegeStats.map(college => {
      const participantData = collegeParticipants.find(p => p._id === college._id);
      return {
        collegeName: college._id,
        registrations: college.registrations,
        participants: participantData?.participants || 0
      };
    });

    // 8. Recent Activity (Last 10 registrations)
    const recentActivity = await Registration.find()
      .populate('userId', 'fullName collegeName mahotsavId')
      .populate('eventId', 'eventName category')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('userId eventId teamName createdAt paymentStatus');

    // 9. Registration Trends by Date (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const registrationTrends = await User.aggregate([
      {
        $match: {
          role: 'student',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 10. Payment Statistics
    const paymentStats = await Registration.aggregate([
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amountPaid' }
        }
      }
    ]);

    const paymentBreakdown = {
      paid: paymentStats.find(p => p._id === 'paid')?.count || 0,
      pending: paymentStats.find(p => p._id === 'pending')?.count || 0,
      failed: paymentStats.find(p => p._id === 'failed')?.count || 0,
      totalRevenue: paymentStats.reduce((sum, p) => sum + (p.totalAmount || 0), 0)
    };

    // 11. Total Registrations (Event Registrations)
    const totalRegistrations = await Registration.countDocuments();

    // Final Response
    res.json({
      success: true,
      data: {
        // Overview
        totalUsers,
        totalColleges,
        totalEvents,
        totalRegistrations,

        // Sports
        sports: {
          teamEvents: sportsTeamEvents,
          individualEvents: sportsIndividualEvents,
          totalParticipants: sportsParticipants[0]?.total || 0
        },

        // Cultural
        cultural: {
          teamEvents: culturalTeamEvents,
          individualEvents: culturalIndividualEvents,
          totalParticipants: culturalParticipants[0]?.total || 0
        },

        // Gender Breakdown
        gender: genderBreakdown,

        // College-wise Data
        colleges: collegeWiseData,

        // Payment Stats
        payment: paymentBreakdown,

        // Activity
        recentActivity: recentActivity.map(activity => ({
          id: activity._id,
          userName: activity.userId?.fullName,
          mahotsavId: activity.userId?.mahotsavId,
          collegeName: activity.userId?.collegeName,
          eventName: activity.eventId?.eventName,
          category: activity.eventId?.category,
          teamName: activity.teamName,
          paymentStatus: activity.paymentStatus,
          registeredAt: activity.createdAt
        })),

        // Trends
        registrationTrends: registrationTrends.map(trend => ({
          date: trend._id,
          count: trend.count
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message 
    });
  }
});

/**
 * GET /api/dashboard/quick-stats
 * Quick Stats for Dashboard Cards
 */
router.get('/quick-stats', auth, async (req, res) => {
  try {
    const [totalUsers, totalColleges, totalEvents, totalRegistrations] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      College.countDocuments(),
      Event.countDocuments({ status: 'active' }),
      Registration.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalColleges,
        totalEvents,
        totalRegistrations
      }
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch quick stats',
      error: error.message 
    });
  }
});

/**
 * GET /api/dashboard/event-stats
 * Event-specific Statistics
 */
router.get('/event-stats', auth, async (req, res) => {
  try {
    const eventStats = await Event.aggregate([
      { $match: { status: 'active' } },
      {
        $lookup: {
          from: 'registrations',
          localField: '_id',
          foreignField: 'eventId',
          as: 'registrations'
        }
      },
      {
        $project: {
          eventName: 1,
          category: 1,
          eventType: 1,
          maxTeamSize: 1,
          totalRegistrations: { $size: '$registrations' },
          paidRegistrations: {
            $size: {
              $filter: {
                input: '$registrations',
                as: 'reg',
                cond: { $eq: ['$$reg.paymentStatus', 'paid'] }
              }
            }
          }
        }
      },
      { $sort: { totalRegistrations: -1 } }
    ]);

    res.json({
      success: true,
      data: eventStats
    });
  } catch (error) {
    console.error('Event stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch event stats',
      error: error.message 
    });
  }
});

module.exports = router;
