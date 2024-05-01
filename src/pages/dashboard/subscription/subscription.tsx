import { useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import {useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Product } from '../../../api/models/stripe';
import { loadStripe } from '@stripe/stripe-js';
import { createStripeSession } from '../../../api/services/http/create-stripe-session';
import { LoadingOutlined } from '@ant-design/icons';


export const Subscription = () => {

    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const { data: stripeConfig } = useSelector((state: RootState) => state.stripeConfig);
    const [loading, setLoading] = useState(false);

    const handleSelectPlan = (product: Product) => {
        setSelectedProduct(product);
    };
    
    const handleSubscribe = async () => {
        if (!selectedProduct) return;
        if (!stripeConfig) return;
        setLoading(true);
        const sessionId: string = (await createStripeSession(selectedProduct)).sessionId;
        setLoading(false);  
        
        const stripe = await loadStripe(stripeConfig.publishable_key);
        stripe?.redirectToCheckout({ sessionId })?.then((result: any) => {
            if (result.error) {
                console.error(`Stripe checkout error: ${result.error.message}`);
            }
        });
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
            <Col span={24}>
                <Row gutter={16} align="middle">
                    <Col span={12}>
                        {stripeConfig && plan(stripeConfig.products.monthly)}
                    </Col>
                    <Col span={12}>
                        {stripeConfig && plan(stripeConfig.products.yearly)}
                    </Col>  
                </Row>
                { loading ? 
                    <Row justify="center">
                        <LoadingOutlined style={{ fontSize: '50px', color: 'blue', marginTop: '20px' }} /> 
                    </Row>
                    : 
                    <Button type="primary" block style={{ marginTop: '20px' }} onClick={handleSubscribe} disabled={!selectedProduct}>
                        Subscribe
                    </Button>
                    }
            </Col>
        </div>
    );
}
