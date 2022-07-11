import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();
    const activeHttpRequests = useRef([]);

    const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {
        setIsLoading(true);
        const httpAbortCtrl = new AbortController();
        activeHttpRequests.current.push(httpAbortCtrl);
        try {
            const response = await fetch(url, {
                method,
                body,
                headers,
                signal: httpAbortCtrl.signal,
            });
            const responseData = await response.json();
            activeHttpRequests.current = activeHttpRequests.current.filter(
                (reqctl) => reqctl !== httpAbortCtrl
            );
            if (!response.ok) {
                console.log(2);
                throw new Error(responseData.message);
            }
            setIsLoading(false);
            return responseData;
        } catch (err) {
            console.log(1);
            setError(err.message);
            setIsLoading(false);

            throw err;
        }
    }, []);
    const clearError = () => setError(null);
    useEffect(() => {
        return () => {
            activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
        };
    }, []);
    return { isLoading, error, sendRequest, clearError };
};
