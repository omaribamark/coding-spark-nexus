const db = require('../config/database');

exports.getUnreadVerdictCount = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('🔔 Get Unread Verdict Count - User:', userId);

    // Count claims that have verdicts but haven't been read
    const result = await db('claims')
      .where('submitted_by', userId)
      .whereNotNull('verdict_date')
      .whereNull('verdict_read_at')
      .count('* as count')
      .first();

    const unreadCount = parseInt(result.count) || 0;
    console.log('✅ Unread verdict count:', unreadCount);

    res.json({
      success: true,
      unreadCount: unreadCount
    });
  } catch (error) {
    console.error('❌ Error getting unread verdict count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get unread verdict count'
    });
  }
};

exports.markVerdictAsRead = async (req, res) => {
  try {
    const { claimId } = req.params;
    const userId = req.user.id;
    console.log('📌 Mark Verdict as Read - User:', userId, 'Claim:', claimId);

    // Verify the claim belongs to the user
    const claim = await db('claims')
      .where({ id: claimId, submitted_by: userId })
      .first();

    if (!claim) {
      console.log('❌ Claim not found or does not belong to user');
      return res.status(404).json({
        success: false,
        error: 'Claim not found'
      });
    }

    // Mark verdict as read - use proper timestamp with timezone
    await db('claims')
      .where({ id: claimId })
      .update({
        verdict_read_at: db.raw("NOW() AT TIME ZONE 'Africa/Nairobi'"),
        verdict_notified: true
      });

    console.log('✅ Verdict marked as read successfully');

    res.json({
      success: true,
      message: 'Verdict marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking verdict as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark verdict as read'
    });
  }
};
