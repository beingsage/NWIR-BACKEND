export declare function inferLocation({ phone, text }: {
    phone?: string;
    text?: string;
}): Promise<{
    estimated_location: string;
    confidence: number;
    sources: any;
    raw_signals: {
        region: string;
        confidence: number;
        source: string;
    }[];
}>;
