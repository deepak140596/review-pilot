import { Button, Input, Switch } from "antd";
import { RepositorySettings } from "../../api/models/repository";
import "./configure-settings.scss";

export const ConfigureSettings = (
    repositorySettings: RepositorySettings,
    handleSwitchChange: (settingName: string, value: boolean) => void, 
    handleInputChange: (settingName: string, event: React.ChangeEvent<HTMLInputElement>) => void
) => {
    return (
    <div className="tabContent">         
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