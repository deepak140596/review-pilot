import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { subscribeToRepository } from "../../../store/repositories-slice";
import { RootState } from "../../../store/store";
import { Repository } from "../../../api/models/repository";

const ConfigureProject = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const {data: repository, error, loading} = useSelector((state: RootState)=> state.repository);
    const dispatch = useDispatch();

    useEffect(() => {
        if (projectId) {
            dispatch(subscribeToRepository(projectId));
        }
    }, [dispatch, projectId])

    return (
        <div>
            {repository && <h1>Configure Project {repository.name}</h1>}
        </div>
    );
}

export default ConfigureProject;