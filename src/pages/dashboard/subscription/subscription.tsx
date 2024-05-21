import { useEffect, useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import {useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { LoadingOutlined } from '@ant-design/icons';
import { Plan } from '../../../api/models/plan';
import { uid } from '../../../context/auth-context';
import { getPlans } from '../../../store/plan-slice';
import { createRazorpaySubscription } from '../../../api/services/http/create-razorpay-subscription';

export const Subscription = () => {
    const [selectedPlan, setSelectedPlan] = useState<Plan>();
    const { data: plans } = useSelector((state: RootState) => state.plans);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getPlans())
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
            email: 'deepak140596@test.com',
            phone: '+918100509478',
            userId: uid(),
        })

        console.log(`Subscription ID: ${subscriptionId}`); 
        startCheckout(subscriptionId);
    };

    const startCheckout = (subscriptionId: string) => {
        const options = {
            key: 'rzp_test_KGB5VujInhP0Dj', // Replace with your Razorpay key ID
            // amount: '10000', // Amount is in the smallest currency unit
            // currency: "INR",
            name: 'ReviewPilot',
            description: 'Subscription',
            subscription_id: subscriptionId,
            handler: function (response: any) {
              alert(`Payment ID: ${response.razorpay_payment_id}`);
              alert(`Subscription ID: ${response.razorpay_subscription_id}`);
              alert(`Signature: ${response.razorpay_signature}`);
              // You can verify the payment on the server
            },
            // prefill: {
            //   name: 'Customer Name',
            //   email: 'customer@example.com',
            //   contact: '9999999999'
            // },
            notes: {
              address: 'Corporate Office'
            },
            theme: {
              color: '#F37254'
            }
          };
      
          const rzp1 = new (window as any).Razorpay(options);
          rzp1.open()
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

    return (
        <div style={{  padding: '30px' }}>
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
        </div>
    );
}

// export const Subscription2 = () => {
//     const [formData, setFormData] = useState({
//         amount: '',
//         productInfo: '',
//         firstName: '',
//         email: '',
//         phone: '',
//         planId: '',
//         success_url: 'http://localhost:3000/dashboard/subscription',
//         failure_url: 'http://localhost:3000/dashboard/repositories'

//     });

//     const handleChange = (e: any) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleSubmit = async (e: any) => {
//         e.preventDefault();
//         try {
//             const response = await createPayuSubscription(formData);
//             const { key, txnid, amount, productinfo, firstname, email, phone, surl, furl, hash } = response;

//             const form = document.createElement('form');
//             form.method = 'POST';
//             form.action = 'https://secure.payu.in/_payment'; // Use 'https://secure.payu.in/_payment' for production

//             form.innerHTML = `
//                 <input type="hidden" name="key" value="${key}" />
//                 <input type="hidden" name="txnid" value="${txnid}" />
//                 <input type="hidden" name="amount" value="${amount}" />
//                 <input type="hidden" name="productinfo" value="${productinfo}" />
//                 <input type="hidden" name="firstname" value="${firstname}" />
//                 <input type="hidden" name="email" value="${email}" />
//                 <input type="hidden" name="phone" value="${phone}" />
//                 <input type="hidden" name="surl" value="${surl}" />
//                 <input type="hidden" name="furl" value="${furl}" />
//                 <input type="hidden" name="hash" value="${hash}" />
//             `;

//             document.body.appendChild(form);
//             form.submit();
//         } catch (error) {
//             console.error('Subscription error: ', error);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit}>
//             <input type="text" name="amount" placeholder="Amount" value={formData.amount} onChange={handleChange} required />
//             <input type="text" name="productInfo" placeholder="Product Info" value={formData.productInfo} onChange={handleChange} required />
//             <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
//             <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
//             <input type="text" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
//             <input type="text" name="planId" placeholder="Plan ID" value={formData.planId} onChange={handleChange} required />
//             <button type="submit">Subscribe Now</button>
//         </form>
//     );
// };
