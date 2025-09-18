import React from 'react';
import { addList as apiAddList, deleteList as apiDeleteList } from "../api";

interface Task {
  id: number
  name: string
  description: string
  deadline: string
  status: "Not Started" | "In Progress" | "Completed"
  createDate: string
  dependencies?: string[]
}

interface List {
  id: number
  name: string
}

interface SidebarProps {
  lists: List[];
  setLists: React.Dispatch<React.SetStateAction<List[]>>;
  selectedList: number | null;
  setSelectedList: React.Dispatch<React.SetStateAction<number | null>>;
  setTasks: React.Dispatch<React.SetStateAction<Record<number, Task[]>>>;
  tasks: Record<number, Task[]>;
}

function Sidebar({ lists, setLists, selectedList, setSelectedList, setTasks, tasks }: SidebarProps) {

  const deleteList = async (id: number): Promise<void> => {
    await apiDeleteList(id);
    setLists(lists.filter(l => l.id !== id));
    const copy: Record<number, Task[]> = { ...tasks };
    delete copy[id];
    setTasks(copy);
    if (selectedList === id) {
      const next = lists.find(l => l.id !== id);
      setSelectedList(next ? next.id : null);
    }
  };
  const addNewList = async (): Promise<void> => {
    const created = await apiAddList(`New List ${lists.length + 1}`);
    setLists([...lists, { id: created.id, name: created.name }]);
    setTasks({ ...tasks, [created.id]: [] });
    setSelectedList(created.id);
  };

  return (
    <div className="w-100% min-w-100% bg-white border-r border-gray-300 h-full flex flex-col">
      <div className="p-5 flex flex-col">
        <div className="flex justify-between items-center mb-5 gap-x-3">
          <h1 className='text-lg font-bold text-gray-800'>To-Do Lists</h1>
          <button
            onClick={addNewList}
            className="bg-gray-200 hover:bg-gray-300 rounded text-lg w-12 h-8"
          >
            +
          </button>
        </div>
        <div>
          {lists.map((list: List) => (
            <div key={list.id} className="flex items-center mb-2">
              <button
                onClick={() => setSelectedList(list.id)}
                className={`flex-1 text-left py-2 px-6 rounded-lg text-lg ${selectedList === list.id ? 'active' : ''}`}
              >
                {list.name}
              </button>
              <button
                onClick={() => deleteList(list.id)}
                className="ml-auto text-black hover:text-red-700 text-sm"
                title="delete list"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;