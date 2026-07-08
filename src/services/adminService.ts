import { supabase } from '../lib/supabase';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type MemberStatus = 'active' | 'expired' | 'suspended' | 'cancelled' | 'pending';
export type ChangeType = 'upgrade' | 'downgrade' | 'renewal' | 'suspension' | 'expiry' | 'manual' | 'activation' | 'deletion';
export type UserRole = 'user' | 'admin' | 'super_admin';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface MembershipTier {
  id: number;
  name: string;
  slug: string;
  level: number;
  description: string | null;
  features: string[];
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  created_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  tier_id: number;
  status: MemberStatus;
  started_at: string;
  expires_at: string | null;
  grace_until: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemberWithDetails extends Profile {
  email?: string;
  role?: UserRole;
  membership?: UserMembership & { tier?: MembershipTier };
}

export interface MembershipHistory {
  id: string;
  user_id: string;
  from_tier_id: number | null;
  to_tier_id: number;
  changed_by: string | null;
  change_type: ChangeType;
  reason: string | null;
  payment_ref: string | null;
  created_at: string;
  from_tier?: MembershipTier;
  to_tier?: MembershipTier;
  changed_by_profile?: Profile;
  user?: Profile;
}

export interface AdminStats {
  totalMembers: number;
  activePremium: number;
  expiringIn7Days: number;
  newThisMonth: number;
  membersByTier: { tier: string; count: number }[];
}

export interface Feature {
  id: number;
  key: string;
  label: string;
  description: string | null;
  category: string | null;
  input_type: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────
// LOCAL STORAGE MOCK DATABASE (FALLBACK)
// ─────────────────────────────────────────────

const MOCK_STORAGE_KEYS = {
  TIERS: 'qalbie_mock_tiers',
  PROFILES: 'qalbie_mock_profiles',
  MEMBERSHIPS: 'qalbie_mock_memberships',
  HISTORY: 'qalbie_mock_history',
  ROLES: 'qalbie_mock_roles',
  FEATURES: 'qalbie_mock_features',
  SETTINGS: 'qalbie_mock_settings'
};

export interface AppSettings {
  support_email: string;
  support_whatsapp: string;
}

const DEFAULT_MOCK_SETTINGS: AppSettings = {
  support_email: 'support@qalbie.id',
  support_whatsapp: 'https://wa.me/6281234567890'
};

const DEFAULT_MOCK_TIERS: MembershipTier[] = [
  { id: 1, name: 'Free', slug: 'free', level: 0, description: 'Akses dasar gratis untuk mulai perjalanan sehatmu', features: ['Akses Basic Chat AI'], price_monthly: 0, price_yearly: 0, is_active: true, created_at: new Date().toISOString() },
  { id: 2, name: 'Basic', slug: 'basic', level: 1, description: 'Fitur premium dasar untuk kesehatan mental sehari-hari', features: ['Akses Audio Terapi Basic', 'Limit Chat AI 50/hari', 'Laporan Mood Tracker Mingguan'], price_monthly: 29000, price_yearly: 290000, is_active: true, created_at: new Date().toISOString() },
  { id: 3, name: 'Pro', slug: 'pro', level: 2, description: 'Akses lengkap untuk perjalanan healing yang lebih dalam', features: ['Akses Audio Terapi Premium', 'Limit Chat AI 200/hari', 'Laporan Mood Tracker Bulanan', 'Stress Meter Lanjutan'], price_monthly: 49000, price_yearly: 490000, is_active: true, created_at: new Date().toISOString() },
  { id: 4, name: 'Premium', slug: 'premium', level: 3, description: 'Paket terlengkap dengan semua fitur eksklusif Qalbie', features: ['Semua Fitur Pro', 'Sesi Konsultasi 1-on-1', 'Prioritas Dukungan', 'Akses Konten Eksklusif'], price_monthly: 99000, price_yearly: 990000, is_active: true, created_at: new Date().toISOString() }
];

const DEFAULT_MOCK_PROFILES: Profile[] = [
  { id: 'usr-1', full_name: 'Nabila Zahra', phone: '08123456789', avatar_url: null, bio: 'Student', timezone: 'Asia/Jakarta', language: 'id', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-2', full_name: 'Aisyah Humaira', phone: '08987654321', avatar_url: null, bio: 'Designer', timezone: 'Asia/Jakarta', language: 'id', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-3', full_name: 'Putri Kusuma', phone: '08555123456', avatar_url: null, bio: 'Writer', timezone: 'Asia/Jakarta', language: 'id', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() },
  { id: 'usr-4', full_name: 'Fatimah Az-Zahra', phone: '08111222333', avatar_url: null, bio: 'Teacher', timezone: 'Asia/Jakarta', language: 'id', created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), updated_at: new Date().toISOString() }
];

const DEFAULT_MOCK_MEMBERSHIPS: UserMembership[] = [
  { id: 'memb-1', user_id: 'usr-1', tier_id: 4, status: 'active', started_at: new Date().toISOString(), expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), grace_until: null, notes: 'Initial setup', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'memb-2', user_id: 'usr-2', tier_id: 2, status: 'active', started_at: new Date().toISOString(), expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), grace_until: null, notes: 'Promo', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'memb-3', user_id: 'usr-3', tier_id: 1, status: 'active', started_at: new Date().toISOString(), expires_at: null, grace_until: null, notes: 'Free Tier default', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'memb-4', user_id: 'usr-4', tier_id: 3, status: 'expired', started_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), expires_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), grace_until: null, notes: 'Expired', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

const DEFAULT_MOCK_ROLES = [
  { user_id: 'usr-1', role: 'user' },
  { user_id: 'usr-2', role: 'user' },
  { user_id: 'usr-3', role: 'user' },
  { user_id: 'usr-4', role: 'user' }
];

const DEFAULT_MOCK_FEATURES: Feature[] = [
  { id: 1, key: 'audio_therapy_premium', label: 'Akses Audio Terapi Premium', description: 'Akses penuh ke semua audio terapi berbayar', category: 'access', input_type: 'toggle', sort_order: 1, is_active: true, created_at: new Date().toISOString() },
  { id: 2, key: 'chat_ai_limit', label: 'Limit Chat AI per Hari', description: 'Batas pesan ke chat AI per 24 jam', category: 'limits', input_type: 'number', sort_order: 2, is_active: true, created_at: new Date().toISOString() },
  { id: 3, key: 'monthly_mood_report', label: 'Laporan Mood Tracker Bulanan', description: 'Download dan akses riwayat mood analitik bulanan', category: 'access', input_type: 'toggle', sort_order: 3, is_active: true, created_at: new Date().toISOString() },
  { id: 4, key: 'one_on_one_consultation', label: 'Sesi Konsultasi 1-on-1', description: 'Konsultasi virtual dengan konselor profesional', category: 'support', input_type: 'toggle', sort_order: 4, is_active: false, created_at: new Date().toISOString() }
];

function getLocalData<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
}

function setLocalData<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

let isOfflineMode = false; // Reset to false and don't read from session for Admin to prevent getting stuck

function setOfflineMode(value: boolean) {
  isOfflineMode = value;
}

function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => {
      console.warn("Supabase timeout detected.");
      reject(new Error('Timeout'));
    }, ms)
  );
  // Remove persistent offline mode trigger
  return Promise.race([promise, timeout]);
}

async function runSupabase<T>(fn: () => Promise<T>, ms = 10000): Promise<T> {
  // Always try to run in admin mode
  return withTimeout(fn(), ms);
}

// ─────────────────────────────────────────────
// ROLE CHECK
// ─────────────────────────────────────────────

export async function getCurrentUserRole(userObj?: any): Promise<UserRole | null> {
  const fetchRole = async (): Promise<UserRole | null> => {
    let user = userObj;
    if (!user) {
      const { data } = await supabase.auth.getSession();
      user = data.session?.user;
    }
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
        
      if (data && data.role) {
        return data.role as UserRole;
      }
    } catch (e) {
      console.error('Error fetching user role:', e);
    }

    const emailLower = user.email?.toLowerCase() || '';
    if (emailLower === 'carx2254@gmail.com') {
      return 'super_admin';
    }
    
    return 'user';
  };

  return withTimeout(fetchRole(), 2000).catch(() => null);
}

export async function isSuperAdmin(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'super_admin' || role === 'admin';
}

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────

export async function getAdminStats(): Promise<AdminStats> {
  try {
    const now = new Date().toISOString();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const fetchStats = async () => {
      const tierIds = await getTierIdsByLevel([1, 2, 3]);
      
      const [totalRes, activeRes, expiringRes, newRes, tiersRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_memberships').select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .in('tier_id', tierIds),
        supabase.from('user_memberships').select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gte('expires_at', now)
          .lte('expires_at', in7Days),
        supabase.from('profiles').select('id', { count: 'exact', head: true })
          .gte('created_at', startOfMonth),
        supabase.from('membership_tiers').select('id, name, slug').eq('is_active', true)
      ]);

      if (totalRes.error || activeRes.error || expiringRes.error || newRes.error || tiersRes.error) {
        throw new Error("Supabase tables missing or error");
      }

      const tierCounts = await Promise.all(
        (tiersRes.data || []).map(async (tier) => {
          const { count } = await supabase
            .from('user_memberships')
            .select('id', { count: 'exact', head: true })
            .eq('tier_id', tier.id)
            .eq('status', 'active');
          return { tier: tier.name, count: count || 0 };
        })
      );

      return {
        totalMembers: totalRes.count || 0,
        activePremium: activeRes.count || 0,
        expiringIn7Days: expiringRes.count || 0,
        newThisMonth: newRes.count || 0,
        membersByTier: tierCounts,
      };
    };

    // Timeout 3 detik untuk query Supabase
    const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
    
    return await Promise.race([fetchStats(), timeoutPromise]);
  } catch (e) {
    // LOCAL STORAGE FALLBACK
    const profiles = getLocalData<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, DEFAULT_MOCK_PROFILES);
    const memberships = getLocalData<UserMembership[]>(MOCK_STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MOCK_MEMBERSHIPS);
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);

    const now = new Date();
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const activeMemb = memberships.filter(m => m.status === 'active' && m.tier_id > 1);
    const expiring = memberships.filter(m => {
      if (!m.expires_at || m.status !== 'active') return false;
      const expDate = new Date(m.expires_at);
      return expDate >= now && expDate <= in7Days;
    });
    const newMembers = profiles.filter(p => new Date(p.created_at) >= startOfMonth);

    const tierCounts = tiers.map(t => {
      const count = memberships.filter(m => m.tier_id === t.id && m.status === 'active').length;
      return { tier: t.name, count };
    });

    return {
      totalMembers: profiles.length,
      activePremium: activeMemb.length,
      expiringIn7Days: expiring.length,
      newThisMonth: newMembers.length,
      membersByTier: tierCounts
    };
  }
}

async function getTierIdsByLevel(levels: number[]): Promise<number[]> {
  try {
    const { data } = await supabase
      .from('membership_tiers')
      .select('id')
      .in('level', levels);
    return (data || []).map(t => t.id);
  } catch (e) {
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    return tiers.filter(t => levels.includes(t.level)).map(t => t.id);
  }
}

// ─────────────────────────────────────────────
// MEMBERS
// ─────────────────────────────────────────────

export async function getMembers(filters?: {
  search?: string;
  tier?: string;
  status?: MemberStatus;
}): Promise<MemberWithDetails[]> {
  try {
    const fetchMembers = async () => {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role),
          user_memberships(
            *,
            membership_tiers(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        role: p.user_roles?.[0]?.role || 'user',
        membership: p.user_memberships?.[0]
          ? {
              ...p.user_memberships[0],
              tier: p.user_memberships[0].membership_tiers,
            }
          : undefined,
      }));
    };

    return await withTimeout(fetchMembers(), 2500);
  } catch (e) {
    // LOCAL STORAGE FALLBACK
    let profiles = getLocalData<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, DEFAULT_MOCK_PROFILES);
    const memberships = getLocalData<UserMembership[]>(MOCK_STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MOCK_MEMBERSHIPS);
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    const roles = getLocalData<any[]>(MOCK_STORAGE_KEYS.ROLES, DEFAULT_MOCK_ROLES);

    const { data: { user } } = await supabase.auth.getUser();
    if (user && !profiles.some(p => p.id === user.id)) {
      const selfProfile: Profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
        phone: null,
        avatar_url: null,
        bio: 'Super Admin Account',
        timezone: 'Asia/Jakarta',
        language: 'id',
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      };
      profiles.unshift(selfProfile);
      setLocalData(MOCK_STORAGE_KEYS.PROFILES, profiles);

      const hasMemb = memberships.some(m => m.user_id === user.id);
      if (!hasMemb) {
        memberships.push({
          id: 'memb-self',
          user_id: user.id,
          tier_id: 4,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: null,
          grace_until: null,
          notes: 'System Assigned Admin Tier',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setLocalData(MOCK_STORAGE_KEYS.MEMBERSHIPS, memberships);
      }
    }

    if (filters?.search) {
      const s = filters.search.toLowerCase();
      profiles = profiles.filter(p => (p.full_name || '').toLowerCase().includes(s));
    }

    return profiles.map(p => {
      const memb = memberships.find(m => m.user_id === p.id);
      const tier = memb ? tiers.find(t => t.id === memb.tier_id) : undefined;
      const roleObj = roles.find(r => r.user_id === p.id);

      return {
        ...p,
        role: roleObj?.role || 'user',
        membership: memb ? { ...memb, tier } : undefined
      };
    });
  }
}

export async function getMemberDetail(userId: string): Promise<MemberWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role),
        user_memberships(*, membership_tiers(*))
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    const rawRoles = (data as any).user_roles;
    const roleStr = Array.isArray(rawRoles) ? rawRoles[0]?.role : rawRoles?.role;

    const rawMemb = (data as any).user_memberships;
    const membObj = Array.isArray(rawMemb) ? rawMemb[0] : rawMemb;

    return {
      ...data,
      role: roleStr || 'user',
      membership: membObj
        ? {
            ...membObj,
            tier: membObj.membership_tiers || (Array.isArray(membObj.membership_tiers) ? membObj.membership_tiers[0] : null),
          }
        : undefined,
    };
  } catch (e) {
    const members = await getMembers();
    return members.find(m => m.id === userId) || null;
  }
}

export async function getMemberHistory(userId: string): Promise<MembershipHistory[]> {
  try {
    const { data, error } = await supabase
      .from('membership_history')
      .select(`
        *,
        from_tier:membership_tiers!membership_history_from_tier_id_fkey(*),
        to_tier:membership_tiers!membership_history_to_tier_id_fkey(*),
        changed_by_profile:profiles!membership_history_changed_by_fkey(full_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    const history = getLocalData<MembershipHistory[]>(MOCK_STORAGE_KEYS.HISTORY, []);
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    const profiles = getLocalData<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, DEFAULT_MOCK_PROFILES);

    return history
      .filter(h => h.user_id === userId)
      .map(h => ({
        ...h,
        from_tier: tiers.find(t => t.id === h.from_tier_id),
        to_tier: tiers.find(t => t.id === h.to_tier_id),
        changed_by_profile: profiles.find(p => p.id === h.changed_by)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

export async function updateMemberTier(
  userId: string,
  tierId: number,
  durationMonths: number | null,
  notes: string,
  adminId: string,
  changeType: ChangeType = 'manual'
): Promise<void> {
  try {
    await runSupabase(async () => {
      const { data: currentMembership } = await supabase
        .from('user_memberships')
        .select('tier_id, id')
        .eq('user_id', userId)
        .single();

      const expiresAt = durationMonths
        ? new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error: upsertError } = await supabase
        .from('user_memberships')
        .upsert({
          user_id: userId,
          tier_id: tierId,
          status: 'active',
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
          notes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      await supabase.from('membership_history').insert({
        user_id: userId,
        from_tier_id: currentMembership?.tier_id || null,
        to_tier_id: tierId,
        changed_by: adminId,
        change_type: changeType,
        reason: notes,
      });
    });
  } catch (e) {
    const memberships = getLocalData<UserMembership[]>(MOCK_STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MOCK_MEMBERSHIPS);
    const history = getLocalData<MembershipHistory[]>(MOCK_STORAGE_KEYS.HISTORY, []);

    const idx = memberships.findIndex(m => m.user_id === userId);
    const prevTierId = idx !== -1 ? memberships[idx].tier_id : null;
    const expiresAt = durationMonths
      ? new Date(Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const newMemb: UserMembership = {
      id: idx !== -1 ? memberships[idx].id : 'memb-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      tier_id: tierId,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: expiresAt,
      grace_until: null,
      notes: notes,
      created_at: idx !== -1 ? memberships[idx].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (idx !== -1) {
      memberships[idx] = newMemb;
    } else {
      memberships.push(newMemb);
    }
    setLocalData(MOCK_STORAGE_KEYS.MEMBERSHIPS, memberships);

    const newHist: MembershipHistory = {
      id: 'hist-' + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      from_tier_id: prevTierId,
      to_tier_id: tierId,
      changed_by: adminId,
      change_type: changeType,
      reason: notes,
      payment_ref: null,
      created_at: new Date().toISOString()
    };
    history.push(newHist);
    setLocalData(MOCK_STORAGE_KEYS.HISTORY, history);
  }
}

export async function suspendMember(userId: string, adminId: string, reason: string): Promise<void> {
  try {
    await runSupabase(async () => {
      const { data: current } = await supabase
        .from('user_memberships')
        .select('tier_id')
        .eq('user_id', userId)
        .single();

      const { error } = await supabase
        .from('user_memberships')
        .update({ status: 'suspended', notes: reason, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      await supabase.from('membership_history').insert({
        user_id: userId,
        from_tier_id: current?.tier_id || null,
        to_tier_id: current?.tier_id || null,
        changed_by: adminId,
        change_type: 'suspension',
        reason,
      });
    });
  } catch (e) {
    const memberships = getLocalData<UserMembership[]>(MOCK_STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MOCK_MEMBERSHIPS);
    const history = getLocalData<MembershipHistory[]>(MOCK_STORAGE_KEYS.HISTORY, []);

    const idx = memberships.findIndex(m => m.user_id === userId);
    if (idx !== -1) {
      memberships[idx].status = 'suspended';
      memberships[idx].notes = reason;
      memberships[idx].updated_at = new Date().toISOString();
      setLocalData(MOCK_STORAGE_KEYS.MEMBERSHIPS, memberships);

      history.push({
        id: 'hist-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        from_tier_id: memberships[idx].tier_id,
        to_tier_id: memberships[idx].tier_id,
        changed_by: adminId,
        change_type: 'suspension',
        reason,
        payment_ref: null,
        created_at: new Date().toISOString()
      });
      setLocalData(MOCK_STORAGE_KEYS.HISTORY, history);
    }
  }
}

export async function activateMember(userId: string, adminId: string): Promise<void> {
  try {
    await runSupabase(async () => {
      const { data: current } = await supabase
        .from('user_memberships')
        .select('tier_id')
        .eq('user_id', userId)
        .single();

      const { error } = await supabase
        .from('user_memberships')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      await supabase.from('membership_history').insert({
        user_id: userId,
        from_tier_id: current?.tier_id || null,
        to_tier_id: current?.tier_id || null,
        changed_by: adminId,
        change_type: 'activation',
        reason: 'Diaktifkan oleh admin',
      });
    });
  } catch (e) {
    const memberships = getLocalData<UserMembership[]>(MOCK_STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MOCK_MEMBERSHIPS);
    const history = getLocalData<MembershipHistory[]>(MOCK_STORAGE_KEYS.HISTORY, []);

    const idx = memberships.findIndex(m => m.user_id === userId);
    if (idx !== -1) {
      memberships[idx].status = 'active';
      memberships[idx].updated_at = new Date().toISOString();
      setLocalData(MOCK_STORAGE_KEYS.MEMBERSHIPS, memberships);

      history.push({
        id: 'hist-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        from_tier_id: memberships[idx].tier_id,
        to_tier_id: memberships[idx].tier_id,
        changed_by: adminId,
        change_type: 'activation',
        reason: 'Diaktifkan oleh admin',
        payment_ref: null,
        created_at: new Date().toISOString()
      });
      setLocalData(MOCK_STORAGE_KEYS.HISTORY, history);
    }
  }
}

export async function deleteMember(userId: string): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
    });
  } catch (e) {
    let profiles = getLocalData<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, DEFAULT_MOCK_PROFILES);
    let memberships = getLocalData<UserMembership[]>(MOCK_STORAGE_KEYS.MEMBERSHIPS, DEFAULT_MOCK_MEMBERSHIPS);

    profiles = profiles.filter(p => p.id !== userId);
    memberships = memberships.filter(m => m.user_id !== userId);

    setLocalData(MOCK_STORAGE_KEYS.PROFILES, profiles);
    setLocalData(MOCK_STORAGE_KEYS.MEMBERSHIPS, memberships);
  }
}

// ─────────────────────────────────────────────
// TIERS
// ─────────────────────────────────────────────

export async function getTiers(): Promise<MembershipTier[]> {
  try {
    const fetchTiers = async () => {
      const { data, error } = await supabase
        .from('membership_tiers')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      return data || [];
    };
    return await withTimeout(fetchTiers(), 2500);
  } catch (e) {
    return getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
  }
}

export async function createTier(tier: Omit<MembershipTier, 'id' | 'created_at'>): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase.from('membership_tiers').insert(tier);
      if (error) throw error;
    });
  } catch (e) {
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    const newId = tiers.reduce((max, t) => t.id > max ? t.id : max, 0) + 1;
    const newTier: MembershipTier = {
      ...tier,
      id: newId,
      created_at: new Date().toISOString()
    };
    tiers.push(newTier);
    setLocalData(MOCK_STORAGE_KEYS.TIERS, tiers);
  }
}

export async function updateTier(id: number, tier: Partial<MembershipTier>): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase
        .from('membership_tiers')
        .update(tier)
        .eq('id', id);
      if (error) throw error;
    });
  } catch (e) {
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    const idx = tiers.findIndex(t => t.id === id);
    if (idx !== -1) {
      tiers[idx] = { ...tiers[idx], ...tier };
      setLocalData(MOCK_STORAGE_KEYS.TIERS, tiers);
    }
  }
}

export async function deleteTier(id: number): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase.from('membership_tiers').delete().eq('id', id);
      if (error) throw error;
    });
  } catch (e) {
    let tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    tiers = tiers.filter(t => t.id !== id);
    setLocalData(MOCK_STORAGE_KEYS.TIERS, tiers);
  }
}

export async function toggleTierStatus(id: number, isActive: boolean): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase
        .from('membership_tiers')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    });
  } catch (e) {
    await updateTier(id, { is_active: isActive });
  }
}

// ─────────────────────────────────────────────
// FEATURES (CRUD)
// ─────────────────────────────────────────────

export async function getFeatures(): Promise<Feature[]> {
  try {
    const fetchFeatures = async () => {
      const { data, error } = await supabase
        .from('features')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    };
    return await withTimeout(fetchFeatures(), 2500);
  } catch (e) {
    return getLocalData<Feature[]>(MOCK_STORAGE_KEYS.FEATURES, DEFAULT_MOCK_FEATURES);
  }
}

export async function createFeature(feature: Omit<Feature, 'id' | 'created_at'>): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase.from('features').insert(feature);
      if (error) throw error;
    });
  } catch (e) {
    const features = getLocalData<Feature[]>(MOCK_STORAGE_KEYS.FEATURES, DEFAULT_MOCK_FEATURES);
    const newId = features.reduce((max, f) => f.id > max ? f.id : max, 0) + 1;
    const newFeature: Feature = {
      ...feature,
      id: newId,
      created_at: new Date().toISOString()
    };
    features.push(newFeature);
    setLocalData(MOCK_STORAGE_KEYS.FEATURES, features);
  }
}

export async function updateFeature(id: number, feature: Partial<Feature>): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase
        .from('features')
        .update(feature)
        .eq('id', id);
      if (error) throw error;
    });
  } catch (e) {
    const features = getLocalData<Feature[]>(MOCK_STORAGE_KEYS.FEATURES, DEFAULT_MOCK_FEATURES);
    const idx = features.findIndex(f => f.id === id);
    if (idx !== -1) {
      features[idx] = { ...features[idx], ...feature };
      setLocalData(MOCK_STORAGE_KEYS.FEATURES, features);
    }
  }
}

export async function deleteFeature(id: number): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase.from('features').delete().eq('id', id);
      if (error) throw error;
    });
  } catch (e) {
    let features = getLocalData<Feature[]>(MOCK_STORAGE_KEYS.FEATURES, DEFAULT_MOCK_FEATURES);
    features = features.filter(f => f.id !== id);
    setLocalData(MOCK_STORAGE_KEYS.FEATURES, features);
  }
}

export async function toggleFeatureStatus(id: number, isActive: boolean): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error } = await supabase
        .from('features')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
    });
  } catch (e) {
    await updateFeature(id, { is_active: isActive });
  }
}

// ─────────────────────────────────────────────
// ACTIVITY LOG
// ─────────────────────────────────────────────

export async function getActivityLog(limit = 20): Promise<MembershipHistory[]> {
  try {
    const { data, error } = await supabase
      .from('membership_history')
      .select(`
        *,
        from_tier:membership_tiers!membership_history_from_tier_id_fkey(name),
        to_tier:membership_tiers!membership_history_to_tier_id_fkey(name),
        user:profiles!membership_history_user_id_fkey(full_name),
        changed_by_profile:profiles!membership_history_changed_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (e) {
    const history = getLocalData<MembershipHistory[]>(MOCK_STORAGE_KEYS.HISTORY, []);
    const tiers = getLocalData<MembershipTier[]>(MOCK_STORAGE_KEYS.TIERS, DEFAULT_MOCK_TIERS);
    const profiles = getLocalData<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, DEFAULT_MOCK_PROFILES);

    return history
      .map(h => ({
        ...h,
        from_tier: tiers.find(t => t.id === h.from_tier_id),
        to_tier: tiers.find(t => t.id === h.to_tier_id),
        user: profiles.find(p => p.id === h.user_id),
        changed_by_profile: profiles.find(p => p.id === h.changed_by)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }
}

// ─────────────────────────────────────────────
// GROWTH CHART DATA
// ─────────────────────────────────────────────

export async function getGrowthData(): Promise<{ date: string; count: number }[]> {
  try {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    const results = await Promise.all(
      days.map(async (day) => {
        const startOfDay = new Date(day);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(day);
        endOfDay.setHours(23, 59, 59, 999);

        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());

        return {
          date: day.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          count: count || 0,
        };
      })
    );

    return results;
  } catch (e) {
    const profiles = getLocalData<Profile[]>(MOCK_STORAGE_KEYS.PROFILES, DEFAULT_MOCK_PROFILES);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });

    return days.map(day => {
      const start = new Date(day);
      start.setHours(0,0,0,0);
      const end = new Date(day);
      end.setHours(23,59,59,999);

      const count = profiles.filter(p => {
        const d = new Date(p.created_at);
        return d >= start && d <= end;
      }).length;

      return {
        date: day.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        count
      };
    });
  }
}

// ─────────────────────────────────────────────
// APP SETTINGS
// ─────────────────────────────────────────────

export async function getAppSettings(): Promise<AppSettings> {
  try {
    return await runSupabase(async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');
      if (error) throw error;
      
      const email = data?.find(s => s.key === 'support_email')?.value || 'support@qalbie.id';
      const whatsapp = data?.find(s => s.key === 'support_whatsapp')?.value || 'https://wa.me/6281234567890';
      return { support_email: email, support_whatsapp: whatsapp };
    });
  } catch (e) {
    return getLocalData<AppSettings>(MOCK_STORAGE_KEYS.SETTINGS, DEFAULT_MOCK_SETTINGS);
  }
}

export async function updateAppSettings(settings: AppSettings): Promise<void> {
  try {
    await runSupabase(async () => {
      const { error: errorEmail } = await supabase
        .from('app_settings')
        .upsert({ key: 'support_email', value: settings.support_email });
      if (errorEmail) throw errorEmail;

      const { error: errorWa } = await supabase
        .from('app_settings')
        .upsert({ key: 'support_whatsapp', value: settings.support_whatsapp });
      if (errorWa) throw errorWa;
    });
  } catch (e) {
    setLocalData(MOCK_STORAGE_KEYS.SETTINGS, settings);
  }
}

// ─────────────────────────────────────────────
// ADMIN CONTENTS (NEW)
// ─────────────────────────────────────────────

export interface AdminContent {
  id: number;
  title: string;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  updated_at: string;
}

export async function getAdminContents(): Promise<AdminContent[]> {
  try {
    return await runSupabase(async () => {
      const { data, error } = await supabase
        .from('admin_contents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  } catch (e) {
    // Fallback if needed
    return [];
  }
}

export async function createAdminContent(content: Omit<AdminContent, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await runSupabase(async () => {
    const { error } = await supabase.from('admin_contents').insert(content);
    if (error) {
      console.error('Error inserting admin_contents:', error);
      throw error;
    }
  }, 10000); // 10 detik timeout
}

export async function updateAdminContent(id: number, content: Partial<AdminContent>): Promise<void> {
  await runSupabase(async () => {
    const { error } = await supabase.from('admin_contents').update(content).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteAdminContent(id: number): Promise<void> {
  await runSupabase(async () => {
    const { error } = await supabase.from('admin_contents').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function uploadAdminContentMedia(file: File): Promise<string> {
  return await runSupabase(async () => {
    let finalFile = file;

    if (file.type.startsWith('image/')) {
      // Kompres gambar agar database tidak bengkak tapi tetap jernih
      finalFile = await compressImage(file);
    } else if (file.type.startsWith('video/')) {
      // Batasi ukuran video maksimal 50MB (kompresi video di sisi client terlalu berat tanpa ffmpeg)
      const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_VIDEO_SIZE) {
        throw new Error('Ukuran video terlalu besar. Maksimal 50MB.');
      }
    }

    const fileExt = finalFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('AdminContent')
      .upload(filePath, finalFile);

    if (uploadError) {
      console.error('Error uploading to AdminContent bucket:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('AdminContent')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }, 60000); // 60 detik timeout untuk upload media
}

// Helper untuk kompres gambar menggunakan Canvas API bawaan browser
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280; // Resolusi maksimal yang cukup jernih untuk mobile & web
        const MAX_HEIGHT = 1280;
        let width = img.width;
        let height = img.height;

        // Resize rasio jika melebihi batas
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file); // Fallback ke file asli jika gagal
        
        ctx.drawImage(img, 0, 0, width, height);

        // Convert ke format WebP dengan kualitas 85% (High Quality, Low Size)
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const newName = file.name.replace(/\.[^/.]+$/, ".webp");
            const compressedFile = new File([blob], newName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
}

// ─────────────────────────────────────────────
// ADMIN AUDIOS / MUSIC (NEW)
// ─────────────────────────────────────────────

export interface AdminAudio {
  id: number;
  title: string;
  description: string | null;
  audio_url: string;
  created_at: string;
  updated_at: string;
}

export async function getAdminAudios(): Promise<AdminAudio[]> {
  try {
    return await runSupabase(async () => {
      const { data, error } = await supabase
        .from('admin_audios')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    });
  } catch (e) {
    return [];
  }
}

export async function createAdminAudio(audio: Omit<AdminAudio, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
  await runSupabase(async () => {
    const { error } = await supabase.from('admin_audios').insert(audio);
    if (error) {
      console.error('Error inserting admin_audios:', error);
      throw error;
    }
  }, 10000);
}

export async function updateAdminAudio(id: number, audio: Partial<AdminAudio>): Promise<void> {
  await runSupabase(async () => {
    const { error } = await supabase.from('admin_audios').update(audio).eq('id', id);
    if (error) throw error;
  });
}

export async function deleteAdminAudio(id: number): Promise<void> {
  await runSupabase(async () => {
    const { error } = await supabase.from('admin_audios').delete().eq('id', id);
    if (error) throw error;
  });
}

export async function uploadAdminAudioMedia(file: File): Promise<string> {
  return await runSupabase(async () => {
    // Batasi ukuran audio maksimal 30MB
    const MAX_AUDIO_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_AUDIO_SIZE) {
      throw new Error('Ukuran file audio terlalu besar. Maksimal 30MB.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('AdminAudio')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading to AdminAudio bucket:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('AdminAudio')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }, 60000); // 60 detik timeout untuk upload audio
}
