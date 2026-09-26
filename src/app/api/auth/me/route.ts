import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/api-error'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('User')
      .select('*, parent:Parent(*), driver:Driver(*), admin:Admin(*)')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        schoolId: profile.admin?.schoolId,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}