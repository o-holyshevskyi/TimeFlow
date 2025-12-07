import { useEffect, useState } from "react";
import Purchases from "react-native-purchases";

export const useUserStatus = () => {
    const [isPro, setIsPro] = useState<boolean>(false);
    
    async function getCustomerName() {
        const customerInfo = await Purchases.getCustomerInfo();
        setIsPro(typeof customerInfo.entitlements.active["PROductive"] !== "undefined");
    }

    useEffect(() => {
        getCustomerName();
    });

    return {
        isPro,
    };
}