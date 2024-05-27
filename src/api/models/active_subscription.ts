export interface ActiveSubscription {
    active: boolean;
    plan: {
        item : {
            amount: number;
            currency: string;
            description: string;
            name: string;
        }
    };
    subscription : {
        status: string;
        start_at: number;
    }
}