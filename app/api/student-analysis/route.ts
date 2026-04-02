import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ollama, GEN_MODEL } from "@/lib/ollama"

export async function POST(req: NextRequest) {
  const { studentId } = await req.json()

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 })
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      profile: true,
      assignments: {
        select: { title: true, status: true, bloomLevel: true, bloomNiveau: true, dueDate: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      oppChunks: { select: { tekst: true }, take: 5 },
    },
  })

  if (!student) {
    return NextResponse.json({ error: "Student niet gevonden" }, { status: 404 })
  }

  const pending = student.assignments.filter((a) => a.status === "PENDING").length
  const inProgress = student.assignments.filter((a) => a.status === "IN_PROGRESS").length
  const completed = student.assignments.filter((a) => a.status === "COMPLETED").length
  const total = student.assignments.length

  const oppText = student.oppChunks.map((c) => c.tekst).join("\n").slice(0, 1200)

const prompt = `Je bent een onderwijskundig analist gespecialiseerd in hoogbegaafdheid en gepersonaliseerd leren.

Analyseer het onderstaande leerlingprofiel (OPP) en geef de leerkracht één concrete opdrachtaanbeveling die perfect aansluit bij deze leerling.

## Leerlingprofiel
Naam: ${student.fullName}
Groep: ${student.profile?.currentSchoolYearGroup ?? student.groep ?? "onbekend"}
Huidig Bloom-niveau: ${student.bloomNiveau}
Opdrachtstatus: ${total} opdrachten (${pending} wachtend, ${inProgress} bezig, ${completed} afgerond)

## OPP
${oppText}

## Jouw taak
Schrijf een vloeiende aanbeveling van 3-4 zinnen in verzorgd, natuurlijk Nederlands. Formuleer het als jouw eigen aanbeveling als analist, bijvoorbeeld "Ik raad u aan..." of "Een passende opdracht voor deze leerling is...". Spreek de leerkracht aan met "u". Onderbouw je aanbeveling uitsluitend op basis van de beschreven bevorderende factoren, onderwijsbehoeften en doelen uit het OPP — interpreteer geen testscores of afkortingen. Sluit af met één praktische tip voor de uitvoering. Gebruik geen kopjes, geen bullets en geen vetgedrukte labels — gewoon lopende tekst. Vermijd letterlijke vertalingen of niet-bestaande Nederlandse woorden.`
  const response = await ollama.chat({
    model: GEN_MODEL,
    messages: [{ role: "user", content: prompt }],
    options: { temperature: 0.3, num_predict: 300 },
  })

  const analysis = response.message.content?.trim() ?? "Geen analyse beschikbaar."
  return NextResponse.json({ analysis })
}
