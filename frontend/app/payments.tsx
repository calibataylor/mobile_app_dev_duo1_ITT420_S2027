import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@/src/constants/theme';
import { useSettings } from '@/src/context/SettingsContext';
import { useApi, apiPost } from '@/src/hooks/useApi';
import { FeeItem, Payment } from '@/src/types';
import ThemedText from '@/src/components/ThemedText';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';
import LoadingScreen from '@/src/components/LoadingScreen';
import EmptyState from '@/src/components/EmptyState';

export default function PaymentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { highContrast, fontScale } = useSettings();
  const { data: fees, loading: feesLoading } = useApi<FeeItem[]>('/fees');
  const { data: payments, loading: paymentsLoading, refetch: refetchPayments } = useApi<Payment[]>('/payments');

  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  // Payment form fields
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-JM', {
      style: 'currency',
      currency: 'JMD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  const handleSelectFee = (fee: FeeItem) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
  };

  const resetForm = () => {
    setStudentName('');
    setStudentId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setPaymentSuccess(false);
  };

  const validateForm = () => {
    if (!studentName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return false;
    }
    if (!studentId.trim() || studentId.length < 5) {
      Alert.alert('Missing Information', 'Please enter a valid student ID.');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      Alert.alert('Invalid Card', 'Please enter a valid 16-digit card number.');
      return false;
    }
    if (cardExpiry.length < 5) {
      Alert.alert('Invalid Expiry', 'Please enter card expiry date (MM/YY).');
      return false;
    }
    if (cardCvv.length < 3) {
      Alert.alert('Invalid CVV', 'Please enter a valid 3-digit CVV.');
      return false;
    }
    if (!cardName.trim()) {
      Alert.alert('Missing Information', 'Please enter the name on the card.');
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm() || !selectedFee) return;

    setProcessing(true);
    try {
      await apiPost('/payments', {
        type: selectedFee.category,
        description: selectedFee.name,
        amount: selectedFee.amount,
        student_name: studentName,
        student_id: studentId,
        card_number: cardNumber.replace(/\s/g, ''),
        card_expiry: cardExpiry,
        card_cvv: cardCvv,
        card_name: cardName,
      });
      setPaymentSuccess(true);
      refetchPayments();
    } catch (error) {
      Alert.alert(
        'Payment Failed',
        'Your payment could not be processed. Please check your card details and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedFee(null);
    resetForm();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-JM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (feesLoading) return <LoadingScreen message="Loading fees..." />;

  return (
    <View style={[styles.container, highContrast && styles.highContrastBg]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText variant="title">Pay Fees</ThemedText>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setShowHistoryModal(true)}
          >
            <Ionicons name="receipt-outline" size={24} color={COLORS.navy} />
          </TouchableOpacity>
        </View>

        {/* Fee Categories */}
        <ThemedText variant="subtitle" style={styles.sectionTitle}>
          Available Fees
        </ThemedText>

        {fees?.map((fee) => (
          <Card key={fee.id} style={styles.feeCard} onPress={() => handleSelectFee(fee)}>
            <View style={styles.feeRow}>
              <View style={[styles.feeIcon, { backgroundColor: getCategoryColor(fee.category) }]}>
                <Ionicons name={getCategoryIcon(fee.category)} size={24} color={COLORS.white} />
              </View>
              <View style={styles.feeInfo}>
                <ThemedText variant="subtitle">{fee.name}</ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  {fee.description}
                </ThemedText>
              </View>
              <View style={styles.feeAmount}>
                <ThemedText variant="subtitle" color={COLORS.navy}>
                  {formatCurrency(fee.amount)}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </View>
            </View>
          </Card>
        ))}

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
          <ThemedText variant="caption" color={COLORS.textSecondary} style={styles.securityText}>
            All payments are secured with 256-bit encryption. Your card details are never stored.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, highContrast && styles.highContrastBg]}>
          {paymentSuccess ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={80} color={COLORS.success} />
              </View>
              <ThemedText variant="title" style={styles.successTitle}>
                Payment Successful!
              </ThemedText>
              <ThemedText variant="body" color={COLORS.textSecondary} style={styles.successText}>
                Your payment of {selectedFee && formatCurrency(selectedFee.amount)} has been processed successfully.
              </ThemedText>
              <Card style={styles.receiptCard}>
                <ThemedText variant="caption" color={COLORS.textSecondary}>Receipt</ThemedText>
                <ThemedText variant="subtitle">{selectedFee?.name}</ThemedText>
                <ThemedText variant="body">{formatCurrency(selectedFee?.amount || 0)}</ThemedText>
                <ThemedText variant="caption" color={COLORS.textSecondary}>
                  Student: {studentName} ({studentId})
                </ThemedText>
              </Card>
              <Button
                title="Done"
                onPress={handleClosePaymentModal}
                fullWidth
                style={styles.doneButton}
              />
            </View>
          ) : (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleClosePaymentModal}>
                  <Ionicons name="close" size={28} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <ThemedText variant="subtitle">Make Payment</ThemedText>
                <View style={{ width: 28 }} />
              </View>

              <ScrollView style={styles.modalContent} keyboardShouldPersistTaps="handled">
                {/* Payment Summary */}
                <Card style={styles.summaryCard}>
                  <ThemedText variant="caption" color={COLORS.textSecondary}>Paying for</ThemedText>
                  <ThemedText variant="subtitle">{selectedFee?.name}</ThemedText>
                  <ThemedText variant="title" color={COLORS.navy} style={styles.paymentAmount}>
                    {selectedFee && formatCurrency(selectedFee.amount)}
                  </ThemedText>
                </Card>

                {/* Student Information */}
                <ThemedText variant="subtitle" style={styles.formSection}>
                  Student Information
                </ThemedText>

                <View style={styles.inputGroup}>
                  <ThemedText variant="label" style={styles.label}>Full Name *</ThemedText>
                  <TextInput
                    style={[styles.input, { fontSize: 16 * fontScale }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.textLight}
                    value={studentName}
                    onChangeText={setStudentName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText variant="label" style={styles.label}>Student ID *</ThemedText>
                  <TextInput
                    style={[styles.input, { fontSize: 16 * fontScale }]}
                    placeholder="e.g., 20244115"
                    placeholderTextColor={COLORS.textLight}
                    value={studentId}
                    onChangeText={setStudentId}
                    keyboardType="number-pad"
                  />
                </View>

                {/* Card Information */}
                <ThemedText variant="subtitle" style={styles.formSection}>
                  Card Details
                </ThemedText>

                <View style={styles.inputGroup}>
                  <ThemedText variant="label" style={styles.label}>Card Number *</ThemedText>
                  <View style={styles.cardInputWrapper}>
                    <TextInput
                      style={[styles.input, styles.cardInput, { fontSize: 16 * fontScale }]}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={COLORS.textLight}
                      value={cardNumber}
                      onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                      keyboardType="number-pad"
                      maxLength={19}
                    />
                    <View style={styles.cardIcons}>
                      <Ionicons name="card" size={24} color={COLORS.textSecondary} />
                    </View>
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <ThemedText variant="label" style={styles.label}>Expiry *</ThemedText>
                    <TextInput
                      style={[styles.input, { fontSize: 16 * fontScale }]}
                      placeholder="MM/YY"
                      placeholderTextColor={COLORS.textLight}
                      value={cardExpiry}
                      onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <ThemedText variant="label" style={styles.label}>CVV *</ThemedText>
                    <TextInput
                      style={[styles.input, { fontSize: 16 * fontScale }]}
                      placeholder="123"
                      placeholderTextColor={COLORS.textLight}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="number-pad"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText variant="label" style={styles.label}>Name on Card *</ThemedText>
                  <TextInput
                    style={[styles.input, { fontSize: 16 * fontScale }]}
                    placeholder="JOHN DOE"
                    placeholderTextColor={COLORS.textLight}
                    value={cardName}
                    onChangeText={setCardName}
                    autoCapitalize="characters"
                  />
                </View>

                <Button
                  title={processing ? 'Processing...' : `Pay ${selectedFee ? formatCurrency(selectedFee.amount) : ''}`}
                  onPress={handlePayment}
                  fullWidth
                  loading={processing}
                  disabled={processing}
                  icon="lock-closed"
                  style={styles.payButton}
                />

                <View style={styles.securityBadge}>
                  <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
                  <ThemedText variant="caption" color={COLORS.textSecondary}>
                    Secure Payment
                  </ThemedText>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </Modal>

      {/* Payment History Modal */}
      <Modal visible={showHistoryModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, highContrast && styles.highContrastBg]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <Ionicons name="close" size={28} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <ThemedText variant="subtitle">Payment History</ThemedText>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {payments && payments.length > 0 ? (
              payments.map((payment) => (
                <Card key={payment.id} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={[
                      styles.statusIcon,
                      { backgroundColor: payment.status === 'completed' ? COLORS.success : COLORS.error }
                    ]}>
                      <Ionicons
                        name={payment.status === 'completed' ? 'checkmark' : 'close'}
                        size={20}
                        color={COLORS.white}
                      />
                    </View>
                    <View style={styles.historyInfo}>
                      <ThemedText variant="subtitle">{payment.description}</ThemedText>
                      <ThemedText variant="caption" color={COLORS.textSecondary}>
                        {formatDate(payment.created_at)}
                      </ThemedText>
                      <ThemedText variant="caption" color={COLORS.textSecondary}>
                        Card ending in {payment.card_last_four}
                      </ThemedText>
                    </View>
                    <ThemedText
                      variant="subtitle"
                      color={payment.status === 'completed' ? COLORS.success : COLORS.error}
                    >
                      {formatCurrency(payment.amount)}
                    </ThemedText>
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon="receipt-outline"
                title="No Payments Yet"
                message="Your payment history will appear here"
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tuition': return '#3B82F6';
    case 'lab': return '#10B981';
    case 'application': return '#F59E0B';
    case 'exam': return '#EF4444';
    case 'materials': return '#8B5CF6';
    default: return COLORS.navy;
  }
};

const getCategoryIcon = (category: string): any => {
  switch (category) {
    case 'tuition': return 'school';
    case 'lab': return 'desktop';
    case 'application': return 'document-text';
    case 'exam': return 'clipboard';
    case 'materials': return 'folder';
    default: return 'cash';
  }
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  historyButton: {
    padding: SPACING.sm,
  },
  sectionTitle: {
    marginBottom: SPACING.sm,
  },
  feeCard: {
    marginBottom: SPACING.sm,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  feeInfo: {
    flex: 1,
  },
  feeAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
  },
  securityText: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalContent: {
    padding: SPACING.md,
  },
  summaryCard: {
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  paymentAmount: {
    marginTop: SPACING.sm,
  },
  formSection: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.textPrimary,
    minHeight: 48,
  },
  cardInputWrapper: {
    position: 'relative',
  },
  cardInput: {
    paddingRight: 50,
  },
  cardIcons: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  rowInputs: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  payButton: {
    marginTop: SPACING.md,
  },
  securityBadge: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  successIcon: {
    marginBottom: SPACING.lg,
  },
  successTitle: {
    marginBottom: SPACING.sm,
  },
  successText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  receiptCard: {
    width: '100%',
    alignItems: 'center',
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  doneButton: {
    marginTop: SPACING.md,
  },
  historyCard: {
    marginBottom: SPACING.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  historyInfo: {
    flex: 1,
  },
});
