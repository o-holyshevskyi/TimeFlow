import { useRef } from 'react';
import { Dimensions, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

const adUnitId = TestIds.BANNER;
const AD_WIDTH = Dimensions.get('window').width * .80;

const AdBanner = ({ isPro = false }: { isPro: boolean }) => {
    const bannerRef = useRef<BannerAd>(null);

    useForeground(() => {
        bannerRef.current?.load();
    });

    if (isPro) return null;
    
    return (
        <View style={{ width: AD_WIDTH, height: 100, alignItems: 'center', marginVertical: 10 }}>
            <BannerAd
                unitId={adUnitId} 
                size={BannerAdSize.FULL_BANNER}
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