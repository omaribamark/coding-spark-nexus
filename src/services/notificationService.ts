import api from './api';

export interface UnreadVerdictNotification {
  notification_id: string;
  claim_id: string;
  claim_title: string;
  verdict: string;
  verdict_date: string;
}

class NotificationService {
  // Get unread verdicts count
  async getUnreadVerdictsCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread-verdicts');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch unread verdicts');
      }

      return response.data.unreadCount || 0;
    } catch (error: any) {
      console.error('Error fetching unread verdicts count:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch unread verdicts count');
    }
  }

  // Get all unread verdict notifications
  async getUnreadVerdicts(): Promise<UnreadVerdictNotification[]> {
    try {
      const response = await api.get('/notifications/unread-verdicts');
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch unread verdicts');
      }

      return response.data.notifications || [];
    } catch (error: any) {
      console.error('Error fetching unread verdicts:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to fetch unread verdicts');
    }
  }

  // Mark verdict as read
  async markVerdictAsRead(claimId: string): Promise<void> {
    try {
      const response = await api.post(`/notifications/verdicts/${claimId}/read`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to mark verdict as read');
      }
    } catch (error: any) {
      console.error('Error marking verdict as read:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to mark verdict as read');
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
