import { Student } from "@/generated/prisma/client";

export type SignalType = "capaciteit" | "taakbetrokkenheid" | "intellectueel" | "Psychomotorisch";

export type SignalVariant = "positive" | "warning" | "advice";

export type SignalsForDashboard = {
    status: string;
    bloomNiveau: number | null;
    submittedAt: Date | null;
    createdAt: Date;
}

export type Signal = {
    type: SignalType;
    variant: SignalVariant;
    message: string; }

export function computeSignals(assignments: SignalsForDashboard [], student: Student): Signal[] {
    const signals: Signal[] = [];
    const lastTwoDoneAssignments = assignments.filter(a => a.status === "COMPLETED").filter((a) => a.submittedAt !== null).sort((a, b) => (b.submittedAt?.getTime() ?? 0) - (a.submittedAt?.getTime() ?? 0)).slice(0,2);
    const assignmentNotCompletedToday = assignments.filter(a => a.status !== "COMPLETED").filter((a) => { const today = new Date(); return a.createdAt.toDateString() === today.toDateString();
});
    const assignmentsCompletedToday = assignments.filter(a => a.status === "COMPLETED").filter((a) => { const today = new Date(); return a.submittedAt?.toDateString() === today.toDateString();
});
        if ( lastTwoDoneAssignments.length === 2 && lastTwoDoneAssignments[0].bloomNiveau === lastTwoDoneAssignments[1].bloomNiveau) {
            signals.push({
                type: "capaciteit",
                variant: "advice",
                message: `${student.fullName} heeft al twee opdrachten achter elkaar afgerond op bloom-niveau ${lastTwoDoneAssignments[0].bloomNiveau}, dus advies: probeer een taak op een hoger niveau te maken.`
            });
        } if (assignmentNotCompletedToday.length > 0) {
            signals.push({
                type: "taakbetrokkenheid",
                variant: "warning",
                message: `${student.fullName} heeft vandaag nog geen opdracht afgerond`
            });
        } if (assignments.filter(a => a.status === "COMPLETED" && (a.bloomNiveau === 5 || a.bloomNiveau === 6)).length >= 3) {
            signals.push({
                type: "intellectueel",
                variant: "positive",
                message: `${student.fullName} heeft al 3 of meer opdrachten afgerond op een hoog bloom-niveau, goed bezig!`
            });
        } if (assignmentsCompletedToday.length >= 3) {
            signals.push({
                type: "Psychomotorisch",
                variant: "positive",
                message: `${student.fullName} heeft vandaag al ${assignmentsCompletedToday.length} opdrachten afgerond, overweeg moeilijkere opdrachten.`
            });
        }
        return signals.slice(0, 2);
    }