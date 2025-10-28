import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CustomButton} from '../components';
import {claimsService} from '../services/claimsService';

import * as ImagePicker from 'react-native-image-picker';

type Props = {};

const SubmitClaimScreen = (props: Props) => {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [claimText, setClaimText] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [sourceLink, setSourceLink] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!claimText.trim()) {
      Alert.alert('Validation Error', 'Please enter the claim text');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await claimsService.submitClaim({
        category: 'general', // Backend will handle categorization
        claimText: claimText,
        videoLink: videoLink,
        sourceLink: sourceLink,
        imageUrl: imageUri || undefined,
      });
      
      setIsSubmitting(false);
      Alert.alert(
        'Success',
        'Your claim has been submitted for verification',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form and navigate back
              setClaimText('');
              setVideoLink('');
              setSourceLink('');
              setImageUri(null);
              navigation.navigate('Home', { refresh: true });
            },
          },
        ],
      );
      
    } catch (error: any) {
      setIsSubmitting(false);
      console.error('Submit claim error:', error);
      const userMessage = error.message?.includes('Network') 
        ? 'Please check your internet connection and try again.' 
        : error.message || 'Failed to submit claim. Please try again.';
      Alert.alert('Submission Failed', userMessage);
    }
  };

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
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const launchImageLibrary = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  const launchCamera = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.errorCode) {
        Alert.alert('Error', 'Failed to take photo. Please try again.');
      } else if (response.assets && response.assets[0]) {
        setImageUri(response.assets[0].uri || null);
      }
    });
  };

  // Function to format category names for display
  const formatCategoryName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Clean Header */}
      <View className="bg-white pt-4 pb-4 px-6 border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-gray-900 text-xl">←</Text>
          </TouchableOpacity>
          <Text className="text-gray-900 text-lg font-pbold">Submit Claim</Text>
          <View style={{width: 24}} />
        </View>
      </View>

      <View className="px-6 py-4">
        {/* Claim Text */}
        <View className="mb-5">
          <Text className="text-base font-pbold text-gray-900 mb-2">
            Claim Description
          </Text>
          <TextInput
            value={claimText}
            onChangeText={setClaimText}
            placeholder="Enter the claim you want to verify..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 font-pregular text-sm"
            style={{minHeight: 100}}
          />
        </View>

        {/* Image Upload */}
        <View className="mb-5">
          <Text className="text-base font-pbold text-gray-900 mb-2">
            Evidence (Optional)
          </Text>
          <TouchableOpacity
            onPress={handleSelectImage}
            className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300 items-center">
            {imageUri ? (
              <>
                <Image 
                  source={{uri: imageUri}} 
                  className="w-full h-40 rounded-lg mb-2"
                  resizeMode="cover"
                />
                <TouchableOpacity onPress={() => setImageUri(null)}>
                  <Text className="text-red-500 font-pmedium text-xs">Remove Image</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-gray-600 font-pmedium text-xs mb-1">
                  📷 Upload Image
                </Text>
                <Text className="text-gray-400 font-pregular text-xs">
                  Add photo evidence
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Video Link */}
        <View className="mb-5">
          <Text className="text-base font-pbold text-gray-900 mb-2">
            Video Link (Optional)
          </Text>
          <TextInput
            value={videoLink}
            onChangeText={setVideoLink}
            placeholder="https://youtube.com/..."
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 font-pregular text-sm"
          />
        </View>

        {/* Source Link */}
        <View className="mb-6">
          <Text className="text-base font-pbold text-gray-900 mb-2">
            Source Link (Optional)
          </Text>
          <TextInput
            value={sourceLink}
            onChangeText={setSourceLink}
            placeholder="https://..."
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 font-pregular text-sm"
          />
        </View>

        {/* Submit Button */}
        <CustomButton
          title="Submit Claim"
          handlePress={handleSubmit}
          isLoading={isSubmitting}
          containerStyle="py-2"
        />

        <View className="mt-5 bg-blue-50 rounded-xl p-3">
          <Text className="text-blue-800 font-pmedium text-xs text-center">
            ℹ️ Your claim will be reviewed by our fact-checkers
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SubmitClaimScreen;