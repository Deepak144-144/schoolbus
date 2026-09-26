export const metadata = {
  title: "Authentication | SafeRide School",
  description: "Sign in to your SafeRide School account or create a new one. Access real-time bus tracking, child safety monitoring, and smart notifications.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
