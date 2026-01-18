export function monthKeyFromIsoDate(isoDate: string): string {
  // isoDate: YYYY-MM-DD
  const month = Number(isoDate.split("-")[1]);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[month - 1] ?? "Jan";
}

export function formatIsoDate(isoDate: string): string {
  // Simple display format: YYYY-MM-DD -> MM/DD/YYYY
  const [y, m, d] = isoDate.split("-");
  return `${m}/${d}/${y}`;
}

export function formatDate(dateInput: string | Date) {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (Number.isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}