import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import DataTable from '../components/UI/DataTable';
import Modal from '../components/UI/Modal';
import { mockCategories, getCategoryHierarchy, getFlatCategories } from '../data/mockData';

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy' or 'table'
  const [expandedCategories, setExpandedCategories] = useState(new Set([1, 2, 3, 4])); // Default expanded

  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryTree = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category.id} className="select-none">
        <div 
          className={`flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
            level > 0 ? 'ml-' + (level * 6) : ''
          }`}
          style={{ marginLeft: level * 24 }}
        >
          <div className="flex items-center flex-1">
            {category.children && category.children.length > 0 ? (
              <button
                onClick={() => toggleExpanded(category.id)}
                className="p-1 hover:bg-gray-200 rounded mr-2"
              >
                {expandedCategories.has(category.id) ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
            ) : (
              <div className="w-6 mr-2" />
            )}
            
            <div className="flex items-center mr-3">
              {category.children && category.children.length > 0 ? (
                expandedCategories.has(category.id) ? (
                  <FolderOpen className="h-5 w-5 text-blue-500" />
                ) : (
                  <Folder className="h-5 w-5 text-blue-500" />
                )
              ) : (
                <div className="h-5 w-5 bg-gray-300 rounded" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-900">{category.name}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {category.courseCount} courses
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{category.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleCreateChild(category)}
              className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50"
              title="Add subcategory"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {category.children && category.children.length > 0 && expandedCategories.has(category.id) && (
          <div className="mt-1">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const tableColumns = [
    {
      header: 'Category',
      accessor: 'name',
      render: (category) => (
        <div className="flex items-center space-x-3">
          <div style={{ marginLeft: category.level * 20 }}>
            <div className="flex items-center">
              {category.level > 0 && (
                <div className="flex items-center mr-2">
                  {[...Array(category.level)].map((_, i) => (
                    <div key={i} className="w-4 h-px bg-gray-300 mr-1" />
                  ))}
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                </div>
              )}
              <span className="font-medium text-gray-900">{category.name}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Parent Category',
      accessor: 'parentId',
      render: (category) => {
        if (!category.parentId) return <span className="text-gray-400">Root Category</span>;
        const parent = mockCategories.find(c => c.id === category.parentId);
        return parent ? parent.name : '-';
      }
    },
    {
      header: 'Course Count',
      accessor: 'courseCount',
      render: (category) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {category.courseCount} courses
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (category) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {category.status}
        </span>
      )
    }
  ];

  const handleCreate = () => {
    setModalMode('create');
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleCreateChild = (parentCategory) => {
    setModalMode('create');
    setSelectedCategory({ parentId: parentCategory.id, parentName: parentCategory.name });
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleView = (category) => {
    setModalMode('view');
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category) => {
    if (confirm(`Are you sure you want to delete category "${category.name}"?`)) {
      console.log('Deleting category:', category);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'hierarchy' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Hierarchy
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'table' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>
          <button onClick={handleCreate} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        <div className="card">
          <div className="space-y-2">
            {renderCategoryTree(getCategoryHierarchy())}
          </div>
        </div>
      ) : (
        <DataTable
          data={getFlatCategories()}
          columns={tableColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === 'create' ? 
            (selectedCategory?.parentId ? `Create Subcategory under "${selectedCategory.parentName}"` : 'Create New Category') :
          modalMode === 'edit' ? 'Edit Category' :
          'Category Details'
        }
      >
        <CategoryForm 
          category={selectedCategory} 
          mode={modalMode}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

const CategoryForm = ({ category, mode, onClose }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    parentId: category?.parentId || null,
    status: category?.status || 'Active',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
    onClose();
  };

  const getParentCategories = () => {
    return mockCategories.filter(cat => 
      cat.id !== category?.id && // Don't include self
      cat.level < 2 // Only allow up to 2 levels deep
    );
  };

  if (mode === 'view') {
    const parentCategory = category.parentId ? 
      mockCategories.find(c => c.id === category.parentId) : null;

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <p className="text-gray-900">{category.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {category.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <p className="text-gray-900">{parentCategory ? parentCategory.name : 'Root Category'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Count</label>
            <p className="text-gray-900">{category.courseCount} courses</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <p className="text-gray-900">{category.description}</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="input"
            placeholder="e.g., Web Development"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="input"
            required
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
        <select
          value={formData.parentId || ''}
          onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
          className="input"
        >
          <option value="">Root Category</option>
          {getParentCategories().map(cat => (
            <option key={cat.id} value={cat.id}>
              {'  '.repeat(cat.level)} {cat.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to create a root category, or select a parent for subcategory
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows="3"
          className="input"
          placeholder="Brief description of the category..."
          required
        />
      </div>
      
      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onClose} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {mode === 'create' ? 'Create Category' : 'Update Category'}
        </button>
      </div>
    </form>
  );
};

export default Categories;