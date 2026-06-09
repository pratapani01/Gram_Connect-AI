const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, complaint, data }) => {
  try {
    await Notification.create({ recipient, type, title, message, complaint, data });
  } catch (err) {
    console.error('Notification creation failed:', err.message);
  }
};

const notifyComplaintSubmitted = async (citizen, complaint) => {
  await createNotification({
    recipient: citizen._id,
    type: 'complaint_submitted',
    title: 'Complaint Submitted',
    message: `Your complaint "${complaint.title}" has been submitted successfully. Complaint #${complaint.complaintNumber}`,
    complaint: complaint._id,
  });
};

const notifyStatusChange = async (citizenId, complaint, newStatus, remark) => {
  const messages = {
    'Pending': `Your complaint "${complaint.title}" is now pending review.`,
    'In Progress': `Your complaint "${complaint.title}" is now being worked on.`,
    'Resolved': `Your complaint "${complaint.title}" has been resolved!`,
    'Rejected': `Your complaint "${complaint.title}" has been rejected. ${remark ? 'Reason: ' + remark : ''}`,
    'Escalated': `Your complaint "${complaint.title}" has been escalated due to no action.`,
    'Assigned': `Your complaint "${complaint.title}" has been assigned to the Sarpanch.`,
  };

  const types = {
    'Resolved': 'complaint_resolved',
    'Rejected': 'complaint_rejected',
    'Escalated': 'escalated',
  };

  await createNotification({
    recipient: citizenId,
    type: types[newStatus] || 'status_changed',
    title: `Complaint ${newStatus}`,
    message: messages[newStatus] || `Your complaint status changed to ${newStatus}`,
    complaint: complaint._id,
  });
};

const notifyNewComplaint = async (sarpanchId, complaint) => {
  await createNotification({
    recipient: sarpanchId,
    type: 'new_complaint',
    title: 'New Complaint Received',
    message: `New complaint "${complaint.title}" submitted by a citizen in your village. #${complaint.complaintNumber}`,
    complaint: complaint._id,
  });
};

const notifyAdminSarpanchRequest = async (adminId, village, district, state) => {
  await createNotification({
    recipient: adminId,
    type: 'sarpanch_request',
    title: 'New Sarpanch Assignment Request',
    message: `Village "${village.name}", ${district.name}, ${state.name} needs a Sarpanch assignment.`,
  });
};

module.exports = {
  createNotification,
  notifyComplaintSubmitted,
  notifyStatusChange,
  notifyNewComplaint,
  notifyAdminSarpanchRequest,
};
