"""
Result reporting and visualization utilities.

Provides consistent formatting for experiment results, statistical summaries,
and publication-quality plots.
"""

import json
import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np


@dataclass
class ExperimentReport:
    """Standard format for experiment results."""
    
    experiment_name: str
    timestamp: str
    configuration: Dict[str, Any]
    results: Dict[str, Any]
    statistical_summary: Dict[str, Any]
    conclusion: str
    pass_fail: str  # "PASS", "FAIL", "MARGINAL", "INCONCLUSIVE"
    
    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
    
    def to_json(self, filepath: Path):
        """Save report as JSON."""
        with open(filepath, 'w') as f:
            json.dump(self.to_dict(), f, indent=2)
    
    @classmethod
    def from_json(cls, filepath: Path) -> 'ExperimentReport':
        """Load report from JSON."""
        with open(filepath, 'r') as f:
            data = json.load(f)
        return cls(**data)


def save_results(
    experiment_name: str,
    config: Dict[str, Any],
    raw_data: Dict[str, Any],
    output_dir: Path
) -> Path:
    """
    Save experiment results to JSON file.
    
    Args:
        experiment_name: Name of experiment
        config: Configuration parameters
        raw_data: Raw experimental data
        output_dir: Directory to save results
    
    Returns:
        Path to saved JSON file
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"{timestamp}_{experiment_name}.json"
    filepath = output_dir / filename
    
    data = {
        'experiment': experiment_name,
        'timestamp': timestamp,
        'configuration': config,
        'results': raw_data
    }
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"✓ Results saved to: {filepath}")
    return filepath


def generate_summary(
    report: ExperimentReport,
    output_dir: Path
) -> Path:
    """
    Generate human-readable markdown summary.
    
    Args:
        report: ExperimentReport object
        output_dir: Directory to save summary
    
    Returns:
        Path to generated summary.md
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    filepath = output_dir / "summary.md"
    
    # Format pass/fail with emoji
    status_emoji = {
        "PASS": "✅",
        "FAIL": "❌",
        "MARGINAL": "⚠️",
        "INCONCLUSIVE": "❓"
    }
    
    status = f"{status_emoji.get(report.pass_fail, '❓')} {report.pass_fail}"
    
    md_content = f"""# {report.experiment_name} - Results Summary

**Status**: {status}  
**Date**: {report.timestamp}

## Configuration

```json
{json.dumps(report.configuration, indent=2)}
```

## Results

{_format_results_markdown(report.results)}

## Statistical Summary

{_format_statistics_markdown(report.statistical_summary)}

## Conclusion

{report.conclusion}

---

**Raw data**: See `{report.timestamp}_*.json` in this directory.
"""
    
    with open(filepath, 'w') as f:
        f.write(md_content)
    
    print(f"✓ Summary saved to: {filepath}")
    return filepath


def _format_results_markdown(results: Dict[str, Any], indent: int = 0) -> str:
    """Format results dict as markdown."""
    lines = []
    prefix = "  " * indent
    
    for key, value in results.items():
        if isinstance(value, dict):
            lines.append(f"{prefix}- **{key}**:")
            lines.append(_format_results_markdown(value, indent + 1))
        elif isinstance(value, (list, tuple)):
            if len(value) > 5:
                lines.append(f"{prefix}- **{key}**: [{value[0]}, {value[1]}, ..., {value[-1]}] ({len(value)} items)")
            else:
                lines.append(f"{prefix}- **{key}**: {value}")
        else:
            lines.append(f"{prefix}- **{key}**: `{value}`")
    
    return "\n".join(lines)


def _format_statistics_markdown(stats: Dict[str, Any]) -> str:
    """Format statistics as markdown table."""
    if not stats:
        return "_No statistics available._"
    
    lines = ["| Metric | Value |", "|--------|-------|"]
    
    for key, value in stats.items():
        # Format numbers nicely
        if isinstance(value, float):
            formatted = f"{value:.6f}" if abs(value) < 1 else f"{value:.2f}"
        else:
            formatted = str(value)
        
        lines.append(f"| {key} | {formatted} |")
    
    return "\n".join(lines)


def plot_histogram(
    data: List[float],
    title: str,
    xlabel: str,
    output_path: Path,
    bins: int = 50,
    expected_value: Optional[float] = None
):
    """
    Create publication-quality histogram.
    
    Args:
        data: List of values to plot
        title: Plot title
        xlabel: X-axis label
        output_path: Where to save plot
        bins: Number of bins
        expected_value: Optional vertical line for expected value
    """
    plt.figure(figsize=(10, 6))
    
    plt.hist(data, bins=bins, alpha=0.7, color='steelblue', edgecolor='black')
    
    if expected_value is not None:
        plt.axvline(expected_value, color='red', linestyle='--', linewidth=2,
                   label=f'Expected: {expected_value:.2f}')
        plt.legend()
    
    plt.title(title, fontsize=14, fontweight='bold')
    plt.xlabel(xlabel, fontsize=12)
    plt.ylabel('Frequency', fontsize=12)
    plt.grid(axis='y', alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Histogram saved to: {output_path}")


def plot_distribution_comparison(
    data1: List[float],
    data2: List[float],
    label1: str,
    label2: str,
    title: str,
    output_path: Path
):
    """
    Compare two distributions side-by-side.
    
    Args:
        data1: First dataset
        data2: Second dataset
        label1: Label for first dataset
        label2: Label for second dataset
        title: Plot title
        output_path: Where to save plot
    """
    plt.figure(figsize=(12, 6))
    
    # Set seaborn style for better aesthetics
    sns.set_style("whitegrid")
    
    plt.subplot(1, 2, 1)
    plt.hist(data1, bins=50, alpha=0.7, color='steelblue', edgecolor='black')
    plt.title(label1, fontsize=12)
    plt.xlabel('Value', fontsize=10)
    plt.ylabel('Frequency', fontsize=10)
    
    plt.subplot(1, 2, 2)
    plt.hist(data2, bins=50, alpha=0.7, color='coral', edgecolor='black')
    plt.title(label2, fontsize=12)
    plt.xlabel('Value', fontsize=10)
    plt.ylabel('Frequency', fontsize=10)
    
    plt.suptitle(title, fontsize=14, fontweight='bold')
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Comparison plot saved to: {output_path}")


def plot_convergence(
    x_values: List[float],
    y_values: List[float],
    title: str,
    xlabel: str,
    ylabel: str,
    output_path: Path,
    expected_value: Optional[float] = None
):
    """
    Plot convergence over trials/iterations.
    
    Args:
        x_values: X-axis values (e.g., trial numbers)
        y_values: Y-axis values (e.g., running average)
        title: Plot title
        xlabel: X-axis label
        ylabel: Y-axis label
        output_path: Where to save plot
        expected_value: Optional horizontal line for expected value
    """
    plt.figure(figsize=(10, 6))
    
    plt.plot(x_values, y_values, linewidth=2, color='steelblue', alpha=0.8)
    
    if expected_value is not None:
        plt.axhline(expected_value, color='red', linestyle='--', linewidth=2,
                   label=f'Expected: {expected_value:.2f}')
        plt.legend()
    
    plt.title(title, fontsize=14, fontweight='bold')
    plt.xlabel(xlabel, fontsize=12)
    plt.ylabel(ylabel, fontsize=12)
    plt.grid(alpha=0.3)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Convergence plot saved to: {output_path}")


def create_results_table(
    headers: List[str],
    rows: List[List[Any]],
    title: str,
    output_path: Path
):
    """
    Create publication-quality table as image.
    
    Args:
        headers: Column headers
        rows: Data rows
        title: Table title
        output_path: Where to save plot
    """
    fig, ax = plt.subplots(figsize=(12, len(rows) * 0.5 + 2))
    ax.axis('tight')
    ax.axis('off')
    
    table = ax.table(
        cellText=rows,
        colLabels=headers,
        cellLoc='center',
        loc='center',
        colWidths=[1.0 / len(headers)] * len(headers)
    )
    
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    table.scale(1, 2)
    
    # Style header row
    for i in range(len(headers)):
        cell = table[(0, i)]
        cell.set_facecolor('#4CAF50')
        cell.set_text_props(weight='bold', color='white')
    
    plt.title(title, fontsize=14, fontweight='bold', pad=20)
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"✓ Table saved to: {output_path}")


if __name__ == "__main__":
    # Self-test
    print("Reporting Utilities Self-Test")
    print("=" * 60)
    
    # Create test report
    report = ExperimentReport(
        experiment_name="Test Experiment",
        timestamp=datetime.datetime.now().isoformat(),
        configuration={"k": 3, "n": 5, "trials": 100},
        results={"mean": 999.5, "std": 1.2, "trials": [998, 1000, 999]},
        statistical_summary={"p_value": 0.847, "statistic": 0.012},
        conclusion="Test passed successfully",
        pass_fail="PASS"
    )
    
    # Test data
    test_data = list(np.random.normal(1000, 10, 100))
    
    # Create temp directory
    temp_dir = Path("/tmp/schiavinato_reporting_test")
    temp_dir.mkdir(exist_ok=True)
    
    # Test save
    report.to_json(temp_dir / "test_report.json")
    print("✓ JSON save test passed")
    
    # Test summary generation
    generate_summary(report, temp_dir)
    print("✓ Summary generation test passed")
    
    # Test plotting
    plot_histogram(test_data, "Test Histogram", "Value", temp_dir / "test_hist.png")
    print("✓ Histogram test passed")
    
    print("\nAll reporting tests passed!")
    print(f"Test files saved to: {temp_dir}")

