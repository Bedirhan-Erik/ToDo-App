import React from 'react';
import { updateTaskStatus, deleteTask as apiDeleteTask } from "../api";

interface Task {
  id: number
  name: string
  description: string
  deadline: string
  status: "Not Started" | "In Progress" | "Completed"
  createDate: string
  dependencies?: number[]
}

interface List {
  id: number
  name: string
}

interface Filters {
  name: string
  status: "Any" | "Not Started" | "In Progress" | "Completed"
  expired: boolean
  orderBy: string
}

interface Post{
  id:number
  [key:string]: any
}

interface MainContentProps {
  selectedList: number | null
  Lists: List[]
  tasks: Record<number, Task[]>
  setTasks: React.Dispatch<React.SetStateAction<Record<number, Task[]>>>
  filters: Filters
  searchText: string
  setSearchText: React.Dispatch<React.SetStateAction<string>>
  showFilters: boolean
  setShowFilters: React.Dispatch<React.SetStateAction<boolean>>
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>
  posts:Post[]
}

function MainContent({ selectedList, Lists, tasks, setTasks, filters, searchText,setSearchText, showFilters, setShowFilters, setShowModal, }: MainContentProps) {

  if (selectedList == null) {
    return (
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
        <div className="bg-white p-6 mt-4 w-full max-w-4xl flex flex-col gap-2">
          <h2 className='text-2xl font-semibold'>Select or create a list</h2>
        </div>
      </div>
    );
  }

  const selectedListName: string = Lists.find(l => l.id === selectedList)?.name || "To-Do List"

  const toggleTaskCompleted = async (taskId: number) => {
  const list = tasks[selectedList];
  const task = list.find(t => t.id === taskId);
  if (!task) return;

  const newStatus =
    task.status === "Completed" ? "Not Started" : "Completed";

  try {
    const updated = await updateTaskStatus(taskId, newStatus);
    setTasks({
      ...tasks,
      [selectedList]: list.map(t => t.id === taskId ? { ...t, status: updated.status } : t)
    });
  } catch (err: any) {
    if (String(err.message).includes("Dependencies not completed")) {
      alert("depends cannot task completed");
    } else {
      console.error(err);
      alert("Status not update");
    }
  }
};

  const deleteTask = async (taskId: number) => {
    await apiDeleteTask(taskId)
    setTasks({
      ...tasks,
      [selectedList]: tasks[selectedList].filter(task => task.id !== taskId)
    });
  };

  const filterTasks = (taskList: Task[]): Task[] => {
    let filtered: Task[] = taskList;
    if (filters.name) {
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    if (filters.status !== "Any") {
      filtered = filtered.filter(task => task.status === filters.status)
    }
    if (filters.expired) {
      const today: string = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(task => task.deadline && task.deadline < today)
    }
    filtered.sort((a: Task, b: Task): number => {
      switch (filters.orderBy) {
        case 'Name':
          return a.name.localeCompare(b.name)
        case 'Create Date':
          return new Date(a.createDate || '').getTime() - new Date(b.createDate || '').getTime()
        case 'Deadline':
          return new Date(a.deadline || '').getTime() - new Date(b.deadline || '').getTime()
        case 'Status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    return filtered;
  };

  const isDependencyCompleted = (task: Task, taskList: Task[]): boolean => {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every((depId: number ) => 
      taskList.find(t => t.id === depId && t.status === 'Completed')
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      <div className="bg-white p-6 mt-4 w-full max-w-4xl flex flex-col gap-2">
        <div className="flex flex-col  sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className='text-2xl font-semibold'>{selectedListName}</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-6 py-2 rounded font-medium border border-gray-300 bg-gray-100 hover:bg-gray-200"
          >
            Filters
          </button>
        </div>
        <div className="mb-2">
          <input
            type="text"
            placeholder="search tasks..."
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
            className="w-[95%] px-5 py-2 border border-gray-300 rounded-xl bg-white shadow text-base focus:border-black"
          />
        </div>
        <div className="w-full flex justify-center">
          <table className="w-full min-w-[700px] border-collapse rounded-xl">
            <thead>
              <tr className="bg-gray-200">
                <th className='p-4 text-center'>Name</th>
                <th className='p-4 text-center'>Description</th>
                <th className='p-4 text-center'>Deadline</th>
                <th className='p-4 text-center'>Status</th>
                <th className='p-4 text-left'>Done</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks[selectedList] && filterTasks(tasks[selectedList])
                .filter((task: Task) => task.name.toLowerCase().includes(searchText.toLowerCase()))
                .map((task: Task) => (
                  <tr key={task.id}>
                    <td className='p-4'>{task.name}</td>
                    <td className='p-4'>{task.description}</td>
                    <td className='p-4'>{task.deadline}</td>
                    <td className='p-4'>{task.status}</td>
                    <td className='p-4'>
                      <input
                        type="checkbox"
                        checked={task.status === "Completed"}
                        onChange={() => toggleTaskCompleted(task.id)}
                        disabled={!isDependencyCompleted(task, tasks[selectedList])}
                        className='accent-black'
                      />
                    </td>
                    <td className='p-4'>
                      <button 
                        onClick={() => deleteTask(task.id)} 
                        className="text-lg hover:text-red-700 text-black"
                      >
                        x
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className='mt-4 flex justify-end'>
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 w-full border-2 border-dashed border-gray-300 rounded-xl bg-gray-100 py-4 text-lg font-light hover:bg-gray-300"
          >
            + New Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default MainContent;