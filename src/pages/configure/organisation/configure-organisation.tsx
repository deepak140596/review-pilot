import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Button } from "antd";
import { defaultRepositorySettings } from "../../../api/models/repository";
import { ConfigureSettings } from "../../../components/configure-settings/configure-settings";
import "./configure-organisation.scss";
import { subscribeToUserAccount } from "../../../store/account-slice";
import { setOrganisationSettingsToDB } from "../../../api/services/firestore/firestore-setter";
import { uid } from "../../../context/auth-context";

const ConfigureOrganisation = () => {
    const { data: activeAccount } = useSelector((state: RootState)=> state.activeAccount);
    const [ applyChangesButtonDisabled, setApplyChangesButtonDisabled ] = useState(true);
    const [ repositorySettings, setRepositorySettings ] = useState(activeAccount?.repository_settings ?? defaultRepositorySettings);

    const dispatch = useDispatch();

    // TODO: subscribe to active account instead of user account
    useEffect(() => {
        dispatch(subscribeToUserAccount())
    }, [dispatch, activeAccount])

    const applyChanges = () => {
        // TODO: save data wrt to active account
        setOrganisationSettingsToDB(uid(),"User",repositorySettings)
    }

    useEffect(() => {
        const checkForChanges = () => {
            const hasChanges = JSON.stringify(activeAccount?.repository_settings ?? defaultRepositorySettings) 
                !== JSON.stringify(repositorySettings);
            setApplyChangesButtonDisabled(!hasChanges);
        };

        checkForChanges();
    }, [repositorySettings, activeAccount]);

    const handleSwitchChange = (settingName: string, value: boolean) => {
        setRepositorySettings(prevSettings => ({
            ...prevSettings,
            [settingName]: value
        }));
    };

    const handleInputChange = (settingName: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setRepositorySettings(prevSettings => ({
            ...prevSettings,
            [settingName]: value
        }));
    };

    return (
        <div className="reviewSettings">
            <div className="reviewSettings__header">    
                <h2>Organisation Settings</h2>
                <Button type="primary" className="applyChangesButton" 
                    disabled={applyChangesButtonDisabled}
                    onClick={applyChanges}
                >
                    Apply Changes
                </Button>
            </div>
            <div className="subtitleText">
            <body>These settings will apply to all repository if not individually configured</body>
            </div>
            { ConfigureSettings(
                repositorySettings,
                handleSwitchChange,
                handleInputChange
            )}
        </div>
        
    );

    
}

export default ConfigureOrganisation;