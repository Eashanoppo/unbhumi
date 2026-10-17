const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface UserProfile {
  role: string;
  full_name_bn: string;
  organization: string;
  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  profile?: UserProfile;
}

export interface ExtractedField {
  id: number;
  document_id: number;
  page_number: number;
  field_key: string;
  field_label_bn: string;
  raw_value: string;
  normalized_value: string;
  confidence: number;
  bounding_box: { x?: number; y?: number; w?: number; h?: number };
  status: string;
  corrected_value: string;
  effective_value: string;
}

export interface DocumentItem {
  id: number;
  case: number;
  document_type: string;
  document_type_display: string;
  title: string;
  file?: string;
  file_hash: string;
  file_size_bytes: number;
  page_count: number;
  status: string;
  status_display: string;
  created_at: string;
  extracted_fields?: ExtractedField[];
}

export interface AnomalyFinding {
  id: number;
  case_id: number;
  case_number?: string;
  case_title?: string;
  rule_code_snapshot: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  severity_display: string;
  title_bn: string;
  title_en: string;
  description_bn: string;
  description_en: string;
  conflicting_records: any[];
  source_pages: number[];
  source_fields: string[];
  human_action_recommended_bn: string;
  status: string;
  status_display: string;
  created_at: string;
}

export interface CaseItem {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  status: string;
  status_display: string;
  risk_level: 'low' | 'review' | 'high' | 'critical';
  risk_level_display: string;
  risk_score: number;
  risk_summary_bn: string;
  risk_summary_en?: string;
  documents_count?: number;
  anomalies_count?: number;
  mouza?: string;
  dag_number?: string;
  recorded_area?: number;
  documents?: DocumentItem[];
  anomalies?: AnomalyFinding[];
  audit_events?: any[];
  created_at: string;
  updated_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  subtext?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  label: string;
  is_conflict?: boolean;
  conflict_reason?: string;
}

export interface GraphData {
  case_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  metrics: {
    node_count: number;
    edge_count: number;
    conflict_edges: number;
    has_conflicting_paths: boolean;
  };
}

export interface DashboardSummary {
  metrics: {
    total_cases: number;
    critical_high_count: number;
    needs_review_count: number;
    clean_count: number;
    total_docs: number;
  };
  status_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  recent_cases: CaseItem[];
  recent_activity: {
    id: number;
    action: string;
    case_number: string;
    user: string;
    timestamp: string;
  }[];
}

// Fallback synthetic data in case backend server is temporarily uncontactable
const FALLBACK_CASES: CaseItem[] = [
  {
    id: 1,
    case_number: 'UB-2026-1001',
    title: 'মৌজা কাউন্দিয়া আরএস দাগ ৪১২ জমি হস্তান্তর যাচাই',
    description: 'স্বাভাবিক ও বৈধ হস্তান্তর। সাফ-কবলা দলিল, আরএস খতিয়ান, নামজারি সম্পূর্ণ সঙ্গতিপূর্ণ।',
    status: 'verified_clean',
    status_display: 'যাচাই সম্পন্ন - অসঙ্গতিহীন',
    risk_level: 'low',
    risk_level_display: 'স্বাভাবিক (Low)',
    risk_score: 0,
    risk_summary_bn: 'কোনো দৃশ্যমান অসঙ্গতি পাওয়া যায়নি। প্রদত্ত নথিপত্র সামঞ্জস্যপূর্ণ।',
    documents_count: 2,
    anomalies_count: 0,
    mouza: 'কাউন্দিয়া',
    dag_number: '৪১২',
    recorded_area: 25.0,
    created_at: '2026-04-10T10:00:00Z',
    updated_at: '2026-04-10T10:05:00Z'
  },
  {
    id: 2,
    case_number: 'UB-2026-1002',
    title: 'মৌজা ধামরাই দাগ ৮৮ - দ্বৈত বিক্রির সন্দেহজনক কেস',
    description: 'একই বিক্রেতা কর্তৃক একই দাগের জমি দুই ভিন্ন ব্যক্তির নিকট হস্তান্তরের গুরুতর অসঙ্গতি শনাক্ত।',
    status: 'flagged_review',
    status_display: 'পর্যালোচনা প্রয়োজন',
    risk_level: 'critical',
    risk_level_display: 'গুরুতর সংকেত (Critical)',
    risk_score: 85,
    risk_summary_bn: 'সম্ভাব্য দ্বৈত বিক্রির আলামত পাওয়া গেছে। একই দাগ পূর্বে অন্য ক্রেতার নিকট বিক্রিত।',
    documents_count: 2,
    anomalies_count: 2,
    mouza: 'ধামরাই',
    dag_number: '৮৮',
    recorded_area: 40.0,
    created_at: '2026-04-12T14:30:00Z',
    updated_at: '2026-04-12T14:45:00Z'
  },
  {
    id: 3,
    case_number: 'UB-2026-1003',
    title: 'মৌজা তেঁতুলঝোড়া দাগ ২৯১ - বায়া দলিলের ধারাবাহিকতা বিচ্ছিন্ন',
    description: 'খতিয়ানভুক্ত মালিকের সাথে বর্তমান বিক্রেতার মালিকানা প্রাপ্তির কোনো বৈধ বায়া দলিল বা রেকর্ডীয় সংযোগ অনুপস্থিত।',
    status: 'flagged_review',
    status_display: 'পর্যালোচনা প্রয়োজন',
    risk_level: 'high',
    risk_level_display: 'উচ্চ ঝুঁকি (High)',
    risk_score: 55,
    risk_summary_bn: 'মালিকানা ধারাবাহিকতা বিচ্ছিন্ন: পূর্ববর্তী বায়া দলিল অনুপস্থিত।',
    documents_count: 2,
    anomalies_count: 2,
    mouza: 'তেঁতুলঝোড়া',
    dag_number: '২৯১',
    recorded_area: 18.5,
    created_at: '2026-04-14T09:15:00Z',
    updated_at: '2026-04-14T09:20:00Z'
  },
  {
    id: 4,
    case_number: 'UB-2026-1004',
    title: 'মৌজা সাভার দাগ ৫১০ - দলিল বনাম খতিয়ান স্বত্ব অসঙ্গতি',
    description: 'প্রস্তাবিত দলিলে উল্লেখিত দাগে খতিয়ানভুক্ত মালিকের নামের সাথে বিক্রেতার সম্পূর্ণ অমিল।',
    status: 'flagged_review',
    status_display: 'পর্যালোচনা প্রয়োজন',
    risk_level: 'high',
    risk_level_display: 'উচ্চ ঝুঁকি (High)',
    risk_score: 55,
    risk_summary_bn: 'দলিলের বিক্রেতার সাথে খতিয়ানের মূল মালিকের নাম মিলছে না।',
    documents_count: 2,
    anomalies_count: 2,
    mouza: 'সাভার',
    dag_number: '৫১০',
    recorded_area: 30.0,
    created_at: '2026-04-15T11:00:00Z',
    updated_at: '2026-04-15T11:10:00Z'
  }
];

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('unbhumi_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error ${res.status}: ${errText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch to ${url} failed, checking fallback handlers...`, err);
    throw err;
  }
}

export const api = {
  // Auth
  async demoLogin(role: string = 'demo_reviewer') {
    try {
      const data = await fetchApi<{ token: string; user: User }>('/auth/demo-login/', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('unbhumi_token', data.token);
        localStorage.setItem('unbhumi_user', JSON.stringify(data.user));
      }
      return data;
    } catch {
      // Local demo fallback
      const mockUser: User = {
        id: 1,
        username: role,
        email: `${role}@unleft.org`,
        profile: {
          role,
          full_name_bn: role === 'demo_reviewer' ? 'আব্দুল করিম (পর্যালোচক)' : 'রাশেদ চৌধুরী (তত্ত্বাবধায়ক)',
          organization: 'সাব-রেজিস্ট্রি কার্যালয় (ডেমো)'
        }
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('unbhumi_token', 'demo-local-token');
        localStorage.setItem('unbhumi_user', JSON.stringify(mockUser));
      }
      return { token: 'demo-local-token', user: mockUser };
    }
  },

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('unbhumi_user');
      if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
      }
    }
    return null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('unbhumi_token');
      localStorage.removeItem('unbhumi_user');
    }
  },

  // Dashboard Summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    try {
      return await fetchApi<DashboardSummary>('/dashboard/summary/');
    } catch {
      return {
        metrics: {
          total_cases: 8,
          critical_high_count: 4,
          needs_review_count: 5,
          clean_count: 1,
          total_docs: 16
        },
        status_distribution: {
          flagged_review: 5,
          verified_clean: 1,
          resolved: 1,
          pending: 1
        },
        risk_distribution: {
          critical: 1,
          high: 3,
          review: 2,
          low: 2
        },
        recent_cases: FALLBACK_CASES,
        recent_activity: [
          { id: 1, action: 'অসঙ্গতি পরীক্ষা', case_number: 'UB-2026-1002', user: 'reviewer', timestamp: new Date().toISOString() },
          { id: 2, action: 'নথি আপলোড', case_number: 'UB-2026-1001', user: 'reviewer', timestamp: new Date().toISOString() }
        ]
      };
    }
  },

  // Cases
  async getCases(params: { risk?: string; status?: string; search?: string } = {}): Promise<CaseItem[]> {
    const query = new URLSearchParams();
    if (params.risk) query.append('risk', params.risk);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    try {
      return await fetchApi<CaseItem[]>(`/cases/?${query.toString()}`);
    } catch {
      let filtered = [...FALLBACK_CASES];
      if (params.risk) filtered = filtered.filter(c => c.risk_level === params.risk);
      if (params.search) filtered = filtered.filter(c => c.case_number.includes(params.search!) || c.title.includes(params.search!));
      return filtered;
    }
  },

  async getCaseDetail(caseId: string): Promise<CaseItem> {
    try {
      return await fetchApi<CaseItem>(`/cases/${caseId}/`);
    } catch {
      const found = FALLBACK_CASES.find(c => c.case_number === caseId || String(c.id) === caseId);
      if (found) return found;
      return FALLBACK_CASES[0];
    }
  },

  async createCase(data: { title: string; description: string; mouza: string; dag_number: string; survey_type: string; area: number }): Promise<CaseItem> {
    return await fetchApi<CaseItem>('/cases/', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async runChecks(caseId: string) {
    return await fetchApi<{ success: boolean; message: string; case: CaseItem; anomalies: AnomalyFinding[] }>(`/cases/${caseId}/run-checks/`, {
      method: 'POST'
    });
  },

  async getCaseGraph(caseId: string): Promise<GraphData> {
    try {
      return await fetchApi<GraphData>(`/cases/${caseId}/graph/`);
    } catch {
      return {
        case_id: caseId,
        nodes: [
          { id: 'parcel_1', label: 'দাগ ৮৮ (ধামরাই)', type: 'parcel', subtext: 'RS জরিপ | ৪০ শতাংশ' },
          { id: 'deed_1', label: 'দলিল নং ৮৯১০ (২০২৬)', type: 'deed', subtext: 'বিক্রেতা: কামাল -> জসিম' },
          { id: 'deed_2', label: 'দলিল নং ৩২০১ (২০২৪)', type: 'deed', subtext: 'বিক্রেতা: কামাল -> রফিকুল' },
          { id: 'person_1', label: 'কামাল হোসেন', type: 'person', subtext: 'বিক্রেতা' },
          { id: 'person_2', label: 'মো: জসিম উদ্দিন', type: 'person', subtext: 'বর্তমান ক্রেতা' },
          { id: 'person_3', label: 'মো: রফিকুল ইসলাম', type: 'person', subtext: 'পূর্ববর্তী ক্রেতা' },
        ],
        edges: [
          { id: 'e1', source: 'person_1', target: 'deed_1', relation: 'SELLER_OF', label: 'বিক্রি করেছেন' },
          { id: 'e2', source: 'deed_1', target: 'person_2', relation: 'BUYER_OF', label: '⚠️ দ্বৈত বিক্রির শিকার', is_conflict: true },
          { id: 'e3', source: 'person_1', target: 'deed_2', relation: 'SELLER_OF', label: 'পূর্বে বিক্রি করেছিলেন' },
          { id: 'e4', source: 'deed_2', target: 'person_3', relation: 'BUYER_OF', label: 'মালিকানা প্রাপ্ত' },
          { id: 'e5', source: 'deed_1', target: 'parcel_1', relation: 'REFERS_TO_PARCEL', label: 'দাগ ৮৮ হস্তান্তর', is_conflict: true },
          { id: 'e6', source: 'deed_2', target: 'parcel_1', relation: 'REFERS_TO_PARCEL', label: 'দাগ ৮৮ মূল হস্তান্তর' },
        ],
        metrics: {
          node_count: 6,
          edge_count: 6,
          conflict_edges: 2,
          has_conflicting_paths: true
        }
      };
    }
  },

  async getCaseReport(caseId: string) {
    return await fetchApi<any>(`/cases/${caseId}/report/`);
  },

  // Documents
  async getDocuments(params: { type?: string; status?: string; search?: string } = {}): Promise<DocumentItem[]> {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    try {
      return await fetchApi<DocumentItem[]>(`/documents/?${query.toString()}`);
    } catch {
      return [];
    }
  },

  async getDocumentDetail(docId: number): Promise<DocumentItem> {
    return await fetchApi<DocumentItem>(`/documents/${docId}/`);
  },

  async correctField(docId: number, fieldKey: string, correctedValue: string) {
    return await fetchApi<ExtractedField>(`/documents/${docId}/fields/`, {
      method: 'PATCH',
      body: JSON.stringify({ field_key: fieldKey, corrected_value: correctedValue })
    });
  },

  // Alerts & Review Queue
  async getAlertsQueue(params: { severity?: string; status?: string } = {}): Promise<AnomalyFinding[]> {
    const query = new URLSearchParams();
    if (params.severity) query.append('severity', params.severity);
    if (params.status) query.append('status', params.status);

    try {
      return await fetchApi<AnomalyFinding[]>(`/alerts/?${query.toString()}`);
    } catch {
      return [];
    }
  },

  async submitDisposition(alertId: number, decision: string, reason_bn: string) {
    return await fetchApi<{ success: boolean; message: string }>(`/alerts/${alertId}/disposition/`, {
      method: 'POST',
      body: JSON.stringify({ decision, reason_bn })
    });
  },

  async reseedData() {
    return await fetchApi<{ success: boolean; count: number }>('/seed-demo/', {
      method: 'POST'
    });
  },

  async getHealth() {
    return await fetchApi<{ status: string; database: string }>('/health/');
  }
};

