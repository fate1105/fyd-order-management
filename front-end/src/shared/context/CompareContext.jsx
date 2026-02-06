import React, { createContext, useContext, useState, useEffect } from "react";

const CompareContext = createContext();

export const useCompare = () => useContext(CompareContext);

export const CompareProvider = ({ children }) => {
    const [compareList, setCompareList] = useState(() => {
        const saved = localStorage.getItem("fyd_compare");
        return saved ? JSON.parse(saved) : [];
    });
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem("fyd_compare", JSON.stringify(compareList));
    }, [compareList]);

    const addToCompare = (product) => {
        if (compareList.find((p) => p.id === product.id)) return false;
        if (compareList.length >= 4) return "limit"; // Max 4 products
        setCompareList([...compareList, product]);
        return true;
    };

    const removeFromCompare = (productId) => {
        setCompareList(compareList.filter((p) => p.id !== productId));
    };

    const clearCompare = () => {
        setCompareList([]);
    };

    return (
        <CompareContext.Provider
            value={{
                compareList,
                addToCompare,
                removeFromCompare,
                clearCompare,
                compareCount: compareList.length,
                isCompareModalOpen,
                setIsCompareModalOpen,
                openCompareModal: () => setIsCompareModalOpen(true),
                closeCompareModal: () => setIsCompareModalOpen(false)
            }}
        >
            {children}
        </CompareContext.Provider>
    );
};
