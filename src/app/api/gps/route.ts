import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit"
import { gpsSchema } from "@/lib/validation"
import { handleApiError, ApiError } from "@/lib/api-error"
import { getAuthUser } from "@/lib/auth/api-auth"

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req, 'DRIVER')

    const body = await req.json()
    
    // Validate input
    const validation = gpsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      )
    }

    const { busId, lat, lng, speed, heading, tripId } = validation.data

    // Verify driver owns this bus
    const { data: driver } = await supabaseAdmin
      .from('Driver')
      .select('id, assignedBusId')
      .eq('userId', user.id)
      .single()

    if (!driver || driver.assignedBusId !== busId) {
      throw new ApiError('Unauthorized: Bus not assigned to you', 403)
    }

    const { data: gpsLocation, error } = await supabaseAdmin
      .from('GpsLocation')
      .insert({
        busId,
        tripId,
        latitude: lat,
        longitude: lng,
        speed: speed || 0,
        heading: heading || 0,
        accuracy: 5.0,
      })
      .select()
      .single()

    if (error) throw error

    await supabaseAdmin
      .from('Bus')
      .update({
        currentLat: lat,
        currentLng: lng,
        currentSpeed: speed || 0,
        lastGpsUpdate: new Date().toISOString(),
      })
      .eq('id', busId)

    return NextResponse.json({ success: true, id: gpsLocation.id })
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
    const busId = searchParams.get("busId")
    const recent = searchParams.get("recent") === "true"

    if (recent && busId) {
      // Verify access
      if (user.role === 'DRIVER') {
        const { data: driver } = await supabaseAdmin
          .from('Driver')
          .select('assignedBusId')
          .eq('userId', user.id)
          .single()
        if (driver?.assignedBusId !== busId) {
          throw new ApiError('Unauthorized', 403)
        }
      }

      const { data: location, error } = await supabaseAdmin
        .from('GpsLocation')
        .select('*')
        .eq('busId', busId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return NextResponse.json({ location })
    }

    let query = supabaseAdmin
      .from('GpsLocation')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100)

    if (busId) query = query.eq('busId', busId)

    const { data: locations, error } = await query

    if (error) throw error

    return NextResponse.json({ locations })
  } catch (error) {
    return handleApiError(error)
  }
}