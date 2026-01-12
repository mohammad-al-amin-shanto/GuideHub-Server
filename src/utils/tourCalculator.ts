type Stop = {
  name: string;
  lat: number;
  lng: number;
  visitTime: number;
};

export function haversine(a: Stop, b: Stop): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export function calculateTourStats(stops: Stop[], city?: string) {
  const cityMultiplierMap: Record<string, number> = {
    Dhaka: 1.6, // Rickshaws, Old City chaos, river crossings
    Tokyo: 1.2, // Ultra-efficient metro, high crowding
    Sydney: 1.15, // Clean roads, light congestion, walkable
    Vancouver: 1.15, // Compact downtown, good transit
    NewYork: 1.35, // Crowds, subway waits, traffic
    Paris: 1.25, // Walkable but busy tourist zones
    Berlin: 1.2, // Very efficient transit, wide roads
    BuenosAires: 1.3, // Busy streets, slower buses
    Rome: 1.35, // Narrow streets, historic congestion
    Cairo: 1.6, // Heavy traffic + old city density
  };

  if (!stops || stops.length === 0) return null;

  let totalKm = 0;
  let visitMinutes = 0;

  for (let i = 0; i < stops.length; i++) {
    visitMinutes += stops[i].visitTime || 30;

    if (i > 0) {
      totalKm += haversine(stops[i - 1], stops[i]);
    }
  }

  const avgSpeed = 8;
  const trafficMultiplier = cityMultiplierMap[city || ""] || 1.5;
  const dailyLimit = 6;

  const travelHours = (totalKm / avgSpeed) * trafficMultiplier;
  const visitHours = visitMinutes / 60;
  const totalHours = travelHours + visitHours;
  const recommendedDays = Math.max(1, Math.ceil(totalHours / dailyLimit));

  return {
    totalKm: Number(totalKm.toFixed(1)),
    travelHours: Number(travelHours.toFixed(1)),
    visitHours: Number(visitHours.toFixed(1)),
    totalHours: Number(totalHours.toFixed(1)),
    recommendedDays,
  };
}
