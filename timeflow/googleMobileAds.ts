import initialize, { MaxAdContentRating } from 'react-native-google-mobile-ads';

// Initialize the SDK
initialize();

// Optional: configure global settings
initialize().setRequestConfiguration({
  maxAdContentRating: MaxAdContentRating.PG,
  tagForChildDirectedTreatment: false,
  tagForUnderAgeOfConsent: false,
});
