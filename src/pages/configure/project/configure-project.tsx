import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { subscribeToRepository } from "../../../store/repositories-slice";
import { RootState } from "../../../store/store";
import { Button, Input, Layout, Select, Switch, Tabs } from "antd";
import './configure-project.scss';
import TabPane from "antd/es/tabs/TabPane";
import { Option } from "antd/es/mentions";
import { BackIcon } from "../../../assets/svg/back-icon";
import { ArrowLeftOutlined } from "@ant-design/icons";

const ConfigureProject = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const { data: repository } = useSelector((state: RootState)=> state.repository);
    const [ applyChangesEnabled, setApplyChanges ] = useState(false);
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

    const reviewCustomization = () => {
        return (
        <div className="reviewSettings__tabContent">         
            <div className="settingsHorizontalItem">
                <div className="settingsItemLabel">
                    <h3>High-level Summary</h3>
                </div>
                <Switch defaultChecked />
            </div>

            <div className="settingsHorizontalItem">
                <div className="settingsItemLabel">
                    <h3>Automated reviews</h3>
                </div>
                <Switch defaultChecked />
            </div>

            <div className="settingsHorizontalItem">
                <div className="settingsItemLabel">
                    <h3>Draft Pull Request reviews</h3>
                </div>
                <Switch defaultChecked />
            </div>

            <div className="settingsVerticalItem">
                <div className="settingsItemLabel">
                    <h3>Target branches</h3>
                    <body>Comma separated branch names where ReviewPilot will work. For eg. main,development,feature/* .</body>
                </div>
                <Input placeholder="main,development,feature/*" onChange={(event)=>{
                    console.log(event.target.value);
                }} />
            </div>

            <div className="settingsVerticalItem">
                <div className="settingsItemLabel">
                    <h3>Ignore Title Keywords</h3>
                    <body>Comma-separated list of title keywords to ignore. E.g. 'WIP,DO NOT MERGE'.</body>
                </div>
                <Input placeholder="WIP,DO NOT MERGE" onChange={(event)=>{
                    console.log(event.target.value);
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
                <Button type="primary" className="applyChangesButton" disabled={applyChangesEnabled}>
                    Apply Changes
                </Button>
            </div>
            { reviewCustomization() }
        </div>
        
    );

    
}

export default ConfigureProject;