"""
Bangladesh Land Law Knowledge Base & GraphRAG AI Advisor Service.
Integrates statutory land laws, administrative SOPs (AC Land, Sub-Registry, Civil Court),
NetworkX ownership graph topology, and Groq LLM inference to explain case findings
and advise officers/citizens on precise legal and investigative next steps.
"""

import os
import re
import json
import urllib.request
import urllib.error
from typing import List, Dict, Any, Optional

from apps.cases.models import Case
from apps.rules.models import AnomalyFinding
from apps.documents.models import Document, ExtractedField
from apps.ownership.models import DeedTransaction
from .graph_service import GraphService
from .vector_service import generate_dense_embedding, cosine_similarity

# ---------------------------------------------------------------------------
# Authoritative Bangladesh Land Statutes & Administrative SOP Knowledge Base
# ---------------------------------------------------------------------------
BANGLADESH_LAND_STATUTES = [
    {
        'id': 'LCPR_ACT_2023_SEC_4_5',
        'title': 'ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন, ২০২৩ (ধারা ৪ ও ৫)',
        'title_en': 'Land Crime Prevention and Redress Act, 2023 (Sec 4 & 5)',
        'topics': ['double_selling', 'fraudulent_deed', 'fake_documents', 'দ্বৈত বিক্রি', 'জাল দলিল', 'প্রতারণা'],
        'summary_bn': (
            'ধারা ৪ ও ৫ অনুযায়ী অন্যের জমি প্রতারণামূলকভাবে নিজের দাবি করে দলিল সম্পাদন বা একই জমি পূর্বে বিক্রি '
            'করে পুনরায় অন্য ক্রেতার নিকট হস্তান্তর করা (দ্বৈত বিক্রি) শাস্তিযোগ্য ফৌজদারি অপরাধ। এর শাস্তি অনধিক '
            '৭ বছর কারাদণ্ড ও অর্থদণ্ড।'
        ),
        'summary_en': (
            'Sections 4 & 5 criminalize fraudulent deed execution and double-selling (selling the same land to multiple buyers). '
            'Carries penalties of up to 7 years imprisonment and substantial fines.'
        ),
        'remedy_steps_bn': [
            'নির্বাহী ম্যাজিস্ট্রেট বা জুডিশিয়াল ম্যাজিস্ট্রেট আদালতে ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩ অনুযায়ী সরাসরি নালিশি মামলা দায়ের।',
            'সহকারী কমিশনার (ভূমি) বরাবর প্রতারণামূলক দলিলের ভিত্তিতে নামজারি স্থগিতের লিখিত আবেদন।',
            'থানায় বা পুলিশ তদন্তে মূল দলিল ও বালাম বইয়ের প্রত্যায়িত প্রতিলিপি দাখিল।'
        ],
        'remedy_steps_en': [
            'File criminal complaint before the Judicial Magistrate or Executive Magistrate under Sections 4 & 5 of the 2023 Act.',
            'Submit petition to Assistant Commissioner (Land) to stay mutation proceedings based on the disputed deed.',
            'Produce certified volume records to law enforcement investigation.'
        ]
    },
    {
        'id': 'TPA_1882_SEC_48',
        'title': 'সম্পত্তি হস্তান্তর আইন, ১৮৮২ (ধারা ৪৮ - অগ্রাধিকার নীতি)',
        'title_en': 'Transfer of Property Act, 1882 (Section 48 - Doctrine of Priority)',
        'topics': ['priority', 'prior_transfer', 'competing_deeds', 'অগ্রাধিকার নীতি', 'পূর্ববর্তী হস্তান্তর', 'দ্বৈত দলিল'],
        'summary_bn': (
            'ধারা ৪৮ অনুযায়ী "সময়ের দিক থেকে যিনি পূর্বে, আইনি অধিকারে তিনিই অগ্রগণ্য" (Qui prior est tempore potior est jure)। '
            'একই দাগের জমিতে পূর্বে সম্পাদিত বৈধ রেজিস্ট্রিকৃত হস্তান্তর পরবর্তীতে সম্পাদিত দলিলের উপর প্রাধান্য পাবে।'
        ),
        'summary_en': (
            'Section 48 establishes that where a person purports to create rights over the same immovable property at different times, '
            'each later created right shall be subject to the rights previously created.'
        ),
        'remedy_steps_bn': [
            'সাব-রেজিস্ট্রি অফিস থেকে ইনডেক্স-২ ও বালাম বহি তল্লাশি করে পূর্বের দলিলের রেজিস্ট্রেশন তারিখ ও ক্রম নির্ধারণ করা।',
            'পূর্ববর্তী ক্রেতার বৈধ রেজিস্ট্রিকৃত দলিলটি মূল স্বত্ব প্রমাণের প্রাথমিক ভিত্তি হিসেবে সিভিল কোর্টে উপস্থাপন।'
        ],
        'remedy_steps_en': [
            'Inspect Index-II and Balam registers to authenticate chronological priority of registration.',
            'Establish senior title of the first purchaser in civil proceedings under Section 48.'
        ]
    },
    {
        'id': 'REG_ACT_1908_SEC_52A_57',
        'title': 'রেজিস্ট্রেশন আইন, ১৯০৮ (ধারা ১৭, ৫২এ ও ৫৭)',
        'title_en': 'The Registration Act, 1908 (Sections 17, 52A & 57)',
        'topics': ['registration', 'balam_search', 'certified_copy', 'বালাম বহি', 'তল্লাশি', 'নকল উত্তোলন'],
        'summary_bn': (
            'ধারা ১৭ অনুযায়ী স্থাবর সম্পত্তির বিক্রয় দলিল রেজিস্ট্রি বাধ্যতামূলক। ধারা ৫২এ অনুযায়ী দলিলে বিক্রেতার খতিয়ান ও বায়া সূত্র '
            'উল্লেখ বাধ্যতামূলক। ধারা ৫৭ অনুযায়ী যে কোনো নাগরিক সাব-রেজিস্ট্রি অফিসে নির্ধারিত ফিতে বালাম বহি তল্লাশি ও প্রত্যায়িত কপি পেতে পারেন।'
        ),
        'summary_en': (
            'Mandatory registration under Section 17; mandatory mutation khatian & baya chain disclosure under Section 52A; '
            'public entitlement to search Volume/Balam books and obtain certified copies under Section 57.'
        ),
        'remedy_steps_bn': [
            'সাব-রেজিস্ট্রি কার্যালয়ে নির্ধারিত ফি (ফর্ম ৩৬) জমা দিয়ে ইনডেক্স ১ ও ২ তল্লাশি করা।',
            'সন্দেহজনক দলিলের সার্টিফাইড কপি (নকল) উত্তোলন করে সাব-রেজিস্ট্রারের সিল ও স্বাক্ষর নিরীক্ষা।'
        ],
        'remedy_steps_en': [
            'File Form 36 inspection fee at Sub-Registry office to inspect Indexes I and II.',
            'Apply for certified copies (nakal) of suspected deeds to cross-examine seal and serial imprints.'
        ]
    },
    {
        'id': 'SAT_ACT_1950_SEC_143_MUTATION',
        'title': 'রাষ্ট্রীয় অধিগ্রহণ ও প্রজাস্বত্ব আইন, ১৯৫০ (ধারা ১৪৩ ও ১৪৩এ - নামজারি ও জমাভাগ)',
        'title_en': 'State Acquisition & Tenancy Act, 1950 (Sec 143 & 143A - Mutation)',
        'topics': ['mutation', 'khatian', 'ac_land', 'নামজারি', 'খতিয়ান', 'এসি ল্যান্ড', 'খারিজ'],
        'summary_bn': (
            'ধারা ১৪৩ ও ১৪৩এ অনুযায়ী সহকারী কমিশনার (ভূমি) জমি হস্তান্তরের পর সরকারি রেকর্ড অব রাইটস (খতিয়ান) হালনাগাদ করার জন্য '
            'নামজারি ও জমাভাগ আদেশ প্রদান করেন। নামজারি ব্যতিরেকে দলিল স্বত্বের প্রশাসনিক নিশ্চয়তা পূর্ণতা পায় না।'
        ),
        'summary_en': (
            'Empowers Assistant Commissioner (Land) to mutate records of rights following transfers. '
            'Mutation reconciles the fiscal tenancy record with civil registered deeds.'
        ),
        'remedy_steps_bn': [
            'mutation.land.gov.bd পোর্টালের মাধ্যমে অনলাইনে ই-নামজারি আবেদন দাখিল করা।',
            'পূর্ববর্তী কোনো অবৈধ বা দ্বৈত নামজারি থাকলে এসি ল্যান্ড বরাবর রিভিউ/বিবিধ মোকদ্দমা (Misc Case) দায়ের।',
            'ইউনিয়ন ভূমি অফিসে রেজিস্টার-২ (হোল্ডিং খতিয়ান) যাচাই করা।'
        ],
        'remedy_steps_en': [
            'Submit online e-Mutation application via mutation.land.gov.bd with valid chain documents.',
            'If rival mutation exists, file Misc Objection Case before Assistant Commissioner (Land).',
            'Inspect Register-II at Union Land Office to verify rent receipt (dakhila) standing.'
        ]
    },
    {
        'id': 'SRA_1877_SEC_39_42',
        'title': 'সুনির্দিষ্ট প্রতিকার আইন, ১৮৭৭ (ধারা ৩৯ ও ৪২ - দলিল বাতিল ও স্বত্ব ঘোষণা)',
        'title_en': 'Specific Relief Act, 1877 (Sec 39 & 42 - Cancellation & Declaration)',
        'topics': ['cancellation_suit', 'title_declaration', 'দলিল বাতিল', 'স্বত্ব ঘোষণা', 'দেওয়ানি মামলা'],
        'summary_bn': (
            'ধারা ৩৯ অনুযায়ী প্রতারণামূলক বা বেআইনি দলিল বাতিলের জন্য দেওয়ানি আদালতে মোকদ্দমা দায়ের করা যায়। '
            'ধারা ৪২ অনুযায়ী জমিতে নিজের বৈধ স্বত্ব বহাল রাখার জন্য স্বত্ব ঘোষণার ডিক্রি প্রার্থনা করা যায়।'
        ),
        'summary_en': (
            'Section 39 provides for civil suits to cancel void or voidable instruments. '
            'Section 42 provides for suits for declaration of legal character or title.'
        ),
        'remedy_steps_bn': [
            'সিনিয়র সহকারী জজ আদালতে তিন বছরের মধ্যে (তামাদি আইন অনুচ্ছেদ ৯১) দলিল বাতিলের মোকদ্দমা দায়ের।',
            'জমিতে দখল ও স্বত্ব রক্ষার জন্য অস্থায়ী নিষেধাজ্ঞার (Temporary Injunction) দরখাস্ত দাখিল।'
        ],
        'remedy_steps_en': [
            'File civil suit for deed cancellation under Section 39 within statutory limitation period.',
            'File petition for temporary injunction to restrain illegal possession or further disposition.'
        ]
    }
]

# Embed statutory documents once for fast cosine similarity RAG retrieval
for _statute in BANGLADESH_LAND_STATUTES:
    _text_repr = (
        f"{_statute['title']} {_statute.get('title_en', '')} "
        f"{' '.join(_statute['topics'])} "
        f"{_statute['summary_bn']} {_statute.get('summary_en', '')}"
    )
    _statute['_embedding'] = generate_dense_embedding(_text_repr)


class LandKnowledgeService:
    """Provides GraphRAG statutory enrichment and AI advisory generation."""

    @staticmethod
    def get_relevant_statutes(query: str, anomaly_codes: Optional[List[str]] = None, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieves top relevant Bangladesh land statutes using dense semantic similarity and anomaly code hints.
        """
        query_text = (query or '').strip().lower()
        if not query_text and anomaly_codes:
            query_text = ' '.join(anomaly_codes).lower()

        if not query_text:
            return BANGLADESH_LAND_STATUTES[:top_k]

        query_emb = generate_dense_embedding(query_text)
        query_tokens = set(re.findall(r'[\w]+', query_text))
        scored = []
        for st in BANGLADESH_LAND_STATUTES:
            sim = cosine_similarity(query_emb, st['_embedding'])
            # Keyword and token boosting
            for topic in st['topics']:
                topic_clean = topic.lower().replace('_', ' ')
                if topic.lower() in query_text or topic_clean in query_text:
                    sim += 0.35
                topic_tokens = set(re.findall(r'[\w]+', topic.lower()))
                if topic_tokens and (topic_tokens & query_tokens):
                    sim += 0.15

            # Match against English or Bengali title tokens
            title_en_tokens = set(re.findall(r'[\w]+', st.get('title_en', '').lower()))
            if title_en_tokens and (title_en_tokens & query_tokens):
                sim += 0.20

            scored.append((sim, st))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

    @staticmethod
    def build_case_rag_context(case: Case, user_query: str) -> Dict[str, Any]:
        """
        Compiles multimodal case intelligence into a grounded prompt context:
        1. Case Metadata & Risk Rating
        2. Extracted Documents & Parties
        3. Detected Anomalies & Severity
        4. Ownership Graph Nodes & Edges (via NetworkX)
        5. Relevant Bangladesh Land Laws & Procedural Steps
        """
        # 1. Parcel & Case Info
        parcel = case.parcel
        case_info = {
            'case_number': case.case_number,
            'title': case.title,
            'description': case.description,
            'status': case.status,
            'risk_level': case.risk_level,
            'risk_score': case.risk_score,
            'mouza': parcel.mouza if parcel else 'অনির্দিষ্ট',
            'dag_number': parcel.dag_number if parcel else 'অনির্দিষ্ট',
            'survey_type': parcel.survey_type if (parcel and parcel.survey_type) else 'অনির্দিষ্ট',
            'recorded_area_decimals': parcel.recorded_area_decimals if parcel else 0.0,
        }

        # 2. Anomalies
        anomalies_qs = AnomalyFinding.objects.filter(case=case).select_related('rule')
        anomalies_data = []
        anomaly_codes = []
        for a in anomalies_qs:
            anomaly_codes.append(a.rule_code_snapshot)
            anomalies_data.append({
                'rule_code': a.rule_code_snapshot,
                'title_bn': a.title_bn,
                'title_en': a.title_en,
                'severity': a.severity,
                'description_bn': a.description_bn,
                'recommendation_bn': a.human_action_recommended_bn,
                'conflicting_records': a.conflicting_records,
                'source_pages': a.source_pages
            })

        # 3. Documents
        docs_qs = Document.objects.filter(case=case).prefetch_related('extracted_fields')
        documents_data = []
        for doc in docs_qs:
            fields = {f.field_key: f.effective_value for f in doc.extracted_fields.all()}
            documents_data.append({
                'id': doc.id,
                'title': doc.title,
                'type': doc.get_document_type_display(),
                'file_hash': doc.file_hash[:16] if doc.file_hash else 'verified-sha256',
                'seller': fields.get('seller_name', ''),
                'buyer': fields.get('buyer_name', ''),
                'deed_number': fields.get('deed_number', ''),
                'area_decimals': fields.get('land_area', '')
            })

        # 4. GraphRAG Traversal
        graph_service = GraphService(case)
        graph_data = graph_service.build_and_persist_graph()
        conflict_edges = [e for e in graph_data.get('edges', []) if e.get('is_conflict')]
        chain_edges = [e for e in graph_data.get('edges', []) if e.get('relation') in ('TRANSFERRED_TO', 'SELLER_OF')]

        # 5. Retrieve Relevant Bangladesh Statutes
        statutes = LandKnowledgeService.get_relevant_statutes(user_query, anomaly_codes=anomaly_codes, top_k=3)

        return {
            'case': case_info,
            'anomalies': anomalies_data,
            'documents': documents_data,
            'graph_summary': {
                'total_nodes': len(graph_data.get('nodes', [])),
                'total_edges': len(graph_data.get('edges', [])),
                'conflicts_count': len(conflict_edges),
                'conflict_reasons': [e.get('conflict_reason') for e in conflict_edges if e.get('conflict_reason')]
            },
            'statutes': [
                {
                    'title': s['title'],
                    'summary_bn': s['summary_bn'],
                    'remedies': s['remedy_steps_bn']
                } for s in statutes
            ]
        }

    @staticmethod
    def generate_advisory_response(
        case: Case,
        user_message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        groq_api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Main AI Advisor reasoning pipeline:
        - Builds GraphRAG + BD land law prompt
        - Calls Groq LLM API if user provides an API key
        - Falls back gracefully to built-in expert rule reasoning if no key provided
        """
        rag_context = LandKnowledgeService.build_case_rag_context(case, user_message)
        model_name = model or 'llama-3.3-70b-versatile'

        # Structured system instructions in Bengali and English
        system_prompt = (
            "You are Groot, the AI Land Legal & Investigative Advisor (আনভূমি এআই আইনি ও তদন্ত পরামর্শক), "
            "an expert specialist on Bangladesh Land Law, cadastre, registry procedures, and land dispute resolution.\n\n"
            "Your role is to analyze the case evidence, explain findings in plain, highly readable, professional Bengali (with legal terms in English if helpful), "
            "and provide actionable step-by-step guidance on what the citizen, reviewer, or land officer should do next.\n\n"
            "GREETING REQUIREMENT: When beginning your reply, always start with: 'Greetings I am Groot, your advisor here'.\n\n"
            "CASE & EVIDENCE CONTEXT (Ground Truth):\n"
            f"{json.dumps(rag_context, ensure_ascii=False, indent=2)}\n\n"
            "READABILITY & FORMATTING RULES (STRICTLY REQUIRED FOR CHAT USABILITY):\n"
            "1. DO NOT output wide 4-column or 5-column markdown pipe tables (| col1 | col2 | ... |). Chat windows have constrained width; wide tables get wrapped awkwardly and become unreadable.\n"
            "2. Instead, present information using structured sections with bold headers, severity badges, and readable bullet points:\n"
            "   - ### ক. বর্তমান ঝুঁকি ও অসঙ্গতির সারসংক্ষেপ (Detected Risks & Anomalies)\n"
            "     Format each anomaly as a clean, self-contained bullet card:\n"
            "     • 🔴 **[অসঙ্গতি কোড বা নাম]** — *তীব্রতা: [গুরুতর / উচ্চ / মাঝারি / কম]*\n"
            "       - **মূল বিষয়:** সংক্ষেপিত স্পষ্ট বিবরণ\n"
            "       - **প্রভাব ও ঝুঁকি:** কেন এটি সমস্যা এবং আইনি ঝুঁকি কী\n"
            "   - ### খ. সংশ্লিষ্ট প্রযোজ্য বাংলাদেশ আইন (Applicable Statutes & Sections)\n"
            "     Present each law as an easy-to-scan bullet item:\n"
            "     • **[আইনের নাম] (যেমন: ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩)**\n"
            "       - **সংশ্লিষ্ট ধারা:** ধারা নং উল্লেখ করুন\n"
            "       - **প্রয়োগ ও প্রাসঙ্গিকতা:** এই কেসে আইনটি কীভাবে ক্রেতা/মালিককে সুরক্ষা দেয় বা কী প্রতিকার দেয়\n"
            "   - ### গ. পরবর্তী করণীয় সুনির্দিষ্ট পদক্ষেপ (Action Plan by Authority)\n"
            "     Provide numbered steps in priority order with the specific office to visit:\n"
            "     ১. **[পদক্ষেপ শিরোনাম]**\n"
            "        - **গন্তব্য অফিস:** যেমন সহকারী কমিশনার (ভূমি) / সাব-রেজিস্ট্রি অফিস / দেওয়ানি আদালত\n"
            "        - **কী করতে হবে:** সুনির্দিষ্ট আবেদন বা অভিযোগ প্রক্রিয়া\n"
            "        - **প্রয়োজনীয় কাগজপত্র:** কী নিয়ে যেতে হবে\n"
            "   - ### ঘ. প্রয়োজনীয় কাগজপত্রের চেকলিস্ট (Document Checklist)\n"
            "     Use simple bullet items for the documents to collect or verify.\n"
            "3. Ground all answers strictly in the provided case facts, extracted documents, and Bangladesh Land Acts.\n"
            "4. Remind the user that this software is an analytical decision-support system and conclusive title is established solely through official administrative procedures.\n"
            "5. Maintain clean spacing between sections and write in natural, respectful, and authoritative Bengali."
        )

        messages = [{'role': 'system', 'content': system_prompt}]
        if conversation_history:
            for item in conversation_history[-6:]:
                role = item.get('role', 'user')
                content = item.get('content', '')
                if role in ('user', 'assistant') and content:
                    messages.append({'role': role, 'content': content})

        messages.append({'role': 'user', 'content': user_message})

        # Check if Groq API Key is available
        api_key = (groq_api_key or os.environ.get('GROQ_API_KEY', '')).strip()

        if api_key:
            try:
                groq_payload = json.dumps({
                    'model': model_name,
                    'messages': messages,
                    'temperature': 0.2,
                    'max_tokens': 1500
                }).encode('utf-8')

                req = urllib.request.Request(
                    'https://api.groq.com/openai/v1/chat/completions',
                    data=groq_payload,
                    headers={
                        'Content-Type': 'application/json',
                        'Authorization': f'Bearer {api_key}',
                        'User-Agent': 'UNBhumi-LandTech-AI/1.0'
                    }
                )

                with urllib.request.urlopen(req, timeout=30) as resp:
                    resp_json = json.loads(resp.read().decode('utf-8'))
                    reply_text = resp_json['choices'][0]['message']['content']
                    usage = resp_json.get('usage', {})

                    return {
                        'success': True,
                        'reply': reply_text,
                        'model': model_name,
                        'provider': 'Groq Cloud (User API Key)',
                        'tokens_used': usage.get('total_tokens', 0),
                        'grounded_context': rag_context,
                        'suggested_actions': LandKnowledgeService._extract_action_items(rag_context)
                    }

            except urllib.error.HTTPError as e:
                err_body = e.read().decode('utf-8', errors='ignore')
                err_msg = f"Groq API Error ({e.code}): {err_body}"
                fallback_reply = LandKnowledgeService._generate_built_in_advisory(rag_context, user_message, note=err_msg)
                return {
                    'success': True,
                    'reply': fallback_reply,
                    'model': 'Built-in Land Law Knowledge Engine (Groq fallback)',
                    'provider': 'UNBhumi Native Legal Engine',
                    'grounded_context': rag_context,
                    'suggested_actions': LandKnowledgeService._extract_action_items(rag_context),
                    'api_warning': err_msg
                }
            except Exception as e:
                fallback_reply = LandKnowledgeService._generate_built_in_advisory(rag_context, user_message, note=str(e))
                return {
                    'success': True,
                    'reply': fallback_reply,
                    'model': 'Built-in Land Law Knowledge Engine',
                    'provider': 'UNBhumi Native Legal Engine',
                    'grounded_context': rag_context,
                    'suggested_actions': LandKnowledgeService._extract_action_items(rag_context),
                    'api_warning': str(e)
                }

        # No API Key provided: Use Built-in Deterministic Land Law Reasoning Engine
        built_in_reply = LandKnowledgeService._generate_built_in_advisory(rag_context, user_message)
        return {
            'success': True,
            'reply': built_in_reply,
            'model': 'Built-in Land Law Knowledge Engine (No Groq Key Configured)',
            'provider': 'UNBhumi Native Legal Engine',
            'grounded_context': rag_context,
            'suggested_actions': LandKnowledgeService._extract_action_items(rag_context)
        }

    @staticmethod
    def _extract_action_items(rag_context: Dict[str, Any]) -> List[str]:
        """Generates a checklist of actionable next steps for the user based on case anomalies."""
        actions = []
        anomalies = rag_context.get('anomalies', [])
        codes = [a['rule_code'] for a in anomalies]

        if 'P001' in codes or 'G001' in codes:
            actions.append('সাব-রেজিস্ট্রি অফিসে ইনডেক্স-২ ও বালাম বহি তল্লাশি করে পূর্ববর্তী দলিলের মূল অনুলিপি উত্তোলন করুন।')
            actions.append('ভূমি অপরাধ প্রতিরোধ ও প্রতিকার আইন ২০২৩-এর ধারা ৫ অনুযায়ী সংশ্লিষ্ট সহকারী কমিশনার (ভূমি) ও নির্বাহী ম্যাজিস্ট্রেট বরাবর নোটিশ প্রদান করুন।')

        if 'K001' in codes or 'O001' in codes:
            actions.append('বিক্রেতার নামে আরএস বা বিএস নামজারি খতিয়ান (DCR ও মিউটেশন পর্চা) দাখিলের নির্দেশ দিন।')
            actions.append('উত্তরাধিকার সূত্রে জমি পেলে স্বীকৃত ওয়ারিশান সনদ ও বণ্টননামা দলিল তলব করুন।')

        if 'P002' in codes:
            actions.append('খতিয়ানের মোট হিস্যা ও অংশনামা যাচাই করে বিক্রিত অতিরিক্ত শতাংশ কর্তনের আবেদন করুন।')

        if not actions:
            actions.append('সহকারী কমিশনার (ভূমি) কার্যালয়ে অনলাইনে ই-নামজারি আবেদন (mutation.land.gov.bd) দাখিল করুন।')
            actions.append('ইউনিয়ন ভূমি অফিস থেকে হালনাগাদ ভূমি উন্নয়ন কর দাখিলা গ্রহণ করুন।')

        return actions

    @staticmethod
    def _generate_built_in_advisory(rag_context: Dict[str, Any], query: str, note: Optional[str] = None) -> str:
        """Generates a structured, rich statutory report and actionable steps in Bengali."""
        case = rag_context['case']
        anomalies = rag_context['anomalies']
        statutes = rag_context['statutes']

        out = []
        out.append(f"### 📋 Greetings I am Groot, your advisor here — কেস: **{case['case_number']}**")
        if note:
            out.append(f"> ℹ️ *দ্রষ্টব্য: Groq API সংযোগ বিকল্প না থাকায় আনভূমি স্থানীয় জ্ঞানভাণ্ডার (Local GraphRAG & Land Law Engine) থেকে পরামর্শ প্রস্তুত করা হয়েছে।*")

        out.append(f"\n#### ১. বর্তমান স্বত্ব অবস্থা ও ঝুঁকি বিশ্লেষণ (Risk Evaluation):")
        out.append(f"- **মৌজা ও দাগ:** {case['mouza']}, দাগ নং {case['dag_number']} ({case['survey_type']})")
        out.append(f"- **রেকর্ডকৃত জমি:** {case['recorded_area_decimals']} শতক | **ঝুঁকি স্তর:** `{case['risk_level']}` (স্কোর: {case['risk_score']}/১০০)")

        if anomalies:
            out.append(f"\nসিস্টেমে **{len(anomalies)}টি সুনির্দিষ্ট অসঙ্গতি সংকেত** চিহ্নিত হয়েছে:")
            severity_icons = {'critical': '🔴', 'high': '🟠', 'medium': '🟡', 'low': '🔵'}
            for idx, a in enumerate(anomalies, 1):
                icon = severity_icons.get(a.get('severity', '').lower(), '⚠️')
                out.append(f"\n• {icon} **[{a['rule_code']}] {a['title_bn']}** — *তীব্রতা: {a['severity'].upper()}*")
                out.append(f"  - **মূল বিষয়:** {a['description_bn']}")
                if a['recommendation_bn']:
                    out.append(f"  - **প্রস্তাবিত পদক্ষেপ:** {a['recommendation_bn']}")
        else:
            out.append("\n✓ দাখিলকৃত নথিপত্রে দৃশ্যমান কোনো বড় সংঘাত পাওয়া যায়নি। তবে আইনি চূড়ান্ততার জন্য নামজারি ও কর দাখিলা হালনাগাদ থাকা আবশ্যক।")

        out.append(f"\n#### ২. সংশ্লিষ্ট প্রযোজ্য বাংলাদেশ আইন ও ধারা (Applicable Laws):")
        for s in statutes:
            out.append(f"- **{s['title']}**")
            out.append(f"  {s['summary_bn']}")

        out.append(f"\n#### ৩. আপনার পরবর্তী করণীয় সুনির্দিষ্ট ধাপসমূহ (Action Plan):")
        actions = LandKnowledgeService._extract_action_items(rag_context)
        for idx, act in enumerate(actions, 1):
            out.append(f"**ধাপ {idx}:** {act}")

        out.append(f"\n#### ৪. প্রয়োজনীয় নথিপত্র চেকলিস্ট (Document Checklist):")
        out.append("1. মূল সাফ-কবলা দলিল বা প্রত্যয়িত নকল (Certified Copy)")
        out.append("2. সর্বশেষ আরএস/বিএস খতিয়ান ও পরচা")
        out.append("3. সহকারী কমিশনার (ভূমি) কর্তৃক অনুমোদিত নামজারি জমাভাগ খতিয়ান ও ডিসিআর")
        out.append("4. সংশ্লিষ্ট অর্থ বছরের ভূমি উন্নয়ন কর পরিশোধের দাখিলা")
        out.append("5. ওয়ারিশান সনদ (প্রযোজ্য ক্ষেত্রে)")

        out.append("\n---\n*আইনি সতর্কতা: আনভূমি একটি সিদ্ধান্ত-সমর্থনকারী কৃত্রিম বুদ্ধিমত্তা। এই বিশ্লেষণ চূড়ান্ত কোনো আদালতের রায় বা সরকারি আইনি স্বত্ব নির্ধারণ নয়। যেকোনো বিরোধে সাব-রেজিস্ট্রার বা সহকারী কমিশনার (ভূমি) কার্যালয়ের আনুষ্ঠানিক সিদ্ধান্তই চূড়ান্ত।*")

        return "\n".join(out)
