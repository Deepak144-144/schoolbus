import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { LandingHeader, LandingFooter } from "@/components/layout/LandingHeader";
import {
  Bus,
  Shield,
  Bell,
  Map,
  Users,
  Smartphone,
  CheckCircle,
  Truck,
  Route,
  Eye,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <main className="pt-16">
        <section className="py-20 px-4 sm:px-6 text-center mx-auto max-w-5xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 max-w-4xl mx-auto">
            Know Where Your Child Is.
            <br />
            Every Step of the Journey.
          </h1>
          <p className="text-lg text-secondary max-w-3xl mx-auto mb-8">
            A smarter and safer way for schools and parents to stay connected
            with school transportation.
          </p>
          <p className="text-sm text-secondary mb-10 font-medium">
            Safe Journeys. Connected Families.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/select-school">
              <Button size="lg" variant="primary" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Link href="/select-school">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-2">
              How SafeRide Works
            </h2>
            <p className="text-center text-secondary mb-12 max-w2xl mx-auto">
              Connecting parents, drivers, and schools through smart
              transportation technology.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/30 text-center">
                <CardContent className="pt-6 pb-5 sm:pt-8 sm:pb-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Bus className="h-7 w-7 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    Real-time Bus Tracking
                  </h3>
                  <p className="text-sm text-secondary">
                    Track your child's bus location live on an interactive map.
                    See the bus route, estimated arrival time, and current
                    status.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/30 text-center">
                <CardContent className="pt-6 pb-5 sm:pt-8 sm:pb-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    Child Safety
                  </h3>
                  <p className="text-sm text-secondary">
                    Know when your child boards the bus, arrives at school, and
                    is dropped off. Safety status updates in real time.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border/30 text-center">
                <CardContent className="pt-6 pb-5 sm:pt-8 sm:pb-6">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">
                    Smart Notifications
                  </h3>
                  <p className="text-sm text-secondary">
                    Receive timely alerts when the bus starts its route, is
                    approaching your stop, or your child has boarded.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 bg-card/50">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-2">
              Features for Every User
            </h2>
            <p className="text-center text-secondary mb-12">
              Tailored dashboards for parents, drivers, and administrators.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary">
                    For Parents
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Live bus tracking with ETA</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Child boarding/drop-off notifications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Child safety status dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mobile-first responsive design</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary">
                    For Drivers
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Start/end route with live GPS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Mark student boarding and drop-off</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Emergency alert button</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Report delays and breakdowns</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
                  <h3 className="text-lg sm:text-xl font-semibold text-primary">
                    For Administrators
                  </h3>
                </div>
                <ul className="space-y-2 text-sm text-secondary">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Manage students, buses, and drivers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Fleet tracking on a single map</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Create and manage bus routes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Emergency alert management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-2">
                Real-time GPS Tracking
              </h2>
              <p className="text-center text-secondary mb-8">
                GPS updates every 5–10 seconds while the route is active,
                showing accurate bus location, speed, and heading.
              </p>

              <div className="flex items-center gap-4 justify-center mb-8">
                <Badge className="px-3 py-1" variant="success">
                  <Map className="h-3 w-3 mr-1" />
                  Interactive map
                </Badge>
                <Badge className="px-3 py-1" variant="info">
                  <Eye className="h-3 w-3 mr-1" />
                  DEMO MODE available
                </Badge>
              </div>

              <Card className="border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-primary">
                      Demo Mode
                    </h3>
                    <Badge variant="info">
                      Feature Included
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary">
                    SafeRide School can operate in Demo Mode where simulated
                    GPS movement is generated along predefined routes. This
                    allows full feature demonstration without real GPS hardware.
                    The simulated data can be replaced with real GPS data
                    without modifying the application structure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 bg-primary/5">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-secondary mb-8 max-w-2xl mx-auto">
              Join schools and families who trust SafeRide for safer, smarter
              school transportation.
            </p>
            <Link href="/select-school">
              <Button size="lg" variant="primary">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>

      </main>

      <LandingFooter />
    </>
  );
}

