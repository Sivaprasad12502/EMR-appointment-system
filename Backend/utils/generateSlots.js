const generateSlots = (start, end, duration, breaks = []) => {
  const slots = [];

  let startTime = new Date(`1970-01-01T${start}:00`);
  const endTime = new Date(`1970-01-01T${end}:00`);

  const isInBreakTime = (slotTime) => {
    if (!breaks || breaks.length === 0) return false;

    const slotMinutes = slotTime.getHours() * 60 + slotTime.getMinutes();

    return breaks.some((breakPeriod) => {
      const [breakStartHour, breakStartMin] = breakPeriod.start
        .split(":")
        .map(Number);
      const [breakEndHour, breakEndMin] = breakPeriod.end
        .split(":")
        .map(Number);

      const breakStartMinutes = breakStartHour * 60 + breakStartMin;
      const breakEndMinutes = breakEndHour * 60 + breakEndMin;

      return slotMinutes >= breakStartMinutes && slotMinutes < breakEndMinutes;
    });
  };

  while (startTime < endTime) {
    if (!isInBreakTime(startTime)) {
      const timeString = startTime.toTimeString().slice(0, 5);
      slots.push(timeString);
    }

    startTime.setMinutes(startTime.getMinutes() + duration);
  }

  return slots;
};

module.exports = generateSlots;
