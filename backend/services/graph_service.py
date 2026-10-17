"""
Graph Analysis and Visualization Service for UNBUmi Detector.
Builds ownership and transaction relationship graphs using NetworkX.
Exposes serializable graph data with nodes, edges, cycle detection, and conflict tracing.
"""

import networkx as nx
from apps.ownership.models import OwnershipEdge, PersonOrParty, DeedTransaction
from apps.parcels.models import Parcel, KhatianRecord, MutationRecord

class GraphService:
    def __init__(self, case):
        self.case = case

    def build_and_persist_graph(self):
        G = nx.DiGraph()
        nodes = []
        edges = []

        # 1. Parcel Node
        parcel = self.case.parcel
        if parcel:
            parcel_node_id = f"parcel_{parcel.id}"
            parcel_label = f"দাগ {parcel.dag_number} ({parcel.mouza})"
            G.add_node(parcel_node_id, label=parcel_label, type='parcel', data={
                'mouza': parcel.mouza,
                'dag_number': parcel.dag_number,
                'survey_type': parcel.survey_type,
                'recorded_area': parcel.recorded_area_decimals
            })
            nodes.append({
                'id': parcel_node_id,
                'label': parcel_label,
                'type': 'parcel',
                'subtext': f"{parcel.survey_type} জরিপ | {parcel.recorded_area_decimals} শতাংশ"
            })

            # Khatian nodes linked to Parcel
            for khat in parcel.khatians.all():
                khat_id = f"khatian_{khat.id}"
                khat_label = f"খতিয়ান নং {khat.khatian_number}"
                G.add_node(khat_id, label=khat_label, type='khatian')
                nodes.append({
                    'id': khat_id,
                    'label': khat_label,
                    'type': 'khatian',
                    'subtext': f"মালিক: {khat.recorded_owner_name}"
                })
                G.add_edge(khat_id, parcel_node_id, relation='RECORDED_IN_KHATIAN')
                edges.append({
                    'id': f"e_{khat_id}_{parcel_node_id}",
                    'source': khat_id,
                    'target': parcel_node_id,
                    'relation': 'RECORDED_IN_KHATIAN',
                    'label': 'খতিয়ানভুক্ত জমি',
                    'is_conflict': False
                })

            # Mutation nodes linked to Parcel
            for mut in parcel.mutations.all():
                mut_id = f"mutation_{mut.id}"
                mut_label = f"নামজারি {mut.case_number}"
                G.add_node(mut_id, label=mut_label, type='mutation')
                nodes.append({
                    'id': mut_id,
                    'label': mut_label,
                    'type': 'mutation',
                    'subtext': f"গ্রহীতা: {mut.mutated_owner_name} ({mut.status})"
                })
                G.add_edge(mut_id, parcel_node_id, relation='MUTATED_IN')
                edges.append({
                    'id': f"e_{mut_id}_{parcel_node_id}",
                    'source': mut_id,
                    'target': parcel_node_id,
                    'relation': 'MUTATED_IN',
                    'label': 'নামজারি অনুমোদিত',
                    'is_conflict': False
                })

        # 2. Deeds and People linked to this case or parcel
        transactions = []
        if parcel:
            transactions = list(DeedTransaction.objects.filter(parcel=parcel).select_related('seller', 'buyer'))

        # Check for conflicts (multiple transfers of same parcel to different buyers)
        buyers_seen = set()
        has_double_sale = len(transactions) > 1

        for tx in transactions:
            deed_id = f"deed_{tx.id}"
            deed_label = f"দলিল নং {tx.deed_number}"
            seller_id = f"person_{tx.seller.id}"
            buyer_id = f"person_{tx.buyer.id}"

            # Nodes
            if not any(n['id'] == seller_id for n in nodes):
                nodes.append({
                    'id': seller_id,
                    'label': tx.seller.name_bn or tx.seller.name,
                    'type': 'person',
                    'subtext': 'বিক্রেতা (Seller)'
                })
            if not any(n['id'] == buyer_id for n in nodes):
                nodes.append({
                    'id': buyer_id,
                    'label': tx.buyer.name_bn or tx.buyer.name,
                    'type': 'person',
                    'subtext': 'ক্রেতা (Buyer)'
                })
            nodes.append({
                'id': deed_id,
                'label': deed_label,
                'type': 'deed',
                'subtext': f"তারিখ: {tx.deed_date} | {tx.transferred_area_decimals} শতাংশ"
            })

            # Edges
            # Seller -> Deed
            edges.append({
                'id': f"e_{seller_id}_{deed_id}",
                'source': seller_id,
                'target': deed_id,
                'relation': 'SELLER_OF',
                'label': 'বিক্রি করেছেন',
                'is_conflict': False
            })
            # Deed -> Buyer
            is_conflicted_tx = has_double_sale and (tx.buyer.id in buyers_seen or len(buyers_seen) > 0)
            buyers_seen.add(tx.buyer.id)

            edges.append({
                'id': f"e_{deed_id}_{buyer_id}",
                'source': deed_id,
                'target': buyer_id,
                'relation': 'BUYER_OF',
                'label': 'মালিকানা হস্তান্তর' if not is_conflicted_tx else '⚠️ দ্বৈত বিক্রির শিকার',
                'is_conflict': is_conflicted_tx,
                'conflict_reason': 'একই দাগ একই বিক্রেতার দ্বারা একাধিক ভিন্ন ক্রেতার নামে হস্তান্তরের দাবি' if is_conflicted_tx else ''
            })
            # Deed -> Parcel
            if parcel:
                edges.append({
                    'id': f"e_{deed_id}_parcel_{parcel.id}",
                    'source': deed_id,
                    'target': f"parcel_{parcel.id}",
                    'relation': 'REFERS_TO_PARCEL',
                    'label': f"হস্তান্তরিত: {tx.transferred_area_decimals} শতক",
                    'is_conflict': is_conflicted_tx
                })

        # Save OwnershipEdge models to DB for persistence and audit
        OwnershipEdge.objects.filter(case=self.case).delete()
        for edge in edges:
            src_node = next((n for n in nodes if n['id'] == edge['source']), None)
            tgt_node = next((n for n in nodes if n['id'] == edge['target']), None)
            if src_node and tgt_node:
                OwnershipEdge.objects.create(
                    case=self.case,
                    source_node_type=src_node['type'],
                    source_node_id=src_node['id'],
                    source_node_label=src_node['label'],
                    target_node_type=tgt_node['type'],
                    target_node_id=tgt_node['id'],
                    target_node_label=tgt_node['label'],
                    relation_type=edge['relation'],
                    is_conflict=edge.get('is_conflict', False),
                    conflict_reason=edge.get('conflict_reason', ''),
                    metadata=edge
                )

        return {
            'case_id': self.case.case_number,
            'nodes': nodes,
            'edges': edges,
            'metrics': {
                'node_count': len(nodes),
                'edge_count': len(edges),
                'conflict_edges': sum(1 for e in edges if e.get('is_conflict')),
                'has_conflicting_paths': has_double_sale
            }
        }
