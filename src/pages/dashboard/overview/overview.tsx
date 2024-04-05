import { Button } from "antd";
import Layout from "antd/es/layout/layout";


const Overview = () => {

    const handleInstalation = () => {
        const installationUrl = 'https://github.com/apps/reviewpilot-ai/installations/new';
        //replace current window
        window.location.replace(installationUrl);
    };

    return (
        <Layout> 
            <Button type="primary" onClick={handleInstalation}>
                Install the app
            </Button>
        </Layout>
    );
    
}

export default Overview;