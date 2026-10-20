// Client-side rules mirror the server's validators so users get instant
// feedback. The server still validates everything independently.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const rules = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 60, message: 'Name must be at most 60 characters' },
  },
  email: {
    required: 'Email is required',
    pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address' },
  },
  loginPassword: {
    required: 'Password is required',
  },
  newPassword: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
    maxLength: { value: 128, message: 'Password is too long' },
    validate: {
      letter: (v) => /[A-Za-z]/.test(v) || 'Include at least one letter',
      number: (v) => /\d/.test(v) || 'Include at least one number',
    },
  },
};
