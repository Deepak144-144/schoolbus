import { prisma } from "@/lib/prisma";
import { getSchoolCookie } from "@/lib/school/cookies";
import { redirect } from "next/navigation";

export default async function SelectSchoolPage() {
  const selectedSchoolId = await getSchoolCookie();

  if (selectedSchoolId) {
    const school = await prisma.school.findUnique({ where: { id: selectedSchoolId } });
    if (school) {
      redirect("/auth/login");
    }
  }

  const schools = await prisma.school.findMany({
    orderBy: { name: "asc" },
    include: { owner: { include: { user: true } } },
  });

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <title>Select Your School | SafeRide School</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased font-sans">
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-10">
              <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">SR</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
                Select Your School
              </h1>
              <p className="text-lg text-secondary max-w-2xl mx-auto">
                Choose your school to continue to SafeRide
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <a
                  key={school.id}
                  href={`/auth/login?schoolId=${school.id}`}
                  className="block p-6 border-2 border-border/30 rounded-xl hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary mb-1">{school.name}</h3>
                      {school.latitude && school.longitude && (
                        <p className="text-sm text-secondary">
                          {school.latitude.toFixed(4)}, {school.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))}

              {schools.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-secondary mb-4">No schools configured yet.</p>
                  <a href="/auth/login" className="text-accent hover:underline">
                    Continue without school selection
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}