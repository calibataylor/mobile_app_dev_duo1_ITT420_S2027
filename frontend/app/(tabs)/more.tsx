import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Modal,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi } from '@/src/hooks/useApi';
import { Announcement, FAQ, Resource, EmergencyContact, Deadline } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import LoadingScreen from '@/src/components/LoadingScreen';
import EmptyState from '@/src/components/EmptyState';

type Section = 'announcements' | 'admissions' | 'social' | 'resources' | 'emergency' | 'deadlines' | 'notes' | 'faq' | 'about' | 'favorites' | 'campus';

const SECTIONS = [
  { id: 'announcements', title: 'Announcements', icon: 'megaphone', color: '#F59E0B' },
  { id: 'admissions', title: 'Admissions', icon: 'school', color: '#3B82F6' },
  { id: 'social', title: 'Social Media', icon: 'share-social', color: '#8B5CF6' },
  { id: 'resources', title: 'Resources', icon: 'folder-open', color: '#10B981' },
  { id: 'emergency', title: 'Emergency', icon: 'warning', color: '#EF4444' },
  { id: 'deadlines', title: 'Deadlines', icon: 'calendar', color: '#EC4899' },
  { id: 'notes', title: 'My Notes', icon: 'document-text', color: '#6366F1' },
  { id: 'faq', title: 'FAQ', icon: 'help-circle', color: '#14B8A6' },
  { id: 'campus', title: 'Campus Map', icon: 'map', color: '#06B6D4' },
  { id: 'favorites', title: 'Favorites', icon: 'heart', color: '#F43F5E' },
  { id: 'about', title: 'About', icon: 'information-circle', color: '#64748B' },
];

const SOCIAL_LINKS = [
  { name: 'Facebook', icon: 'logo-facebook', url: 'https://www.facebook.com/UCCjamaica', color: '#1877F2' },
  { name: 'Instagram', icon: 'logo-instagram', url: 'https://www.instagram.com/uccjamaica', color: '#E4405F' },
  { name: 'X (Twitter)', icon: 'logo-twitter', url: 'https://twitter.com/UCCJamaica', color: '#1DA1F2' },
];

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale, favorites } = useSettings();
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { data: announcements, refetch: refetchAnnouncements } = useApi<Announcement[]>('/announcements');
  const { data: faqs } = useApi<FAQ[]>('/faqs');
  const { data: resources } = useApi<Resource[]>('/resources');
  const { data: emergencyContacts } = useApi<EmergencyContact[]>('/emergency-contacts');
  const { data: deadlines, refetch: refetchDeadlines } = useApi<Deadline[]>('/deadlines');

  const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || '';

  const toggleDeadlineCompletion = async (deadlineId: string) => {
    try {
      await fetch(`${API_BASE}/api/deadlines/${deadlineId}/toggle`, { method: 'PUT' });
      refetchDeadlines();
    } catch (error) {
      console.error('Failed to toggle deadline:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAnnouncements(), refetchDeadlines()]);
    setRefreshing(false);
  };

  const handleSectionPress = (sectionId: Section) => {
    if (sectionId === 'notes') {
      router.push('/note-editor');
    } else if (sectionId === 'social') {
      setActiveSection('social');
    } else {
      setActiveSection(sectionId);
    }
  };

  const openSocialLink = (url: string) => {
    router.push({ pathname: '/webview', params: { url } });
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openAdmissions = () => {
    router.push({ pathname: '/webview', params: { url: 'https://ucc.edu.jm/apply' } });
  };

  const openMaps = () => {
    Linking.openURL('https://maps.google.com/?q=University+of+the+Commonwealth+Caribbean+Jamaica');
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'announcements':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Announcements</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {announcements?.map((item) => (
                <Card key={item.id} style={styles.announcementCard}>
                  <View style={styles.announcementHeader}>
                    <View style={[styles.categoryChip, item.important && styles.importantChip]}>
                      <ThemedText variant="caption" color={COLORS.white}>
                        {item.category}
                      </ThemedText>
                    </View>
                    {item.important && (
                      <Ionicons name="alert-circle" size={20} color={COLORS.error} />
                    )}
                  </View>
                  <ThemedText variant="subtitle" style={styles.announcementTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText variant="body" color={COLORS.textSecondary}>
                    {item.content}
                  </ThemedText>
                  <ThemedText variant="caption" color={COLORS.textLight} style={styles.date}>
                    {item.date}
                  </ThemedText>
                </Card>
              ))}
            </ScrollView>
          </View>
        );

      case 'admissions':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Admissions</ThemedText>
            <Card style={styles.admissionsCard}>
              <ThemedText variant="subtitle">IT Department Entry Requirements</ThemedText>
              <View style={styles.reqList}>
                <View style={styles.reqItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <ThemedText variant="body" style={styles.reqText}>
                    5 CXC/CSEC subjects including Math and English
                  </ThemedText>
                </View>
                <View style={styles.reqItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <ThemedText variant="body" style={styles.reqText}>
                    Minimum Grade III or better
                  </ThemedText>
                </View>
                <View style={styles.reqItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <ThemedText variant="body" style={styles.reqText}>
                    Computer literacy preferred
                  </ThemedText>
                </View>
                <View style={styles.reqItem}>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                  <ThemedText variant="body" style={styles.reqText}>
                    Completed application form
                  </ThemedText>
                </View>
              </View>
              <Button title="Apply Now" onPress={openAdmissions} icon="open-outline" fullWidth />
            </Card>
            <Card style={styles.admissionsCard}>
              <ThemedText variant="subtitle">Campus Location</ThemedText>
              <ThemedText variant="body" color={COLORS.textSecondary} style={styles.locationText}>
                17 Worthington Avenue, Kingston 5, Jamaica
              </ThemedText>
              <Button title="Get Directions" onPress={openMaps} icon="navigate" variant="outline" fullWidth />
            </Card>
          </View>
        );

      case 'social':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Social Media</ThemedText>
            {SOCIAL_LINKS.map((social) => (
              <TouchableOpacity
                key={social.name}
                style={[styles.socialCard, { borderLeftColor: social.color }]}
                onPress={() => openSocialLink(social.url)}
              >
                <Ionicons name={social.icon as any} size={32} color={social.color} />
                <View style={styles.socialInfo}>
                  <ThemedText variant="subtitle">{social.name}</ThemedText>
                  <ThemedText variant="caption" color={COLORS.textSecondary}>@UCCJamaica</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={24} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'resources':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Resources</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {resources?.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={styles.resourceCard}
                  onPress={() => router.push({ pathname: '/webview', params: { url: resource.url } })}
                >
                  <View style={[styles.resourceIcon, { backgroundColor: COLORS.lightGray }]}>
                    <Ionicons name={resource.icon as any || 'link'} size={24} color={COLORS.navy} />
                  </View>
                  <View style={styles.resourceInfo}>
                    <ThemedText variant="subtitle">{resource.title}</ThemedText>
                    <ThemedText variant="caption" color={COLORS.textSecondary}>
                      {resource.description}
                    </ThemedText>
                  </View>
                  <Ionicons name="open-outline" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 'emergency':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Emergency Contacts</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {emergencyContacts?.map((contact) => (
                <Card key={contact.id} style={styles.emergencyCard}>
                  <ThemedText variant="subtitle">{contact.name}</ThemedText>
                  <ThemedText variant="caption" color={COLORS.textSecondary}>{contact.role}</ThemedText>
                  <ThemedText variant="caption" color={COLORS.info}>{contact.available}</ThemedText>
                  <View style={styles.emergencyActions}>
                    <TouchableOpacity
                      style={[styles.emergencyButton, { backgroundColor: COLORS.success }]}
                      onPress={() => handleCall(contact.phone)}
                    >
                      <Ionicons name="call" size={20} color={COLORS.white} />
                      <ThemedText variant="caption" color={COLORS.white}>Call</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.emergencyButton, { backgroundColor: COLORS.info }]}
                      onPress={() => handleEmail(contact.email)}
                    >
                      <Ionicons name="mail" size={20} color={COLORS.white} />
                      <ThemedText variant="caption" color={COLORS.white}>Email</ThemedText>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </ScrollView>
          </View>
        );

      case 'deadlines':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Deadline Tracker</ThemedText>
            <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.deadlineHint}>
              Tap the checkbox to mark deadlines as complete
            </ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {deadlines?.map((deadline) => (
                <Card key={deadline.id} style={[styles.deadlineCard, deadline.completed && styles.completedCard]}>
                  <View style={styles.deadlineRow}>
                    <TouchableOpacity
                      style={[styles.checkbox, deadline.completed && styles.checkboxChecked]}
                      onPress={() => toggleDeadlineCompletion(deadline.id)}
                      accessibilityLabel={deadline.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      accessibilityRole="checkbox"
                    >
                      {deadline.completed && (
                        <Ionicons name="checkmark" size={18} color={COLORS.white} />
                      )}
                    </TouchableOpacity>
                    <View style={styles.deadlineContent}>
                      <View style={styles.deadlineHeader}>
                        <View style={[styles.categoryChip, deadline.important && styles.importantChip]}>
                          <ThemedText variant="caption" color={COLORS.white}>
                            {deadline.category}
                          </ThemedText>
                        </View>
                        <ThemedText variant="caption" color={deadline.important ? COLORS.error : COLORS.textSecondary}>
                          {deadline.date}
                        </ThemedText>
                      </View>
                      <ThemedText 
                        variant="subtitle" 
                        style={deadline.completed && styles.completedText}
                      >
                        {deadline.title}
                      </ThemedText>
                      <ThemedText variant="body" color={COLORS.textSecondary}>
                        {deadline.description}
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              ))}
            </ScrollView>
          </View>
        );

      case 'faq':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>FAQ</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {faqs?.map((faq) => (
                <Card key={faq.id} style={styles.faqCard}>
                  <View style={styles.faqHeader}>
                    <Ionicons name="help-circle" size={24} color={COLORS.gold} />
                    <ThemedText variant="subtitle" style={styles.faqQuestion}>
                      {faq.question}
                    </ThemedText>
                  </View>
                  <ThemedText variant="body" color={COLORS.textSecondary}>
                    {faq.answer}
                  </ThemedText>
                </Card>
              ))}
            </ScrollView>
          </View>
        );

      case 'favorites':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>My Favorites</ThemedText>
            {favorites.length === 0 ? (
              <EmptyState
                icon="heart-outline"
                title="No Favorites Yet"
                message="Add faculty or courses to your favorites"
              />
            ) : (
              <View style={styles.favoritesInfo}>
                <ThemedText variant="body">
                  You have {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
                </ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  View them in Faculty or Courses sections
                </ThemedText>
              </View>
            )}
          </View>
        );

      case 'campus':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>Campus Map</ThemedText>
            <Card style={styles.campusCard}>
              <View style={styles.campusIcon}>
                <Ionicons name="location" size={48} color={COLORS.gold} />
              </View>
              <ThemedText variant="subtitle" style={styles.campusTitle}>
                University of the Commonwealth Caribbean
              </ThemedText>
              <ThemedText variant="body" color={COLORS.textSecondary} style={styles.campusAddress}>
                17 Worthington Avenue{'\n'}Kingston 5, Jamaica
              </ThemedText>
              <View style={styles.campusInfo}>
                <View style={styles.campusInfoItem}>
                  <Ionicons name="business" size={20} color={COLORS.navy} />
                  <ThemedText variant="body" style={styles.campusInfoText}>
                    IT Department: IT Building, Floor 2
                  </ThemedText>
                </View>
                <View style={styles.campusInfoItem}>
                  <Ionicons name="time" size={20} color={COLORS.navy} />
                  <ThemedText variant="body" style={styles.campusInfoText}>
                    Office Hours: Mon-Fri 8AM - 5PM
                  </ThemedText>
                </View>
                <View style={styles.campusInfoItem}>
                  <Ionicons name="car" size={20} color={COLORS.navy} />
                  <ThemedText variant="body" style={styles.campusInfoText}>
                    Student Parking: Lots B & C
                  </ThemedText>
                </View>
              </View>
              <Button
                title="Open in Maps"
                onPress={() => Linking.openURL('https://maps.google.com/?q=University+of+the+Commonwealth+Caribbean+Jamaica')}
                icon="navigate"
                fullWidth
              />
            </Card>
          </View>
        );

      case 'about':
        return (
          <View style={styles.modalContent}>
            <ThemedText variant="title" style={styles.modalTitle}>About</ThemedText>
            <Card style={styles.aboutCard}>
              <View style={styles.aboutLogo}>
                <Ionicons name="school" size={48} color={COLORS.gold} />
              </View>
              <ThemedText variant="title" style={styles.aboutTitle}>UCC Connect</ThemedText>
              <ThemedText variant="body" color={COLORS.textSecondary} style={styles.aboutSubtitle}>
                Department of Information Technology
              </ThemedText>
              <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.aboutSubtitle}>
                University of the Commonwealth Caribbean
              </ThemedText>
              
              <View style={styles.divider} />
              
              <ThemedText variant="subtitle" style={styles.sectionHeader}>Developed By</ThemedText>
              <ThemedText variant="body">Matthew Taylor (20244115)</ThemedText>
              <ThemedText variant="body">Taneika Cunningham (20216503)</ThemedText>
              
              <View style={styles.divider} />
              
              <ThemedText variant="caption" color={COLORS.textSecondary}>
                Course: ITT420 - Mobile Application Development
              </ThemedText>
              <ThemedText variant="caption" color={COLORS.textSecondary}>
                Term: Spring 2027
              </ThemedText>
              <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.version}>
                Version 1.0.0
              </ThemedText>
            </Card>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.md }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[styles.sectionCard, highContrast && styles.highContrastCard]}
              onPress={() => handleSectionPress(section.id as Section)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={section.title}
            >
              <View style={[styles.iconContainer, { backgroundColor: section.color }]}>
                <Ionicons name={section.icon as any} size={28} color={COLORS.white} />
              </View>
              <ThemedText variant="label" style={styles.sectionTitle}>
                {section.title}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal for section content */}
      <Modal
        visible={activeSection !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveSection(null)}
      >
        <View style={[styles.modalContainer, highContrast && styles.highContrastBg]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setActiveSection(null)}
              style={styles.closeButton}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={28} color={highContrast ? COLORS.highContrastText : COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          {renderSectionContent()}
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  sectionCard: {
    width: '33.33%',
    padding: SPACING.xs,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  highContrastCard: {
    borderWidth: 1,
    borderColor: COLORS.highContrastAccent,
    borderRadius: BORDER_RADIUS.md,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  sectionTitle: {
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  modalTitle: {
    marginBottom: SPACING.lg,
  },
  announcementCard: {
    marginBottom: SPACING.md,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  categoryChip: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  importantChip: {
    backgroundColor: COLORS.error,
  },
  announcementTitle: {
    marginBottom: SPACING.xs,
  },
  date: {
    marginTop: SPACING.sm,
  },
  admissionsCard: {
    marginBottom: SPACING.md,
  },
  reqList: {
    marginVertical: SPACING.md,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  reqText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  locationText: {
    marginVertical: SPACING.md,
  },
  socialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    ...SHADOWS.sm,
  },
  socialInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resourceInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  emergencyCard: {
    marginBottom: SPACING.md,
  },
  emergencyActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  emergencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    gap: SPACING.xs,
    minHeight: 44,
  },
  deadlineCard: {
    marginBottom: SPACING.md,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: COLORS.lightGray,
  },
  deadlineHint: {
    marginBottom: SPACING.md,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  deadlineContent: {
    flex: 1,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  faqCard: {
    marginBottom: SPACING.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  faqQuestion: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  favoritesInfo: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  aboutCard: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  aboutLogo: {
    marginBottom: SPACING.md,
  },
  aboutTitle: {
    marginBottom: SPACING.xs,
  },
  aboutSubtitle: {
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    marginVertical: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.sm,
  },
  version: {
    marginTop: SPACING.md,
  },
  campusCard: {
    alignItems: 'center',
    padding: SPACING.lg,
  },
  campusIcon: {
    marginBottom: SPACING.md,
  },
  campusTitle: {
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  campusAddress: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  campusInfo: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  campusInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  campusInfoText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
});
