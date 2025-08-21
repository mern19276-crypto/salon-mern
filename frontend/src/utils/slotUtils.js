// src/utils/slotUtils.js

export const timeStringToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTimeString = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const durationToMinutes = (durationStr) => {
  const parts = durationStr.split(" ");
  let minutes = 0;
  for (let i = 0; i < parts.length; i += 2) {
    const val = parseInt(parts[i]);
    const unit = parts[i + 1].toLowerCase();
    if (unit.includes("hour")) minutes += val * 60;
    else if (unit.includes("min")) minutes += val;
  }
  return minutes;
};

export const computeEndTime = (startTime, duration) => {
  const startMins = timeStringToMinutes(startTime);
  const endMins = startMins + duration;
  return minutesToTimeString(endMins);
};

// ✅ Used in SelectTimePage: groups adjacent unbooked slots to form a valid duration
export const filterMatchingSlots = (rawSlots, serviceDuration) => {
  const serviceMins = durationToMinutes(serviceDuration);
  const filtered = [];

  const slots = rawSlots
    .map((s) => ({
      ...s,
      startMins: timeStringToMinutes(s.startTime),
      endMins: timeStringToMinutes(s.endTime),
    }))
    .sort((a, b) => a.startMins - b.startMins);

  for (let i = 0; i < slots.length; i++) {
    let combined = [];
    let totalDuration = 0;
    let j = i;

    while (j < slots.length) {
      const current = slots[j];

      if (combined.length === 0) {
        combined.push(current);
        totalDuration += current.endMins - current.startMins;
      } else {
        const prev = combined[combined.length - 1];
        const gap = current.startMins - prev.endMins;

        if (gap === 0 && !current.isBooked) {
          combined.push(current);
          totalDuration += current.endMins - current.startMins;
        } else {
          break;
        }
      }

      if (totalDuration >= serviceMins) {
        break;
      }

      j++;
    }

    if (totalDuration >= serviceMins) {
      const anyBooked = combined.some((s) => s.isBooked);

      filtered.push({
        _id: combined.map((s) => s._id).join("_"),
        startTime: minutesToTimeString(combined[0].startMins),
        endTime: minutesToTimeString(combined[0].startMins + totalDuration),
        slotIds: combined.map((s) => s._id),
        isBooked: anyBooked,
      });
    }
  }

  return filtered;
};
