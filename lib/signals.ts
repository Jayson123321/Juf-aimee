import { Student } from "@/generated/prisma/client";
import { ollama, GEN_MODEL } from "@/lib/ollama";
import { zoekConcreteInteresses, zoekIntegratieBeeld, zoekMotivatieEnWerkstijl } from "@/app/ai/tools/search_opp";

export type SignalType = "capaciteit" | "taakbetrokkenheid" | "intellectueel" | "Psychomotorisch";

export type SignalVariant = "positive" | "warning" | "advice";

export type SignalsForDashboard = {
    status: string;
    bloomNiveau: number | null;
    submittedAt: Date | null;
    createdAt: Date;
};

export type Signal = {
    type: SignalType;
    variant: SignalVariant;
    teacher_message: string;
    teacher_feedback_advice?: string;
    llm_instruction: string;
    adviceJufAimee: string;
    llm_feedback_advice?: string;
};

export function computeSignals(assignments: SignalsForDashboard[], student: Student, teacher_feedback_advice?: string): Signal[] {
    const signals: Signal[] = [];
    const today = new Date();

    const lastTwoDoneAssignments = assignments
        .filter(a => a.status === "COMPLETED" && a.submittedAt !== null)
        .sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0))
        .slice(0, 2);

    const hasAssignmentToday = assignments.some(a => a.createdAt.toDateString() === today.toDateString());
    const hasCompletedToday = assignments.some(a =>
        a.status === "COMPLETED" && a.submittedAt?.toDateString() === today.toDateString()
    );
    const assignmentsCompletedToday = assignments.filter(a =>
        a.status === "COMPLETED" && a.submittedAt?.toDateString() === today.toDateString()
    );

    if (lastTwoDoneAssignments.length === 2 && lastTwoDoneAssignments[0].bloomNiveau === lastTwoDoneAssignments[1].bloomNiveau) {
        signals.push({
            type: "capaciteit",
            variant: "advice",
            teacher_message: `${student.fullName} heeft al twee opdrachten achter elkaar afgerond op bloom niveau ${lastTwoDoneAssignments[0].bloomNiveau}.`,
            teacher_feedback_advice,
            llm_instruction: `De leerling blijft op bloomniveau ${lastTwoDoneAssignments[0].bloomNiveau}. Genereer een opdracht op bloomniveau ${(lastTwoDoneAssignments[0].bloomNiveau ?? 1) + 1} of hoger.`,
            adviceJufAimee: `Vraag de docent of ${student.fullName} klaar is voor bloomniveau ${(lastTwoDoneAssignments[0].bloomNiveau ?? 1) + 1}, of dat hij/zij eerst nog een opdracht op hetzelfde niveau nodig heeft.`,
        });
    }

    if (hasAssignmentToday && !hasCompletedToday) {
        signals.push({
            type: "taakbetrokkenheid",
            variant: "warning",
            teacher_message: `${student.fullName} heeft vandaag nog geen opdracht afgerond.`,
            teacher_feedback_advice,
            llm_instruction: `De leerling heeft vandaag nog geen opdracht afgerond.${teacher_feedback_advice ? ` Docent advies: ${teacher_feedback_advice}` : ""} Adviseer de docent om te achterhalen waarom, en stel voor een laagdrempelige opdracht aan te bieden.`,
            adviceJufAimee: `Vraag de docent te achterhalen waarom ${student.fullName} vandaag niets heeft afgerond, en stel voor een korte laagdrempelige opdracht aan te bieden.`,
        });
    }

    if (assignments.filter(a => a.status === "COMPLETED" && (a.bloomNiveau === 5 || a.bloomNiveau === 6)).length >= 3) {
        signals.push({
            type: "intellectueel",
            variant: "positive",
            teacher_message: `${student.fullName} heeft 3 of meer opdrachten afgerond op een hoog bloom-niveau, goed bezig!`,
            teacher_feedback_advice,
            llm_instruction: `De leerling presteert consistent op hoog niveau (bloomniveau 5-6). Genereer een complexe, open-ended opdracht op bloomniveau 6.`,
            adviceJufAimee: `${student.fullName} presteert consistent op hoog niveau — overweeg een open, complexe opdracht op bloomniveau 6 die verder gaat dan wat hij/zij al heeft laten zien.`,
        });
    }

    if (assignmentsCompletedToday.length >= 3) {
        signals.push({
            type: "Psychomotorisch",
            variant: "positive",
            teacher_message: `${student.fullName} heeft vandaag al ${assignmentsCompletedToday.length} opdrachten afgerond, overweeg moeilijkere opdrachten.`,
            teacher_feedback_advice,
            llm_instruction: `De leerling heeft een hoog werktempo. Genereer een uitdagende opdracht die meer diepgang vereist.`,
            adviceJufAimee: `${student.fullName} heeft een hoog werktempo — overweeg om de focus te verschuiven naar diepgang in plaats van meer opdrachten.`,
        });
    }

    const priority: Record<SignalVariant, number> = { warning: 0, advice: 1, positive: 2 };
    return signals.sort((a, b) => priority[a.variant] - priority[b.variant]);
}

async function generateSingleSignalAdvice(student: Student, signal: Signal, interestsLine: string): Promise<string> {
    const teacherAdvice = student.teacherNotes
        ? `De docent heeft de volgende notitie toegevoegd: "${student.teacherNotes.slice(0, 200)}". Dit advies is leidend.`
        : "";

    const prompt = `
Je bent Juf Aimee, een warme en deskundige onderwijsassistent. Je spreekt de docent direct en vriendelijk aan.

Leerling: ${student.fullName}
${interestsLine}
${teacherAdvice}

Advies aan de docent: ${signal.adviceJufAimee}
Schrijf dit advies in één of twee vriendelijke zinnen en sluit altijd af met een korte, open vraag aan de docent — want de docent heeft het eindoordeel. Geen opdrachten verzinnen, geen markdown. Niets meer.
    `.trim();

    const response = await ollama.chat({
        model: GEN_MODEL,
        messages: [{ role: "user", content: prompt }],
        options: { temperature: 0.6 },
    });

    return response.message.content.trim();
}

async function generateCombinedSignalAdvice(student: Student, signals: Signal[], interestsLine: string): Promise<string> {
    const teacherAdvice = student.teacherNotes
        ? `De docent heeft de volgende notitie toegevoegd: "${student.teacherNotes.slice(0, 200)}". Dit advies is leidend.`
        : "";

    const signalLines = signals
        .map(s => {
            const label = s.variant === "warning" ? "AANDACHT" : s.variant === "advice" ? "ADVIES" : "POSITIEF";
            return `- ${label}: ${s.adviceJufAimee}`;
        })
        .join("\n");

    const prompt = `
Je bent Juf Aimee, een warme en deskundige onderwijsassistent. Je spreekt de docent direct en vriendelijk aan.

Leerling: ${student.fullName}
${interestsLine}
${teacherAdvice}

Er zijn meerdere signalen over deze leerling:
${signalLines}

Schrijf één samenhangende observatie aan de docent die de signalen verbindt tot één verhaal, en sluit altijd af met een korte, open vraag aan de docent — want de docent heeft het eindoordeel. Maximaal twee zinnen. Geen opdrachten verzinnen, geen markdown. Niets meer.
    `.trim();

    const response = await ollama.chat({
        model: GEN_MODEL,
        messages: [{ role: "user", content: prompt }],
        options: { temperature: 0.6 },
    });

    return response.message.content.trim();
}

export async function generateSignalAdvice(student: Student, signals: Signal[]): Promise<Signal[]> {
    if (signals.length === 0) return [];

    const [rawInterests, rawIntegratief, rawMotivatie] = await Promise.all([
        zoekConcreteInteresses(student.id),
        zoekIntegratieBeeld(student.id),
        zoekMotivatieEnWerkstijl(student.id),
    ]);
    const allInterests = [...new Set([...rawInterests, ...rawIntegratief, ...rawMotivatie])];
    const interestsLine = allInterests.length > 0
        ? `Interesses van de leerling (uit OPP): ${allInterests.map((t: string) => t.slice(0, 100)).join(" | ")}`
        : "";

    if (signals.length === 1) {
        const advice = await generateSingleSignalAdvice(student, signals[0], interestsLine);
        return [{ ...signals[0], llm_feedback_advice: advice }];
    }

    const combinedAdvice = await generateCombinedSignalAdvice(student, signals, interestsLine);
    return [
        { ...signals[0], llm_feedback_advice: combinedAdvice },
        ...signals.slice(1),
    ];
}
