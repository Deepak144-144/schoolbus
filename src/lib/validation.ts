import { z } from 'zod'

// Common validation schemas
export const emailSchema = z.string().email('Invalid email format').max(255)
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').max(20)
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128)
export const nameSchema = z.string().min(1, 'Name is required').max(100).regex(/^[a-zA-Z\s'-]+$/, 'Invalid name format')
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Role validation
export const roleSchema = z.enum(['ADMIN', 'DRIVER', 'PARENT'])
export const driverStatusSchema = z.enum(['OFFLINE', 'AVAILABLE', 'ON_ROUTE', 'ON_BREAK'])
export const busStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE'])
export const tripStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'CANCELLED'])
export const attendanceStatusSchema = z.enum(['WAITING', 'BOARDED', 'DROPPED_OFF', 'ABSENT'])
export const notificationTypeSchema = z.enum(['GENERAL', 'ROUTE_STARTED', 'ROUTE_COMPLETED', 'BOARDED', 'DROPPED_OFF', 'EMERGENCY', 'DELAY'])
export const emergencyStatusSchema = z.enum(['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED'])

// School validation
export const schoolSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// Bus validation
export const busSchema = z.object({
  busNumber: z.string().min(1).max(20),
  registrationNumber: z.string().min(1).max(50),
  capacity: z.number().int().positive().max(100),
  routeId: uuidSchema.optional(),
  driverId: uuidSchema.optional(),
})

// Route validation
export const routeSchema = z.object({
  routeName: z.string().min(1).max(100),
  school: z.string().min(1).max(200),
  schoolLat: z.number().min(-90).max(90),
  schoolLng: z.number().min(-180).max(180),
  schoolId: uuidSchema.optional(),
})

// Stop validation
export const stopSchema = z.object({
  stopName: z.string().min(1).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  estimatedTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  stopOrder: z.number().int().positive(),
})

// Student validation
export const studentSchema = z.object({
  name: nameSchema,
  studentId: z.string().min(1).max(50),
  class: z.string().min(1).max(20),
  section: z.string().min(1).max(10),
  parentId: uuidSchema,
  busId: uuidSchema.optional(),
  pickupStopId: uuidSchema.optional(),
  dropoffStopId: uuidSchema.optional(),
})

// Driver validation
export const driverSchema = z.object({
  licenseInfo: z.string().min(1).max(100),
  status: driverStatusSchema,
  schoolId: uuidSchema,
  assignedBusId: uuidSchema.optional(),
})

// Login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  schoolId: uuidSchema.optional(),
})

// Register validation
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  phone: phoneSchema.optional(),
  role: roleSchema,
  schoolId: uuidSchema.optional(),
})

// GPS validation
export const gpsSchema = z.object({
  busId: uuidSchema,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speed: z.number().min(0).max(200).optional(),
  heading: z.number().min(0).max(360).optional(),
  tripId: uuidSchema.optional(),
})

// Emergency validation
export const emergencySchema = z.object({
  busId: uuidSchema,
  driverId: uuidSchema,
  tripId: uuidSchema.optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  message: z.string().max(500).optional(),
})

// Notification validation
export const notificationSchema = z.object({
  userId: uuidSchema,
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: notificationTypeSchema.optional(),
  relatedBusId: uuidSchema.optional(),
  relatedTripId: uuidSchema.optional(),
})

// Sanitization helpers
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`) }
}