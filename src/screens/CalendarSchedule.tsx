import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { db } from '../../firebase/config';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import auth from '@react-native-firebase/auth';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation'; 

type LoginScreenNavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;


export default function CalendarScreen() {
    const navigation = useNavigation<LoginScreenNavProp>();

  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<Record<string, 'available' | 'booked'>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCalendar, setLoadingCalendar] = useState(true);

  // Fetch all dates and mark based on slot availability
  useEffect(() => {
    const fetchMarkedDates = async () => {
      const snapshot = await getDocs(collection(db, 'slots'));
      const marks: Record<string, any> = {};

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const values = Object.values(data).filter(v => typeof v === 'string' && !v.includes('@'));
        const booked = values.filter(v => v === 'booked').length;
        const total = values.length;

        let color = 'blue';
        if (booked === 0) color = 'green';
        else if (booked === total) color = 'red';

        marks[docSnap.id] = {
          customStyles: {
            container: { backgroundColor: color },
            text: { color: 'white', fontWeight: 'normal' },
          },
        };
      });

      setMarkedDates(marks);
      setLoadingCalendar(false);
    };

    fetchMarkedDates();
  }, []);

  // Handle day selection
  const onDayPress = async (day: any) => {
    if (!day || !day.dateString) {
    console.warn('Invalid day pressed:', day);
    return;
  }
    const dateStr = day.dateString;

    // const updatedMarks: Record<string, any> = { ...markedDates };
    // Object.keys(updatedMarks).forEach(date => {
    //   if (updatedMarks[date]?.customStyles?.text) {
    //     updatedMarks[date].customStyles.text.fontWeight = 'normal';
    //   }
    // });


    // setMarkedDates(updatedMarks);
    setSelectedDate(dateStr);
    setLoadingSlots(true);

    try {
      const slotDoc = await getDoc(doc(db, 'slots', dateStr));
      if (slotDoc.exists()) {
        const data = slotDoc.data();
        const filtered: Record<string, 'available' | 'booked'> = {};

        Object.entries(data).forEach(([key, value]) => {
        if (!key.endsWith('_user') && (value === 'available' || value === 'booked')) {
            filtered[key] = value;
        }
    });

        setSlots(filtered);
      } else {
        setSlots({});
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }

    setLoadingSlots(false);
  };

//   const handleSlotPress = async (slot: string) => {
//     const user = auth().currentUser;
//     if (!user || !selectedDate) {
//       Alert.alert('You must be logged in to book a slot.');
//       return;
//     }

//     try {
//       const slotRef = doc(db, 'slots', selectedDate);
//       const slotDoc = await getDoc(slotRef);
//       if (!slotDoc.exists()) return;

//       const data = slotDoc.data();
//       if (data[slot] === 'booked') {
//         Alert.alert('This slot is already booked.');
//         return;
//       }
//       await setDoc(
//         slotRef,
//         {
//           [slot]: 'booked',
//           [`${slot}_user`]: user.email || 'anonymous',
//         },
//         { merge: true }
//       );

//       navigation.navigate('Form', {
//         date: selectedDate,
//         slot: slot,
//         });

//     //   const updatedSlots = { ...slots, [slot]: 'booked' };
        // const updatedSlots: Record<string, 'available' | 'booked'> = {
        // ...slots,
        // [slot]: 'booked',
        // };
        

const handleSlotPress = async (slot: string) => {
  const user = auth().currentUser;
  if (!user || !selectedDate) {
    Alert.alert('You must be logged in to book a slot.');
    return;
  }

  navigation.navigate('Form', {
    date: selectedDate,
    slot: slot,
  });
};
        
        // setSlots(updatedSlots);

      // Update color logic
    //   const bookedCount = Object.values(updatedSlots).filter(v => v === 'booked').length;
    //   const totalCount = Object.values(updatedSlots).length;

//       let newColor = 'blue';
//       if (bookedCount === totalCount) newColor = 'red';
//       else if (bookedCount === 0) newColor = 'green';

//       const updatedMarks = { ...markedDates };
//       updatedMarks[selectedDate] = {
//         customStyles: {
//           container: { backgroundColor: newColor },
//           text: { color: 'white', fontWeight: 'bold' },
//         },
//       };

//       setMarkedDates(updatedMarks);

//     } catch (error) {
//       console.error('Error booking slot:', error);
//       Alert.alert('Booking failed. Please try again.');
//     }
//   };

//   if (loadingCalendar) {
//     return <ActivityIndicator style={{ marginTop: 40 }} />;
//   }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Book an Appointment</Text>

      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={onDayPress}
      />

      {selectedDate && (
        <>
          <Text style={styles.subtitle}>Available Slots for {selectedDate}:</Text>

          {loadingSlots ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : Object.keys(slots).length > 0 ? (
            Object.entries(slots).map(([slot, status]) =>
              status === 'available' ? (
                <Button key={slot} title={`Book ${slot}`} onPress={() => handleSlotPress(slot)} />
              ) : (
                <Text key={slot} style={{ color: 'grey', marginTop: 10 }}>{slot} - Booked</Text>
              )
            )
          ) : (
            <Text style={styles.noSlots}>No slots found for this date.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
  },
  noSlots: {
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
