
const firebaseConfig = {
    apiKey: "AIzaSyAs44uSpR_I-P2KzCdl41tISQ5Vp5AYvOA",
    authDomain: "pkkc-prd.firebaseapp.com",
    projectId: "pkkc-prd",
    storageBucket: "pkkc-prd.firebasestorage.app",
    messagingSenderId: "800170741015",
    appId: "1:800170741015:web:319f7d1166631dc48c3b52",
    measurementId: "G-HZXZ8Y7SK6"
};

const firebaseConfigStg = {
    apiKey: "AIzaSyAbgSHbcfaSbT2s0gMGUbMBUEPE0P3-ODM",
    authDomain: "pkkc-stg.firebaseapp.com",
    projectId: "pkkc-stg",
    storageBucket: "pkkc-stg.firebasestorage.app",
    messagingSenderId: "891231581063",
    appId: "1:891231581063:web:f7ef304672698bc5655922",
    measurementId: "G-6TQKZ01QP5"
};

// Environment-based configuration selection
const getFirebaseConfig = () => {
    const env = process.env.EXPO_PUBLIC_ENV || 'stg';

    switch (env) {
        case 'prd':
            return firebaseConfig;
        default:
            return firebaseConfigStg;
    }
};

export default getFirebaseConfig();