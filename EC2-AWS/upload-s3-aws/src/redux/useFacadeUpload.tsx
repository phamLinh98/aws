import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store"; // Import RootState too
import { getThunkUploadList } from "./thunkUpload";


export const useFacadeUpload = () => {
  //  **IMPORTANT:  Provide selector functions to useSelector()**
  const { listUpload, error, loading } = useSelector((state: RootState) => state.upload);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(getThunkUploadList());
  }, [dispatch]);

  return {
    listUpload,
    error,
    loading,
  };
};