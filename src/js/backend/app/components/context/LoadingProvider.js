import React, { createContext, useState, useContext } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {children}
            {loading && (
                <div className="xpo_fixed xpo_inset-0 xpo_bg-white/70 xpo_z-40 xpo_flex xpo_justify-center xpo_items-center">
                    <div className="xpo_text-primary-500 xpo_text-xl xpo_animate-pulse">
                        Loading...
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
