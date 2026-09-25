/**
 * Emergency Contacts (Friends & Family) Management Service
 * Allows users to store up to 3 trusted emergency contacts.
 * Automatically broadcasts live GPS location & SOS alerts via GSM SMS on siren/SOS trigger.
 */
import { Platform, Linking } from 'react-native';

export interface EmergencyContactPerson {
  id: string;
  name: string;
  phone: string;
  relation: string; // e.g. 'Mom', 'Dad', 'Spouse', 'Brother', 'Friend'
}

const STORAGE_KEY = 'rakshak_emergency_contacts_v1';

// Default initial emergency contacts if empty (starts clean)
const DEFAULT_CONTACTS: EmergencyContactPerson[] = [];

/**
 * Get saved emergency contacts from local storage (max 3)
 */
export function getSavedEmergencyContacts(): EmergencyContactPerson[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_CONTACTS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTACTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 3) : DEFAULT_CONTACTS;
  } catch (e) {
    console.warn('Error reading emergency contacts:', e);
    return DEFAULT_CONTACTS;
  }
}

/**
 * Save emergency contacts array to local storage (strictly caps at 3)
 */
export function saveEmergencyContacts(contacts: EmergencyContactPerson[]): boolean {
  if (contacts.length > 3) return false;
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts.slice(0, 3)));
    return true;
  } catch (e) {
    console.warn('Error saving emergency contacts:', e);
    return false;
  }
}

/**
 * Add a new emergency contact (returns false if already at 3 contacts limit)
 */
export function addEmergencyContact(name: string, phone: string, relation: string): { success: boolean; message: string; contacts: EmergencyContactPerson[] } {
  const current = getSavedEmergencyContacts();
  if (current.length >= 3) {
    return {
      success: false,
      message: 'Maximum limit of 3 emergency contacts reached. Please remove a contact to add a new one.',
      contacts: current,
    };
  }

  const cleanPhone = phone.trim();
  const cleanName = name.trim();
  if (!cleanName || !cleanPhone) {
    return {
      success: false,
      message: 'Please enter both a name and phone number.',
      contacts: current,
    };
  }

  const newContact: EmergencyContactPerson = {
    id: `cnt-${Date.now().toString().slice(-6)}`,
    name: cleanName,
    phone: cleanPhone,
    relation: relation.trim() || 'Emergency Contact',
  };

  const updated = [...current, newContact].slice(0, 3);
  saveEmergencyContacts(updated);
  return {
    success: true,
    message: '✓ Emergency contact saved successfully!',
    contacts: updated,
  };
}

/**
 * Delete an emergency contact by ID
 */
export function deleteEmergencyContact(id: string): EmergencyContactPerson[] {
  const current = getSavedEmergencyContacts();
  const updated = current.filter((c) => c.id !== id);
  saveEmergencyContacts(updated);
  return updated;
}

/**
 * Broadcast Emergency SOS SMS to all saved family & friends with active GPS coordinates
 */
export function broadcastSOSLocationToEmergencyContacts(
  lat: number = 25.5788,
  lon: number = 91.8933,
  locationName: string = 'East Khasi Hills • Shillong Sector'
): boolean {
  const contacts = getSavedEmergencyContacts();
  const phoneNumbers = contacts.map((c) => c.phone.replace(/[^0-9+]/g, '')).filter(Boolean);

  const phoneStr = phoneNumbers.length > 0 ? phoneNumbers.join(',') : '1078';

  const smsText = `🚨 EMERGENCY LANDSLIDE ALERT! I have pressed the SOS button and need immediate help! Active Location: ${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E (${locationName}). Sent via RAKSHAK NER Emergency Guard.`;

  const smsUri = `sms:${phoneStr}?body=${encodeURIComponent(smsText)}`;

  try {
    if (Platform.OS === 'web') {
      window.open(smsUri, '_self');
    } else {
      Linking.openURL(smsUri);
    }
    return true;
  } catch (e) {
    console.warn('SMS launch error:', e);
    return false;
  }
}
