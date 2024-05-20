import { useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import {useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { Product } from '../../../api/models/stripe';
import { LoadingOutlined } from '@ant-design/icons';
import { createStripeCheckoutSession } from '../../../store/stripe-slice';
import { createPayuSubscription } from '../../../api/services/http/create-payu-subscription';


export const Subscription1 = () => {

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

export const Subscription = () => {
    const [formData, setFormData] = useState({
        amount: '',
        productInfo: '',
        firstName: '',
        email: '',
        phone: '',
        planId: '',
        success_url: 'http://localhost:3000/dashboard/subscription',
        failure_url: 'http://localhost:3000/dashboard/repositories'

    });

    const handleChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            const response = await createPayuSubscription(formData);
            const { key, txnid, amount, productinfo, firstname, email, phone, surl, furl, hash } = response;

            const form = document.createElement('form');
            form.method = 'POST';
            form.action = 'https://secure.payu.in/_payment'; // Use 'https://secure.payu.in/_payment' for production

            form.innerHTML = `
                <input type="hidden" name="key" value="${key}" />
                <input type="hidden" name="txnid" value="${txnid}" />
                <input type="hidden" name="amount" value="${amount}" />
                <input type="hidden" name="productinfo" value="${productinfo}" />
                <input type="hidden" name="firstname" value="${firstname}" />
                <input type="hidden" name="email" value="${email}" />
                <input type="hidden" name="phone" value="${phone}" />
                <input type="hidden" name="surl" value="${surl}" />
                <input type="hidden" name="furl" value="${furl}" />
                <input type="hidden" name="hash" value="${hash}" />
            `;

            document.body.appendChild(form);
            form.submit();
        } catch (error) {
            console.error('Subscription error: ', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
            <input type="text" name="productInfo" placeholder="Product Info" value={formData.productInfo} onChange={handleChange} required />
            <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
            <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
            <input type="text" name="planId" placeholder="Plan ID" value={formData.planId} onChange={handleChange} required />
            <button type="submit">Subscribe Now</button>
        </form>
    );
};
