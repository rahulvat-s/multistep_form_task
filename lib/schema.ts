import { z } from 'zod'

export const FormDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  parentnames: z.string().min(1, 'Parent names are required'),
  phonenumber: z.string().min(1, 'Phone number is required'),
  address: z.string().min(1, 'Address is required'),
})


