import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import useNotificationStore from '../store/useNotificationStore';

export async function registerForPushNotificationsAsync() {
    const { setPermissionStatus, setNotificationError, clearNotificationError } = useNotificationStore.getState();
    
    clearNotificationError();

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        }); 
    }

    if (!Device.isDevice) {
        const error = 'Must use physical device for Push Notifications';
        setNotificationError(error);
        setPermissionStatus('unavailable');
        alert(error);
        return null;
    }

    try {
        // Get existing permission status
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        setPermissionStatus(existingStatus);
        let finalStatus = existingStatus;

        // Request permission if not granted
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
            setPermissionStatus(finalStatus);
        }

        // Handle denied permission
        if (finalStatus !== 'granted') {
            const error = 'Permission not granted for push notifications';
            setNotificationError(error);
            alert('Failed to get push token for push notification! \n\nPlease ensure you have enabled push notifications for this app in your device settings.');
            return null;
        }

        // Get project ID
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            const error = 'No project ID found. Push Notifications will not work.';
            setNotificationError(error);
            setPermissionStatus('error');
            alert(error);
            return null;
        }

        // Get push token
        const token = await Notifications.getExpoPushTokenAsync({ projectId });
        console.log(`Push Notification Token: ${token.data}`);
        return token.data;

    } catch (error) {
        console.error('Error getting push token:', error);
        setNotificationError(error.message || 'Failed to get push token');
        setPermissionStatus('error');
        return null;
    }
}

// Helper function to check current permission status
export async function checkPermissionStatus() {
    const { setPermissionStatus } = useNotificationStore.getState();
    
    try {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status);
        return status;
    } catch (error) {
        console.error('Error checking permission status:', error);
        setPermissionStatus('error');
        return 'error';
    }
}