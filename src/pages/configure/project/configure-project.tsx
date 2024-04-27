import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { subscribeToRepository } from "../../../store/repositories-slice";
import { RootState } from "../../../store/store";
import { Button, Input, Switch } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import './configure-project.scss';
import { RepositorySettings } from "../../../api/models/repository";
import { setRepositorySettingsToDB } from "../../../api/services/firestore/firestore-setter";

const ConfigureProject = () => {
    const defaultRepositorySettings: RepositorySettings = {
        high_level_summary: false,
        automated_reviews: false,
        draft_pull_request_reviews: true,
        target_branches: "",
        ignore_title_keywords: ""
    };
    const { projectId } = useParams<{ projectId: string }>();
    const { data: repository } = useSelector((state: RootState)=> state.repository);
    const [ applyChangesButtonDisabled, setApplyChangesButtonDisabled ] = useState(true);
    const [ repositorySettings, setRepositorySettings ] = useState(repository?.repository_settings ?? defaultRepositorySettings);
    const navigate = useNavigate();

    const goBack = () => {
        navigate("/dashboard/repositories")
    }
    const dispatch = useDispatch();

    useEffect(() => {
        if (projectId) {
            dispatch(subscribeToRepository(projectId));
        }
    }, [dispatch, projectId])

    const applyChanges = () => {
        if (repository) {
            setRepositorySettingsToDB(repository?.id, repositorySettings);
        }
    }

    useEffect(() => {
        const checkForChanges = () => {
            const hasChanges = JSON.stringify(repository?.repository_settings ?? defaultRepositorySettings) 
                !== JSON.stringify(repositorySettings);

            console.log(`First: ${JSON.stringify(repository?.repository_settings)}`);
            console.log(`Second: ${JSON.stringify(repositorySettings)}`);
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

    const reviewCustomization = () => {
        return (
        <div className="reviewSettings__tabContent">         
            <div className="settingsHorizontalItem">
                <div className="settingsItemLabel">
                    <h3>High-level Summary</h3>
                </div>
                <Switch 
                    defaultValue={repositorySettings?.high_level_summary ?? true} 
                    onChange={(checked) => {
                        handleSwitchChange("high_level_summary", checked);
                    }} 
                />
            </div>

            <div className="settingsHorizontalItem">
                <div className="settingsItemLabel">
                    <h3>Automated reviews</h3>
                </div>
                <Switch defaultValue={repositorySettings?.automated_reviews ?? true} 
                    onChange={(checked) => {
                        handleSwitchChange("automated_reviews", checked);
                    }} 
                />
            </div>

            <div className="settingsHorizontalItem">
                <div className="settingsItemLabel">
                    <h3>Draft Pull Request reviews</h3>
                </div>
                <Switch defaultValue={repositorySettings?.draft_pull_request_reviews ?? true} 
                    onChange={(checked) => {
                        handleSwitchChange("draft_pull_request_reviews", checked);
                    }} 
                />
            </div>

            <div className="settingsVerticalItem">
                <div className="settingsItemLabel">
                    <h3>Target branches</h3>
                    <body>Comma separated branch names where ReviewPilot will work. For eg. main,development,feature/* .</body>
                </div>
                <Input 
                    placeholder="main,development,feature/*" 
                    value={repositorySettings?.target_branches ?? ""}
                    onChange={(event)=>{
                        handleInputChange("target_branches", event);
                    }} />
            </div>

            <div className="settingsVerticalItem">
                <div className="settingsItemLabel">
                    <h3>Ignore Title Keywords</h3>
                    <body>Comma-separated list of title keywords to ignore. E.g. 'WIP,DO NOT MERGE'.</body>
                </div>
                <Input 
                    placeholder="WIP,DO NOT MERGE" 
                    value={repositorySettings?.ignore_title_keywords ?? ""}
                    onChange={(event)=>{
                        handleInputChange("ignore_title_keywords", event);
                    }} />
            </div>

            <Button type="dashed" className="instructionButton">
                + Instructions
            </Button>
        </div>
        );
    }

    return (
        <div className="reviewSettings">
            <div className="reviewSettings__header">    
                <div className="backButton" onClick={goBack} >
                    <ArrowLeftOutlined />   
                </div>
                <h2>{repository?.name}</h2>
                <Button type="primary" className="applyChangesButton" 
                    disabled={applyChangesButtonDisabled}
                    onClick={applyChanges}
                >
                    Apply Changes
                </Button>
            </div>
            { reviewCustomization() }
        </div>
        
    );

    
}

export default ConfigureProject;