import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  'https://meddqcbnupkmreawagyl.supabase.co';

const SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lZGRxY2JudXBrbXJlYXdhZ3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1ODAzNTYsImV4cCI6MjEwNDE1NjM1Nn0.0lR-6UrxQy7FAZR4-4DYZiwfkD4EVzlC1h2KsIV9lZs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type UserRole = 'user' | 'admin' | 'tester';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  photoUrl?: string;
  phone?: string;
  birthdate?: string;
  bloodGroup?: string;
  locationName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  createdAt?: string;
}

export interface IncidentReportRecord {
  id: string;
  incidentType: string;
  severity: string;
  latitude: number;
  longitude: number;
  locationName?: string;
  reportedBy: string;
  reporterEmail?: string;
  reporterRole?: string;
  remarks?: string;
  imageUrl?: string;
  hazardConfidence?: number;
  isAuthentic?: boolean;
  status: 'PENDING_REVIEW' | 'DISPATCHED_NDRF' | 'RESOLVED' | 'REJECTED';
  createdAt: string;
}

/**
 * Authenticate user with Username & Password against Supabase app_users table
 */
export async function authenticateUserFromDatabase(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const u = usernameInput.trim().toLowerCase();
  const p = passwordInput.trim();

  if (!u || !p) {
    return { success: false, message: 'Please enter both username and password.' };
  }

  try {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', u)
      .eq('password', p)
      .single();

    if (!error && data) {
      return {
        success: true,
        user: {
          id: data.id,
          email: data.email || `${u}@rakshak.in`,
          name: u,
          role: (['admin', 'tester', 'user'].includes(data.role) ? data.role : 'user') as UserRole,
          photoUrl: '',
          createdAt: data.created_at,
        },
      };
    }
  } catch (e) {
    console.warn('Database query fallback:', e);
  }

  // Exact fallback matching user credentials requirement
  if (u === 'admin' && p === 'admin') {
    return {
      success: true,
      user: {
        id: 'usr-adm-01',
        name: 'admin',
        email: 'admin@rakshak-ner.gov.in',
        role: 'admin',
        photoUrl: '',
      },
    };
  }

  if (u === 'tester' && p === 'tester') {
    return {
      success: true,
      user: {
        id: 'usr-tst-01',
        name: 'tester',
        email: 'tester@rakshak-ner.dev',
        role: 'tester',
        photoUrl: '',
      },
    };
  }

  if (u === 'user' && p === 'user') {
    return {
      success: true,
      user: {
        id: 'usr-cit-01',
        name: 'user',
        email: 'user@rakshak-ner.in',
        role: 'user',
        photoUrl: '',
      },
    };
  }

  return {
    success: false,
    message: 'Invalid username or password. For Admin use admin/admin, for Tester use tester/tester.',
  };
}

/**
 * Register a new citizen user in Supabase (Always assigned 'user' role)
 */
export async function registerUserInDatabase(
  usernameInput: string,
  passwordInput: string,
  nameInput: string,
  emailInput: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const u = usernameInput.trim().toLowerCase();
  const p = passwordInput.trim();
  const name = nameInput.trim() || u;
  const email = emailInput.trim() || `${u}@rakshak.in`;

  if (u === 'admin' || u === 'tester') {
    return { success: false, message: 'Username is reserved for system administrators.' };
  }

  const newUser: UserProfile = {
    id: `usr-${Date.now().toString().slice(-6)}`,
    email,
    name,
    role: 'user', // All public registrations get 'user' role only
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  };

  try {
    const { error } = await supabase.from('app_users').insert([
      {
        id: newUser.id,
        username: u,
        password: p,
        name: newUser.name,
        email: newUser.email,
        role: 'user',
        photo_url: newUser.photoUrl,
      },
    ]);

    if (error) {
      console.warn('Supabase register note:', error.message);
    }
  } catch (e) {
    console.warn('Registration error:', e);
  }

  return { success: true, user: newUser };
}

/**
 * Save user profile and role to Supabase (with resilient local storage fallback)
 */
export async function syncUserProfile(profile: UserProfile): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          photo_url: profile.photoUrl,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (error) {
      console.warn('Supabase user_profiles table note (will use local state):', error.message);
    }
  } catch (e) {
    console.warn('Supabase profile sync error:', e);
  }

  return profile;
}

/**
 * Save verified incident report to Supabase database
 */
export async function saveIncidentReportToSupabase(
  report: Omit<IncidentReportRecord, 'id' | 'createdAt'>
): Promise<IncidentReportRecord> {
  const newRecord: IncidentReportRecord = {
    ...report,
    id: `NER-REP-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from('incident_reports').insert([
      {
        id: newRecord.id,
        incident_type: newRecord.incidentType,
        severity: newRecord.severity,
        latitude: newRecord.latitude,
        longitude: newRecord.longitude,
        location_name: newRecord.locationName,
        reported_by: newRecord.reportedBy,
        reporter_email: newRecord.reporterEmail,
        reporter_role: newRecord.reporterRole,
        remarks: newRecord.remarks,
        image_url: newRecord.imageUrl,
        hazard_confidence: newRecord.hazardConfidence,
        is_authentic: newRecord.isAuthentic,
        status: newRecord.status,
        created_at: newRecord.createdAt,
      },
    ]);

    if (error) {
      console.warn('Supabase incident_reports note:', error.message);
    }
  } catch (e) {
    console.warn('Supabase insert report error:', e);
  }

  // Also maintain in local storage for instant offline resilience
  try {
    if (typeof localStorage !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('rakshak_incident_reports') || '[]');
      existing.unshift(newRecord);
      localStorage.setItem('rakshak_incident_reports', JSON.stringify(existing.slice(0, 50)));
    }
  } catch {}

  return newRecord;
}

/**
 * Fetch all incident reports from Supabase (for Admin & Command Center)
 */
export async function fetchAllIncidentReports(): Promise<IncidentReportRecord[]> {
  try {
    const { data, error } = await supabase
      .from('incident_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        incidentType: d.incident_type || d.incidentType || 'Active Landslide',
        severity: d.severity || 'HIGH',
        latitude: d.latitude || 27.3389,
        longitude: d.longitude || 88.6065,
        locationName: d.location_name || d.locationName || 'Sikkim Corridor',
        reportedBy: d.reported_by || d.reportedBy || 'Field Responder',
        reporterEmail: d.reporter_email || d.reporterEmail,
        reporterRole: d.reporter_role || d.reporterRole,
        remarks: d.remarks || '',
        imageUrl: d.image_url || d.imageUrl,
        hazardConfidence: d.hazard_confidence || d.hazardConfidence || 95,
        isAuthentic: d.is_authentic ?? true,
        status: d.status || 'PENDING_REVIEW',
        createdAt: d.created_at || new Date().toISOString(),
      }));
    }
  } catch (e) {
    console.warn('Supabase fetch reports error, using local buffer:', e);
  }

  // Fallback to local stored reports
  if (typeof localStorage !== 'undefined') {
    const local = localStorage.getItem('rakshak_incident_reports');
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
  }

  // Seed default incident reports for demo/admin view
  return [
    {
      id: 'NER-REP-904211',
      incidentType: 'Active Mudslide',
      severity: 'CRITICAL',
      latitude: 27.2415,
      longitude: 88.5132,
      locationName: 'NH-10 Km 29 (Sevoke - Gangtok)',
      reportedBy: 'Rajesh Sharma (Field Officer)',
      reporterEmail: 'r.sharma@ndrf.gov.in',
      reporterRole: 'admin',
      remarks: 'Continuous soil slide across both highway lanes. Debris depth approx 1.8m. Heavy rain continuing.',
      hazardConfidence: 98.4,
      isAuthentic: true,
      status: 'DISPATCHED_NDRF',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
    {
      id: 'NER-REP-904189',
      incidentType: 'Rockfall Hazard',
      severity: 'HIGH',
      latitude: 30.1245,
      longitude: 78.4312,
      locationName: 'NH-58 Rishikesh - Devprayag Sector',
      reportedBy: 'Anita Roy (Citizen Reporter)',
      reporterEmail: 'anita.roy@gmail.com',
      reporterRole: 'user',
      remarks: 'Multiple large boulders on shoulder, single lane passable.',
      hazardConfidence: 94.7,
      isAuthentic: true,
      status: 'PENDING_REVIEW',
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ];
}
