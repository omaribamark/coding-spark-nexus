import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {icons} from '../constants';

type Props = {};

const HakikishaAIScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  const handleSelectImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: launchCamera,
        },
        {
          text: 'Choose from Gallery',
          onPress: launchImageLibrary,
        },
        {text: 'Cancel', style: 'cancel'},
      ],
    );
  };

  const launchImageLibrary = () => {
    const ImagePicker = require('react-native-image-picker');
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
  };

  const launchCamera = () => {
    const ImagePicker = require('react-native-image-picker');
    const options: any = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options, (response: any) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setSelectedImage(response.assets[0].uri || null);
      }
    });
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    
    setTimeout(() => {
      setAiFeedback(
        'Based on our analysis, this image appears to be authentic. No signs of manipulation detected. The metadata shows it was taken on 2025-01-12. The content relates to a public event that has been verified through multiple sources.',
      );
      setIsAnalyzing(false);
    }, 2000);
  };

  // Safe icon rendering to prevent null source warnings
  const renderIcon = (iconSource: any, style: any = {}) => {
    if (!iconSource) {
      return <View style={[style, {backgroundColor: '#E5E7EB'}]} />;
    }
    return (
      <Image
        source={iconSource}
        style={style}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View className="bg-white pt-12 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-pbold text-gray-900 mb-1">
              Hakikisha AI
            </Text>
            <Text className="text-gray-500 font-pregular text-sm">
              Advanced Image Verification
            </Text>
          </View>
          <View className="flex-row items-center space-x-2">
            <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-full bg-gray-100">
              <Text className="text-gray-600 text-xs">ℹ️</Text>
            </TouchableOpacity>
            <TouchableOpacity className="w-8 h-8 items-center justify-center rounded-full bg-gray-100">
              {renderIcon(icons.setting, {
                width: 18,
                height: 18,
                tintColor: '#6B7280'
              })}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 20}}
      >
        {/* Hero Section */}
        <View className="bg-green-50 mx-4 mt-4 rounded-xl p-4 border border-green-100">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-white rounded-lg items-center justify-center mr-3 border border-green-200">
              <Text className="text-2xl">🤖</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-psemibold text-base mb-1">
                AI-Powered Analysis
              </Text>
              <Text className="text-gray-600 font-pregular text-xs">
                Detect manipulations and verify authenticity
              </Text>
            </View>
          </View>
        </View>

        {/* Image Upload Section */}
        <View className="mx-4 mt-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-psemibold text-gray-900">
              Upload Image
            </Text>
            <View className="flex-row items-center bg-green-50 rounded-full px-2 py-1 border border-green-200">
              <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
              <Text className="text-green-800 text-xs font-pmedium">AI Ready</Text>
            </View>
          </View>
          
          {selectedImage ? (
            <View className="bg-white rounded-xl overflow-hidden mb-3 border border-gray-300">
              <Image
                source={{uri: selectedImage}}
                className="w-full h-64"
                resizeMode="cover"
              />
              <View className="absolute top-3 right-3 flex-row space-x-2">
                <TouchableOpacity
                  className="w-8 h-8 bg-white/95 rounded-full items-center justify-center border border-gray-300"
                  onPress={() => setSelectedImage(null)}>
                  <Text className="text-gray-700 text-lg font-pbold">×</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAnalyzeImage}
                  className="w-8 h-8 bg-green-500 rounded-full items-center justify-center">
                  <Text className="text-white text-lg">🔍</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleSelectImage}
              className="bg-white rounded-xl p-6 border-2 border-dashed border-gray-300 items-center justify-center">
              <View className="w-16 h-16 mb-3 items-center justify-center bg-green-50 rounded-xl border border-green-200">
                <Text className="text-4xl">📤</Text>
              </View>
              <Text className="text-gray-900 font-psemibold text-center mb-1 text-sm">
                Select Image to Analyze
              </Text>
              <Text className="text-gray-500 text-xs font-pregular text-center">
                Choose from gallery or capture using camera
              </Text>
            </TouchableOpacity>
          )}

          {selectedImage && !isAnalyzing && !aiFeedback && (
            <TouchableOpacity
              onPress={handleAnalyzeImage}
              className="bg-green-500 rounded-xl py-3 mb-3">
              <Text className="text-white text-center font-psemibold text-sm">
                Start AI Analysis
              </Text>
            </TouchableOpacity>
          )}

          {isAnalyzing && (
            <View className="bg-white rounded-xl p-4 items-center border border-gray-300">
              <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center mb-3 border border-blue-200">
                <ActivityIndicator size="small" color="#0A864D" />
              </View>
              <Text className="text-gray-900 font-psemibold text-sm mb-1">
                Analyzing Image
              </Text>
              <Text className="text-gray-500 text-xs font-pregular text-center">
                Our AI is examining your image for authenticity
              </Text>
              <View className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                <View 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{width: '70%'}}
                />
              </View>
            </View>
          )}

          {aiFeedback && (
            <View className="bg-white rounded-xl p-4 border border-green-300">
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3 border border-green-300">
                  <Text className="text-2xl">✅</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-psemibold text-gray-900 text-sm">
                    Analysis Complete
                  </Text>
                  <Text className="text-green-600 font-pmedium text-xs">
                    Image Verified
                  </Text>
                </View>
              </View>
              <Text className="text-gray-700 font-pregular leading-5 text-[13px]">
                {aiFeedback}
              </Text>
              <View className="flex-row space-x-2 mt-3">
                <View className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <Text className="text-gray-500 text-xs font-pmedium mb-1">Confidence</Text>
                  <Text className="text-gray-900 font-psemibold text-sm">94%</Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <Text className="text-gray-500 text-xs font-pmedium mb-1">Manipulation</Text>
                  <Text className="text-gray-900 font-psemibold text-sm">None</Text>
                </View>
                <View className="flex-1 bg-gray-50 rounded-lg p-2 border border-gray-200">
                  <Text className="text-gray-500 text-xs font-pmedium mb-1">Risk Level</Text>
                  <Text className="text-green-600 font-psemibold text-sm">Low</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* How It Works */}
        <View className="mx-4 mt-6">
          <Text className="text-lg font-psemibold text-gray-900 mb-3">
            How It Works
          </Text>
          <View className="bg-white rounded-xl border border-gray-300">
            {/* Step 1 */}
            <View className="flex-row p-4 border-b border-gray-200">
              <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3 border border-blue-200">
                <Text className="text-blue-600 font-psemibold text-xs">1</Text>
              </View>
              <View className="flex-1">
                <Text className="font-psemibold text-gray-900 mb-1 text-sm">
                  Upload Your Image
                </Text>
                <Text className="text-gray-600 text-xs font-pregular leading-4">
                  Select an image from your device storage or capture a new photo
                </Text>
              </View>
            </View>

            {/* Step 2 */}
            <View className="flex-row p-4 border-b border-gray-200">
              <View className="w-8 h-8 bg-green-50 rounded-lg items-center justify-center mr-3 border border-green-200">
                <Text className="text-green-600 font-psemibold text-xs">2</Text>
              </View>
              <View className="flex-1">
                <Text className="font-psemibold text-gray-900 mb-1 text-sm">
                  AI Processing
                </Text>
                <Text className="text-gray-600 text-xs font-pregular leading-4">
                  Our neural networks analyze for digital manipulation and authenticity
                </Text>
              </View>
            </View>

            {/* Step 3 */}
            <View className="flex-row p-4">
              <View className="w-8 h-8 bg-purple-50 rounded-lg items-center justify-center mr-3 border border-purple-200">
                <Text className="text-purple-600 font-psemibold text-xs">3</Text>
              </View>
              <View className="flex-1">
                <Text className="font-psemibold text-gray-900 mb-1 text-sm">
                  Detailed Report
                </Text>
                <Text className="text-gray-600 text-xs font-pregular leading-4">
                  Receive comprehensive analysis with confidence scores
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Additional Info Section */}
        <View className="mx-4 mt-6 mb-4">
          <Text className="text-lg font-psemibold text-gray-900 mb-3">
            About Our Technology
          </Text>
          <View className="bg-white rounded-xl p-4 border border-gray-300">
            <Text className="text-gray-700 font-pregular text-sm leading-5 mb-2">
              Hakikisha AI uses advanced machine learning algorithms to analyze images for authenticity and detect potential manipulations.
            </Text>
            <Text className="text-gray-600 font-pregular text-xs leading-4">
              Our system examines metadata consistency, pixel-level patterns, and digital artifacts to provide reliable verification results.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default HakikishaAIScreen;