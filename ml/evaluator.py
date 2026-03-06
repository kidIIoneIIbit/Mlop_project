"""
Evaluator — Recommendation Metrics
===================================
Person C — ML / Data  |  Day 7 Deliverable

Standalone evaluation functions for recommendation models.
Used by trainer.py and model.py for computing metrics.
"""

from __future__ import annotations

from typing import Any

import numpy as np


# ════════════════════════════════════════════════════════════════════════════
#  CORE METRICS
# ════════════════════════════════════════════════════════════════════════════


def precision_at_k(recommended: list, relevant: set, k: int = 5) -> float:
    """
    Precision @ k — fraction of top-k recommendations that are relevant.

    Args:
        recommended: Ordered list of recommended item IDs (best first).
        relevant:    Set of ground-truth relevant item IDs.
        k:           Cutoff position.

    Returns:
        Precision value in [0, 1].
    """
    if k <= 0:
        return 0.0
    hits = sum(1 for item in recommended[:k] if item in relevant)
    return hits / k


def recall_at_k(recommended: list, relevant: set, k: int = 5) -> float:
    """
    Recall @ k — fraction of relevant items that appear in top-k.

    Args:
        recommended: Ordered list of recommended item IDs (best first).
        relevant:    Set of ground-truth relevant item IDs.
        k:           Cutoff position.

    Returns:
        Recall value in [0, 1].
    """
    if not relevant:
        return 0.0
    hits = sum(1 for item in recommended[:k] if item in relevant)
    return hits / len(relevant)


def ndcg_at_k(recommended: list, relevant: set, k: int = 5) -> float:
    """
    Normalized Discounted Cumulative Gain @ k.

    Uses binary relevance: 1 if item is relevant, 0 otherwise.

    Args:
        recommended: Ordered list of recommended item IDs (best first).
        relevant:    Set of ground-truth relevant item IDs.
        k:           Cutoff position.

    Returns:
        NDCG value in [0, 1].
    """
    dcg = 0.0
    for i, item in enumerate(recommended[:k]):
        if item in relevant:
            dcg += 1.0 / np.log2(i + 2)  # 0-indexed, so +2

    # Ideal DCG: assumes all relevant items are ranked first
    n_relevant = min(k, len(relevant))
    ideal_dcg = sum(1.0 / np.log2(i + 2) for i in range(n_relevant))

    return dcg / ideal_dcg if ideal_dcg > 0 else 0.0


def mean_reciprocal_rank(recommended: list, relevant: set) -> float:
    """
    Mean Reciprocal Rank — 1/rank of the first relevant item.

    Args:
        recommended: Ordered list of recommended item IDs.
        relevant:    Set of ground-truth relevant item IDs.

    Returns:
        MRR value in [0, 1]. Returns 0 if no relevant item found.
    """
    for i, item in enumerate(recommended):
        if item in relevant:
            return 1.0 / (i + 1)
    return 0.0


def hit_rate_at_k(recommended: list, relevant: set, k: int = 5) -> float:
    """
    Hit Rate @ k — 1 if at least one relevant item appears in top-k, else 0.

    Args:
        recommended: Ordered list of recommended item IDs.
        relevant:    Set of ground-truth relevant item IDs.
        k:           Cutoff position.

    Returns:
        1.0 or 0.0.
    """
    return 1.0 if any(item in relevant for item in recommended[:k]) else 0.0


# ════════════════════════════════════════════════════════════════════════════
#  LIGHTFM-SPECIFIC WRAPPER
# ════════════════════════════════════════════════════════════════════════════


def auc_score(
    model: Any,
    test_interactions: Any,
    train_interactions: Any,
    item_features: Any = None,
    num_threads: int = 2,
) -> float:
    """
    Compute mean AUC score using LightFM's built-in evaluation.

    Returns:
        Mean AUC across all users.
    """
    try:
        from lightfm.evaluation import auc_score as lfm_auc

        scores = lfm_auc(
            model,
            test_interactions,
            train_interactions=train_interactions,
            item_features=item_features,
            num_threads=num_threads,
        )
        return float(scores.mean())
    except ImportError:
        print("⚠ LightFM not available — cannot compute AUC score.")
        return 0.0


# ════════════════════════════════════════════════════════════════════════════
#  BATCH EVALUATION
# ════════════════════════════════════════════════════════════════════════════


def evaluate_recommendations(
    user_recommendations: dict[str, list],
    user_relevant: dict[str, set],
    k: int = 5,
) -> dict[str, float]:
    """
    Evaluate a full set of user recommendations against ground truth.

    Args:
        user_recommendations: {user_id: [ordered item IDs]}
        user_relevant:        {user_id: {relevant item IDs}}
        k:                    Cutoff position for @k metrics.

    Returns:
        Dictionary with averaged metrics across all users.
    """
    precisions = []
    recalls = []
    ndcgs = []
    mrrs = []
    hit_rates = []

    for user_id in user_recommendations:
        if user_id not in user_relevant:
            continue

        recs = user_recommendations[user_id]
        rels = user_relevant[user_id]

        if not rels:
            continue

        precisions.append(precision_at_k(recs, rels, k))
        recalls.append(recall_at_k(recs, rels, k))
        ndcgs.append(ndcg_at_k(recs, rels, k))
        mrrs.append(mean_reciprocal_rank(recs, rels))
        hit_rates.append(hit_rate_at_k(recs, rels, k))

    n = len(precisions)
    if n == 0:
        return {
            "precision_at_k": 0.0,
            "recall_at_k": 0.0,
            "ndcg_at_k": 0.0,
            "mrr": 0.0,
            "hit_rate_at_k": 0.0,
            "num_users_evaluated": 0,
        }

    return {
        "precision_at_k": float(np.mean(precisions)),
        "recall_at_k": float(np.mean(recalls)),
        "ndcg_at_k": float(np.mean(ndcgs)),
        "mrr": float(np.mean(mrrs)),
        "hit_rate_at_k": float(np.mean(hit_rates)),
        "num_users_evaluated": n,
    }


# ════════════════════════════════════════════════════════════════════════════
#  MAIN (self-test)
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    # Quick self-test with synthetic data
    print("🧪 Evaluator self-test\n")

    recs = ["item_a", "item_b", "item_c", "item_d", "item_e"]
    relevant = {"item_b", "item_d", "item_f"}

    print(f"Recommended: {recs}")
    print(f"Relevant:    {relevant}")
    print(f"  Precision@5 = {precision_at_k(recs, relevant, 5):.4f}  (expect 0.4000)")
    print(f"  Recall@5    = {recall_at_k(recs, relevant, 5):.4f}  (expect 0.6667)")
    print(f"  NDCG@5      = {ndcg_at_k(recs, relevant, 5):.4f}  (expect ~0.6934)")
    print(
        f"  MRR         = {mean_reciprocal_rank(recs, relevant):.4f}  (expect 0.5000)"
    )
    print(f"  Hit@5       = {hit_rate_at_k(recs, relevant, 5):.4f}  (expect 1.0000)")

    # Batch test
    print("\n📊 Batch evaluation test:")
    user_recs = {
        "u1": ["a", "b", "c", "d", "e"],
        "u2": ["x", "y", "z", "a", "b"],
    }
    user_rels = {
        "u1": {"b", "d"},
        "u2": {"x", "z"},
    }
    batch_metrics = evaluate_recommendations(user_recs, user_rels, k=5)
    for metric, value in batch_metrics.items():
        print(f"  {metric}: {value}")

    print("\n✅ All evaluator tests passed.")