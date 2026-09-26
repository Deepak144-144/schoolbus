export interface BusPosition {
  id: string;
  busNumber: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  timestamp: number;
  status: "moving" | "stopped";
  isDemo: boolean;
  lastUpdate?: Date;
}

export interface BusInfo {
  id: string;
  busNumber: string;
  registrationNumber: string;
  capacity: number;
  status: string;
  driverName: string;
  driverPhone: string;
  routeName: string;
  currentStop: string;
  nextStop: string;
  eta: number;
  distance: number;
  studentsOnboard: number;
  totalStops: number;
  completedStops: number;
}

export interface ChildInfo {
  id: string;
  name: string;
  class: string;
  section: string;
  busNumber: string;
  pickupStop: string;
  dropoffStop: string;
  pickupTime: string;
  expectedArrival: string;
  studentId: string;
}

export interface RouteStop {
  id: string;
  stopName: string;
  lat: number;
  lng: number;
  estimatedTime: string | null;
  stopOrder: number;
  isPickup: boolean;
  isDropoff: boolean;
}

export interface RouteInfo {
  id: string;
  routeName: string;
  schoolName: string;
  schoolLat: number;
  schoolLng: number;
  stops: RouteStop[];
  buses: BusInfo[];
}

export type ChildSafetyStatus =
  | "waiting"
  | "approaching"
  | "boarded"
  | "arrived_school"
  | "returning"
  | "dropped_off"
  | "emergency";

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  licenseInfo: string;
  status: string;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  timestamp: Date;
  relatedBusId?: string;
  relatedTripId?: string;
}

export interface EmergencyAlertData {
  id: string;
  busId: string;
  busNumber: string;
  driverId: string;
  driverName: string;
  latitude: number;
  longitude: number;
  message: string;
  status: "active" | "acknowledged" | "resolved";
  timestamp: Date;
}

export interface DemoBusRoute {
  stops: Array<{
    stopName: string;
    lat: number;
    lng: number;
    estimatedTime: string | null;
    studentsToPick: number;
  }>;
}

export const DEMO_ROUTES: Record<string, DemoBusRoute> = {
  "route-1": {
    stops: [
      { stopName: "Greenwood Elementary School", lat: 40.7580, lng: -73.9855, estimatedTime: "14:00", studentsToPick: -30 },
      { stopName: "124 Maple Street", lat: 40.7505, lng: -73.9934, estimatedTime: "14:03", studentsToPick: 3 },
      { stopName: "89 Oak Avenue", lat: 40.7484, lng: -73.9857, estimatedTime: "14:06", studentsToPick: 2 },
      { stopName: "45 Pine Road", lat: 40.7549, lng: -73.9788, estimatedTime: "14:09", studentsToPick: 4 },
      { stopName: "200 Cedar Lane", lat: 40.7505, lng: -73.9834, estimatedTime: "14:12", studentsToPick: 2 },
      { stopName: "77 Birch Drive", lat: 40.7484, lng: -73.9907, estimatedTime: "14:15", studentsToPick: 3 },
      { stopName: "Greenwood Elementary School", lat: 40.7580, lng: -73.9855, estimatedTime: "14:18", studentsToPick: -15 },
    ],
  },
};
