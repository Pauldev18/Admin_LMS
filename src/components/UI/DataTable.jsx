import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

const DataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onView,
  searchable = true,
  filterable = true,
  pagination = true 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // const filteredData = data.filter(item =>
  //   Object.values(item).some(value =>
  //     value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  //   )
  // );
console.log("DataTable received:", data);

  const filteredData = data.filter(item =>
  Object.values(item).some(value =>
    (value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  )
);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleAction = (action, item) => {
    setActiveDropdown(null);
    if (action === 'edit' && onEdit) onEdit(item);
    if (action === 'delete' && onDelete) onDelete(item);
    if (action === 'view' && onView) onView(item);
  };

  return (
    <div className="card min-h-screen flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input w-full sm:w-64"
              />
            </div>
          )}
          {filterable && (
            <button className="btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-grow">
        <table className="table w-full">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={column.className || ''}>
                  {column.header}
                </th>
              ))}
              <th className="relative"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={column.className || ''}>
                    {column.render ? column.render(item) : item[column.accessor]}
                  </td>
                ))}
                <td className="text-right">
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {activeDropdown === index && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        {onView && (
                          <button
                            onClick={() => handleAction('view', item)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => handleAction('edit', item)}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleAction('delete', item)}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
