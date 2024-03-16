export const validateEmail = (email: string) => {
  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(email);
};

export const sanitizeEmail = (email: string) => {
  return email.toLowerCase().trim();
};
