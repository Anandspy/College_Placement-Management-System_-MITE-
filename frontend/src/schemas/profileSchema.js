import { z } from 'zod';

export const profileSchema = z.object({
  phone: z
    .string()
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits')
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  
  dateOfBirth: z.string().optional().or(z.literal('')),
  
  gender: z.enum(['Male', 'Female', 'Other', ''], {
    errorMap: () => ({ message: 'Please select a valid gender' }),
  }),
  
  address: z.string().min(5, 'Address is too short').max(300, 'Address is too long').optional().or(z.literal('')),
  
  // Academic Details
  tenthPercentage: z.coerce
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100')
    .optional(),
  
  tenthBoard: z.string().optional().or(z.literal('')),
  
  tenthPassingYear: z.coerce
    .number()
    .min(2000, 'Year must be 2000 or later')
    .max(new Date().getFullYear(), 'Invalid year')
    .optional(),
  
  twelfthPercentage: z.coerce
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100')
    .optional(),
  
  twelfthBoard: z.string().optional().or(z.literal('')),
  
  twelfthPassingYear: z.coerce
    .number()
    .min(2000, 'Year must be 2000 or later')
    .max(new Date().getFullYear(), 'Invalid year')
    .optional(),
  
  cgpa: z.coerce
    .number()
    .min(0, 'CGPA cannot be negative')
    .max(10, 'CGPA cannot exceed 10')
    .optional(),
  
  backlogs: z.coerce
    .number()
    .min(0, 'Backlogs cannot be negative')
    .default(0),
  
  // Skills & Social
  skills: z.array(z.string()).optional(),
  
  linkedIn: z
    .string()
    .url('Invalid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  
  github: z
    .string()
    .url('Invalid GitHub URL')
    .optional()
    .or(z.literal('')),
});
