/**
 * Utility to format birthdates cleanly regardless of user input format.
 * Examples:
 *  "02022006" -> "02 Feb 2006"
 *  "02/02/2006" -> "02 Feb 2006"
 *  "2006-02-02" -> "02 Feb 2006"
 *  "02 / 02 / 2006" -> "02 Feb 2006"
 */
export function formatBirthdateDisplay(input?: string): string {
  if (!input || !input.trim()) return 'Not Specified';
  const trimmed = input.trim();

  // If already formatted with Month name like "02 Feb 2006"
  if (/[a-zA-Z]/.test(trimmed)) {
    return trimmed;
  }

  // Extract all digits
  const digits = trimmed.replace(/\D/g, '');

  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  if (digits.length === 8) {
    if (digits.startsWith('19') || digits.startsWith('20')) {
      // YYYYMMDD
      year = parseInt(digits.slice(0, 4), 10);
      month = parseInt(digits.slice(4, 6), 10);
      day = parseInt(digits.slice(6, 8), 10);
    } else {
      // DDMMYYYY
      day = parseInt(digits.slice(0, 2), 10);
      month = parseInt(digits.slice(2, 4), 10);
      year = parseInt(digits.slice(4, 8), 10);
    }
  } else if (trimmed.includes('/') || trimmed.includes('-') || trimmed.includes('.')) {
    const parts = trimmed.split(/[/.\-\s]+/).filter(Boolean).map((p) => parseInt(p, 10));
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        // YYYY-MM-DD
        year = parts[0];
        month = parts[1];
        day = parts[2];
      } else {
        // DD-MM-YYYY
        day = parts[0];
        month = parts[1];
        year = parts[2];
      }
    }
  }

  const MONTH_NAMES = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  if (
    day !== null &&
    month !== null &&
    year !== null &&
    !isNaN(day) &&
    !isNaN(month) &&
    !isNaN(year) &&
    day >= 1 &&
    day <= 31 &&
    month >= 1 &&
    month <= 12 &&
    year >= 1920 &&
    year <= 2026
  ) {
    const paddedDay = day < 10 ? `0${day}` : `${day}`;
    return `${paddedDay} ${MONTH_NAMES[month - 1]} ${year}`;
  }

  return trimmed;
}

/**
 * Auto-format typed numbers into "DD / MM / YYYY" as the user types in text inputs.
 */
export function formatBirthdateInputMask(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
}
