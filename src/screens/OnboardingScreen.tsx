import { View, Text, Image } from 'react-native';
import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { images } from '../constants';
import { SplashData } from '../constants/data';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { setItem } from '../utils/AsyncStorage';
import { RouteStackParamList } from '../../App';

type Props = {};
export type RootStackParamList = {
  Login: { id: number } | undefined;

};

const OnboardingScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();
  
  const handleDone = async () => {
    await setItem('onboarded', 200);
    navigation.navigate('GetStarted');
  };

  return (
    <View className="flex-1">
      <Onboarding
        onSkip={handleDone}
        onDone={handleDone}
        pages={[
          {
            backgroundColor: '#fff',
            image: <Image source={SplashData[0].image} />,
            title: <Text className="text-2xl font-pbold text-gray-900 text-center px-6">{SplashData[0].title}</Text>,
            subtitle: <Text className="text-base font-pregular text-gray-600 text-center px-8 mt-2">{SplashData[0].description}</Text>,
          },
          {
            backgroundColor: '#fff',
            image: <Image source={SplashData[1].image} />,
            title: <Text className="text-2xl font-pbold text-gray-900 text-center px-6">{SplashData[1].title}</Text>,
            subtitle: <Text className="text-base font-pregular text-gray-600 text-center px-8 mt-2">{SplashData[1].description}</Text>,
          },
          {
            backgroundColor: '#fff',
            image: <Image source={SplashData[2].image} />,
            title: <Text className="text-2xl font-pbold text-gray-900 text-center px-6">{SplashData[2].title}</Text>,
            subtitle: <Text className="text-base font-pregular text-gray-600 text-center px-8 mt-2">{SplashData[2].description}</Text>,
          },
        ]}
      />
    </View>
  );
};

export default OnboardingScreen;
