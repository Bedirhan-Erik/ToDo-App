import React from 'react';

interface Filterss {
  name: string
  status: "Any" | "Not Started" | "In Progress" | "Completed"
  expired: boolean
  orderBy: string
}

type FilterKeys = keyof Filterss
type FilterValues = Filterss[FilterKeys]

interface FiltersProps {
  filters: Filterss
  handleFilterChange: (key: FilterKeys, value: FilterValues) => void
}

function Filters({ filters, handleFilterChange }: FiltersProps) {
  
  return (
    <div className="bg-gray-100 rounded-xl border border-gray-200 p-6 mb-4 w-full max-w-md shadow">
      <h3 className="text-xl font-bold mb-4">Filters</h3>
      <div className="flex flex-col gap-4">
        <div>
          <label className="block font-medium mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              handleFilterChange("status", e.target.value as Filterss['status'])
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="Any">Any Status</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Name</label>
          <input
            type="text"
            placeholder="Filter by name..."
            value={filters.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFilterChange("name", e.target.value)
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={filters.expired}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFilterChange('expired', e.target.checked)
            }
            className="mr-2 accent-black"
          />
          <label>Expired</label>
        </div>
        <div>
          <label className="block font-medium mb-1">Sort By</label>
          <div className="flex flex-col gap-1">
            {(["Create Date", "Deadline", "Name", "Status"] as const).map((option: Filterss['orderBy']) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="orderBy"
                  value={option}
                  checked={filters.orderBy === option}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    handleFilterChange("orderBy", e.target.value as Filterss['orderBy'])
                  }
                  className="accent-black"
                />
                {option === "Create Date" ? "Create Date" :
                  option === "Deadline" ? "Deadline" :
                  option === "Name" ? "Name" : "Status"}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Filters;