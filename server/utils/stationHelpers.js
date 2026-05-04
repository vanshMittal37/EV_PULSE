/**
 * Checks if a station should be open based on its schedule and 24/7 setting
 * @param {Object} user - The user/vendor object
 * @returns {string} - 'Active' or 'Offline'
 */
const getScheduledStatus = (user) => {
  // If explicitly in Maintenance, that takes priority
  if (user.stationStatus === 'Maintenance') return 'Maintenance';

  if (user.is24x7) return 'Active';

  if (!user.schedule) return 'Active'; // Fallback if no schedule set

  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const schedule = user.schedule instanceof Map ? Object.fromEntries(user.schedule) : user.schedule;
  
  const todaySchedule = schedule[currentDay];

  if (!todaySchedule || !todaySchedule.open || !todaySchedule.close) {
    return 'Active'; // Default to active if schedule is missing for the day
  }

  const [openH, openM] = todaySchedule.open.split(':').map(Number);
  const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  if (currentTime >= openTime && currentTime < closeTime) {
    return 'Active';
  }

  return 'Offline';
};

module.exports = { getScheduledStatus };
