import { supabase } from '@/lib/supabase/client'

export type BusLocationUpdate = {
  busId: string
  busNumber: string
  lat: number
  lng: number
  speed: number
  heading: number
  timestamp: number
  status: 'moving' | 'stopped'
  isDemo?: boolean
  currentStop?: string
  nextStop?: string
  progress?: number
  completedStops?: number
  totalStops?: number
  eta?: number
  distanceToNext?: number
}

export type StudentBoardedEvent = {
  busId: string
  studentId: string
  studentName: string
  parentId: string
  timestamp: number
}

export type EmergencyAlertEvent = {
  alertId: string
  busId: string
  driverId: string
  latitude: number
  longitude: number
  message?: string
  timestamp: number
}

export type NotificationEvent = {
  userId: string
  title: string
  message: string
  type: string
}

class RealtimeClient {
  private channels: Map<string, ReturnType<typeof supabase.channel>> = new Map()

  subscribeToBusTracking(busId: string, callback: (payload: { new: BusLocationUpdate }) => void) {
    const channelName = `tracking-${busId}`
    if (this.channels.has(channelName)) return

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'bus-location-update' },
        (payload) => callback(payload as any)
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  subscribeToNotifications(userId: string, callback: (payload: { new: NotificationEvent }) => void) {
    const channelName = `notifications-${userId}`
    if (this.channels.has(channelName)) return

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'notification' },
        (payload) => callback(payload as any)
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  subscribeToFleet(schoolId: string, callback: (payload: { new: BusLocationUpdate }) => void) {
    const channelName = `fleet-${schoolId}`
    if (this.channels.has(channelName)) return

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'bus-location-update' },
        (payload) => callback(payload as any)
      )
      .on(
        'broadcast',
        { event: 'emergency-alert' },
        (payload) => callback(payload as any)
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  subscribeToEmergencyAlerts(callback: (payload: { new: EmergencyAlertEvent }) => void) {
    const channelName = 'emergency-alerts'
    if (this.channels.has(channelName)) return

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'emergency-alert' },
        (payload) => callback(payload as any)
      )
      .subscribe()

    this.channels.set(channelName, channel)
  }

  async publishBusLocation(busId: string, data: BusLocationUpdate) {
    const channel = supabase.channel(`tracking-${busId}`)
    await channel.send({
      type: 'broadcast',
      event: 'bus-location-update',
      payload: data
    })
  }

  async publishFleetUpdate(schoolId: string, data: BusLocationUpdate) {
    const channel = supabase.channel(`fleet-${schoolId}`)
    await channel.send({
      type: 'broadcast',
      event: 'bus-location-update',
      payload: data
    })
  }

  async publishStudentBoarded(busId: string, data: StudentBoardedEvent) {
    const channel = supabase.channel(`tracking-${busId}`)
    await channel.send({
      type: 'broadcast',
      event: 'student-boarded',
      payload: data
    })

    const notificationChannel = supabase.channel(`notifications-${data.parentId}`)
    await notificationChannel.send({
      type: 'broadcast',
      event: 'notification',
      payload: {
        userId: data.parentId,
        title: 'Child Boarded',
        message: `${data.studentName} has boarded the bus.`,
        type: 'BOARDED'
      }
    })
  }

  async publishEmergencyAlert(data: EmergencyAlertEvent) {
    const fleetChannel = supabase.channel('fleet-all')
    await fleetChannel.send({
      type: 'broadcast',
      event: 'emergency-alert',
      payload: data
    })

    const emergencyChannel = supabase.channel('emergency-alerts')
    await emergencyChannel.send({
      type: 'broadcast',
      event: 'emergency-alert',
      payload: data
    })
  }

  async publishNotification(userId: string, data: NotificationEvent) {
    const channel = supabase.channel(`notifications-${userId}`)
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: data
    })
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((channel) => supabase.removeChannel(channel))
    this.channels.clear()
  }
}

export const realtime = new RealtimeClient()

export function useBusTracking(busId: string, onUpdate: (data: BusLocationUpdate) => void) {
  if (typeof window === 'undefined') return () => {}

  realtime.subscribeToBusTracking(busId, (payload) => onUpdate(payload.new))

  return () => realtime.unsubscribe(`tracking-${busId}`)
}

export function useNotifications(userId: string, onNotification: (data: NotificationEvent) => void) {
  if (typeof window === 'undefined') return () => {}

  realtime.subscribeToNotifications(userId, (payload) => onNotification(payload.new))

  return () => realtime.unsubscribe(`notifications-${userId}`)
}

export function useFleetTracking(schoolId: string, onUpdate: (data: BusLocationUpdate) => void) {
  if (typeof window === 'undefined') return () => {}

  realtime.subscribeToFleet(schoolId, (payload) => onUpdate(payload.new))

  return () => realtime.unsubscribe(`fleet-${schoolId}`)
}

export function useEmergencyAlerts(onAlert: (data: EmergencyAlertEvent) => void) {
  if (typeof window === 'undefined') return () => {}

  realtime.subscribeToEmergencyAlerts((payload) => onAlert(payload.new))

  return () => realtime.unsubscribe('emergency-alerts')
}