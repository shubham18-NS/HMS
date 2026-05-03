const parseTime = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
};

export const generateSlots = (availability = [], existingAppointments = [], intervalMinutes = 30) => {
  const booked = new Set(
    existingAppointments.map((appointment) => `${appointment.date.toISOString().slice(0, 10)}-${appointment.timeSlot.start}`)
  );

  return availability.flatMap((slot) => {
    const start = parseTime(slot.startTime);
    const end = parseTime(slot.endTime);
    const slots = [];

    for (let current = start; current + intervalMinutes <= end; current += intervalMinutes) {
      const startTime = formatTime(current);
      const endTime = formatTime(current + intervalMinutes);
      const key = `${slot.date}-${startTime}`;
      if (!booked.has(key)) {
        slots.push({
          date: slot.date,
          startTime,
          endTime,
          label: `${startTime} - ${endTime}`,
        });
      }
    }

    return slots;
  });
};
