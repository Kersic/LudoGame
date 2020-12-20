import React, {createContext, useState} from "react";
import Loader from "../Components/Loader";

export const LoaderContext = createContext([]);

export function LoaderProvider({ children }) {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoaderContext.Provider value={{ setIsLoading }}>
            <Loader isLoading={isLoading} />
            {children}
        </LoaderContext.Provider>
    );
}