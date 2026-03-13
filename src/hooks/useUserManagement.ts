import { useState, useCallback, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  registeredAt: number;
  faceDescriptor?: number[];
}

interface UseUserManagementOptions {
  onUserRegistered?: (user: User) => void;
  onUserRecognized?: (user: User) => void;
}

export function useUserManagement(options: UseUserManagementOptions = {}) {
  const { onUserRegistered, onUserRecognized } = options;

  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRecognitionEnabled, setIsRecognitionEnabled] = useState(false);

  // Load users from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('blinkguard-users');
    if (savedUsers) {
      try {
        const parsed = JSON.parse(savedUsers);
        setUsers(parsed);
      } catch (err) {
        console.error('Failed to parse users:', err);
      }
    }

    const savedCurrentUser = localStorage.getItem('blinkguard-current-user');
    if (savedCurrentUser) {
      try {
        const parsed = JSON.parse(savedCurrentUser);
        setCurrentUser(parsed);
      } catch (err) {
        console.error('Failed to parse current user:', err);
      }
    }

    const savedRecognition = localStorage.getItem('blinkguard-recognition-enabled');
    if (savedRecognition) {
      setIsRecognitionEnabled(savedRecognition === 'true');
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('blinkguard-users', JSON.stringify(users));
  }, [users]);

  // Save current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('blinkguard-current-user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('blinkguard-current-user');
    }
  }, [currentUser]);

  // Save recognition setting
  useEffect(() => {
    localStorage.setItem('blinkguard-recognition-enabled', isRecognitionEnabled.toString());
  }, [isRecognitionEnabled]);

  // Register a new user
  const registerUser = useCallback((name: string, faceDescriptor?: number[]) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name.trim(),
      registeredAt: Date.now(),
      faceDescriptor,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    onUserRegistered?.(newUser);

    return newUser;
  }, [onUserRegistered]);

  // Delete a user
  const deleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
  }, [currentUser]);

  // Switch to a user
  const switchUser = useCallback((userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      onUserRecognized?.(user);
    }
  }, [users, onUserRecognized]);

  // Recognize user from face descriptor (simplified)
  const recognizeUser = useCallback((faceDescriptor: number[]) => {
    if (!isRecognitionEnabled || users.length === 0) return null;

    // Simple Euclidean distance comparison
    let bestMatch: User | null = null;
    let bestDistance = Infinity;

    for (const user of users) {
      if (user.faceDescriptor) {
        const distance = calculateEuclideanDistance(
          faceDescriptor,
          user.faceDescriptor
        );
        if (distance < bestDistance && distance < 0.8) {
          bestDistance = distance;
          bestMatch = user;
        }
      }
    }

    if (bestMatch && bestMatch.id !== currentUser?.id) {
      setCurrentUser(bestMatch);
      onUserRecognized?.(bestMatch);
    }

    return bestMatch;
  }, [isRecognitionEnabled, users, currentUser, onUserRecognized]);

  // Toggle recognition
  const toggleRecognition = useCallback(() => {
    setIsRecognitionEnabled((prev) => !prev);
  }, []);

  // Set recognition enabled
  const setRecognitionEnabled = useCallback((enabled: boolean) => {
    setIsRecognitionEnabled(enabled);
  }, []);

  // Update user's face descriptor
  const updateFaceDescriptor = useCallback((userId: string, faceDescriptor: number[]) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, faceDescriptor } : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, faceDescriptor } : null));
    }
  }, [currentUser]);

  return {
    users,
    currentUser,
    isRecognitionEnabled,
    registerUser,
    deleteUser,
    switchUser,
    recognizeUser,
    toggleRecognition,
    setRecognitionEnabled,
    updateFaceDescriptor,
  };
}

// Calculate Euclidean distance between two vectors
function calculateEuclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  
  return Math.sqrt(sum);
}

export type { User };
