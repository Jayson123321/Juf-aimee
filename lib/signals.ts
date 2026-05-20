
export type SignalType = "capaciteit" | "taakbetrokkenheid" | "intellectueel" | "Psychomotorisch";

export type SignalVariant = "positive" | "warning" | "advice";

export type Signal = {
    type: SignalType;
    variant: SignalVariant;
    message: string; }
    