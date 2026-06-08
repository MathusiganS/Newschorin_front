const SRI_LANKA_TIME_ZONE = "Asia/Colombo";

export function formatSriLankaDate(
  date: string,
  options: Intl.DateTimeFormatOptions
) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleString("ta-LK", {
    ...options,
    timeZone: SRI_LANKA_TIME_ZONE,
  });
}

export function sriLankaTimeValue(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}
