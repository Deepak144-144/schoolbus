import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit"
import { notificationSchema } from "@/lib/validation"
import { handleApiError, ApiError } from "@/lib/api-error"
import { getAuthUser } from "@/lib/auth/api-auth"

async function callEdgeFunction(body: any) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notifications`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req)

    const { searchParams } = new URL(req.url)
    const unreadOnly = searchParams.get("unreadOnly") === "true"

    let query = supabaseAdmin
      .from('Notification')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(100)

    if (unreadOnly) query = query.eq('readStatus', false)

    const { data: notifications, error } = await query

    if (error) throw error

    return NextResponse.json({ notifications })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req, 'ADMIN')

    const body = await req.json()
    
    // Validate input
    const validation = notificationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { userId, title, message, type, relatedBusId, relatedTripId } = validation.data

    const { data: notification, error } = await supabaseAdmin
      .from('Notification')
      .insert({
        userId,
        title,
        message,
        type: type || "GENERAL",
        relatedBusId,
        relatedTripId,
        readStatus: false,
      })
      .select()
      .single()

    if (error) throw error

    await callEdgeFunction({
      action: 'send',
      userId,
      title,
      message,
      type,
      relatedBusId,
      relatedTripId,
    })

    return NextResponse.json({ notification })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req)

    const { searchParams } = new URL(req.url)
    const markAll = searchParams.get("markAll") === "true"
    const notificationId = searchParams.get("id")

    if (markAll) {
      const { error } = await supabaseAdmin
        .from('Notification')
        .update({ readStatus: true })
        .eq('userId', user.id)
        .eq('readStatus', false)

      if (error) throw error
    } else if (notificationId) {
      const { error } = await supabaseAdmin
        .from('Notification')
        .update({ readStatus: true })
        .eq('id', notificationId)
        .eq('userId', user.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}