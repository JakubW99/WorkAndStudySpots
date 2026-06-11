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
  ActivityIndicator,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker } from '../components/MapViewCompat';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { addSpot } from '../services/spotsService';

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
  { key: 'outdoor', label: 'Outdoor', emoji: '🌳' },
  { key: 'university', label: 'School / Uni', emoji: '🎓' },
  { key: 'other', label: 'Other', emoji: '📍' },
];

// Fikcyjne obrazki do "uploadu"
const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=400&auto=format&fit=crop', // cafe
  'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop', // office
  'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=400&auto=format&fit=crop', // library
  'https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=400&auto=format&fit=crop', // coworking
];

// Opcje udogodnień
const WIFI_OPTIONS = ['Spotty', 'Reliable', 'Fast'];
const OUTLET_OPTIONS = ['None', 'Limited', 'Plentiful'];
const NOISE_OPTIONS = ['Silent', 'Chatter', 'Lively'];
const CROWD_OPTIONS = ['Empty', 'Moderate', 'Busy', 'Packed'];
const PRICE_OPTIONS = ['Free', '$', '$$', '$$$'];

export default function AddSpotScreen({ navigation }) {
  // Motyw (dark mode)
  const { colors } = useTheme();

  // Autentykacja użytkownika
  const { user } = useAuth();

  // Stan aktualnego kroku (0, 1, 2)
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dane formularza
  const [formData, setFormData] = useState({
    // Step 1 — Details
    name: '',
    category: '',
    description: '',
    hours: '',
    imageUrl: '', // Fikcyjne zdjęcie
    // Step 2 — Amenities
    wifi: '',
    outlets: '',
    noise: '',
    crowdedness: '',
    priceLevel: '',
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
        if (Platform.OS === 'web') window.alert('Podaj nazwę miejsca, aby kontynuować.');
        else Alert.alert('Brak nazwy', 'Podaj nazwę miejsca, aby kontynuować.');
        return;
      }
      if (!formData.category) {
        if (Platform.OS === 'web') window.alert('Wybierz kategorię miejsca.');
        else Alert.alert('Brak kategorii', 'Wybierz kategorię miejsca.');
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
  const handleSubmit = async () => {
    if (!formData.latitude || !formData.longitude) {
      if (Platform.OS === 'web') window.alert('Dotknij mapę, aby postawić pin z lokalizacją.');
      else Alert.alert('Brak lokalizacji', 'Dotknij mapę, aby postawić pin z lokalizacją.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Dla celu podglądu natychmiastowych zmian wymuszam zmianę obiektu na 'approved'
      // aby od razu pojawił się na liście i mapie bez czekania na Panel Admina (który też zaimplementowaliśmy, ale user nie chce czekać).
      const userId = user?.uid || 'anonymous';
      const augmentedData = { ...formData, status: 'approved' };
      await addSpot(augmentedData, userId);

      // Pokazujemy alert i cofamy ekran, map i list uzywają listenera by zaktualizować się na focus()
      // Pokazujemy alert i cofamy ekran
      if (Platform.OS === 'web') {
        window.alert('🎉 Miejsce dodane! Twoje miejsce zostało wysłane i dodane do naszej mapy.');
        if (navigation && navigation.goBack) navigation.goBack();
      } else {
        Alert.alert(
          '🎉 Miejsce dodane!',
          'Twoje miejsce zostało wysłane i dodane do naszej mapy (Dla celów testowych ominęto moderację).',
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
      }
    } catch (err) {
      console.error(err);
      if (Platform.OS === 'web') window.alert('Nie udało się dodać miejsca. Sprawdź połączenie internetowe i spróbuj ponownie.');
      else Alert.alert('Błąd', 'Nie udało się dodać miejsca. Sprawdź połączenie internetowe i spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
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
                isActive && [styles.stepCircleActive, { backgroundColor: colors.primary }],
                isFuture && [styles.stepCircleFuture, { backgroundColor: colors.borderLight }],
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              ) : isFuture ? (
                <Ionicons name="lock-closed" size={14} color={colors.textMuted} />
              ) : (
                <Ionicons name={step.icon} size={16} color="#FFFFFF" />
              )}
            </View>

            {/* Nazwa kroku */}
            <Text
              style={[
                styles.stepLabel,
                { color: colors.textSecondary },
                isActive && [styles.stepLabelActive, { color: colors.primary }],
                isFuture && [styles.stepLabelFuture, { color: colors.textMuted }],
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
                  { backgroundColor: colors.borderLight },
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
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Tell us about the spot</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
        Share basic information about this work-friendly place.
      </Text>

      {/* Fikcyjne Zdjęcie */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Cover Photo</Text>
        {formData.imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: formData.imageUrl }} style={styles.imagePreview} />
            <TouchableOpacity
              style={[styles.removeImageButton, { backgroundColor: colors.overlay }]}
              onPress={() => updateField('imageUrl', '')}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.imageUploadBox, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
            onPress={() => {
              // Wybierz losowe fikcyjne zdjęcie
              const randomImg = DUMMY_IMAGES[Math.floor(Math.random() * DUMMY_IMAGES.length)];
              updateField('imageUrl', randomImg);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="camera-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.imageUploadText, { color: colors.textSecondary }]}>Tap to add a photo</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Nazwa miejsca */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Spot Name</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="e.g. Kawiarnia Literacka"
          placeholderTextColor={colors.textMuted}
          value={formData.name}
          onChangeText={(text) => updateField('name', text)}
          autoFocus={false}
        />
      </View>

      {/* Kategoria */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryButton,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
                formData.category === cat.key && [styles.categoryButtonActive, { borderColor: colors.primary, backgroundColor: colors.chipActiveBg }],
              ]}
              onPress={() => updateField('category', cat.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  { color: colors.textSecondary },
                  formData.category === cat.key && [styles.categoryLabelActive, { color: colors.primary }],
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Godziny otwarcia */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Opening Hours</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="e.g. Mon-Fri 8:00 - 20:00"
          placeholderTextColor={colors.textMuted}
          value={formData.hours}
          onChangeText={(text) => updateField('hours', text)}
        />
      </View>

      {/* Opis */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.textArea, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
          placeholder="Describe the atmosphere, what makes this spot great for work or study..."
          placeholderTextColor={colors.textMuted}
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
          { backgroundColor: colors.primary, shadowColor: colors.primary },
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
      <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Amenities & Vibe</Text>
      <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
        Help others know what to expect at this spot.
      </Text>

      {/* Wi-Fi Reliability */}
      <View style={styles.optionGroup}>
        <View style={styles.optionHeader}>
          <Ionicons name="wifi" size={20} color={colors.textPrimary} />
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Wi-Fi Reliability</Text>
        </View>
        <View style={styles.pillRow}>
          {WIFI_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                { backgroundColor: colors.chipBg, borderColor: 'transparent' },
                formData.wifi === option && [styles.pillButtonActive, { backgroundColor: colors.chipActiveBg, borderColor: colors.primary }],
              ]}
              onPress={() => updateField('wifi', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textSecondary },
                  formData.wifi === option && [styles.pillTextActive, { color: colors.primary }],
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
          <Ionicons name="power" size={20} color={colors.textPrimary} />
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Power Outlets</Text>
        </View>
        <View style={styles.pillRow}>
          {OUTLET_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                { backgroundColor: colors.chipBg, borderColor: 'transparent' },
                formData.outlets === option && [styles.pillButtonActive, { backgroundColor: colors.chipActiveBg, borderColor: colors.primary }],
              ]}
              onPress={() => updateField('outlets', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textSecondary },
                  formData.outlets === option && [styles.pillTextActive, { color: colors.primary }],
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
          <Ionicons name="volume-medium" size={20} color={colors.textPrimary} />
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Noise Level</Text>
        </View>
        <View style={styles.pillRow}>
          {NOISE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                { backgroundColor: colors.chipBg, borderColor: 'transparent' },
                formData.noise === option && [styles.pillButtonActive, { backgroundColor: colors.chipActiveBg, borderColor: colors.primary }],
              ]}
              onPress={() => updateField('noise', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textSecondary },
                  formData.noise === option && [styles.pillTextActive, { color: colors.primary }],
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Crowdedness */}
      <View style={styles.optionGroup}>
        <View style={styles.optionHeader}>
          <Ionicons name="people" size={20} color={colors.textPrimary} />
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>Crowdedness</Text>
        </View>
        <View style={styles.pillRow}>
          {CROWD_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.pillButton,
                { backgroundColor: colors.chipBg, borderColor: 'transparent' },
                formData.crowdedness === option && [styles.pillButtonActive, { backgroundColor: colors.chipActiveBg, borderColor: colors.primary }],
              ]}
              onPress={() => updateField('crowdedness', option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: colors.textSecondary },
                  formData.crowdedness === option && [styles.pillTextActive, { color: colors.primary }],
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Price Level */}
      <View style={styles.optionGroup}>
        <View style={styles.optionHeader}>
          <Ionicons name="cash-outline" size={20} color={colors.textPrimary} />
          <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
            Price Level: {formData.priceLevel || 'Free'}
          </Text>
        </View>
        <Slider
          style={{ width: '100%', height: 40, marginTop: 10 }}
          minimumValue={0}
          maximumValue={PRICE_OPTIONS.length - 1}
          step={1}
          value={PRICE_OPTIONS.indexOf(formData.priceLevel) !== -1 ? PRICE_OPTIONS.indexOf(formData.priceLevel) : 0}
          onValueChange={(val) => updateField('priceLevel', PRICE_OPTIONS[val])}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.accent}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10 }}>
          {PRICE_OPTIONS.map((opt) => (
            <Text key={opt} style={{ color: colors.textMuted, fontSize: 12 }}>{opt}</Text>
          ))}
        </View>
      </View>

      {/* Przyciski nawigacji */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.chipBg }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
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
        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>Pin the Location</Text>
        <Text style={[styles.stepSubtitle, { color: colors.textMuted }]}>
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
              <View style={[styles.locationPin, { backgroundColor: colors.primary }]}>
                <Ionicons name="location" size={24} color="#FFFFFF" />
              </View>
            </Marker>
          )}
        </MapView>

        {/* Instrukcja na mapie */}
        {!formData.latitude && (
          <View style={[styles.mapInstruction, { backgroundColor: colors.overlay }]}>
            <Ionicons name="hand-left" size={20} color={colors.textPrimary} />
            <Text style={[styles.mapInstructionText, { color: colors.textPrimary }]}>
              Tap on the map to place a pin
            </Text>
          </View>
        )}

        {/* Wybrany adres / współrzędne */}
        {formData.latitude && (
          <View style={[styles.coordinatesBadge, { backgroundColor: colors.overlay }]}>
            <Ionicons name="checkmark-circle" size={18} color="#059669" />
            <Text style={[styles.coordinatesText, { color: colors.textPrimary }]}>
              📍 {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
            </Text>
          </View>
        )}
      </View>

      {/* Pole adresu (opcjonalne) */}
      <View style={styles.addressInputContainer}>
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Address (optional)</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.textPrimary }]}
            placeholder="e.g. ul. Floriańska 15, Kraków"
            placeholderTextColor={colors.textMuted}
            value={formData.address}
            onChangeText={(text) => updateField('address', text)}
          />
        </View>
      </View>

      {/* Przyciski nawigacji */}
      <View style={[styles.buttonRow, styles.buttonRowBottom]}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: colors.chipBg }]}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary, shadowColor: colors.primary },
            (!formData.latitude || !formData.longitude || isSubmitting) && styles.primaryButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!formData.latitude || !formData.longitude || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Submit</Text>
            </>
          )}
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Nagłówek z przyciskiem zamykania */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.chipBg }]}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Add New Spot</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Nagłówek kroku */}
        <View style={styles.stepHeaderContainer}>
          <Text style={[styles.stepCounter, { color: colors.textMuted }]}>
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
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
  },

  // Zdjęcie
  imageUploadBox: {
    height: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageUploadText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Category Selectors ───
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  categoryButton: {
    width: '48%',
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
