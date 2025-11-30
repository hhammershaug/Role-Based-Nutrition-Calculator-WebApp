export const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  const minLength = 8;
  const minUniqueChars = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const uniqueChars = new Set(password).size;

  if (password.length < minLength) {
    errors.push(`Passordet må være minst ${minLength} tegn langt.`);
  }

  if (uniqueChars < minUniqueChars) {
    errors.push(`Passordet må inneholde minst ${minUniqueChars} unike tegn.`);
  }

  if (!hasUpperCase) {
    errors.push("Passordet må inneholde minst en stor bokstav.");
  }

  if (!hasLowerCase) {
    errors.push("Passordet må inneholde minst en liten bokstav.");
  }

  if (!hasNumber) {
    errors.push("Passordet må inneholde minst ett tall.");
  }

  if (!hasSpecialChar) {
    errors.push("Passordet må inneholde minst ett spesialtegn.");
  }

  return errors;
};
