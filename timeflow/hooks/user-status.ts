import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

export const useUserStatus = () => {
    const [isPro, setIsPro] = useState<boolean>(true);
    const [isChecking, setIsChecking] = useState(true);
    
    useEffect(() => {
        async function loadStatus() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            const hasPro = !!customerInfo.entitlements.active["PROductive"];
            setIsPro(hasPro);
        } finally {
            setIsChecking(false);
        }
        }

        loadStatus();
    });

    return {
        isPro,
        isChecking
    };
}