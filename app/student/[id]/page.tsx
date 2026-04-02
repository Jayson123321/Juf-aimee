import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User, BookOpen, Sparkles, AlertTriangle,
  StickyNote, TrendingUp, Clock,
} from "lucide-react";
import { StudentAnalysis } from "@/app/dashboard/StudentAnalysis";

export const dynamic = "force-dynamic";

export default async function StudentProfilePage({
const BLOOM_LEVELS = [
  { level: 1, label: "Onthouden",  active: "bg-slate-400"  },
  { level: 2, label: "Begrijpen",  active: "bg-blue-400"   },
  { level: 3, label: "Toepassen",  active: "bg-teal-400"   },
  { level: 4, label: "Analyseren", active: "bg-violet-400" },
  { level: 5, label: "Evalueren",  active: "bg-orange-400" },
  { level: 6, label: "Creeren",    active: "bg-rose-400"   },
];

export default async function StudentAnalysePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { profile: true, assignments: true },
  });

  if (!student) notFound();

  const currentBloom = student.bloomNiveau ?? 1;
  const currentBloomLabel =
    BLOOM_LEVELS.find((b) => b.level === currentBloom)?.label ?? "Onthouden";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{student.fullName}</h1>
        <div className="flex items-center gap-3">
          <Button asChild variant="secondary">
            <Link href={`/student/${id}/generate`}>AI opdracht</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/student/${id}/edit`}>Profiel bewerken</Link>
          </Button>
        </div>
      </div>
    <div className="px-8 py-6 w-full space-y-4">

      {/* Row 1: Student info (1/3) + Bloom progress (1/3) + Opdrachten+AI (1/3) */}
      <div className="grid grid-cols-3 gap-4">

        {/* Section 1: Wie is deze leerling? */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
            leerling
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-start gap-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-primary-foreground shrink-0"
                style={{ backgroundColor: "oklch(0.28 0.09 255)" }}
              >
                {student.fullName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{student.fullName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {student.groep ? `Groep ${student.groep}` : "Geen groep"}
                    {student.profile?.currentTeacher
                      ? ` · ${student.profile.currentTeacher}`
                      : ""}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                    Interesses
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    Nog geen interesses ingevoerd door de leraar.
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Bijzonderheden (leraar)
                  </p>
                  <p className="text-sm text-muted-foreground italic">
                    Nog geen bijzonderheden ingevoerd.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Bloom-voortgang */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-4 h-4" />
                Bloom-voortgang
              </CardTitle>
              <Badge variant="outline" className="text-[11px]">
                {currentBloomLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex gap-1 mb-5">
              {BLOOM_LEVELS.map((b) => (
                <div key={b.level} className="flex-1 space-y-1">
                  <div
                    className={`h-2 rounded-full ${
                      b.level <= currentBloom ? b.active : "bg-muted"
                    }`}
                  />
                  <p className="text-[9px] text-center text-muted-foreground font-medium">
                    {b.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <p className="text-sm text-center">Nog geen voortgangsgeschiedenis beschikbaar.</p>
              <p className="text-xs text-center">
                Niveauwijzigingen worden hier bijgehouden zodra ze worden vastgelegd.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 3+4: Opdrachtenhistorie + AI-suggesties stacked */}
        <div className="flex flex-col gap-4">

          {/* Section 3: Opdrachtenhistorie */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="w-4 h-4" />
                Opdrachtenhistorie
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                <Clock className="w-6 h-6" />
                <p className="text-sm">Nog geen opdrachten beschikbaar.</p>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: AI-suggesties */}
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 pt-5 px-6">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="w-4 h-4" />
                AI-suggesties
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <StudentAnalysis studentId={id} />
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Row 3: Signalen (1/2) + Notities (1/2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Section 5: Signalen */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4" />
              Signalen en alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <AlertTriangle className="w-6 h-6" />
              <p className="text-sm">Nog geen signalen geregistreerd.</p>
              <p className="text-xs text-center">
                Hier verschijnen momenten waarop de leerling vastliep, opdrachten oversloeg
                of juist uitzonderlijk goed presteerde.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Notities */}
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-3 pt-5 px-6">
            <CardTitle className="flex items-center gap-2 text-base">
              <StickyNote className="w-4 h-4" />
              Notities van de leraar
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-3">
            <p className="text-xs text-muted-foreground">
              Voeg observaties toe die de AI niet zelf kan weten. Deze notities kunnen
              worden meegenomen als context voor AI-suggesties.
            </p>
            <textarea
              placeholder="Schrijf hier je observaties..."
              className="w-full min-h-[120px] rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <div className="flex justify-end">
              <button className="px-4 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Opslaan
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
