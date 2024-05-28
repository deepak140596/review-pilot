export interface Plan {
    features: string[];
    id: string;
    price: string;
    test_id: string;
    title: string;
}

export interface Plans {
    monthly: Plan;
    yearly: Plan;
}