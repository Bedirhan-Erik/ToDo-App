import React from "react"
import { addTask as apiAddTask } from "../api";

interface Task {
  id: number;
  name: string;
  description: string;
  deadline: string | null;
  status: "Not Started" | "In Progress" | "Completed"
  createDate: string;
  dependencies: number[];
}

interface FormData {
  name: string;
  description: string;
  deadline: string | null;
  status: "Not Started" | "In Progress" | "Completed"
  dependencies: number[];
}

interface AddTaskProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  tasks: Record<number, Task[]>;
  setTasks: React.Dispatch<React.SetStateAction<Record<number, Task[]>>>;
  selectedList: number | null;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddTask: React.FC<AddTaskProps> = ({
  formData,
  setFormData,
  tasks,
  setTasks,
  selectedList,
  setShowModal,
}) => {

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedList == null) return;
    if (!formData.name || !formData.description || !formData.deadline) return

    const payload = {
      name: formData.name,
      description: formData.description,
      deadline: formData.deadline || null,
      status: formData.status as "Not Started" | "In Progress" | "Completed",
      dependencies: formData.dependencies ?? []
    };

    const created=await apiAddTask(selectedList,payload)

    setTasks(prev => ({
      ...prev,
      [selectedList]: [...(prev[selectedList] || []), created],
    }));

    setFormData({
      name: "",
      description: "",
      deadline: null,
      status: "Not Started",
      dependencies: [],
    });
    setShowModal(false);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <form onSubmit={handleSubmit} className="bg-white border py-4 px-5 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>

        <input
          name="name"
          type="text"
          placeholder="Task name"
          value={formData?.name || ""}
          onChange={handleChange}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={formData?.description || ""}
          onChange={handleChange}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl"
        />

        <input
          name="deadline"
          type="date"
          value={formData?.deadline || ''}
          onChange={handleChange}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-xl"
        />

        <div className="mb-3">
          <label className="block font-medium mb-2">Status</label>
          <select
            name="status"
            value={formData?.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-2">Dependencies</label>
          {tasks[selectedList]?.map((task) => (
            <label key={task.id} className="block">
              <input
                type="checkbox"
                value={task.id}
                checked={formData.dependencies?.includes(task.id)}
                onChange={() => {
                  const dependencies = formData.dependencies || [];
                  if (dependencies.includes(task.id)) {
                    setFormData({
                      ...formData,
                      dependencies: dependencies.filter((id) => id !== task.id),
                    });
                  } else {
                    setFormData({
                      ...formData,
                      dependencies: [...dependencies, task.id],
                    });
                  }
                }}
                className="mr-2 accent-black"
              />
              {task.name}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-4 py-2 rounded border border-gray-300 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800">
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTask;