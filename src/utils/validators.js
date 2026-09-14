export const isValidId = (id) =>
  typeof id === "string" && id.trim().length === 36;

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
