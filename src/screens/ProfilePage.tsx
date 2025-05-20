// screens/ProfileScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { db } from '../../firebase/config';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  setDoc,
} from 'firebase/firestore';

const ProfileScreen = () => {
  const user = auth().currentUser;
  const [userData, setUserData] = useState<{ name?: string; phone?: string; email?: string }>({});
  const [editingField, setEditingField] = useState<'name' | 'phone' | null>(null);
  const [editedValue, setEditedValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [userSlots, setUserSlots] = useState<{ date: string; slot: string }[]>([]);

  const email = user?.email || '';
  const uid = user?.uid || '';

  // Fetch user profile and slots
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) return;

      // User profile
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
      }

      // User slots
      const slotsRef = collection(db, 'slots');
      const snap = await getDocs(slotsRef);
      const userAppointments: { date: string; slot: string }[] = [];

      snap.forEach(docSnap => {
        const data = docSnap.data();
        Object.entries(data).forEach(([slot, status]) => {
          if (slot.endsWith('_user') && status === email) {
            const slotName = slot.replace('_user', '');
            userAppointments.push({ date: docSnap.id, slot: slotName });
          }
        });
      });

      setUserSlots(userAppointments);
      setLoading(false);
    };

    fetchData();
  }, []);

  // Save profile field update
  const saveEdit = async () => {
    if (!uid || !editingField) return;
    try {
      await updateDoc(doc(db, 'users', uid), {
        [editingField]: editedValue,
      });
      setUserData(prev => ({ ...prev, [editingField]: editedValue }));
      setEditingField(null);
      setEditedValue('');
    } catch (error) {
      Alert.alert('Error updating profile');
    }
  };

  // Cancel appointment
  const cancelAppointment = async (date: string, slot: string) => {
    try {
      const slotRef = doc(db, 'slots', date);
      await setDoc(
        slotRef,
        {
          [slot]: 'available',
          [`${slot}_user`]: '',
        },
        { merge: true }
      );

      setUserSlots(prev => prev.filter(s => !(s.date === date && s.slot === slot)));
      Alert.alert('Appointment cancelled.');
    } catch (error) {
      Alert.alert('Error cancelling appointment.');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      {/* User Info */}
      <View style={styles.fieldRow}>
        <Text style={styles.label}>Name:</Text>
        {editingField === 'name' ? (
          <>
            <TextInput
              style={styles.input}
              value={editedValue}
              onChangeText={setEditedValue}
              placeholder="Edit Name"
            />
            <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.value}>{userData.name || 'N/A'}</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingField('name');
                setEditedValue(userData.name || '');
              }}
            >
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.fieldRow}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{auth().currentUser?.email || 'N/A'}</Text>
      </View>


      <View style={styles.fieldRow}>
        <Text style={styles.label}>Phone:</Text>
        {editingField === 'phone' ? (
          <>
            <TextInput
              style={styles.input}
              value={editedValue}
              onChangeText={setEditedValue}
              placeholder="Edit Phone"
              keyboardType="phone-pad"
            />
            <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.value}>{userData.phone || 'N/A'}</Text>
            <TouchableOpacity
              onPress={() => {
                setEditingField('phone');
                setEditedValue(userData.phone || '');
              }}
            >
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={[styles.label, { marginTop: 20 }]}>BookedSlots:</Text>

      {userSlots.length === 0 ? (
        <Text style={styles.value}>No appointments</Text>
      ) : (
        <FlatList
          data={userSlots}
          keyExtractor={(item, index) => `${item.date}-${item.slot}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.slotItem}>
        <Text style={styles.slotText}>
          📅 {item.date} — 🕐 {item.slot}
        </Text>
          <TouchableOpacity
          onPress={() => {
            Alert.alert(
          'Cancel Appointment',
          'Do you want to cancel this appointment?',
          [
            {
            text: 'No',
            style: 'cancel', // Just closes the alert
          },
          {
            text: 'Yes',
            onPress: () => cancelAppointment(item.date, item.slot), // Executes only if confirmed
            style: 'destructive',
          },
        ],
        { cancelable: true }
        );
      }}
      style={styles.editIcon}
      >
    <Text style={styles.editIcon}>❌ Cancel</Text>
  </TouchableOpacity>
</View>

          )}
        />
      )}
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    width: 100,
  },
  value: {
    fontSize: 16,
    flex: 1,
  },
  editIcon: {
    fontSize: 18,
    color: '#007AFF',
    marginLeft: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    borderRadius: 6,
    fontSize: 16,
    flex: 1,
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    marginVertical: 6,
    alignItems: 'center',
  },
  slotText: {
    fontSize: 15,
    flex: 1,
  },
  cancelBtn: {
    marginLeft: 10,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
