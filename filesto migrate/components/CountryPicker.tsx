import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  SafeAreaView,
} from 'react-native';

// Comprehensive list of countries with calling codes and flags
export const COUNTRIES = [
  { code: 'KE', name: 'Kenya', callingCode: '254', flag: '🇰🇪' },
  { code: 'UG', name: 'Uganda', callingCode: '256', flag: '🇺🇬' },
  { code: 'TZ', name: 'Tanzania', callingCode: '255', flag: '🇹🇿' },
  { code: 'RW', name: 'Rwanda', callingCode: '250', flag: '🇷🇼' },
  { code: 'ET', name: 'Ethiopia', callingCode: '251', flag: '🇪🇹' },
  { code: 'SS', name: 'South Sudan', callingCode: '211', flag: '🇸🇸' },
  { code: 'SO', name: 'Somalia', callingCode: '252', flag: '🇸🇴' },
  { code: 'DJ', name: 'Djibouti', callingCode: '253', flag: '🇩🇯' },
  { code: 'ER', name: 'Eritrea', callingCode: '291', flag: '🇪🇷' },
  { code: 'BI', name: 'Burundi', callingCode: '257', flag: '🇧🇮' },
  { code: 'CD', name: 'DR Congo', callingCode: '243', flag: '🇨🇩' },
  { code: 'ZA', name: 'South Africa', callingCode: '27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', callingCode: '234', flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', callingCode: '233', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt', callingCode: '20', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', callingCode: '212', flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', callingCode: '213', flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', callingCode: '216', flag: '🇹🇳' },
  { code: 'LY', name: 'Libya', callingCode: '218', flag: '🇱🇾' },
  { code: 'SD', name: 'Sudan', callingCode: '249', flag: '🇸🇩' },
  { code: 'CM', name: 'Cameroon', callingCode: '237', flag: '🇨🇲' },
  { code: 'CI', name: "Côte d'Ivoire", callingCode: '225', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', callingCode: '221', flag: '🇸🇳' },
  { code: 'ZM', name: 'Zambia', callingCode: '260', flag: '🇿🇲' },
  { code: 'ZW', name: 'Zimbabwe', callingCode: '263', flag: '🇿🇼' },
  { code: 'MW', name: 'Malawi', callingCode: '265', flag: '🇲🇼' },
  { code: 'MZ', name: 'Mozambique', callingCode: '258', flag: '🇲🇿' },
  { code: 'AO', name: 'Angola', callingCode: '244', flag: '🇦🇴' },
  { code: 'BW', name: 'Botswana', callingCode: '267', flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', callingCode: '264', flag: '🇳🇦' },
  { code: 'US', name: 'United States', callingCode: '1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', callingCode: '44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', callingCode: '1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', callingCode: '61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', callingCode: '49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', callingCode: '33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', callingCode: '39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', callingCode: '34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', callingCode: '31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', callingCode: '32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', callingCode: '41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', callingCode: '43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', callingCode: '46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', callingCode: '47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', callingCode: '45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', callingCode: '358', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', callingCode: '48', flag: '🇵🇱' },
  { code: 'PT', name: 'Portugal', callingCode: '351', flag: '🇵🇹' },
  { code: 'IE', name: 'Ireland', callingCode: '353', flag: '🇮🇪' },
  { code: 'GR', name: 'Greece', callingCode: '30', flag: '🇬🇷' },
  { code: 'CZ', name: 'Czech Republic', callingCode: '420', flag: '🇨🇿' },
  { code: 'RO', name: 'Romania', callingCode: '40', flag: '🇷🇴' },
  { code: 'HU', name: 'Hungary', callingCode: '36', flag: '🇭🇺' },
  { code: 'UA', name: 'Ukraine', callingCode: '380', flag: '🇺🇦' },
  { code: 'RU', name: 'Russia', callingCode: '7', flag: '🇷🇺' },
  { code: 'TR', name: 'Turkey', callingCode: '90', flag: '🇹🇷' },
  { code: 'IN', name: 'India', callingCode: '91', flag: '🇮🇳' },
  { code: 'CN', name: 'China', callingCode: '86', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', callingCode: '81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', callingCode: '82', flag: '🇰🇷' },
  { code: 'SG', name: 'Singapore', callingCode: '65', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', callingCode: '60', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', callingCode: '62', flag: '🇮🇩' },
  { code: 'TH', name: 'Thailand', callingCode: '66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', callingCode: '84', flag: '🇻🇳' },
  { code: 'PH', name: 'Philippines', callingCode: '63', flag: '🇵🇭' },
  { code: 'PK', name: 'Pakistan', callingCode: '92', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', callingCode: '880', flag: '🇧🇩' },
  { code: 'AE', name: 'UAE', callingCode: '971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', callingCode: '966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', callingCode: '974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', callingCode: '965', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', callingCode: '968', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', callingCode: '973', flag: '🇧🇭' },
  { code: 'IL', name: 'Israel', callingCode: '972', flag: '🇮🇱' },
  { code: 'JO', name: 'Jordan', callingCode: '962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', callingCode: '961', flag: '🇱🇧' },
  { code: 'BR', name: 'Brazil', callingCode: '55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', callingCode: '52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', callingCode: '54', flag: '🇦🇷' },
  { code: 'CO', name: 'Colombia', callingCode: '57', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', callingCode: '56', flag: '🇨🇱' },
  { code: 'PE', name: 'Peru', callingCode: '51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', callingCode: '58', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', callingCode: '593', flag: '🇪🇨' },
  { code: 'NZ', name: 'New Zealand', callingCode: '64', flag: '🇳🇿' },
];

export type CountryData = {
  code: string;
  name: string;
  callingCode: string;
  flag: string;
};

type CountryPickerProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryData) => void;
  selectedCountryCode?: string;
};

export const CountryPickerModal: React.FC<CountryPickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountryCode = 'KE',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return COUNTRIES;
    const query = searchQuery.toLowerCase();
    return COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query) ||
        country.callingCode.includes(query)
    );
  }, [searchQuery]);

  const renderCountryItem = ({ item }: { item: CountryData }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item);
        setSearchQuery('');
      }}
      className="flex-row items-center py-3 px-4 border-b border-gray-100"
      style={{
        backgroundColor: item.code === selectedCountryCode ? '#E8F5E9' : 'transparent',
      }}
    >
      <Text className="text-2xl mr-3">{item.flag}</Text>
      <View className="flex-1">
        <Text className="text-base font-pmedium text-gray-900">{item.name}</Text>
        <Text className="text-sm text-gray-500">+{item.callingCode}</Text>
      </View>
      {item.code === selectedCountryCode && (
        <Text className="text-lg" style={{ color: '#0A864D' }}>✓</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%' }}>
          <SafeAreaView>
            {/* Header */}
            <View className="p-4 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-lg font-pbold text-gray-900">Select Country</Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>

              {/* Search Input */}
              <View
                className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2"
              >
                <Text className="text-gray-400 mr-2">🔍</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search country..."
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-base text-gray-900 font-pregular"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text className="text-gray-400 text-lg">✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Country List */}
            <FlatList
              data={filteredCountries}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              windowSize={10}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text className="text-gray-500 font-pregular">No countries found</Text>
                </View>
              }
            />
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

// Simple country display component for showing selected country
type CountryDisplayProps = {
  countryCode: string;
  onPress: () => void;
  showName?: boolean;
};

export const CountryDisplay: React.FC<CountryDisplayProps> = ({
  countryCode,
  onPress,
  showName = true,
}) => {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  return (
    <TouchableOpacity onPress={onPress} className="flex-row items-center">
      <Text className="text-xl mr-2">{country.flag}</Text>
      {showName && (
        <Text className="text-gray-800 font-pregular">{country.name}</Text>
      )}
    </TouchableOpacity>
  );
};

// Get country by code
export const getCountryByCode = (code: string): CountryData | undefined => {
  return COUNTRIES.find((c) => c.code === code);
};

// Get default Kenya country
export const getDefaultCountry = (): CountryData => {
  return COUNTRIES.find((c) => c.code === 'KE') || COUNTRIES[0];
};

export default CountryPickerModal;
