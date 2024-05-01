import { useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import {useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Product } from '../../../api/models/stripe';
import { LoadingOutlined } from '@ant-design/icons';
import { createStripeCheckoutSession } from '../../../store/stripe-slice';


export const Subscription = () => {

    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const { data: stripeConfig } = useSelector((state: RootState) => state.stripeConfig);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSelectPlan = (product: Product) => {
        setSelectedProduct(product);
    };
    
    const handleSubscribe = async () => {
        if (!selectedProduct) return;
        setLoading(true);
        dispatch(
            createStripeCheckoutSession({
                priceId: selectedProduct.price_id,
                successUrl: 'http://localhost:3001/dashboard/subscription',
                cancelUrl: 'http://localhost:3001/dashboard/repositories'
            })
        )
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
