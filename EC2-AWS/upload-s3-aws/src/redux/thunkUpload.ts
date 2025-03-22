import { fetchApiGetStatus } from "../api/FetchApiGetStatus";
import { eventLoading, getUpload } from "./uploadRedux";

// Redux thunk cho list status 
export const getThunkUploadList = () => {
    return async (dispatch: any) => {
        try {
            const data = await fetchApiGetStatus();
            dispatch(getUpload(data));
            dispatch(eventLoading(false));
        } catch (error) {
            console.log('error', error);
        }
    }
};