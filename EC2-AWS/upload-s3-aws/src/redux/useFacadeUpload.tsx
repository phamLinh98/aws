import { useEffect, useState } from "react";

const fetchApiAws = async (
  setStatus: any,
  id: any = undefined
) => {
  fetch('https://ne3j40rhmj.execute-api.ap-northeast-1.amazonaws.com/get-status?id=' + id + '&timestamp=' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
      if (data && data.status && data.status.S) {
        setStatus(data.status.S);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

export const useFacadeUpload = (id = undefined) => {
  const [status, setStatus] = useState(undefined);

  useEffect(() => {
    // TODO: Implement
  });

  useEffect(() => {
    // TODO: Implement
  }, []);

  useEffect(() => {
    // TODO: Implement
  }, [status]);

  useEffect(() => {
    if (id) {
      // Call in first time to get status
      fetchApiAws(setStatus, id);

      if (status === 'success' || status === 'failed') {
        return;
      }

      // Call every 5s to get status
      const interval = setInterval(() => {
        fetchApiAws(setStatus, id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [id]);

  return {
    status
  };
};