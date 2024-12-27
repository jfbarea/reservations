export default function getDateInFourDays(): string {
  const today = new Date();
  const fourDaysFromNow = new Date(today.setDate(today.getDate() + 4));
  const year = fourDaysFromNow.getFullYear();
  const month = String(fourDaysFromNow.getMonth() + 1).padStart(2, '0');
  const day = String(fourDaysFromNow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}