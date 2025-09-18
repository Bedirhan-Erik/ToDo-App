const API_URL = process.env.REACT_APP_API_URL ?? "http://localhost:8000";

const statusMapFrontendToBackend: Record<string,  "PENDING"|"IN_PROGRESS"|"COMPLETED"> = {
  "Not Started": "PENDING",
  "In Progress": "IN_PROGRESS",
  "Completed": "COMPLETED",
};

const statusMapBackendToFrontend: Record<string, "Not Started"|"In Progress"|"Completed"> = {
  PENDING: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

export async function getLists() {
  const res = await fetch(`${API_URL}/lists`);
  if (!res.ok) throw new Error('Failed to fetch lists');
  return res.json();
}

export async function addList(name: string) {
  const res = await fetch(`${API_URL}/lists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create list');
  return res.json();
}

export async function deleteList(listId: number) {
  const res = await fetch(`${API_URL}/lists/${listId}`, { method: "DELETE" });
  if (!res.ok) throw new Error('Failed to delete list');
  return res.json();
}

export async function getTasks(listId: number) {
  const res = await fetch(`${API_URL}/lists/${listId}/items`);
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  
  return data.map((task: any) => ({
    id: task.id,
    name: task.name,
    description: task.description ?? "",
    deadline: task.deadline ?? null,
    status: statusMapBackendToFrontend[task.status] || "Not Started",
    createDate: task.createdAt, 
    list_id: task.listId,
    dependencies: task.dependencies ?? [],
  }));
}

export async function addTask(listId: number,task: {
    name: string;
    description: string;
    deadline: string | null;
    status: "Not Started" | "In Progress" | "Completed";
    dependencies?: number[];
  }
) {
   const body = {
    name: task.name,                          
    description: task.description,
    deadline: task.deadline ?? null,            
    status: statusMapFrontendToBackend[task.status],
    dependencies: task.dependencies ?? [],
  };

  const res = await fetch(`${API_URL}/lists/${listId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("addTask payload ->", body);
    throw new Error(`Failed to create task: ${res.status} ${text}`);
  }

  return res.json(); 
}

export async function deleteTask(taskId: number) {
  const res = await fetch(`${API_URL}/items/${taskId}`, { method: "DELETE" });
  if (!res.ok) throw new Error('Failed to delete task');
  return res.json();
}

export async function updateTaskStatus(taskId: number , status: "Not Started"|"In Progress"|"Completed") {
  const res = await fetch(`${API_URL}/items/${taskId}/status`, { method: "PATCH", headers:{ "Content-Type": "application/json" },
    body: JSON.stringify({ status: statusMapFrontendToBackend[status] })
  })
  if (!res.ok) throw new Error('Failed to update task status');
  const data = await res.json();
  return {
    id: data.id,
    status: statusMapBackendToFrontend[data.status] || "Completed"
  };
}

export async function addDependency(taskId: number, dependsOnId: number) {
  const res = await fetch(`${API_URL}/items/${taskId}/dependencies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dependsOnIds: [dependsOnId] }),
  });
  if (!res.ok) throw new Error('Failed to add dependency');
  return res.json();
}

export async function getDependencies(taskId: number) {
  const res = await fetch(`${API_URL}/items/${taskId}/dependencies`);
  if (!res.ok) throw new Error('Failed to fetch dependencies');
  return res.json();
}