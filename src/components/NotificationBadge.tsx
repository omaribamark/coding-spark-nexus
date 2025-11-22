import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NotificationBadgeProps {
  count: number;
  size?: 'small' | 'medium';
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, size = 'small' }) => {
  console.log('🔴 NotificationBadge render - count:', count);
  
  if (count <= 0) {
    console.log('🔴 Badge hidden - count is 0 or negative');
    return null;
  }

  const displayCount = count > 99 ? '99+' : count.toString();
  const badgeSize = size === 'small' ? 18 : 22;
  const fontSize = size === 'small' ? 10 : 12;

  console.log('🔴 Badge showing - displayCount:', displayCount);

  return (
    <View style={[styles.badge, { minWidth: badgeSize, height: badgeSize }]}>
      <Text style={[styles.badgeText, { fontSize }]}>{displayCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default NotificationBadge;
