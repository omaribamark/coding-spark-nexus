import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { claimsService, Claim } from '@/services/claimsService';
import { formatDate } from '@/utils/dateFormatter';
import { useTheme } from '@/context/ThemeContext';

const VerifiedClaimsTab = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchVerifiedClaims();
    }, [])
  );

  const fetchVerifiedClaims = async () => {
    setLoading(true);
    try {
      const data = await claimsService.getAllVerifiedClaims();
      
      const sortedClaims = data.sort((a, b) => {
        const dateA = new Date(a.verdictDate || a.updated_at || a.created_at || 0);
        const dateB = new Date(b.verdictDate || b.updated_at || b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setClaims(sortedClaims);
    } catch (error: any) {
      const userMessage = error.message?.includes('Network') 
        ? 'Please check your internet connection and try again.' 
        : 'Failed to load verified claims.';
      Alert.alert('Error', userMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchVerifiedClaims();
  };

  const getStatusColor = (claim: Claim) => {
    const finalStatus = claim.verdict || claim.status;
    switch (finalStatus) {
      case 'true':
      case 'verified':
        return '#DCFCE7';
      case 'false':
        return '#FEE2E2';
      case 'misleading':
        return '#FFEDD5';
      case 'needs_context':
      case 'unverifiable':
        return '#FEF9C3';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusTextColor = (claim: Claim) => {
    const finalStatus = claim.verdict || claim.status;
    switch (finalStatus) {
      case 'true':
      case 'verified':
        return '#15803D';
      case 'false':
        return '#B91C1C';
      case 'misleading':
        return '#C2410C';
      case 'needs_context':
      case 'unverifiable':
        return '#A16207';
      default:
        return '#374151';
    }
  };

  const getStatusLabel = (claim: Claim) => {
    const finalStatus = claim.verdict || claim.status;
    switch (finalStatus) {
      case 'true':
      case 'verified':
        return '✓ True';
      case 'false':
        return '✗ False';
      case 'misleading':
        return '⚠ Misleading';
      case 'needs_context':
      case 'unverifiable':
        return '📋 Needs Context';
      default:
        return '⏳ Pending';
    }
  };

  const getVerificationBadge = (claim: Claim) => {
    if (claim.verified_by_ai) {
      return { text: 'AI Verified', emoji: '🤖', color: '#DBEAFE', textColor: '#1D4ED8' };
    }
    return { text: 'Human Verified', emoji: '👤', color: '#F3E8FF', textColor: '#7C3AED' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#111827' : '#fff' }}>
      <ScrollView 
        style={{ flex: 1 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0A864D']} />}
      >
        {loading && (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0A864D" />
          </View>
        )}

        <View style={{ paddingHorizontal: 24, paddingVertical: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>All Verified Claims</Text>
            <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ color: '#15803D', fontSize: 12, fontWeight: '700' }}>{claims.length} Claims</Text>
            </View>
          </View>

          {claims.map((claim) => {
            const verificationBadge = getVerificationBadge(claim);
            
            return (
              <TouchableOpacity
                key={claim.id}
                onPress={() => router.push(`/claim-details?claimId=${claim.id}`)}
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#fff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#F3F4F6',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ backgroundColor: '#0A864D', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                      <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{claim.category || 'General'}</Text>
                    </View>
                    <View style={{ backgroundColor: verificationBadge.color, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 8 }}>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: verificationBadge.textColor }}>
                        {verificationBadge.emoji} {verificationBadge.text}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={{ color: isDark ? '#fff' : '#111827', fontWeight: '700', fontSize: 16, marginBottom: 8, lineHeight: 20 }}>
                  {claim.title}
                </Text>

                {claim.description && (
                  <Text style={{ color: isDark ? '#D1D5DB' : '#4B5563', fontSize: 14, marginBottom: 12, lineHeight: 20 }} numberOfLines={2}>
                    {claim.description}
                  </Text>
                )}

                <View style={{ backgroundColor: getStatusColor(claim), paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: getStatusTextColor(claim) }}>{getStatusLabel(claim)}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDark ? '#374151' : '#F3F4F6' }}>
                  <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 12 }}>
                    Submitted: {formatDate(claim.submittedDate || claim.created_at || '')}
                  </Text>
                  {claim.verdictDate && (
                    <Text style={{ color: '#059669', fontSize: 12, fontWeight: '500' }}>
                      Verified: {formatDate(claim.verdictDate || claim.updated_at || '')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Empty State */}
          {claims.length === 0 && !loading && (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 48 }}>
              <View style={{ width: 64, height: 64, backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 24 }}>✓</Text>
              </View>
              <Text style={{ color: isDark ? '#9CA3AF' : '#6B7280', fontSize: 14, textAlign: 'center' }}>
                No verified claims yet{"\n"}
                <Text style={{ color: isDark ? '#4B5563' : '#9CA3AF' }}>Check back later</Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default VerifiedClaimsTab;
