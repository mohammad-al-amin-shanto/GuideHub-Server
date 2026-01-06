export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;

export const BOOKING_TRANSITIONS: Record<
  (typeof BOOKING_STATUSES)[number],
  readonly (typeof BOOKING_STATUSES)[number][]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
