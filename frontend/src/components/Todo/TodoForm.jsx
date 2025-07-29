import React, { useState, useEffect } from 'react';
import { Plus, Save, Search, User, Calendar, Tag, AlertCircle } from 'lucide-react';
import { todoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TodoForm = ({ onSubmit, initialData = null, isEditing = false, onCancel = null }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    assignmentNote: '',
    priority: 'medium',
    category: '',
    dueDate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        assignedTo: initialData.assignedTo?._id || '',
        assignmentNote: initialData.assignmentNote || '',
        priority: initialData.priority || 'medium',
        category: initialData.category || '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
      });
      if (initialData.assignedTo && initialData.assignedTo._id !== user.id) {
        setSelectedUser(initialData.assignedTo);
      }
    } else {
      // Default to self-assignment for new todos
      setFormData(prev => ({ ...prev, assignedTo: user.id }));
    }
  }, [initialData, user.id]);

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.length >= 2) {
        try {
          const response = await todoAPI.searchUsers(userSearch);
          setSearchResults(response.data.users);
        } catch (error) {
          console.error('User search error:', error);
        }
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [userSearch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleUserSelect = (selectedUser) => {
    setFormData(prev => ({ ...prev, assignedTo: selectedUser._id }));
    setSelectedUser(selectedUser);
    setShowUserSearch(false);
    setUserSearch('');
    setSearchResults([]);
  };

  const handleAssignToSelf = () => {
    setFormData(prev => ({ ...prev, assignedTo: user.id, assignmentNote: '' }));
    setSelectedUser(null);
    setShowUserSearch(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    
    const todoData = {
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null
    };

    const result = await onSubmit(todoData);
    
    if (result.success && !isEditing) {
      setFormData({
        title: '',
        description: '',
        assignedTo: user.id,
        assignmentNote: '',
        priority: 'medium',
        category: '',
        dueDate: ''
      });
      setSelectedUser(null);
    } else if (!result.success) {
      setError(result.error || 'Failed to save todo');
    }
    
    setIsLoading(false);
  };

  const isAssignedToOther = formData.assignedTo && formData.assignedTo !== user.id;

  return (
    <div className={`${isEditing ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200' : 'bg-white'} rounded-2xl p-6 shadow-lg`}>
      {isEditing && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Save className="w-5 h-5 mr-2 text-blue-600" /> Edit Todo
          </h3>
          {onCancel && (
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
              Cancel
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-400 px-4 py-2 rounded flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
            <Tag className="w-4 h-4 mr-1" />
            Title *
          </label>
          <input
            name="title"
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            placeholder="What needs to be done?"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
          <textarea
            name="description"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
            placeholder="Add more details..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Priority and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
            <input
              name="category"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
              placeholder="e.g., Work, Personal"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center mb-1">
            <Calendar className="w-4 h-4 mr-1" />
            Due Date
          </label>
          <input
            name="dueDate"
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
            value={formData.dueDate}
            onChange={handleChange}
          />
        </div>

        {/* User Assignment */}
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center mb-2">
            <User className="w-4 h-4 mr-1" />
            Assign To
          </label>
          
          <div className="space-y-2">
            {/* Current Assignment Display */}
            <div className="flex items-center space-x-2">
              <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl">
                {selectedUser ? (
                  <span className="text-gray-800">{selectedUser.username} ({selectedUser.email})</span>
                ) : (
                  <span className="text-gray-800">Myself ({user.username})</span>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  type="button"
                  onClick={handleAssignToSelf}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                    !isAssignedToOther 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Me
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                    isAssignedToOther 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Other
                </button>
              </div>
            </div>

            {/* User Search */}
            {showUserSearch && (
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((searchUser) => (
                      <button
                        key={searchUser._id}
                        type="button"
                        onClick={() => handleUserSelect(searchUser)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{searchUser.username}</div>
                          <div className="text-sm text-gray-500">{searchUser.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Assignment Note */}
            {isAssignedToOther && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Assignment Note (Optional)
                </label>
                <input
                  name="assignmentNote"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Add a note for the assignee..."
                  value={formData.assignmentNote}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (
              <>
                {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                {isEditing ? 'Update Todo' : 'Create Todo'}
              </>
            )}
          </button>

          {isEditing && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoForm;


