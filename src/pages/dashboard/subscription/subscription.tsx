import { useEffect, useState } from 'react';
import { Card, Col, Row, Button } from 'antd';
import {useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { LoadingOutlined } from '@ant-design/icons';
import { Plan } from '../../../api/models/plan';
import { uid } from '../../../context/auth-context';
import { getPlans } from '../../../store/plan-slice';
import { createRazorpaySubscription } from '../../../api/services/http/razorpay';
import { getRazorpayCredentials } from '../../../store/razorpay-slice';
import { setPaymentInProgressInDB } from '../../../api/services/firestore/firestore-setter';
import { ActiveSubscription } from './active/active';
import { BuySubscription } from './buy/buy';

// TODO: when subscription is active show details of subs
// TODO: implement trial period
export const Subscription = () => {
    const { data: userAccount } = useSelector((state: RootState) => state.userAccount);

    return (
        <div style={{  padding: '30px' }}>
            { (userAccount?.pro) 
                ? <ActiveSubscription />
                : <BuySubscription />
            }
        </div>
    );
}