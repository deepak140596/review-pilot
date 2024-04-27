import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { subscribeToRepository } from "../../../store/repositories-slice";
import { RootState } from "../../../store/store";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { RepositorySettings } from "../../../api/models/repository";
import { setRepositorySettingsToDB } from "../../../api/services/firestore/firestore-setter";
import { ConfigureSettings } from "../../../components/configure-settings/configure-settings";
import "./configure-organisation.scss";

const ConfigureOrganisation = () => {
    const defaultRepositorySettings: RepositorySettings = {
        automated_reviews: false,
        draft_pull_request_reviews: true,
        high_level_summary: false,
        ignore_title_keywords: "",
        target_branches: "",
    };
    
    const { data: repository } = useSelector((state: RootState)=> state.repository);
    const [ applyChangesButtonDisabled, setApplyChangesButtonDisabled ] = useState(true);
    const [ repositorySettings, setRepositorySettings ] = useState(repository?.repository_settings ?? defaultRepositorySettings);
    const navigate = useNavigate();

    const goBack = () => {
        navigate("/dashboard/repositories")
    }
    const dispatch = useDispatch();

    useEffect(() => {
        
    }, [dispatch])

    const applyChanges = () => {
        if (repository) {
            // set settings to org level
        }
    }

    useEffect(() => {
        const checkForChanges = () => {
            const hasChanges = JSON.stringify(repository?.repository_settings ?? defaultRepositorySettings) 
                !== JSON.stringify(repositorySettings);
            setApplyChangesButtonDisabled(!hasChanges);
        };

        checkForChanges();
    }, [repositorySettings, repository]);

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
                <div className="backButton" onClick={goBack} >
                    <ArrowLeftOutlined />   
                </div>
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