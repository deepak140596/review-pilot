import Layout from "antd/es/layout/layout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { subscribeToRepositories } from "../../../store/repositories-slice";
import { Button, List } from "antd";


const Repositories = () => {

    const {repositories, error} = useSelector((state: any) => state.repositories)
    const dispatch = useDispatch();

    const handleInstalation = () => {
        const installationUrl = 'https://github.com/apps/reviewpilot-ai/installations/new';
        //replace current window
        window.location.replace(installationUrl);
    };

    useEffect( () => {
        dispatch(subscribeToRepositories("deepak140596"));
    }, [dispatch]);

    return (
        <Layout> 
            {repositories && repositories.length > 0 ?
                <List
                    itemLayout="horizontal"
                    dataSource={repositories}
                    renderItem={(repository: any) => (
                        <List.Item>
                            <List.Item.Meta
                                title={repository.name}
                                description={repository.full_name}
                            />
                        </List.Item>
                    )}
                />
                :
                <Button type="primary" onClick={handleInstalation}>
                    Install ReviewPilot AI
                </Button>
            }
        </Layout>
    );
    
}

export default Repositories;