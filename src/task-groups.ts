import { getConfig, type State, type Task } from "./domain";

export function taskCategory(state: State, task: Task): string {
  const scenario = state.scenarios.find((s) => s.id === task.scenarioId);
  if (!scenario) return "unassigned";
  const versionId = task.activationId
    ? state.activations.find((a) => a.id === task.activationId)?.versionId
    : task.batchId
      ? state.batches.find((b) => b.id === task.batchId)?.versionId
      : undefined;
  return (
    (
      scenario.versions.find((v) => v.id === versionId)?.config ??
      getConfig(scenario)
    )?.category || "unassigned"
  );
}

export function groupTasks(state: State, tasks: Task[]) {
  const groups = state.categories.map((category) => ({
    id: category.id,
    name: category.name,
    tasks: [] as Task[],
  }));
  for (const task of tasks) {
    const category = taskCategory(state, task);
    let group = groups.find((g) => g.id === category);
    if (!group) {
      group = groups.find((g) => g.id === "unassigned");
      if (!group) {
        group = { id: "unassigned", name: "Chưa phân nhóm", tasks: [] };
        groups.push(group);
      }
    }
    group.tasks.push(task);
  }
  return groups;
}

export function matchesTaskStatus(task: Task, status: string, now: string) {
  return (
    status === "all" ||
    (status === "overdue"
      ? task.status !== "completed" && Date.parse(task.due) < Date.parse(now)
      : task.status === status)
  );
}
