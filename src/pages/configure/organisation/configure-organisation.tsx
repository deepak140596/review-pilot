import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { Button } from "antd";
import { RepositorySettings, defaultRepositorySettings } from "../../../api/models/repository";
import { ConfigureSettings } from "../../../components/configure-settings/configure-settings";
import "./configure-organisation.scss";
import { subscribeToUserAccount } from "../../../store/account-slice";
import { setOrganisationSettingsToDB } from "../../../api/services/firestore/firestore-setter";
import { uid } from "../../../context/auth-context";

const ConfigureOrganisation = () => {
    const { data: userAccount } = useSelector((state: RootState)=> state.userAccount);
    const [ applyChangesButtonDisabled, setApplyChangesButtonDisabled ] = useState(true);
    const [ repositorySettings, setRepositorySettings ] = useState(userAccount?.repository_settings ?? defaultRepositorySettings);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(subscribeToUserAccount())
    }, [dispatch, userAccount])

    const applyChanges = () => {
        setOrganisationSettingsToDB(uid(),"User",repositorySettings)
    }

    useEffect(() => {
        const checkForChanges = () => {
            const hasChanges = JSON.stringify(userAccount?.repository_settings ?? defaultRepositorySettings) 
                !== JSON.stringify(repositorySettings);
            setApplyChangesButtonDisabled(!hasChanges);
        };

        checkForChanges();
    }, [repositorySettings, userAccount]);

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