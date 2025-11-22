import { Share, Platform, Linking } from 'react-native';

export const shareService = {
  shareBlog: async (blog: { title: string; id: string; excerpt?: string }) => {
    try {
      // Fallback URLs for app stores
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.front_end';
      const appStoreUrl = 'https://apps.apple.com/app/hakikisha/id123456789'; // Update with actual ID
      
      // Create shareable message with Play Store link
      const shareMessage = `${blog.title}\n\n${blog.excerpt || 'Read more in the Hakikisha app!'}\n\n📱 Download Hakikisha:\n${Platform.OS === 'ios' ? appStoreUrl : playStoreUrl}`;
      
      const result = await Share.share({
        message: shareMessage,
        title: blog.title,
      });

      return result;
    } catch (error: any) {
      console.error('Error sharing blog:', error);
      throw new Error('Failed to share blog. Please try again.');
    }
  },

  shareToWhatsApp: async (blog: { title: string; id: string; excerpt?: string }) => {
    try {
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.front_end';
      
      const message = encodeURIComponent(
        `${blog.title}\n\n${blog.excerpt || 'Read more in Hakikisha!'}\n\n📱 Download Hakikisha: ${playStoreUrl}`
      );
      
      const whatsappUrl = `whatsapp://send?text=${message}`;
      
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        throw new Error('WhatsApp is not installed');
      }
    } catch (error: any) {
      console.error('Error sharing to WhatsApp:', error);
      throw new Error(error.message || 'Failed to share to WhatsApp');
    }
  },

  shareToFacebook: async (blog: { title: string; id: string }) => {
    try {
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.front_end';
      
      // Fallback to web sharing with Play Store link
      const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(playStoreUrl)}`;
      await Linking.openURL(webUrl);
    } catch (error: any) {
      console.error('Error sharing to Facebook:', error);
      throw new Error('Failed to share to Facebook');
    }
  },

  shareToTwitter: async (blog: { title: string; id: string; excerpt?: string }) => {
    try {
      const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.front_end';
      
      const tweetText = encodeURIComponent(
        `${blog.title}\n\n${blog.excerpt || 'Read more in Hakikisha!'}\n\n📱 Download: ${playStoreUrl}`
      );
      
      const twitterUrl = `twitter://post?message=${tweetText}`;
      
      const canOpen = await Linking.canOpenURL(twitterUrl);
      if (canOpen) {
        await Linking.openURL(twitterUrl);
      } else {
        // Fallback to web
        const webUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
        await Linking.openURL(webUrl);
      }
    } catch (error: any) {
      console.error('Error sharing to Twitter:', error);
      throw new Error('Failed to share to Twitter');
    }
  },
};
