import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { registerSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/api-error'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, password, name, phone, role, schoolId } = validation.data

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from('User')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
        schoolId,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 400 }
      )
    }

    const user = authData.user

    const { error: profileError } = await supabaseAdmin
      .from('User')
      .insert({
        id: user.id,
        email: user.email!,
        name,
        phone,
        role,
        password: '',
      })

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    if (role === 'PARENT') {
      await supabaseAdmin.from('Parent').insert({ userId: user.id })
    } else if (role === 'DRIVER') {
      await supabaseAdmin.from('Driver').insert({ userId: user.id, schoolId: schoolId || '' })
    } else if (role === 'ADMIN') {
      await supabaseAdmin.from('Admin').insert({ userId: user.id, schoolId: schoolId || '' })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name,
        email,
        role,
        phone,
        schoolId,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}