import { TaskService } from "@/server/services/task.service";

async function main() {
  console.log("Testing TaskService...");

  // 1. Get initial tasks for org-1
  const initial = await TaskService.getTasks("org-1");
  console.log("Initial tasks count:", initial.total);
  if (initial.total === 0) {
    throw new Error("Expected initial tasks to be populated");
  }

  // 2. Create a new task
  const created = await TaskService.createTask({
    organizationId: "org-1",
    employeeId: "emp-1",
    assignedById: "user-org-1",
    assignedByName: "Sarah Rahman",
    assignedByRole: "ORG_ADMIN",
    title: "Quarterly Code Refactor & Unit Test Coverage",
    description: "Raise test coverage to 85% on backend services.",
    priority: "HIGH",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
  console.log("Task created successfully:", created.id, created.title);

  // 3. Retrieve task by id
  const fetched = await TaskService.getTaskById("org-1", created.id);
  console.log("Fetched task title:", fetched.title);

  // 4. Update task status to IN_PROGRESS
  const inProgress = await TaskService.updateTask("org-1", created.id, {
    status: "IN_PROGRESS",
  });
  console.log("Task updated to:", inProgress.status);

  // 5. Update task to COMPLETED with notes
  const completed = await TaskService.updateTask("org-1", created.id, {
    status: "COMPLETED",
    completionNotes: "All unit tests written and verified.",
  });
  console.log("Task completed at:", completed.completedAt, "Notes:", completed.completionNotes);

  // 6. Get stats
  const stats = await TaskService.getTaskStats("org-1");
  console.log("Task stats:", stats);

  // 7. Delete the test task
  await TaskService.deleteTask("org-1", created.id);
  console.log("Task deleted successfully");

  console.log("ALL TASK TESTS PASSED!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
