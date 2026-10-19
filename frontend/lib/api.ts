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

export interface DocumentPageItem {
  id: number;
  page_number: number;
  image?: string;
  ocr_text: string;
  ocr_confidence: number;
}

export interface DocumentItem {
  id: number;
  case: number;
  document_type: string;
  document_type_display: string;
  title: string;
  file?: string;
  file_url?: string;
  file_hash: string;
  file_size_bytes: number;
  page_count: number;
  status: string;
  status_display: string;
  created_at: string;
  extracted_fields?: ExtractedField[];
  pages?: DocumentPageItem[];
  raw_ocr_text?: string;
}

export interface ScanPreviewResult {
  success: boolean;
  raw_ocr_text: string;
  confidence: number;
  words_count: number;
  engine: string;
  engine_version: string;
  language: string;
  bounding_boxes: Array<{ word: string; confidence: number; x: number; y: number; w: number; h: number }>;
  extracted_fields: Array<{
    field_key: string;
    field_label_bn: string;
    raw_value: string;
    normalized_value: string;
    confidence: number;
  }>;
  suggested?: {
    mouza?: string;
    dag_number?: string;
    area?: string | number;
    survey_type?: string;
  };
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
  conflicting_records: Record<string, unknown>[];
  source_pages: number[];
  source_fields: string[];
  human_action_recommended_bn: string;
  human_action_recommended_en?: string;
  status: string;
  status_display: string;
  created_at: string;
}

export interface ParcelInfo {
  id?: number;
  mouza?: string;
  dag_number?: string;
  survey_type?: string;
  recorded_area_decimals?: number;
  [key: string]: any;
}

export interface AuditEventItem {
  id: number;
  action_display: string;
  details: any;
  user_email?: string;
  created_at: string;
  [key: string]: any;
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
  parcel?: ParcelInfo;
  recorded_area?: number;
  documents?: DocumentItem[];
  anomalies?: AnomalyFinding[];
  audit_events?: AuditEventItem[];
  created_at: string;
  updated_at: string;
}

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  subtext?: string;
  canonical_id?: string;
  properties?: Record<string, any>;
  doc_ids?: (string | number)[];
  page_refs?: number[];
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  label: string;
  is_conflict?: boolean;
  conflict_reason?: string;
  doc_ids?: (string | number)[];
  page_refs?: number[];
  detection_rule?: string;
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

export interface GraphRAGResult {
  query: string;
  case_id: string;
  retrieved_nodes: GraphNode[];
  retrieved_edges: GraphEdge[];
  grounded_evidence: {
    doc_id: number;
    doc_title: string;
    doc_type: string;
    page: number;
    field_key: string;
    field_label_bn: string;
    field_value: string;
    confidence: number;
    hash_snippet: string;
  }[];
  graph_synthesis_bn: string;
  graph_synthesis_en: string;
  conflicts_count: number;
  metrics: {
    total_nodes_in_case: number;
    retrieved_node_count: number;
    retrieved_edge_count: number;
    cited_documents_count: number;
  };
  provenance: string;
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
export const FALLBACK_CASES: CaseItem[] = [
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
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string>),
  };
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errText = await res.text();
      // Auto-heal expired/invalid demo authentication tokens:
      if ((res.status === 401 || res.status === 403) && typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('unbhumi_token');
        if (storedToken) {
          console.warn('Authentication token invalid or expired. Purging stale token and retrying request...');
          localStorage.removeItem('unbhumi_token');
          localStorage.removeItem('unbhumi_user');

          // Retry once without the stale Authorization header
          const retryHeaders: Record<string, string> = {
            ...(options.headers as Record<string, string>),
          };
          if (!isFormData && !retryHeaders['Content-Type']) {
            retryHeaders['Content-Type'] = 'application/json';
          }
          delete retryHeaders['Authorization'];
          delete retryHeaders['authorization'];

          const retryRes = await fetch(url, { ...options, headers: retryHeaders });
          if (retryRes.ok) {
            return await retryRes.json();
          }
        }
      }
      throw new Error(`API Error ${res.status}: ${errText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch to ${url} failed:`, err);
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
  // Dashboard Summary
  async getDashboardSummary(): Promise<DashboardSummary> {
    return await fetchApi<DashboardSummary>('/dashboard/summary/');
  },

  // Cases
  async getCases(params: { risk?: string; status?: string; search?: string } = {}): Promise<CaseItem[]> {
    const query = new URLSearchParams();
    if (params.risk) query.append('risk', params.risk);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);
    return await fetchApi<CaseItem[]>(`/cases/?${query.toString()}`);
  },

  async getCaseDetail(caseId: string): Promise<CaseItem> {
    return await fetchApi<CaseItem>(`/cases/${caseId}/`);
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

  async updateCaseStatus(caseId: string, status: string): Promise<CaseItem> {
    return await fetchApi<CaseItem>(`/cases/${caseId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async getCaseGraph(caseId: string): Promise<GraphData> {
    return await fetchApi<GraphData>(`/cases/${caseId}/graph/`);
  },

  async queryGraphRAG(caseId: string, query: string): Promise<GraphRAGResult> {
    return await fetchApi<GraphRAGResult>(`/cases/${caseId}/graph-rag/`, {
      method: 'POST',
      body: JSON.stringify({ query })
    });
  },

  async getCaseReport(caseId: string) {
    return await fetchApi<Record<string, unknown>>(`/cases/${caseId}/report/`);
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

  async scanDocumentPreview(file: File, documentType: string): Promise<ScanPreviewResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    return await fetchApi<ScanPreviewResult>('/documents/scan-preview/', {
      method: 'POST',
      body: formData
    });
  },

  async uploadCaseDocument(caseId: string, data: { title: string; document_type: string; file?: File; file_hash?: string; file_size_bytes?: number }): Promise<DocumentItem> {
    if (data.file) {
      const formData = new FormData();
      formData.append('document_type', data.document_type);
      formData.append('title', data.title);
      formData.append('file', data.file);
      if (data.file_hash) formData.append('file_hash', data.file_hash);
      if (data.file_size_bytes) formData.append('file_size_bytes', String(data.file_size_bytes));
      return await fetchApi<DocumentItem>(`/cases/${caseId}/documents/`, {
        method: 'POST',
        body: formData
      });
    } else {
      return await fetchApi<DocumentItem>(`/cases/${caseId}/documents/`, {
        method: 'POST',
        body: JSON.stringify({
          document_type: data.document_type,
          title: data.title,
          file_hash: data.file_hash || '',
          file_size_bytes: data.file_size_bytes || 0
        })
      });
    }
  },

  async deleteDocument(docId: number): Promise<{ success: boolean; message: string }> {
    return await fetchApi<{ success: boolean; message: string }>(`/documents/${docId}/`, {
      method: 'DELETE'
    });
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
    const res = await fetchApi<{ success: boolean; count: number; token?: string; user?: User }>('/seed-demo/', {
      method: 'POST'
    });
    if (typeof window !== 'undefined' && res.token) {
      localStorage.setItem('unbhumi_token', res.token);
      if (res.user) {
        localStorage.setItem('unbhumi_user', JSON.stringify(res.user));
      }
    }
    return res;
  },

  async getHealth() {
    return await fetchApi<{ status: string; database: string }>('/health/');
  }
};

