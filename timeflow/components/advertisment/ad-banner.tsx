import { useRef } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

const adUnitId = TestIds.BANNER;

const AdBanner = ({ isPremiumUser = false }: { isPremiumUser: boolean }) => {
    const bannerRef = useRef<BannerAd>(null);

    useForeground(() => {
        bannerRef.current?.load();
    });

    if (isPremiumUser) return null;
    
    return (
        <View style={{ width: '100%', alignItems: 'center', marginVertical: 10 }}>
            <BannerAd
                unitId={adUnitId} 
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
                ref={bannerRef}
                onAdLoaded={() => console.log('Ad loaded successfully with ID:', adUnitId)}
                onAdFailedToLoad={(error) => console.log('Ad failed to load. Error:', error)}
            />
        </View>
    );
};

export default AdBanner;