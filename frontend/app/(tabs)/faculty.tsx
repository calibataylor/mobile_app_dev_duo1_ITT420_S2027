import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi } from '@/src/hooks/useApi';
import { FacultyMember } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import LoadingScreen from '@/src/components/LoadingScreen';
import ErrorScreen from '@/src/components/ErrorScreen';

const ROLES = ['All', 'HOD', 'Lecturer', 'Admin'];

export default function FacultyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale, isFavorite, addFavorite, removeFavorite } = useSettings();
  const { data: faculty, loading, error, refetch } = useApi<FacultyMember[]>('/faculty');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');

  const filteredFaculty = useMemo(() => {
    if (!faculty) return [];
    return faculty.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'All' || member.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [faculty, searchQuery, selectedRole]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleConsultation = (member: FacultyMember) => {
    router.push({
      pathname: '/consultation',
      params: { name: member.name, email: member.email },
    });
  };

  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  };

  if (loading) return <LoadingScreen message="Loading faculty..." />;
  if (error) return <ErrorScreen message={error} onRetry={refetch} />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, highContrast && styles.highContrastSearch]}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={[styles.searchInput, { fontSize: 16 * fontScale }]}
            placeholder="Search by name or specialization"
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="Search faculty"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Role Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {ROLES.map((role) => (
          <TouchableOpacity
            key={role}
            style={[
              styles.filterChip,
              selectedRole === role && styles.filterChipActive,
              highContrast && selectedRole === role && styles.highContrastChipActive,
            ]}
            onPress={() => setSelectedRole(role)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedRole === role }}
          >
            <ThemedText
              variant="label"
              color={selectedRole === role ? (highContrast ? '#000' : COLORS.white) : COLORS.textSecondary}
            >
              {role}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Faculty List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: insets.bottom + SPACING.md }}
        showsVerticalScrollIndicator={false}
      >
        {filteredFaculty.map((member) => (
          <Card
            key={member.id}
            style={styles.facultyCard}
            onPress={() => router.push(`/faculty/${member.id}`)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.avatar, highContrast && styles.highContrastAvatar]}>
                <ThemedText variant="title" color={highContrast ? COLORS.highContrastAccent : COLORS.white}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </ThemedText>
              </View>
              <View style={styles.headerInfo}>
                <View style={styles.nameRow}>
                  <ThemedText variant="subtitle" numberOfLines={1} style={styles.name}>
                    {member.name}
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => toggleFavorite(member.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityLabel={isFavorite(member.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Ionicons
                      name={isFavorite(member.id) ? 'heart' : 'heart-outline'}
                      size={22}
                      color={isFavorite(member.id) ? COLORS.error : COLORS.textLight}
                    />
                  </TouchableOpacity>
                </View>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  {member.title}
                </ThemedText>
                <View style={styles.roleChip}>
                  <ThemedText variant="caption" color={COLORS.gold}>
                    {member.role}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.success }]}
                onPress={() => handleCall(member.phone)}
                accessibilityLabel={`Call ${member.name}`}
              >
                <Ionicons name="call" size={18} color={COLORS.white} />
                <ThemedText variant="caption" color={COLORS.white} style={styles.actionText}>
                  Call
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.info }]}
                onPress={() => handleEmail(member.email)}
                accessibilityLabel={`Email ${member.name}`}
              >
                <Ionicons name="mail" size={18} color={COLORS.white} />
                <ThemedText variant="caption" color={COLORS.white} style={styles.actionText}>
                  Email
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: COLORS.gold }]}
                onPress={() => handleConsultation(member)}
                accessibilityLabel={`Request consultation with ${member.name}`}
              >
                <Ionicons name="calendar" size={18} color={COLORS.navy} />
                <ThemedText variant="caption" color={COLORS.navy} style={styles.actionText}>
                  Consult
                </ThemedText>
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {filteredFaculty.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={COLORS.textLight} />
            <ThemedText variant="body" color={COLORS.textSecondary} style={styles.emptyText}>
              No faculty members found
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  highContrastBg: {
    backgroundColor: COLORS.highContrastBg,
  },
  searchContainer: {
    padding: SPACING.md,
    paddingBottom: 0,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...SHADOWS.sm,
  },
  highContrastSearch: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastText,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    color: COLORS.textPrimary,
  },
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.lightGray,
    marginRight: SPACING.sm,
  },
  filterChipActive: {
    backgroundColor: COLORS.navy,
  },
  highContrastChipActive: {
    backgroundColor: COLORS.highContrastAccent,
  },
  list: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  facultyCard: {
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  highContrastAvatar: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.highContrastAccent,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  roleChip: {
    marginTop: SPACING.xs,
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: 'rgba(212, 160, 23, 0.15)',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    minHeight: 44,
  },
  actionText: {
    marginLeft: SPACING.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    marginTop: SPACING.md,
  },
});
