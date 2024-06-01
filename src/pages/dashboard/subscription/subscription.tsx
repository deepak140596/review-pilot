import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { ActiveSubscription } from './active/active';
import { BuySubscription } from './buy/buy';

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