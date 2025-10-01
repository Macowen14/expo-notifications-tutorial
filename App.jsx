import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import useNotificationStore from './store/useNotificationStore';
import { registerForPushNotificationsAsync } from './utils/registerPushNotifications';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const { pushToken, setPushToken } = useNotificationStore();
  const [notification, setNotification] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Register for push notifications on mount
    registerNotifications();

    // Listener for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      setNotification(notification);
    });

    // Listener for user interaction with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      Alert.alert('Notification Tapped', JSON.stringify(response.notification.request.content.data, null, 2));
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const registerNotifications = async () => {
    setIsRegistering(true);
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushToken(token);
    }
    setIsRegistering(false);
  };

  const scheduleLocalNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification 📬",
          body: 'This is a local test notification!',
          data: { testData: 'Some data here', timestamp: Date.now() },
          sound: true,
        },
        trigger: { seconds: 2 },
      });
      Alert.alert('Success', 'Local notification scheduled for 2 seconds from now');
    } catch (error) {
      Alert.alert('Error', `Failed to schedule notification: ${error.message}`);
    }
  };

  const scheduleImmediateNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Immediate Test 🚀",
          body: 'This notification appears immediately!',
          data: { immediate: true },
        },
        trigger: null,
      });
    } catch (error) {
      Alert.alert('Error', `Failed to send notification: ${error.message}`);
    }
  };

  const scheduleDailyNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Daily Reminder ⏰",
          body: 'This is your daily notification',
          data: { type: 'daily' },
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
        },
      });
      Alert.alert('Success', 'Daily notification scheduled for 9:00 AM');
    } catch (error) {
      Alert.alert('Error', `Failed to schedule daily notification: ${error.message}`);
    }
  };

  const getAllScheduledNotifications = async () => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    Alert.alert(
      'Scheduled Notifications',
      scheduled.length > 0 
        ? `Found ${scheduled.length} scheduled notification(s)\n\n${JSON.stringify(scheduled, null, 2)}`
        : 'No scheduled notifications'
    );
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert('Success', 'All scheduled notifications cancelled');
  };

  const getBadgeCount = async () => {
    const count = await Notifications.getBadgeCountAsync();
    Alert.alert('Badge Count', `Current badge count: ${count}`);
  };

  const setBadge = async (count) => {
    await Notifications.setBadgeCountAsync(count);
    Alert.alert('Success', `Badge count set to ${count}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🔔 Expo Notifications Test</Text>
        
        {/* Token Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Token</Text>
          {isRegistering ? (
            <Text style={styles.tokenText}>Registering...</Text>
          ) : pushToken ? (
            <View>
              <Text style={styles.tokenText} numberOfLines={3}>
                {pushToken}
              </Text>
              <TouchableOpacity 
                style={styles.smallButton}
                onPress={() => Alert.alert('Token', pushToken)}
              >
                <Text style={styles.smallButtonText}>View Full Token</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.tokenText}>No token registered</Text>
          )}
        </View>

        {/* Last Notification */}
        {notification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Notification Received</Text>
            <Text style={styles.notificationText}>
              Title: {notification.request.content.title}
            </Text>
            <Text style={styles.notificationText}>
              Body: {notification.request.content.body}
            </Text>
          </View>
        )}

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local Notifications</Text>
          
          <TouchableOpacity 
            style={styles.button}
            onPress={scheduleImmediateNotification}
          >
            <Text style={styles.buttonText}>Send Immediate Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={scheduleLocalNotification}
          >
            <Text style={styles.buttonText}>Schedule Notification (2s)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.button}
            onPress={scheduleDailyNotification}
          >
            <Text style={styles.buttonText}>Schedule Daily (9:00 AM)</Text>
          </TouchableOpacity>
        </View>

        {/* Management Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={getAllScheduledNotifications}
          >
            <Text style={styles.buttonText}>View Scheduled</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.dangerButton]}
            onPress={cancelAllNotifications}
          >
            <Text style={styles.buttonText}>Cancel All Scheduled</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={getBadgeCount}
          >
            <Text style={styles.buttonText}>Get Badge Count</Text>
          </TouchableOpacity>

          <View style={styles.badgeRow}>
            <TouchableOpacity 
              style={[styles.button, styles.smallButtonInline]}
              onPress={() => setBadge(5)}
            >
              <Text style={styles.buttonText}>Set Badge (5)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.smallButtonInline]}
              onPress={() => setBadge(0)}
            >
              <Text style={styles.buttonText}>Clear Badge</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.button, styles.secondaryButton]}
            onPress={registerNotifications}
            disabled={isRegistering}
          >
            <Text style={styles.buttonText}>
              {isRegistering ? 'Registering...' : 'Re-register Token'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            💡 To test push notifications from outside the app, use the Expo Push Notification Tool:
          </Text>
          <Text style={styles.instructionsText}>
            https://expo.dev/notifications
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  tokenText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  smallButton: {
    backgroundColor: '#E5E5EA',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  smallButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallButtonInline: {
    flex: 1,
  },
  instructions: {
    backgroundColor: '#FFF9E6',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  instructionsText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
});