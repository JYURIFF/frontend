import { FormData } from '../types/form';

export interface ValidationRule {
  test: (value: unknown) => boolean;
  message: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

export const validationRules: ValidationRules = {
  name: [
    {
      test: (value: unknown) => typeof value === 'string' && value.trim().length >= 2,
      message: 'Name must be at least 2 characters long'
    }
  ],
  email: [
    {
      test: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
      message: 'Email is required'
    },
    {
      test: (value: unknown) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address'
    }
  ],
  phone: [
    {
      test: (value: unknown) => typeof value === 'string' && value.trim().length > 0,
      message: 'Phone number is required'
    },
    {
      test: (value: unknown) => typeof value === 'string' && /^[\d\s+()-]{10,}$/.test(value.trim()),
      message: 'Please enter a valid phone number'
    }
  ],
  summary: [
    {
      test: (value: unknown) => typeof value === 'string' && value.trim().length >= 50,
      message: 'Professional summary must be at least 50 characters long'
    },
    {
      test: (value: unknown) => typeof value === 'string' && value.trim().length <= 500,
      message: 'Professional summary cannot exceed 500 characters'
    }
  ],
  website: [
    {
      test: (value: unknown) => !value || (typeof value === 'string' && URL_REGEX.test(value)),
      message: 'Please enter a valid website URL'
    }
  ],
  linkedin: [
    {
      test: (value: unknown) => !value || (typeof value === 'string' && URL_REGEX.test(value)),
      message: 'Please enter a valid LinkedIn profile URL'
    }
  ],
  github: [
    {
      test: (value: unknown) => !value || (typeof value === 'string' && URL_REGEX.test(value)),
      message: 'Please enter a valid GitHub profile URL'
    }
  ],
  photo: [
    {
      test: (value: unknown) => !value || typeof value === 'string',
      message: 'Photo must be a valid data URL'
    }
  ]
};

// Validate experience when it's a multi-line string
const validateWorkExperience = (experienceStr: string): string | null => {
  if (!experienceStr || experienceStr.trim().length < 50) {
    return 'Work experience should be descriptive (about 50+ characters)';
  }
  return null;
};

// Education is an object with optional primary/secondary/tertiary fields
const validateEducation = (educationObj: unknown): string | null => {
  if (!educationObj || typeof educationObj !== 'object') return null;
  const obj = educationObj as Record<string, unknown>;
  const fields = ['primary', 'secondary', 'tertiary'];
  for (const f of fields) {
    const val = obj[f];
    if (val && String(val).trim().length < 5) {
      return `${f} education entry is too short`;
    }
  }
  return null;
};

export const validateField = (field: string, value: unknown): string | null => {
  // Handle experience as a string
  if (field === 'experience' && typeof value === 'string') {
    return validateWorkExperience(value);
  }

  // Handle education as an object
  if (field === 'education') {
    return validateEducation(value);
  }

  // Handle regular fields
  const rules = validationRules[field];
  if (!rules) return null;

  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message;
    }
  }

  return null;
};

export const validateForm = (formData: FormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validate regular fields
  Object.keys(validationRules).forEach(field => {
    if (field in formData) {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  // Validate experience (string)
  if (formData.experience) {
    const error = validateField('experience', formData.experience);
    if (error) {
      errors['experience'] = error;
    }
  }

  // Validate education (object with optional keys)
  if (formData.education && Object.keys(formData.education).length > 0) {
    const error = validateField('education', formData.education);
    if (error) {
      errors['education'] = error;
    }
  }

  return errors;
};