import { describe, it, expect } from "vitest";
import { seed } from "./seed";
import { copy, type Task } from "./domain";
import { groupTasks, matchesTaskStatus, taskCategory } from "./task-groups";

describe("task grouping", () => {
  it("includes all six categories even with no matching tasks", () => {
    const s = seed();
    expect(groupTasks(s, []).map((g) => [g.id, g.tasks.length])).toEqual([
      ["DV", 0],
      ["HD", 0],
      ["TT", 0],
      ["GS", 0],
      ["TV", 0],
      ["QH", 0],
    ]);
  });
  it("assigns every task once, using the version that created it", () => {
    const s = seed();
    const task = s.tasks.find((t) => t.activationId)!;
    const activation = s.activations.find((a) => a.id === task.activationId)!;
    const scenario = s.scenarios.find((sc) => sc.id === task.scenarioId)!;
    const oldVersion = scenario.versions.find(
      (v) => v.id === activation.versionId,
    )!;
    const originalCategory = oldVersion.config.category;
    const changed = copy(oldVersion);
    changed.id = "new-version";
    changed.config.category = originalCategory === "TV" ? "GS" : "TV";
    scenario.versions.push(changed);
    expect(taskCategory(s, task)).toBe(originalCategory);
    const groups = groupTasks(s, s.tasks);
    expect(
      groups
        .flatMap((g) => g.tasks)
        .map((t) => t.id)
        .sort(),
    ).toEqual(s.tasks.map((t) => t.id).sort());
    expect(
      groups
        .find((g) => g.id === originalCategory)
        ?.tasks.some((t) => t.id === task.id),
    ).toBe(true);
  });
  it("does not lose tasks with missing scenarios or missing categories", () => {
    const s = seed();
    const orphan = { ...s.tasks[0], id: "orphan", scenarioId: "missing" };
    expect(groupTasks(s, [orphan]).at(-1)).toMatchObject({
      id: "unassigned",
      tasks: [orphan],
    });
    s.categories = [];
    expect(groupTasks(s, s.tasks).flatMap((g) => g.tasks)).toHaveLength(
      s.tasks.length,
    );
  });
  it("counts overdue work without completed tasks and excludes the exact due boundary", () => {
    const s = seed();
    const task: Task = {
      ...s.tasks[0],
      status: "open",
      due: "2026-09-29T09:00:00+07:00",
    };
    expect(matchesTaskStatus(task, "overdue", s.now)).toBe(true);
    expect(
      matchesTaskStatus({ ...task, status: "completed" }, "overdue", s.now),
    ).toBe(false);
    expect(matchesTaskStatus({ ...task, due: s.now }, "overdue", s.now)).toBe(
      false,
    );
    expect(matchesTaskStatus(task, "in_progress", s.now)).toBe(false);
    expect(matchesTaskStatus(task, "all", s.now)).toBe(true);
  });
});
