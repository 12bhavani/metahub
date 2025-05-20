import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import Ionicons from 'react-native-vector-icons/Ionicons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

    React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
      ),
    });
    }, [navigation]);


  const goToCalendar = () => {
    navigation.navigate('Calendar');
  };

  return (
    <View style={styles.container}>
    

      <Text style={styles.title}>Welcome to the Home Page!</Text>
      
      <TouchableOpacity style={styles.button} onPress={goToCalendar}>
        <Text style={styles.buttonText}>Go to Calendar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
    
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 40,
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
