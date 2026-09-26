import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimit, getRateLimitConfig } from '@/lib/security/rate-limit'
import { loginSchema } from '@/lib/validation'
import { handleApiError, ApiError } from '@/lib/api-error'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const body = await req.json()
    
    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, schoolId } = validation.data

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const user = authData.user

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('User')
      .select('*, parent:Parent(*), driver:Driver(*), admin:Admin(*)')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    let adminSchoolId = profile.admin?.schoolId ?? undefined
    if (schoolId && profile.admin) {
      if (profile.admin.schoolId !== schoolId) {
        return NextResponse.json(
          { error: 'Account not associated with this school' },
          { status: 403 }
        )
      }
      adminSchoolId = schoolId
    }

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
      user_metadata: {
        role: profile.role,
        schoolId: adminSchoolId,
        name: profile.name,
      },
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        schoolId: adminSchoolId,
      },
      session: authData.session,
    })
  } catch (error) {
    return handleApiError(error)
  }
}