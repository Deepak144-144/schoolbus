import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ApiError } from '@/lib/api-error'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  phone?: string
  schoolId?: string
  parent?: { id: string } | null
  driver?: { id: string; licenseInfo?: string | null; status: string; assignedBusId?: string | null } | null
  admin?: { id: string; schoolId?: string | null } | null
}

async function getSupabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: "lax" | "strict" | "none" } }>) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    }
  )
}

export async function getAuthUser(requiredRole?: string | string[]): Promise<AuthUser> {
  const supabase = await getSupabaseServer()
  
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new ApiError('UNAUTHORIZED: Invalid or expired token', 401)
  }

  const { data: profile, error: profileError } = await supabase
    .from('User')
    .select('*, parent:Parent(*), driver:Driver(*), admin:Admin(*)')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new ApiError('UNAUTHORIZED: User profile not found', 401)
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!roles.includes(profile.role)) {
      throw new ApiError(`FORBIDDEN: Requires role ${roles.join(' or ')}`, 403)
    }
  }

  // Check school access for admin routes
  const schoolId = profile.admin?.schoolId || profile.driver?.schoolId || profile.parent?.schoolId
  if (!schoolId && ['ADMIN', 'DRIVER'].includes(profile.role)) {
    throw new ApiError('FORBIDDEN: No school assigned', 403)
  }

  return {
    id: user.id,
    name: profile.name,
    email: profile.email,
    role: profile.role,
    phone: profile.phone,
    schoolId,
    parent: profile.parent,
    driver: profile.driver,
    admin: profile.admin,
  }
}

export function requireRole(...roles: string[]) {
  return async () => getAuthUser(roles)
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await getAuthUser()
  } catch {
    return null
  }
}

// Permission checkers
export function canAccessSchool(user: AuthUser, schoolId: string): boolean {
  return user.role === 'ADMIN' && user.schoolId === schoolId
}

export function canManageBus(user: AuthUser, busId: string): boolean {
  if (user.role === 'ADMIN') return canAccessSchool(user, user.schoolId!)
  if (user.role === 'DRIVER') return user.driver?.assignedBusId === busId
  return false
}

export function canViewStudent(user: AuthUser, studentId: string): Promise<boolean> {
  // Implementation would check if user is parent of student or admin of school
  return Promise.resolve(
    user.role === 'ADMIN' || 
    (user.role === 'PARENT' && user.parent?.id === studentId)
  )
}