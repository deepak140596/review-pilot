import { Card } from "antd";
import { TRIAL_DAYS, trialDays } from "../../../../api/models/account";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/store";
import { useEffect, useState } from "react";


export const Trial = () => {

    const { data: userAccount } = useSelector((state: RootState) => state.userAccount);
    const [ trialDaysRemaining , setTrialDaysRemaining ] = useState<number>(1);

    useEffect(() => {
        if (userAccount) {
            const trial = trialDays(userAccount);
            setTrialDaysRemaining(trial);
        }
    }, [userAccount]);

    return (
        <div>
            { (trialDaysRemaining > 0) ? 
                (<Card title="Free Trial" style={{ width: 300 }}>
                    <p>
                        You are currently on a free trial. Enjoy all the features of the Pro plan for free for {trialDaysRemaining.toFixed(0)} days.
                    </p>
                </Card>)
                : null
            }
        </div>
        
    );
}