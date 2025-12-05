// import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';
// import { useEffect } from 'react';
// import { View } from "react-native";

// const adUnitId = 'ca-app-pub-2316339748820874/5655190892';

// async function configureAdMob() {
//   await setTestDeviceIDAsync('EMULATOR'); // Works for iOS Simulator or Expo Go
// }

// const AdBanner = ({ isPremiumUser = false }: { isPremiumUser: boolean }) => {
//     useEffect(() => {
//         const config = async () => {
//             configureAdMob();
//         }

//         config();
//     });
    
//     if (isPremiumUser) {
//         return null;
//     }

//     return (
//     <View style={{ alignItems: 'center', marginVertical: 10 }}>
//         <AdMobBanner
//             bannerSize="fullBanner"
//             adUnitID={adUnitId} // TEST ID for development
//             onAdViewDidReceiveAd={() => console.log('Ad received')}
//             onDidFailToReceiveAdWithError={error => console.log('Ad failed:', error)}
//         />
//         </View>
//     );;
// }

// //App ID:      ca-app-pub-2316339748820874~1276962185
// // Ad Unit ID: ca-app-pub-2316339748820874/5655190892

// export default AdBanner;

import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

const AdBanner = ({ isPremiumUser = false }: { isPremiumUser: boolean }) => {
  if (isPremiumUser) return null;

  return (
    <View style={{ alignItems: 'center', marginVertical: 10 }}>
      <BannerAd
        unitId={"ca-app-pub-2316339748820874/5655190892"} // or your real Ad Unit ID
        size={BannerAdSize.FULL_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => console.log('Ad loaded')}
        onAdFailedToLoad={(error) => console.log('Ad failed', error)}
      />
    </View>
  );
};

export default AdBanner;