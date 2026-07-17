import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RecommendationResults } from "@/components/forms/TaskForm";
import { getRecommendationPresentation, recommendationScoreWidth } from "@/features/tasks/recommendations";
import type { AssigneeRecommendation } from "@/types/domain";

describe("AI recommendation presentation", () => {
  it("deduplicates overlapping backend explanations", () => {
    const item = {
      employeeName: "Phan Thanh Duc",
      roleFitReason: "Hồ sơ hiện chưa có tín hiệu chuyên môn khớp với nội dung task.",
      reason: "Hồ sơ hiện chưa có tín hiệu chuyên môn khớp với nội dung task; cần owner kiểm tra lại trước khi giao.",
    } satisfies AssigneeRecommendation;

    const presentation = getRecommendationPresentation(item);
    expect(presentation.primaryReason).toContain("cần owner kiểm tra lại");
    expect(presentation.details).toEqual([]);
  });

  it("renders candidates in the exact order returned by backend", () => {
    render(<RecommendationResults kind="individual" items={[{ employeeId: "a", employeeName: "Ứng viên A", score: 25 }, { employeeId: "b", employeeName: "Ứng viên B", score: 72 }]} selectedIds={[]} onSelect={vi.fn()} />);
    const names = screen.getAllByText(/Ứng viên [AB]/).map((item) => item.textContent);
    expect(names).toEqual(["Ứng viên A", "Ứng viên B"]);
  });

  it("clamps visual score width while preserving the backend score label", () => {
    expect(recommendationScoreWidth(125)).toBe(100);
    expect(recommendationScoreWidth(-10)).toBe(0);
    expect(recommendationScoreWidth(null)).toBe(0);
  });

  it("renders a compact ranked candidate and a clear selected state", () => {
    render(<RecommendationResults
      kind="individual"
      items={[{
        employeeId: "employee-1",
        employeeName: "Phan Thanh Duc",
        score: 29,
        workloadLevel: "NO_WORK",
        roleFit: null,
        source: "RULE_BASED_FALLBACK",
        roleFitReason: "Hồ sơ hiện chưa có tín hiệu chuyên môn khớp với nội dung task.",
        reason: "Hồ sơ hiện chưa có tín hiệu chuyên môn khớp với nội dung task; cần owner kiểm tra lại trước khi giao.",
      }]}
      selectedIds={["employee-1"]}
      onSelect={vi.fn()}
    />);

    expect(screen.getByText("Phan Thanh Duc")).toBeInTheDocument();
    expect(screen.getByText("29 điểm")).toBeInTheDocument();
    expect(screen.getByText("Đã chọn cho task")).toBeInTheDocument();
    expect(screen.getByText("Dữ liệu năng lực hạn chế")).toBeInTheDocument();
    expect(screen.queryByText("Hồ sơ hiện chưa có tín hiệu chuyên môn khớp với nội dung task.")).not.toBeInTheDocument();
    expect(screen.getAllByText(/xếp hạng theo quy tắc nghiệp vụ/i)).toHaveLength(1);
  });
});
