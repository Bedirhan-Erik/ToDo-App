import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import MainContent from './components/MainContent';
import AddTask from "./components/addTask";
import Filters from "./components/Filters";
import './index.css';
import { addList, getLists, getTasks } from "./api";


interface Task {
  id: number;
  name: string;
  description: string;
  deadline: string | null;
  status: "Not Started" | "In Progress" | "Completed"
  createDate?: string;
  dependencies?: number[];
}

interface List {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  description: string;
  deadline: string | null;
  status: "Not Started" | "In Progress" | "Completed"
  dependencies: number[];
}

interface FiltersState {
  status: "Any" | "Not Started" | "In Progress" | "Completed"
  name: string
  expired: boolean
  orderBy: 'Name' | 'Create Date' | 'Deadline' | 'Status';
}

type FilterKeys = keyof FiltersState;
type FilterValues = FiltersState[FilterKeys];


function TodoApp() {

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    deadline: null,
    status: 'Not Started',
    dependencies: []
  });

  const [lists, setLists] = useState<List[]>([]);

  const [selectedList, setSelectedList] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const [filters, setFilters] = useState<FiltersState>({
    status: 'Any',
    name: '',
    expired: false,
    orderBy: 'Create Date'
  });

  const [tasks, setTasks] = useState<Record<number, Task[]>>({});

  useEffect(() => {
    (async () => {
      const lists = await getLists();
      if (lists.length === 0) {
        const created = await addList("My First List");
        setLists([{ id: created.id, name: created.name }]);
        setSelectedList(created.id);
        setTasks({ [created.id]: [] });
      } else {
        setLists(lists.map(l => ({ id: l.id, name: l.name })));
        setSelectedList(lists[0].id);
      }
    })().catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedList == null) return;
    (async () => {
      const its = await getTasks(selectedList);
      setTasks(prev => ({ ...prev, [selectedList]: its }));
    })().catch(console.error);
  }, [selectedList]);

  const handleFilterChange = (key: FilterKeys, value: FilterValues): void => {
    setFilters({ ...filters, [key]: value });
  };

  return (
    <div className="h-screen flex flex-row p-4 bg-red">
      <Sidebar
        lists={lists}
        setLists={setLists}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
        setTasks={setTasks}
        tasks={tasks}
      />
      <MainContent
        selectedList={selectedList}
        Lists={lists}
        tasks={tasks}
        setTasks={setTasks}
        filters={filters}
        searchText={searchText}
        setSearchText={setSearchText}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        setShowModal={setShowModal}
        posts={[]}
      />

      {showFilters && (
        <Filters filters={filters} handleFilterChange={handleFilterChange} />
      )}
      {showModal && (
        <AddTask
          formData={formData}
          setFormData={setFormData}
          tasks={tasks}
          setShowModal={setShowModal}
          setTasks={setTasks}
          selectedList={selectedList}
        />
      )}
    </div>
  );
}

export default TodoApp;