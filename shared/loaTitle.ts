function twoDigits(value: number) {
  return String(value).padStart(2, "0");
}

export function buildDefaultLoaTitle(employeeFullName: string, date = new Date()) {
  const name = employeeFullName.trim() || "Employee";
  const datePart = `${date.getFullYear()}-${twoDigits(date.getMonth() + 1)}-${twoDigits(date.getDate())}`;
  const timePart = `${twoDigits(date.getHours())}-${twoDigits(date.getMinutes())}`;
  return `${name}_Employment Contract_${datePart}_${timePart}`;
}

export function resolveLoaTitle(input: { currentTitle: string; wasManuallyEdited: boolean; employeeFullName: string; date?: Date }) {
  return input.wasManuallyEdited ? input.currentTitle : buildDefaultLoaTitle(input.employeeFullName, input.date);
}
