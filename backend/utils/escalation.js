const Complaint = require('../models/Complaint');
const { notifyStatusChange } = require('./notification');

const escalateComplaints = async () => {
  try {
    const escalationDays = parseInt(process.env.ESCALATION_DAYS) || 15;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - escalationDays);

    const complaints = await Complaint.find({
      status: { $in: ['Pending', 'Assigned', 'In Progress'] },
      isEscalated: false,
      createdAt: { $lte: cutoffDate },
    });

    let count = 0;
    for (const complaint of complaints) {
      complaint.status = 'Escalated';
      complaint.isEscalated = true;
      complaint.escalatedAt = new Date();
      complaint.updates.push({
        status: 'Escalated',
        remark: `Automatically escalated after ${escalationDays} days without resolution`,
        updatedBy: null,
      });
      await complaint.save();
      await notifyStatusChange(complaint.citizen, complaint, 'Escalated', '');
      count++;
    }

    console.log(`✅ Escalated ${count} complaints`);
    return count;
  } catch (err) {
    console.error('Escalation error:', err.message);
  }
};

module.exports = { escalateComplaints };
