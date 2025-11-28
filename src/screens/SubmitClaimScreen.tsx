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

  // Convert image to base64
  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      console.log('🔄 Converting image to base64:', uri);
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          console.log('✅ Image converted to base64, length:', base64String.length);
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  };

  const handleSubmit = async () => {
    if (!claimText.trim()) {
      Alert.alert('Validation Error', 'Please enter the claim text');
      return;
    }

    // Show immediate popup if image is included
    if (imageUri) {
      Alert.alert(
        '👤 Human Fact-Checker Review',
        'Your claim includes an image and will be thoroughly reviewed by our expert human fact-checkers to ensure accurate verification of visual evidence.',
        [{ text: 'OK' }]
      );
    }

    setIsSubmitting(true);
    
    try {
      // Convert image to base64 if present
      let imageBase64: string | undefined = undefined;
      if (imageUri) {
        imageBase64 = await convertImageToBase64(imageUri);
      }

      const response = await claimsService.submitClaim({
        category: 'general',
        claimText: claimText,
        videoLink: videoLink,
        sourceLink: sourceLink,
        imageUrl: imageBase64 || undefined,
      });
      
      const claimId = response.claim?.id || response.claimId;
      
      if (!claimId) {
        throw new Error('No claim ID returned from server');
      }

      // Skip AI polling if image/video/links are present (human review needed)
      if (imageUri || videoLink || sourceLink) {
        console.log('📋 Claim submitted for human fact-checker review');
        setIsSubmitting(false);
        
        // Reset form
        setClaimText('');
        setVideoLink('');
        setSourceLink('');
        setImageUri(null);
        
        // Navigate to claim details
        navigation.navigate('ClaimDetails', { 
          claimId: claimId
        });
        return;
      }

      // Poll for AI verdict only for text-only claims (faster: max 1.8 seconds with 300ms intervals)
      console.log('⏳ Waiting for AI verdict...');
      const claimWithVerdict = await claimsService.pollForAIVerdict(claimId, 6, 300);
      
      setIsSubmitting(false);
      
      // Reset form
      setClaimText('');
      setVideoLink('');
      setSourceLink('');
      setImageUri(null);
      
      // Navigate to claim details to show AI verdict
      navigation.navigate('ClaimDetails', { 
        claimId: claimId,
        claim: claimWithVerdict 
      });
      
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

        {/* Human Review Notice */}
        {(imageUri || videoLink || sourceLink) && (
          <View className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <View className="flex-row items-start">
              <Text className="text-2xl mr-3">👤</Text>
              <View className="flex-1">
                <Text className="text-amber-900 font-psemibold text-sm mb-1">
                  Human Fact-Checker Review
                </Text>
                <Text className="text-amber-700 font-pregular text-xs leading-5">
                  Claims including images, video links, and other links will be thoroughly reviewed by our expert human fact-checkers to ensure accurate verification of visual evidence.
                </Text>
              </View>
            </View>
          </View>
        )}

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