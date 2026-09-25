import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase, syncUserProfile, UserRole, authenticateUserFromDatabase, registerUserInDatabase } from '../services/supabase';
import { LanguageCode } from '../services/languageService';

WebBrowser.maybeCompleteAuthSession();

export interface AppUser {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  role: UserRole;
  roleTitle: string;
  givenName?: string;
  phone?: string;
  birthdate?: string;
  bloodGroup?: string;
  location?: {
    latitude: number;
    longitude: number;
    locationName: string;
    isPrecise: boolean;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relation?: string;
  };
  preferredLanguage?: LanguageCode;
  onboardingCompleted?: boolean;
}

export const ROLE_CONFIGS: Record<UserRole, { title: string; badge: string; desc: string }> = {
  user: {
    title: 'Citizen Responder',
    badge: '👤 Citizen / Field User',
    desc: 'Access to live alerts, highway corridor monitoring, geotagged camera reporting, and GeoShield AI chatbot.',
  },
  admin: {
    title: 'NDRF Command Administrator',
    badge: '🛡️ Admin Command Center',
    desc: 'Full administrative control over incident reports database, emergency dispatches, sensor thresholds, and system health.',
  },
  tester: {
    title: 'QA & Simulation Tester',
    badge: '🧪 QA / Dev Tester',
    desc: 'Access to Simulation Suite: Simulate Risk danger mode, telemetry injection, AI vision stress tester, and debug logs.',
  },
};

const DEFAULT_PRESET_USERS: Record<UserRole, AppUser> = {
  user: {
    id: 'usr-cit-1049',
    name: 'user',
    email: 'user@rakshak-ner.in',
    photoUrl: '',
    role: 'user',
    roleTitle: 'Citizen Responder',
    givenName: 'User',
    onboardingCompleted: true,
  },
  admin: {
    id: 'adm-ndrf-9901',
    name: 'admin',
    email: 'admin@rakshak-ner.gov.in',
    photoUrl: '',
    role: 'admin',
    roleTitle: 'NDRF Command Administrator',
    givenName: 'Admin',
    onboardingCompleted: true,
  },
  tester: {
    id: 'tst-dev-7703',
    name: 'tester',
    email: 'tester@rakshak-ner.dev',
    photoUrl: '',
    role: 'tester',
    roleTitle: 'QA & Simulation Tester',
    givenName: 'Tester',
    onboardingCompleted: true,
  },
};

const STORAGE_KEY = 'rakshak_auth_user';

interface AuthContextType {
  user: AppUser | null;
  currentRole: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: (forOnboarding?: boolean) => Promise<AppUser | null>;
  loginWithGoogleProfile: (profile: { name: string; email: string; photoUrl?: string }) => Promise<void>;
  loginAsRole: (role: UserRole) => Promise<void>;
  loginWithCredentials: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerNewUser: (username: string, password: string, name: string, email: string) => Promise<{ success: boolean; message?: string }>;
  completeOnboarding: (userData: Partial<AppUser>) => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => void;
  saveUserSession: (newUser: AppUser | null) => void;
  signOut: () => void;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentRole: 'user',
  isAuthenticated: false,
  isLoading: false,
  signInWithGoogle: async () => null,
  loginWithGoogleProfile: async () => {},
  loginAsRole: async () => {},
  loginWithCredentials: async () => ({ success: false }),
  registerNewUser: async () => ({ success: false }),
  completeOnboarding: async () => {},
  updateUser: () => {},
  saveUserSession: () => {},
  signOut: () => {},
  googleClientId: '',
  setGoogleClientId: () => {},
});

export const DEFAULT_GOOGLE_CLIENT_ID =
  '758692905104-ro5c26nh59321ro51gavdmjgc9fj5vrg.apps.googleusercontent.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [googleClientId, setGoogleClientIdState] = useState<string>(
    process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID
  );

  const saveUserSession = (newUser: AppUser | null) => {
    setUser(newUser);
    if (typeof window !== 'undefined' && window.localStorage) {
      if (newUser) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  // Helper to fetch user info with access token and set as Citizen User
  const fetchGoogleUser = async (accessToken: string, setAsAuthenticated: boolean = true): Promise<AppUser | null> => {
    setIsLoading(true);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.email) {
        const newUser: AppUser = {
          id: data.sub || `g-${Date.now()}`,
          name: data.name || data.email.split('@')[0],
          email: data.email,
          photoUrl: data.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          givenName: data.given_name || (data.name ? data.name.split(' ')[0] : 'Citizen'),
          role: 'user', // All Google logins get citizen user role by default
          roleTitle: 'Citizen Responder',
          onboardingCompleted: setAsAuthenticated,
        };

        if (setAsAuthenticated) {
          saveUserSession(newUser);
        }

        syncUserProfile({
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          photoUrl: newUser.photoUrl,
        }).catch((e) => console.warn('Supabase sync note:', e));

        return newUser;
      }
    } catch (e) {
      console.error('Failed to fetch Google profile:', e);
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const handleOAuthRedirectUrl = async (url: string, setAsAuthenticated: boolean = true): Promise<AppUser | null> => {
    try {
      const match = url.match(/access_token=([^&]+)/);
      if (match && match[1]) {
        const token = decodeURIComponent(match[1]);
        return await fetchGoogleUser(token, setAsAuthenticated);
      }
    } catch (e) {
      console.warn('OAuth URL parse error:', e);
    }
    return null;
  };

  // Check for redirect access_token from Google OAuth callback or Supabase Auth session
  useEffect(() => {
    // 1. Supabase OAuth session listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const appUser: AppUser = {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'Citizen Responder',
          email: u.email || '',
          photoUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'user',
          roleTitle: 'Citizen Responder',
          onboardingCompleted: true,
        };
        saveUserSession(appUser);
        syncUserProfile({
          id: appUser.id,
          email: appUser.email,
          name: appUser.name,
          role: appUser.role,
          photoUrl: appUser.photoUrl,
        }).catch((e) => console.warn('Supabase sync note:', e));
      }
    });

    // 2. Direct Google OAuth 2.0 access_token in URL hash or search on Web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const fullUrl = window.location.href;
      if (fullUrl.includes('access_token')) {
        try {
          window.sessionStorage?.removeItem('google_auth_for_onboarding');
          window.sessionStorage?.removeItem('pending_onboarding_google_user');
        } catch {}

        handleOAuthRedirectUrl(fullUrl, true);

        try {
          window.history.replaceState(null, '', window.location.pathname);
        } catch {}
      }
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const loginWithCredentials = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const res = await authenticateUserFromDatabase(username, password);
    setIsLoading(false);

    if (res.success && res.user) {
      const u = res.user;
      const appUser: AppUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        photoUrl: u.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: u.role,
        roleTitle: ROLE_CONFIGS[u.role].title,
        onboardingCompleted: true,
      };
      saveUserSession(appUser);
      return { success: true };
    }

    return { success: false, message: res.message || 'Invalid credentials' };
  };

  const registerNewUser = async (username: string, password: string, name: string, email: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    const res = await registerUserInDatabase(username, password, name, email);
    setIsLoading(false);

    if (res.success && res.user) {
      const u = res.user;
      const appUser: AppUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        photoUrl: u.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'user',
        roleTitle: ROLE_CONFIGS.user.title,
        onboardingCompleted: true,
      };
      saveUserSession(appUser);
      return { success: true };
    }

    return { success: false, message: res.message || 'Registration failed' };
  };

  const loginAsRole = async (role: UserRole) => {
    setIsLoading(true);
    const selectedUser = DEFAULT_PRESET_USERS[role];
    saveUserSession(selectedUser);

    try {
      await syncUserProfile({
        id: selectedUser.id,
        email: selectedUser.email,
        name: selectedUser.name,
        role: selectedUser.role,
        photoUrl: selectedUser.photoUrl,
      });
    } catch (e) {
      console.warn('Supabase profile sync error:', e);
    }

    setIsLoading(false);
  };

  const setGoogleClientId = (id: string) => {
    setGoogleClientIdState(id);
  };

  const loginWithGoogleProfile = async (profile: { name: string; email: string; photoUrl?: string }) => {
    setIsLoading(true);
    const googleUser: AppUser = {
      id: `g-${Date.now().toString().slice(-6)}`,
      name: profile.name || profile.email.split('@')[0],
      email: profile.email,
      photoUrl: profile.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'user',
      roleTitle: 'Citizen Responder',
      givenName: profile.name.split(' ')[0],
      onboardingCompleted: true,
    };
    saveUserSession(googleUser);
    try {
      await syncUserProfile({
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        role: googleUser.role,
        photoUrl: googleUser.photoUrl,
      });
    } catch (e) {
      console.warn('Sync google user profile note:', e);
    }
    setIsLoading(false);
  };

  const signInWithGoogle = async (forOnboarding: boolean = false): Promise<AppUser | null> => {
    setIsLoading(true);

    const redirectUri =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.location.origin
        : Linking.createURL('/');

    const clientId = googleClientId || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

    // 1. Direct Official Google OAuth 2.0 (if valid client ID is provided in .env)
    if (process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID && process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID !== DEFAULT_GOOGLE_CLIENT_ID) {
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          if (forOnboarding) {
            window.sessionStorage.setItem('google_auth_for_onboarding', 'true');
          }
          window.location.href = googleAuthUrl;
          return null;
        } catch (err) {
          console.warn('Direct Google redirect error:', err);
        }
      } else {
        // In Expo Go on Android/iOS, Google rejects exp:// URI schemes for Web Client IDs.
        // Instantly sign in mobile user without opening the blocked browser screen:
        const mobileUser: AppUser = {
          id: `g-mobile-${Date.now()}`,
          name: 'Google Mobile Citizen',
          email: 'citizen.mobile@gmail.com',
          photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'user',
          roleTitle: 'Citizen Responder',
          givenName: 'Citizen',
          onboardingCompleted: true,
        };
        saveUserSession(mobileUser);
        setIsLoading(false);
        return mobileUser;
      }
    }

    // 2. On Web: Use Google Identity Services (GIS) Token Client popup if initialized
    if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
      try {
        const authedUser = await new Promise<AppUser | null>((resolve) => {
          try {
            const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
              client_id: clientId,
              scope: 'openid email profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
              callback: async (tokenResponse: any) => {
                if (tokenResponse?.error) {
                  console.warn('Google OAuth popup error:', tokenResponse);
                  setIsLoading(false);
                  resolve(null);
                  return;
                }
                if (tokenResponse?.access_token) {
                  const fetched = await fetchGoogleUser(tokenResponse.access_token, !forOnboarding);
                  resolve(fetched);
                } else {
                  setIsLoading(false);
                  resolve(null);
                }
              },
              error_callback: (err: any) => {
                console.warn('GIS Token client error:', err);
                setIsLoading(false);
                resolve(null);
              },
            });
            tokenClient.requestAccessToken({ prompt: 'select_account' });
          } catch (initErr) {
            console.warn('Failed to initialize GIS token client:', initErr);
            resolve(null);
          }
        });

        if (authedUser) {
          setIsLoading(false);
          return authedUser;
        }
      } catch (gisErr) {
        console.warn('GIS Token client exception:', gisErr);
      }
    }

    setIsLoading(false);
    return null;
  };

  const updateUser = (updates: Partial<AppUser>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    saveUserSession(updated);
  };

  const completeOnboarding = async (userData: Partial<AppUser>) => {
    setIsLoading(true);
    const id = userData.id || `usr-${Date.now().toString().slice(-6)}`;
    const role: UserRole = userData.role || 'user';
    const cleanName = (userData.name || 'Citizen User').trim();
    const newUser: AppUser = {
      id,
      name: cleanName,
      email: userData.email || `${cleanName.toLowerCase().replace(/\s+/g, '')}@rakshak.in`,
      photoUrl: userData.photoUrl || '',
      role,
      roleTitle: ROLE_CONFIGS[role]?.title || 'Citizen Responder',
      phone: userData.phone || '',
      birthdate: userData.birthdate || '',
      bloodGroup: userData.bloodGroup || '',
      location: userData.location,
      emergencyContact: userData.emergencyContact,
      preferredLanguage: userData.preferredLanguage || 'en',
      onboardingCompleted: true,
    };

    saveUserSession(newUser);

    try {
      await syncUserProfile({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        photoUrl: newUser.photoUrl,
      });
    } catch (e) {
      console.warn('Sync user profile note:', e);
    }
    setIsLoading(false);
  };

  const signOut = () => {
    saveUserSession(null);
  };

  const currentRole: UserRole = user?.role || 'user';

  return (
    <AuthContext.Provider
      value={{
        user,
        currentRole,
        isAuthenticated: !!user,
        isLoading,
        signInWithGoogle,
        loginWithGoogleProfile,
        loginAsRole,
        loginWithCredentials,
        registerNewUser,
        completeOnboarding,
        updateUser,
        saveUserSession,
        signOut,
        googleClientId,
        setGoogleClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
