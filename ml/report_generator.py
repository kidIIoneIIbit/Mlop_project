"""
Report Generator — Evaluation Report (HTML)
============================================
Person C — ML / Data  |  Day 8–9 Deliverable

Generates reports/evaluation_report.html with:
  - Experiment comparison table
  - Metrics bar charts (Precision@5, NDCG@5, AUC)
  - Parameter summary per experiment

Usage:
    python report_generator.py [--results-path ../reports/experiment_results.json]
"""

from __future__ import annotations

import argparse
import base64
import io
import json
from datetime import datetime
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # Non-interactive backend
import matplotlib.pyplot as plt
import numpy as np

REPORTS_DIR = Path(__file__).resolve().parent.parent / "reports"


# ════════════════════════════════════════════════════════════════════════════
#  CHART GENERATION
# ════════════════════════════════════════════════════════════════════════════


def _fig_to_base64(fig: plt.Figure) -> str:
    """Convert matplotlib figure to base64-encoded PNG for HTML embedding."""
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode("utf-8")
    plt.close(fig)
    return b64


def _make_comparison_chart(results: dict) -> str:
    """Create a grouped bar chart comparing metrics across experiments."""
    exp_names = list(results.keys())
    short_names = [n.replace("exp", "E").replace("_", " ").title() for n in exp_names]

    metrics_to_plot = ["precision_at_5", "ndcg_at_5"]
    # Add AUC if available for any experiment
    if any("auc_score" in results[e]["metrics"] for e in exp_names):
        metrics_to_plot.append("auc_score")

    x = np.arange(len(exp_names))
    width = 0.25
    n_metrics = len(metrics_to_plot)

    fig, ax = plt.subplots(figsize=(10, 5))
    colors = ["#2563eb", "#16a34a", "#ea580c"]

    for i, metric in enumerate(metrics_to_plot):
        values = [results[e]["metrics"].get(metric, 0) for e in exp_names]
        offset = (i - n_metrics / 2 + 0.5) * width
        bars = ax.bar(
            x + offset,
            values,
            width,
            label=metric.replace("_", " ").title(),
            color=colors[i],
        )
        for bar, val in zip(bars, values):
            if val > 0:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height() + 0.005,
                    f"{val:.3f}",
                    ha="center",
                    va="bottom",
                    fontsize=8,
                )

    ax.set_ylabel("Score")
    ax.set_title("Experiment Comparison — Recommendation Metrics")
    ax.set_xticks(x)
    ax.set_xticklabels(short_names, rotation=15, ha="right")
    ax.legend()
    ax.set_ylim(0, 1.0)
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()

    return _fig_to_base64(fig)


def _make_training_time_chart(results: dict) -> str:
    """Create a bar chart of training times."""
    exp_names = list(results.keys())
    short_names = [n.replace("exp", "E").replace("_", " ").title() for n in exp_names]
    times = [results[e]["metrics"].get("training_time_s", 0) for e in exp_names]

    fig, ax = plt.subplots(figsize=(8, 4))
    bars = ax.bar(short_names, times, color="#7c3aed")
    for bar, val in zip(bars, times):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.1,
            f"{val:.1f}s",
            ha="center",
            va="bottom",
            fontsize=9,
        )
    ax.set_ylabel("Time (seconds)")
    ax.set_title("Training Time per Experiment")
    ax.grid(axis="y", alpha=0.3)
    fig.tight_layout()

    return _fig_to_base64(fig)


# ════════════════════════════════════════════════════════════════════════════
#  HTML GENERATION
# ════════════════════════════════════════════════════════════════════════════


def generate_html_report(results: dict, output_path: Path | None = None) -> Path:
    """
    Generate a comprehensive HTML evaluation report.

    Args:
        results: Dict of experiment results (from trainer.py output or experiment_results.json).
        output_path: Where to write the HTML file.

    Returns:
        Path to the generated HTML file.
    """
    output = output_path or (REPORTS_DIR / "evaluation_report.html")
    output.parent.mkdir(parents=True, exist_ok=True)

    # Generate charts
    comparison_chart = _make_comparison_chart(results)
    time_chart = _make_training_time_chart(results)

    # Build metrics table rows
    table_rows = ""
    for name, data in results.items():
        params = data["params"]
        metrics = data["metrics"]
        method = params.get("method", "—")
        loss = params.get("loss", "—")
        components = params.get("num_components", "—")
        epochs = params.get("epochs", "—")
        prec = metrics.get("precision_at_5", 0)
        ndcg = metrics.get("ndcg_at_5", 0)
        auc = metrics.get("auc_score", "—")
        time_s = metrics.get("training_time_s", "—")

        if isinstance(auc, float):
            auc = f"{auc:.4f}"
        if isinstance(time_s, float):
            time_s = f"{time_s:.2f}s"

        table_rows += f"""
        <tr>
            <td><strong>{name}</strong></td>
            <td>{method}</td>
            <td>{loss}</td>
            <td>{components}</td>
            <td>{epochs}</td>
            <td>{prec:.4f}</td>
            <td>{ndcg:.4f}</td>
            <td>{auc}</td>
            <td>{time_s}</td>
        </tr>"""

    # Find best experiment
    best_name = max(
        results, key=lambda k: results[k]["metrics"].get("precision_at_5", 0)
    )
    best_metrics = results[best_name]["metrics"]

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pet Nutrition Recommender — Evaluation Report</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
               line-height: 1.6; color: #1e293b; max-width: 1100px; margin: 0 auto; padding: 2rem; }}
        h1 {{ font-size: 1.8rem; margin-bottom: 0.5rem; color: #0f172a; }}
        h2 {{ font-size: 1.3rem; margin: 2rem 0 0.8rem; color: #1e40af; border-bottom: 2px solid #dbeafe; padding-bottom: 0.3rem; }}
        .meta {{ color: #64748b; font-size: 0.9rem; margin-bottom: 2rem; }}
        .best-badge {{ background: #16a34a; color: white; padding: 0.3rem 0.8rem; border-radius: 4px; font-weight: 600; display: inline-block; margin: 1rem 0; }}
        table {{ width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }}
        th, td {{ padding: 0.6rem 0.8rem; text-align: left; border: 1px solid #e2e8f0; }}
        th {{ background: #f1f5f9; font-weight: 600; color: #334155; }}
        tr:nth-child(even) {{ background: #f8fafc; }}
        .chart {{ text-align: center; margin: 1.5rem 0; }}
        .chart img {{ max-width: 100%; border: 1px solid #e2e8f0; border-radius: 8px; }}
        .summary-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0; }}
        .summary-card {{ background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; text-align: center; }}
        .summary-card .value {{ font-size: 1.5rem; font-weight: 700; color: #1e40af; }}
        .summary-card .label {{ color: #64748b; font-size: 0.85rem; }}
        footer {{ margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 0.8rem; }}
    </style>
</head>
<body>
    <h1>🐾 Pet Nutrition Recommender — Evaluation Report</h1>
    <p class="meta">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Experiments: {len(results)} | Seed: 42</p>

    <h2>📊 Summary</h2>
    <div class="summary-grid">
        <div class="summary-card">
            <div class="value">{len(results)}</div>
            <div class="label">Experiments Run</div>
        </div>
        <div class="summary-card">
            <div class="value">{best_metrics.get('precision_at_5', 0):.4f}</div>
            <div class="label">Best Precision@5</div>
        </div>
        <div class="summary-card">
            <div class="value">{best_metrics.get('ndcg_at_5', 0):.4f}</div>
            <div class="label">Best NDCG@5</div>
        </div>
        <div class="summary-card">
            <div class="value">{best_metrics.get('auc_score', 'N/A')}</div>
            <div class="label">Best AUC</div>
        </div>
    </div>

    <div class="best-badge">🏆 Best Model: {best_name}</div>

    <h2>📋 Experiment Results</h2>
    <table>
        <thead>
            <tr>
                <th>Experiment</th>
                <th>Method</th>
                <th>Loss</th>
                <th>Components</th>
                <th>Epochs</th>
                <th>Precision@5</th>
                <th>NDCG@5</th>
                <th>AUC</th>
                <th>Time</th>
            </tr>
        </thead>
        <tbody>
            {table_rows}
        </tbody>
    </table>

    <h2>📈 Metrics Comparison</h2>
    <div class="chart">
        <img src="data:image/png;base64,{comparison_chart}" alt="Metrics Comparison Chart">
    </div>

    <h2>⏱ Training Time</h2>
    <div class="chart">
        <img src="data:image/png;base64,{time_chart}" alt="Training Time Chart">
    </div>

    <h2>🔬 Methodology</h2>
    <p>Four recommendation approaches were evaluated on mock data (200 users, 24 food items, 21 breeds):</p>
    <ol style="margin: 0.5rem 0 0.5rem 1.5rem;">
        <li><strong>CBF Baseline:</strong> Content-based filtering using nutrient match scores against breed targets.</li>
        <li><strong>LightFM WARP (32d):</strong> Hybrid collaborative + content-based with Weighted Approximate-Rank Pairwise loss, 32-dimensional embeddings.</li>
        <li><strong>LightFM WARP (64d):</strong> Same as above with 64-dimensional embeddings and longer training.</li>
        <li><strong>LightFM BPR (32d):</strong> Hybrid model with Bayesian Personalized Ranking loss.</li>
    </ol>
    <p>All experiments used 80/20 train/test split with SEED=42 for reproducibility. Side features include species, food type, protein/fat bins, and tag flags.</p>

    <footer>
        Pet Lifestyle &amp; Nutrition Recommender | MLOps 2 Final Project | {datetime.now().year}
    </footer>
</body>
</html>"""

    with open(output, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"📄 Report generated: {output}")
    return output


# ════════════════════════════════════════════════════════════════════════════
#  CLI
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate evaluation report")
    parser.add_argument(
        "--results-path",
        type=Path,
        default=REPORTS_DIR / "experiment_results.json",
        help="Path to experiment_results.json",
    )
    args = parser.parse_args()

    if args.results_path.exists():
        with open(args.results_path) as f:
            results = json.load(f)
        generate_html_report(results)
    else:
        print(f"⚠ No results file found at {args.results_path}")
        print("  Run trainer.py first to generate experiment results.")
        print("  Generating report with placeholder data …")

        # Placeholder for testing the report generator itself
        placeholder = {
            "exp1_cbf_baseline": {
                "params": {"method": "cbf", "k": 5},
                "metrics": {
                    "precision_at_5": 0.32,
                    "ndcg_at_5": 0.28,
                    "training_time_s": 1.2,
                },
                "run_id": "placeholder",
            },
            "exp2_lightfm_warp_32": {
                "params": {
                    "method": "lightfm",
                    "loss": "warp",
                    "num_components": 32,
                    "epochs": 30,
                },
                "metrics": {
                    "precision_at_5": 0.45,
                    "ndcg_at_5": 0.41,
                    "auc_score": 0.82,
                    "training_time_s": 5.3,
                },
                "run_id": "placeholder",
            },
            "exp3_lightfm_warp_64": {
                "params": {
                    "method": "lightfm",
                    "loss": "warp",
                    "num_components": 64,
                    "epochs": 50,
                },
                "metrics": {
                    "precision_at_5": 0.48,
                    "ndcg_at_5": 0.44,
                    "auc_score": 0.85,
                    "training_time_s": 12.1,
                },
                "run_id": "placeholder",
            },
            "exp4_lightfm_bpr_32": {
                "params": {
                    "method": "lightfm",
                    "loss": "bpr",
                    "num_components": 32,
                    "epochs": 30,
                },
                "metrics": {
                    "precision_at_5": 0.40,
                    "ndcg_at_5": 0.37,
                    "auc_score": 0.78,
                    "training_time_s": 4.8,
                },
                "run_id": "placeholder",
            },
        }
        generate_html_report(placeholder)
