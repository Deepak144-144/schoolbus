import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { rateLimit, getRateLimitConfig } from "@/lib/security/rate-limit"
import { handleApiError, ApiError } from "@/lib/api-error"
import { getAuthUser } from "@/lib/auth/api-auth"

async function callEdgeFunction(action: string, body: any) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/gps-simulation`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ action, ...body }),
  })
  return res.json()
}

export async function POST(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req, 'DRIVER')

    const body = await req.json()
    const { busId, routeId } = body

    const { data: driver, error: driverError } = await supabaseAdmin
      .from('Driver')
      .select('*, user:User(*)')
      .eq('userId', user.id)
      .single()

    if (driverError || !driver) {
      throw new ApiError('Driver not found', 404)
    }

    const { data: bus, error: busError } = await supabaseAdmin
      .from('Bus')
      .select('*')
      .eq('id', busId || driver.assignedBusId || '')
      .single()

    if (busError || !bus) {
      throw new ApiError('Bus not found', 404)
    }

    const { data: trip, error: tripError } = await supabaseAdmin
      .from('Trip')
      .insert({
        busId: bus.id,
        driverId: driver.id,
        routeId: routeId || bus.routeId || '',
        status: 'ACTIVE',
        startTime: new Date().toISOString(),
      })
      .select()
      .single()

    if (tripError) throw tripError

    if (process.env.DEMO_MODE === 'true') {
      await callEdgeFunction('start', {
        busId: bus.id,
        busNumber: bus.busNumber,
        schoolId: user.schoolId,
      })
    }

    const { data: parents } = await supabaseAdmin
      .from('Parent')
      .select('userId')

    if (parents) {
      const notifications = parents.map((p: any) => ({
        userId: p.userId,
        title: 'Bus has started its route',
        message: `Bus ${bus.busNumber} has started its route. Driver: ${driver.user?.name || user.name}. ETA to your stop: 8 minutes.`,
        type: 'ROUTE_STARTED',
        relatedBusId: bus.id,
        relatedTripId: trip.id,
        readStatus: false,
      }))

      await supabaseAdmin.from('Notification').insert(notifications)
    }

    return NextResponse.json({ trip })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(req: NextRequest) {
  try {
    const rl = await rateLimit(req, getRateLimitConfig(req.nextUrl.pathname))
    if (rl) return rl

    const user = await getAuthUser(req)

    const body = await req.json()
    const { id, status, endTime } = body

    if (!id || !status) {
      throw new ApiError('Trip ID and status are required', 400)
    }

    const { data: trip, error } = await supabaseAdmin
      .from('Trip')
      .update({
        status,
        ...(endTime ? { endTime: new Date(endTime).toISOString() } : {}),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (status === 'COMPLETED' && process.env.DEMO_MODE === 'true') {
      await callEdgeFunction('stop', { busId: trip.busId })
    }

    return NextResponse.json({ trip })
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
    const busId = searchParams.get('busId')
    const driverId = searchParams.get('driverId')

    let query = supabaseAdmin.from('Trip').select(`
      *,
      bus:Bus(*),
      driver:Driver(user:User(*)),
      route:Route(*)
    `)

    if (busId) query = query.eq('busId', busId)
    if (driverId) query = query.eq('driverId', driverId)
    if (user.role === 'DRIVER') {
      const { data: driver } = await supabaseAdmin
        .from('Driver')
        .select('id')
        .eq('userId', user.id)
        .single()
      if (driver) query = query.eq('driverId', driver.id)
    }

    const { data: trips, error } = await query
      .order('createdAt', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ trips })
  } catch (error) {
    return handleApiError(error)
  }
}