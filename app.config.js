import 'dotenv/config';

const IS_STAGING = process.env.EXPO_PUBLIC_ENV === 'stg';
const IS_PRODUCTION = process.env.EXPO_PUBLIC_ENV === 'prd';
const IS_PREPRODUCTION = process.env.EXPO_PUBLIC_ENV === 'ppd';

const getAppName = () => {
    if (IS_PRODUCTION) return 'PKKC';
    if (IS_PREPRODUCTION) return 'PKKC (PPD)';
    console.log('IS_STAGING', IS_STAGING)
    return 'PKKC (STG)';
};

const getBundleId = () => {
    if (IS_PRODUCTION) return 'my.ppkc';
    if (IS_PREPRODUCTION) return 'my.ppkc.ppd';
    return 'my.ppkc.stg';
};
console.log("Using environment:", process.env.EXPO_PUBLIC_ENV);
console.log("App name:", getAppName());
export default {
    expo: {
        name: getAppName(),
        slug: 'pkkc',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './src/assets/images/icon.png',
        scheme: 'pkkc',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        ios: {
            supportsTablet: true,
            bundleIdentifier: getBundleId(),
        },
        android: {
            icon: './src/assets/images/icon.png',
            adaptiveIcon: {
                foregroundImage: './src/assets/images/icon.png',
                backgroundColor: '#ffffff',
            },
            edgeToEdgeEnabled: false,
            package: getBundleId(),
        },
        web: {
            bundler: 'metro',
            output: 'server',
            favicon: './src/assets/images/favicon.png',
        },
        plugins: [
            'expo-router',
            [
                'expo-splash-screen',
                {
                    image: "./src/assets/images/icon.png",
                    imageWidth: 200,
                    resizeMode: "contain",
                    backgroundColor: "#ffffff"
                }
            ],
            "expo-font",
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {},
            eas: {
                projectId: 'f84427f0-b552-4c5a-ba30-bd5ec6a135d5'
            }
        },
    },
};
