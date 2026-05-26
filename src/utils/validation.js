export const ValidationRules = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'Field ini wajib diisi';
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email tidak valid';
    }
    return null;
  },

  minLength: (min) => (value) => {
    if (!value) return null;
    if (value.length < min) {
      return `Minimal ${min} karakter`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (!value) return null;
    if (value.length > max) {
      return `Maksimal ${max} karakter`;
    }
    return null;
  },

  minNumber: (min) => (value) => {
    if (!value && value !== 0) return null;
    if (Number(value) < min) {
      return `Minimal ${min}`;
    }
    return null;
  },

  maxNumber: (max) => (value) => {
    if (!value && value !== 0) return null;
    if (Number(value) > max) {
      return `Maksimal ${max}`;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value)) {
      return 'Nomor telepon tidak valid';
    }
    return null;
  },

  numeric: (value) => {
    if (!value && value !== 0) return null;
    if (isNaN(value)) {
      return 'Harus berupa angka';
    }
    return null;
  },
};

export function validateForm(data, rules) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];
    const rulesToApply = Array.isArray(fieldRules) ? fieldRules : [fieldRules];

    for (const rule of rulesToApply) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return errors;
}

export function createValidator(rules) {
  return (data) => validateForm(data, rules);
}
