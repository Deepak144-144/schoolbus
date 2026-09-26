import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit"
import { emergencySchema } from "@/lib/validation"
import { handleApiError, ApiError } from "@/lib/api-error"
import { getAuthUser } from "@/lib/auth/api-auth"

async function callEdgeFunction(functionName: string, body: any) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/${functionName}`
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

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req, 'DRIVER')

    const body = await req.json()
    
    // Validate input
    const validation = emergencySchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { busId, driverId, tripId, latitude, longitude, message } = validation.data

    const { data: driver } = await supabaseAdmin
      .from('Driver')
      .select('*, user:User(*), assignedBus:Bus(*)')
      .eq('userId', user.id)
      .single()

    if (!driver) {
      throw new ApiError('Driver not found', 404)
    }

    const actualBusId = busId || driver.assignedBusId

    if (!actualBusId) {
      throw new ApiError('No bus assigned', 400)
    }

    const { data: alert, error } = await supabaseAdmin
      .from('EmergencyAlert')
      .insert({
        busId: actualBusId,
        driverId: driver.id,
        tripId,
        latitude,
        longitude,
        message: message || "Emergency alert activated",
        status: "ACTIVE",
      })
      .select('*, bus:Bus(*), driver:Driver(user:User(*))')
      .single()

    if (error) throw error

    await supabaseAdmin
      .from('Notification')
      .insert({
        userId: driver.userId,
        title: "Emergency Alert Sent",
        message: "Your emergency alert has been sent to the school and parents.",
        type: "EMERGENCY",
        readStatus: false,
      })

    await callEdgeFunction('emergency-alerts', {
      action: 'create',
      busId: alert.busId,
      driverId: alert.driverId,
      tripId: tripId || null,
      latitude: alert.latitude,
      longitude: alert.longitude,
      message: alert.message,
    })

    const { data: students } = await supabaseAdmin
      .from('Student')
      .select('parent:Parent(userId)')
      .eq('busId', actualBusId)

    if (students) {
      const notifications = students.map((s: any) => ({
        userId: s.parent.userId,
        title: "🚨 EMERGENCY ALERT",
        message: `Bus #${alert.bus.busNumber} has triggered an emergency alert. Bus ${alert.bus.busNumber} - ${alert.driver.user.name}. View live location in the app.`,
        type: "EMERGENCY",
        relatedBusId: alert.busId,
        readStatus: false,
      }))

      await supabaseAdmin.from('Notification').insert(notifications)
    }

    return NextResponse.json({ success: true, alert })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req)

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    let query = supabaseAdmin
      .from('EmergencyAlert')
      .select('*, bus:Bus(*), driver:Driver(user:User(*))')
      .order('createdAt', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data: alerts, error } = await query

    if (error) throw error

    return NextResponse.json({ alerts })
  } catch (error) {
    return handleApiError(error)
  }
}