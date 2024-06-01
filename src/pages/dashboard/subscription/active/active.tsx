import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { useEffect, useState } from "react";
import { getActiveSubscription } from "../../../../store/active-subscription";
import { Button, Card, Modal, Popover } from "antd";
import { cancelRazorpaySubscription } from "../../../../api/services/http/razorpay";

export const ActiveSubscription = () => {
    const { data: activeSubscription } = useSelector((state: RootState) => state.activeSubscriptions);
    const dispatch = useDispatch();
    const [subscriptionCancelModalVisible, setSubscriptionCancelModalVisible] = useState(false);

    useEffect(() => {
        dispatch(getActiveSubscription());
    }, [dispatch]);

    const showCancelConfirmationModal = () => {
        setSubscriptionCancelModalVisible(true);
      };
    
      const handleOk = () => {
        setSubscriptionCancelModalVisible(false);
        cancelRazorpaySubscription();
      };
    
      const handleCancel = () => {
        setSubscriptionCancelModalVisible(false);
      };

    return (
        <Card title="Active Subscription">
            {!activeSubscription && <p>Loading...</p>}
            {activeSubscription && (
                <div>
                    <h1> {activeSubscription.plan.item.name} </h1>
                    <h2>{activeSubscription.plan.item.currency} {activeSubscription.plan.item.amount / 100}</h2>
                    <p>{activeSubscription.plan.item.description}</p>

                    <Button type="dashed"
                        block style={{ marginTop: '20px' }} 
                        onClick={showCancelConfirmationModal}
                    >
                        Cancel Subscription
                    </Button>

                    <Modal
                        title="Cancel Subscription"
                        open={subscriptionCancelModalVisible} 
                        onOk={handleOk} 
                        onCancel={handleCancel}
                    />
                </div>
            )}
        </Card>
        
    )
}