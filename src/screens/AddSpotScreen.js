import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MapView, { Marker } from '../components/MapViewCompat';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Definicje kroków formularza
const STEPS = [
  { key: 'details', title: 'Details', icon: 'document-text' },
  { key: 'amenities', title: 'Amenities & Vibe', icon: 'options' },
  { key: 'location', title: 'Location Pin', icon: 'location' },
];

// Opcje kategorii
const CATEGORIES = [
  { key: 'cafe', label: 'Cafe', emoji: '☕' },
  { key: 'library', label: 'Library', emoji: '📚' },
  { key: 'coworking', label: 'Coworking', emoji: '💼' },
];

// Opcje udogodnień
const WIFI_OPTIONS = ['Spotty', 'Reliable', 'Fast'];
const OUTLET_OPTIONS = ['None', 'Limited', 'Plentiful'];
const NOISE_OPTIONS = ['Silent', 'Chatter', 'Lively'];

export default function AddSpotScreen({ navigation }) {
  // Stan aktualnego kroku (0, 1, 2)
  const [currentStep, setCurrentStep] = useState(0);

  // Dane formularza
  const [formData, setFormData] = useState({
    // Step 1 — Details
    name: '',
    category: '',
    description: '',
    // Step 2 — Amenities
    wifi: '',
    outlets: '',
    noise: '',
    // Step 3 — Location
    latitude: null,
    longitude: null,
    address: '',
  });

  // Animacja przejścia między krokami
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Aktualizacja pola formularza
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Animowane przejście między krokami
  const animateTransition = (nextStep) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setCurrentStep(nextStep), 150);
  };

  // Przejście do następnego kroku
  const handleNext = () => {
    if (currentStep === 0) {
      // Walidacja Step 1
      if (!formData.name.trim()) {
        Alert.alert('Brak nazwy', 'Podaj nazwę miejsca, aby kontynuować.');
        return;
      }
      if (!formData.category) {
        Alert.alert('Brak kategorii', 'Wybierz kategorię miejsca.');
        return;
      }
    }

    if (currentStep < 2) {
      animateTransition(currentStep + 1);
    }
  };

  // Cofnięcie do poprzedniego kroku
  const handleBack = () => {
    if (currentStep > 0) {
      animateTransition(currentStep - 1);
    }
  };

  // Zamknięcie formularza
  const handleClose = () => {
    Alert.alert(
      'Zamknąć formularz?',
      'Niezapisane dane zostaną utracone.',
      [
        { text: 'Anuluj', style: 'cancel' },
        {
          text: 'Zamknij',
          style: 'destructive',
          onPress: () => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // Wysłanie formularza
  const handleSubmit = () => {
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Brak lokalizacji', 'Dotknij mapę, aby postawić pin z lokalizacją.');
      return;
    }

    // Na razie console.log — potem podpięcie do spotsService.addSpot (Łukasz)
    console.log('=== Nowe miejsce ===');
    console.log(JSON.stringify(formData, null, 2));

    Alert.alert(
      '🎉 Miejsce dodane!',
      'Twoje miejsce zostało wysłane do moderacji. Pojawi się na mapie po zatwierdzeniu przez admina.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (navigation && navigation.goBack) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // Kliknięcie na mapę — postawienie pina
  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    updateField('latitude', latitude);
    updateField('longitude', longitude);
  };

  // Przejście do konkretnego kroku (edycja ukończonego)
  const handleEditStep = (stepIndex) => {
    if (stepIndex < currentStep) {
      animateTransition(stepIndex);
    }
  };

  // ─── Renderowanie paska postępu ───
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        const isFuture = index > currentStep;

        return (
          <TouchableOpacity
            key={step.key}
            style={styles.stepIndicator}
            onPress={() => handleEditStep(index)}
            disabled={isFuture}
            activeOpacity={isCompleted ? 0.6 : 1}
          >
            {/* Ikona kroku */}
            <View
              style={[
                styles.stepCircle,
                isCompleted && styles.stepCircleCompleted,
                isActive && styles.stepCircleActive,
                isFuture && styles.stepCircleFuture,
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : isFuture ? (
                <Ionicons name="lock-closed" size={14} color="#D1D5DB" />
              ) : (
                <Ionicons name={step.icon} size={16} color="#FFFFFF" />
              )}
            </View>

            {/* Nazwa kroku */}
            <Text
              style={[
                styles.stepLabel,
                isActive && styles.stepLabelActive,
                isFuture && styles.stepLabelFuture,
              ]}
              numberOfLines={1}
            >
              {step.title}
            </Text>

            {/* Link "Edit" dla ukończonych kroków */}
            {isCompleted && (
              <Text style={styles.editLink}>Edit</Text>
            )}

            {/* Linia łącząca (oprócz ostatniego) */}
            {index < STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  isCompleted && styles.stepLineCompleted,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  // ─── Step 1: Details ───
  const renderStep1 = () => (
    <ScrollView
      style={styles.stepContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.stepTitle}>Tell us about the spot</Text>
      <Text style={styles.stepSubtitle}>
        Share basic information about this work-friendly place.
      </Text>

      {/* Nazwa miejsca */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Spot Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g. Kawiarnia Literacka"
          placeholderTextColor="#9CA3AF"
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          autoFocus={false}
        />
      </View>

      {/* Kategoria */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryButton,
                formData.category === cat.key && styles.categoryButtonActive,
              ]}
              onPress={() => updateField('category', cat.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  formData.category === cat.key && styles.categoryLabelActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Opis */}
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Describe the atmosphere, what makes this spot great for work or study..."
          placeholderTextColor="#9CA3AF"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
        />
      </View>

      {/* Przycisk "Continue" */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          (!formData.name.trim() || !formData.category) && styles.primaryButtonDisabled,
        ]}
        onPress={handleNext}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </ScrollView>
  );

  // ─── Step 2: Amenities & Vibe ───
  const renderStep2 = () => (
    <ScrollView
      style={styles.stepContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Amenities & Vibe</Text>
      <Text style={styles.stepSubtitle}>
        Help others know what to expect at this spot.
      </Text>

      {/* Wi-Fi Reliability */}
      <View style={styles.optionGroup}>
        <View style={styles.optionHeader}>
          <Ionicons name="wifi" size={20} color="#1E1B4B" />
          <Text style={styles.optionTitle}>Wi-Fi Reliability</Text>
        </View>
        <View style={styles.pillRow}>
          {WIFI_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                formData.wifi === option && styles.pillButtonActive,
              ]}
              onPress={() => updateField('wifi', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  formData.wifi === option && styles.pillTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Power Outlets */}
      <View style={styles.optionGroup}>
        <View style={styles.optionHeader}>
          <Ionicons name="power" size={20} color="#1E1B4B" />
          <Text style={styles.optionTitle}>Power Outlets</Text>
        </View>
        <View style={styles.pillRow}>
          {OUTLET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                formData.outlets === option && styles.pillButtonActive,
              ]}
              onPress={() => updateField('outlets', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  formData.outlets === option && styles.pillTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Noise Level */}
      <View style={styles.optionGroup}>
        <View style={styles.optionHeader}>
          <Ionicons name="volume-medium" size={20} color="#1E1B4B" />
          <Text style={styles.optionTitle}>Noise Level</Text>
        </View>
        <View style={styles.pillRow}>
          {NOISE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                formData.noise === option && styles.pillButtonActive,
              ]}
              onPress={() => updateField('noise', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  formData.noise === option && styles.pillTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Przyciski nawigacji */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // ─── Step 3: Location Pin ───
  const renderStep3 = () => (
    <View style={styles.stepContentFull}>
      <View style={styles.locationHeader}>
        <Text style={styles.stepTitle}>Pin the Location</Text>
        <Text style={styles.stepSubtitle}>
          Tap on the map to place a pin at the exact location.
        </Text>
      </View>

      {/* Mapa na pełny ekran */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.fullMap}
          initialRegion={{
            latitude: 50.0614,
            longitude: 19.9365,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          onPress={handleMapPress}
          showsUserLocation={true}
        >
          {formData.latitude && formData.longitude && (
            <Marker
              coordinate={{
                latitude: formData.latitude,
                longitude: formData.longitude,
              }}
              draggable
              onDragEnd={handleMapPress}
            >
              <View style={styles.locationPin}>
                <Ionicons name="location" size={24} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Instrukcja na mapie */}
        {!formData.latitude && (
          <View style={styles.mapInstruction}>
            <Ionicons name="hand-left" size={20} color="#1E1B4B" />
            <Text style={styles.mapInstructionText}>
              Tap on the map to place a pin
            </Text>
          </View>
        )}

        {/* Wybrany adres / współrzędne */}
        {formData.latitude && (
          <View style={styles.coordinatesBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={styles.coordinatesText}>
              📍 {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      {/* Pole adresu (opcjonalne) */}
      <View style={styles.addressInputContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Address (optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. ul. Floriańska 15, Kraków"
            placeholderTextColor="#9CA3AF"
            value={formData.address}
            onChangeText={(text) => updateField('address', text)}
          />
        </View>
      </View>

      {/* Przyciski nawigacji */}
      <View style={[styles.buttonRow, styles.buttonRowBottom]}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#1E1B4B" />
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!formData.latitude || !formData.longitude) && styles.primaryButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderowanie aktualnego kroku
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return renderStep1();
      case 1:
        return renderStep2();
      case 2:
        return renderStep3();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Nagłówek z przyciskiem zamykania */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color="#1E1B4B" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Spot</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Nagłówek kroku */}
        <View style={styles.stepHeaderContainer}>
          <Text style={styles.stepCounter}>
            Step {currentStep + 1} of {STEPS.length}
          </Text>
        </View>

        {/* Pasek postępu */}
        {renderProgressBar()}

        {/* Zawartość kroku z animacją */}
        <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
          {renderCurrentStep()}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },

  // ─── Header ───
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E1B4B',
  },
  headerSpacer: {
    width: 40,
  },

  // ─── Step Header ───
  stepHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ─── Progress Bar ───
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepCircleActive: {
    backgroundColor: '#1E1B4B',
  },
  stepCircleCompleted: {
    backgroundColor: '#059669',
  },
  stepCircleFuture: {
    backgroundColor: '#E5E7EB',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
  },
  stepLabelActive: {
    fontWeight: '700',
    color: '#1E1B4B',
  },
  stepLabelFuture: {
    color: '#D1D5DB',
  },
  editLink: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B',
    marginTop: 2,
  },
  stepLine: {
    position: 'absolute',
    top: 18,
    left: '60%',
    width: '80%',
    height: 2,
    backgroundColor: '#E5E7EB',
    zIndex: -1,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },

  // ─── Step Content ───
  animatedContainer: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepContentFull: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 20,
  },

  // ─── Input Groups ───
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1E1B4B',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },

  // ─── Category Buttons ───
  categoryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: '#1E1B4B',
    backgroundColor: '#EEF2FF',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  categoryLabelActive: {
    color: '#1E1B4B',
  },

  // ─── Option Groups (Step 2) ───
  optionGroup: {
    marginBottom: 24,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pillButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#1E1B4B',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  pillTextActive: {
    fontWeight: '700',
    color: '#1E1B4B',
  },

  // ─── Buttons ───
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  buttonRowBottom: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1E1B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  // ─── Step 3: Location ───
  locationHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fullMap: {
    width: '100%',
    height: '100%',
  },
  locationPin: {
    backgroundColor: '#1E1B4B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  mapInstruction: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  mapInstructionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E1B4B',
  },
  coordinatesBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E1B4B',
  },
  addressInputContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
