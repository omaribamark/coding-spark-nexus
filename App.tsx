import React, {useEffect, useState} from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  ForgotPasswordScreen,
  HomeScreen,
  LoginScreen,
  OnboardingScreen,
  ProfileScreen,
  SignupScreen,
  AdminDashboardScreen,
  FactCheckerDashboardScreen,
  VerifyEmailScreen,
  TwoFactorAuthScreen,
} from './src/screens';
import PlaceOrder from './src/screens/SubmitClaimScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import HakikishaAIScreen from './src/screens/HakikishaAIScreen';
import TrendingClaimsScreen from './src/screens/TrendingClaimsScreen';
import BlogDetailScreen from './src/screens/BlogDetailScreen';
import ClaimDetailsScreen from './src/tabs/ClaimDetailsScreen';
import AboutAppScreen from './src/screens/AboutAppScreen';
import SplashScreen from 'react-native-splash-screen';
import GetStartedScreen from './src/screens/GetStartedScreen';
import {getItem} from './src/utils/AsyncStorage';
import {ActivityIndicator, View} from 'react-native';
import { ThemeProvider } from './src/context/ThemeContext';

export type RouteStackParamList = {
  Onboarding: undefined;
  GetStarted: undefined;
  Login: undefined;
  Signup: undefined;
  HomeScreen: undefined;
  AdminDashboard: undefined;
  FactCheckerDashboard: undefined;
  Profile: undefined;
  SubmitClaim: undefined;
  ForgotPassword: undefined;
  PrivacyPolicy: undefined;
  HakikishaAI: undefined;
  TrendingClaims: undefined;
  BlogDetail: { blog: any } | undefined;
  ClaimDetails: { claimId: string };
  AboutApp: undefined;
  VerifyEmail: { userId: string; email: string };
  TwoFactorAuth: { userId: string; email: string; role: string };
};

const App = () => {
  const Stack = createNativeStackNavigator<RouteStackParamList>();
  const [showOnboarded, setShowOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    SplashScreen.hide();
    checkIfAlreadyOnboarded();
  }, []);

  const checkIfAlreadyOnboarded = async () => {
    const onboarded = await getItem('onboarded');
    const isAuthenticated = await getItem('isAuthenticated');
    
    if (onboarded === 200) {
      // Check if user is authenticated
      if (isAuthenticated === 'true') {
        // User is logged in, go to HomeScreen
        setShowOnboarded(false);
      } else {
        // User has onboarded but not logged in, show GetStarted
        setShowOnboarded(false);
      }
    } else {
      // User hasn't onboarded yet
      setShowOnboarded(true);
    }
  };

  if (showOnboarded === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={'large'} color={'#F3F3F3'} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemeProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{headerShown: false}}
            initialRouteName={showOnboarded ? 'Onboarding' : 'GetStarted'}>
            <Stack.Screen name="HomeScreen" component={HomeScreen} />
            <Stack.Screen name="GetStarted" component={GetStartedScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="SubmitClaim" component={PlaceOrder} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
            />
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
            />
            <Stack.Screen
              name="FactCheckerDashboard"
              component={FactCheckerDashboardScreen}
            />
            <Stack.Screen
              name="HakikishaAI"
              component={HakikishaAIScreen}
            />
            <Stack.Screen
              name="TrendingClaims"
              component={TrendingClaimsScreen}
            />
            <Stack.Screen
              name="BlogDetail"
              component={BlogDetailScreen}
            />
            <Stack.Screen
              name="ClaimDetails"
              component={ClaimDetailsScreen}
            />
            <Stack.Screen
              name="AboutApp"
              component={AboutAppScreen}
            />
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
            />
            <Stack.Screen
              name="TwoFactorAuth"
              component={TwoFactorAuthScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default App;