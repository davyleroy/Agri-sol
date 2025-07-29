import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TermsAndConditionsModal from './TermsAndConditionsModal';

export default function TermsTest() {
  const [showModal, setShowModal] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>Test Terms Modal</Text>
      </TouchableOpacity>

      <TermsAndConditionsModal
        visible={showModal}
        onAccept={() => {
          console.log('Terms accepted');
          setShowModal(false);
        }}
        onDecline={() => {
          console.log('Terms declined');
          setShowModal(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
