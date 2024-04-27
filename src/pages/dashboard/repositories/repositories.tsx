import Layout from "antd/es/layout/layout";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { subscribeToRepositories } from "../../../store/repositories-slice";
import { Button, List } from "antd";
import { useNavigate } from "react-router-dom";
import { Repository } from "../../../api/models/repository";
import { RootState } from "../../../store/store";
import { subscribeToUserAccount } from "../../../store/account-slice";

const installationUrl = 'https://github.com/apps/reviewpilot-ai/installations/new';
const Repositories = () => {

    const { data: repositories } = useSelector((state: RootState) => state.repositories)
    const { data: userAccount } = useSelector((state: RootState) => state.userAccount)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInstalation = () => {
        window.location.replace(installationUrl);
    };

    const navigateToConfigureRepositories = (projectId: number) => {
        navigate(`/dashboard/configure-project/${projectId}`);
    }

    useEffect( () => {
        if (!userAccount) return;
        dispatch(subscribeToRepositories(userAccount?.id ));
    }, [dispatch, userAccount]);

    useEffect(() => {
        dispatch(subscribeToUserAccount())
    }, [dispatch])

    return (
        <Layout> 
            {repositories && repositories.length > 0 ?
                <List
                    itemLayout="horizontal"
                    dataSource={repositories}
                    renderItem={(repository: Repository) => (
                        <List.Item
                            actions={[
                                <a onClick={()=>navigateToConfigureRepositories(repository.id)}>
                                    Configure
                                </a>,
                            ]}
                        >
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