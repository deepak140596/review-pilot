import { useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Product } from '../../../api/models/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { createStripeSession } from '../../../api/services/http/create-stripe-session';


export const Subscription = () => {

    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const { data: stripeConfig } = useSelector((state: RootState) => state.stripeConfig);

    const handleSelectPlan = (product: Product) => {
        setSelectedProduct(product);
    };
    
    const handleSubscribe = async () => {
        if (!selectedProduct) return;
        const sessionId = await createStripeSession(selectedProduct);
        console.log(`Stripe session id: ${sessionId}`)
    };

    const plan = (product: Product) => {
        return (
            <Card title={product.plan.title} bordered={true} color={selectedProduct === product ? "primary" : "default"}>
                <Col span={24}>
                    <h1 style={{ minHeight: '50px', marginBottom: '20px' }}>{product.plan.price}</h1>
                    {product.plan.features.map((feature, i) => (
                        <p key={i}><i style={{ color: 'green', paddingRight: '10px' }}>✔</i>{feature}</p>
                    ))}
                    <Button type={selectedProduct === product ? "primary" : "dashed"}
                        block style={{ marginTop: '20px' }} 
                        onClick={() => handleSelectPlan(product)}
                    >
                        Select Plan
                    </Button>
                </Col>
            </Card>
        )
    }

    return (
        <div style={{  padding: '30px' }}>
            <Row gutter={16}>
                <Col span={12}>
                    {stripeConfig && plan(stripeConfig.products.monthly)}
                </Col>
                <Col span={12}>
                    {stripeConfig && plan(stripeConfig.products.yearly)}
                </Col>
                <Button type="primary" block style={{ marginTop: '20px' }} onClick={handleSubscribe} disabled={!selectedProduct}>
                    Subscribe
                </Button>
            </Row>
        </div>
    );
}
