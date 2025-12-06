import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Define the expected type for the AdBanner component
type AdBannerProps = { isPremiumUser: boolean };
type AdBannerType = React.FC<AdBannerProps>;

const DynamicAdBanner = ({ isPremiumUser }: AdBannerProps) => {
    // 1. Set the initial state type to null OR the AdBannerType
    const [AdBannerComponent, setAdBannerComponent] = useState<AdBannerType | null>(null);

    useEffect(() => {
        import('./ad-banner') // <-- The path to your original ad-banner component
        .then(module => {
            // 2. FIX APPLIED HERE: Pass the component value directly to the setter
            setAdBannerComponent(module.default as AdBannerType); 
        })
        .catch(error => {
            console.error("Failed to load AdBanner component dynamically:", error);
        });
    }, []);

    if (isPremiumUser) return null;

    if (!AdBannerComponent) {
        return (
            <View style={{ width: '80%', height: 100, alignItems: 'center', marginVertical: 10, justifyContent: 'center' }}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    // 3. Render the actual AdBanner component
    // TypeScript now knows AdBannerComponent is the correct component type.
    return <AdBannerComponent isPremiumUser={isPremiumUser} />;
};

export default DynamicAdBanner;