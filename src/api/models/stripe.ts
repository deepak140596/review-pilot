import { Plan } from "./plan";

export interface StripeConfig {
    publishable_key: string;
    secret_key: string;
    products: Products;
}

export interface Products {
    monthly: Product;
    yearly: Product;
}

export interface Product {
    price_id: string;
    product_id: string;
    plan: Plan;
}

