type ReminderPayload = {
  atIso: string;
  type: string;
};

const reminders = new Map<string, ReminderPayload>();

export async function saveReminder(key: string, payload: ReminderPayload) {
  reminders.set(key, payload);
}

export async function loadReminder(key: string) {
  return reminders.get(key) ?? null;
}

export async function listReminders() {
  return Array.from(reminders.entries()).map(([key, payload]) => ({
    key,
    ...payload
  }));
}
