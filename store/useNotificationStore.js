import { create } from "zustand";

const useNotificationStore = create((set) => ({
    // Push token state
    pushToken: null,
    setPushToken: (token) => set({ pushToken: token }),
    
    // Last received notification
    lastNotification: null,
    setLastNotification: (notification) => set({ lastNotification: notification }),
    
    // Notification history
    notificationHistory: [],
    addNotificationToHistory: (notification) => 
        set((state) => ({
            notificationHistory: [
                {
                    id: Date.now(),
                    notification,
                    receivedAt: new Date().toISOString(),
                },
                ...state.notificationHistory,
            ].slice(0, 50) // Keep only last 50 notifications
        })),
    clearNotificationHistory: () => set({ notificationHistory: [] }),
    
    // Permission status
    permissionStatus: null,
    setPermissionStatus: (status) => set({ permissionStatus: status }),
    
    // Badge count
    badgeCount: 0,
    setBadgeCount: (count) => set({ badgeCount: count }),
    
    // Registration state
    isRegistering: false,
    setIsRegistering: (isRegistering) => set({ isRegistering }),
    
    // Error state
    notificationError: null,
    setNotificationError: (error) => set({ notificationError: error }),
    clearNotificationError: () => set({ notificationError: null }),
}));

export default useNotificationStore;