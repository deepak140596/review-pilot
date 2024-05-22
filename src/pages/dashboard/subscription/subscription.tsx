import { useEffect, useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import {useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { LoadingOutlined } from '@ant-design/icons';
import { Plan } from '../../../api/models/plan';
import { uid } from '../../../context/auth-context';
import { getPlans } from '../../../store/plan-slice';
import { createRazorpaySubscription } from '../../../api/services/http/create-razorpay-subscription';
import { getRazorpayCredentials } from '../../../store/razorpay-slice';
import { setPaymentInProgressInDB } from '../../../api/services/firestore/firestore-setter';

// TODO: when subscription is active show details of subs
// TODO: implement trial period
export const Subscription = () => {
    const [selectedPlan, setSelectedPlan] = useState<Plan>();
    const { data: plans } = useSelector((state: RootState) => state.plans);
    const { data: razorpayCredentials } = useSelector((state: RootState) => state.razorpayCredentials);
    const { data: userAccount } = useSelector((state: RootState) => state.userAccount);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPlans())
        dispatch(getRazorpayCredentials())
    }, [dispatch]);

    useEffect(() => {   
        loadScript("https://checkout.razorpay.com/v1/checkout.js");
    })

    const loadScript = (src: any) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => {
            resolve(true);
          };
          script.onerror = () => {
            resolve(false);
          };
         document.body.appendChild(script);
       });
    };

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
    };
    
    const handleSubscribe = async () => {
        if (!selectedPlan) return;
        setLoading(true);
        const subscriptionId = await createRazorpaySubscription({
            planId: selectedPlan.id,
            userId: uid(),
        })

        console.log(`Subscription ID: ${subscriptionId}`); 
        startCheckout(subscriptionId);
    };

    const startCheckout = (subscriptionId: string) => {
        const options = {
            key: razorpayCredentials?.key_id,
            name: 'ReviewPilot',
            description: 'Subscription',
            subscription_id: subscriptionId,
            modal: {
                ondismiss: function() {
                    console.log('dismissed');
                    setLoading(false);
                }
            },
            handler: function (response: any) {
                console.log(JSON.stringify(response));
                if (response.razorpay_payment_id && 
                    response.razorpay_subscription_id &&
                    response.razorpay_signature) {
                        setPaymentInProgressInDB();
                }
               
                setLoading(false);
            },
            theme: {
              color: '#F37254'
            }
          };
      
          const rzp1 = new (window as any).Razorpay(options);
          rzp1.open()
    }

    const paymentInProgress = () => {
        return (
            <Card title="Payment in Progress" bordered={true}>
                <Col span={24}>
                    <h1 style={{ minHeight: '50px', marginBottom: '20px' }}>Please wait...</h1>
                </Col>
            </Card>
        )
    }

    const plan = (plan: Plan) => {
        return (
            <Card title={plan.title} bordered={true} color={selectedPlan === plan ? "primary" : "default"}>
                <Col span={24}>
                    <h1 style={{ minHeight: '50px', marginBottom: '20px' }}>{plan.price}</h1>
                    {plan.features.map((feature, i) => (
                        <p key={i}><i style={{ color: 'green', paddingRight: '10px' }}>✔</i>{feature}</p>
                    ))}
                    <Button type={selectedPlan === plan ? "primary" : "dashed"}
                        block style={{ marginTop: '20px' }} 
                        onClick={() => handleSelectPlan(plan)}
                    >
                        Select Plan
                    </Button>
                </Col>
            </Card>
        )
    }

    const plansView = () => {
        return (
            <Col span={24}>
                <Row gutter={16} align="middle">
                    <Col span={12}>
                        {plans && plan(plans.monthly)}
                    </Col>
                    <Col span={12}>
                        {plans && plan(plans.yearly)}
                    </Col>
                </Row>
                { loading ? 
                    <Row justify="center">
                        <LoadingOutlined style={{ fontSize: '50px', color: 'blue', marginTop: '20px' }} /> 
                    </Row>
                    : 
                    <Button type="primary" block style={{ marginTop: '20px' }} onClick={handleSubscribe} disabled={!selectedPlan}>
                        Subscribe
                    </Button>
                    }
            </Col>
        )
    }

    return (
        <div style={{  padding: '30px' }}>
            { (userAccount?.payment_in_progress ?? false) ? paymentInProgress() : plansView() }
        </div>
    );
}