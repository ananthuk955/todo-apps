import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  Clock, 
  Check, 
  X, 
  User, 
  Calendar, 
  Tag,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import TodoForm from './TodoForm';
import { useAuth } from '../../context/AuthContext';

const TodoItem = ({ todo, onUpdate, onDelete, showAssignmentInfo = false }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusToggle = async () => {
    setIsLoading(true);
    const newStatus = todo.status === 'pending' ? 'completed' : 'pending';
    await onUpdate(todo._id, { ...todo, status: newStatus });
    setIsLoading(false);
  };

  const handleEdit = async (formData) => {
    const result = await onUpdate(todo._id, { ...todo, ...formData });
    if (result.success) setIsEditing(false);
    return result;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });

  const formatDueDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && todo.status !== 'completed';
  };

  const canEdit = todo.createdBy._id === user.id || todo.assignedTo._id === user.id;
  const canDelete = todo.createdBy._id === user.id;
  const isCreator = todo.createdBy._id === user.id;
  const isAssignee = todo.assignedTo._id === user.id;

  return (
    <div className={`p-6 rounded-2xl shadow-md transition border-l-4 ${
      todo.status === 'completed' 
        ? 'bg-green-50 border-green-500' 
        : isOverdue(todo.dueDate)
        ? 'bg-red-50 border-red-500'
        : isDueSoon(todo.dueDate)
        ? 'bg-yellow-50 border-yellow-500'
        : 'bg-blue-50 border-blue-500'
    }`}>
      {isEditing ? (
        <TodoForm
          initialData={todo}
          isEditing={true}
          onSubmit={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className={`text-xl font-bold ${
                  todo.status === 'completed' 
                    ? 'line-through text-gray-500' 
                    : 'text-gray-800'
                }`}>
                  {todo.title}
                </h3>
                
                {/* Priority Badge */}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(todo.priority)}`}>
                  {todo.priority.toUpperCase()}
                </span>
                
                {/* Overdue Warning */}
                {isOverdue(todo.dueDate) && (
                  <span className="flex items-center text-red-600 text-xs font-semibold">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    OVERDUE
                  </span>
                )}
              </div>

              {todo.description && (
                <p className={`mt-2 ${
                  todo.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {todo.description}
                </p>
              )}

              {/* Assignment Information */}
              {showAssignmentInfo && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-1" />
                        <span className="font-medium">Created by:</span>
                        <span className="ml-1">{todo.createdBy.username}</span>
                      </div>
                      
                      {todo.assignedTo._id !== todo.createdBy._id && (
                        <div className="flex items-center text-blue-600">
                          <User className="w-4 h-4 mr-1" />
                          <span className="font-medium">Assigned to:</span>
                          <span className="ml-1">{todo.assignedTo.username}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {todo.assignmentNote && (
                    <div className="mt-2 flex items-start text-sm text-gray-600">
                      <MessageSquare className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
                      <span className="italic">"{todo.assignmentNote}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Row */}
              <div className="flex items-center mt-3 space-x-4 text-sm text-gray-500 flex-wrap gap-2">
                <span className="flex items-center">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Created: {formatDate(todo.createdAt)}
                </span>
                
                {todo.createdAt !== todo.updatedAt && (
                  <span className="flex items-center">
                    <Edit className="inline w-4 h-4 mr-1" />
                    Updated: {formatDate(todo.updatedAt)}
                  </span>
                )}
                
                {todo.dueDate && (
                  <span className={`flex items-center ${
                    isOverdue(todo.dueDate) 
                      ? 'text-red-600 font-semibold' 
                      : isDueSoon(todo.dueDate)
                      ? 'text-yellow-600 font-semibold'
                      : 'text-gray-500'
                  }`}>
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Due: {formatDueDate(todo.dueDate)}
                  </span>
                )}
                
                {todo.category && (
                  <span className="flex items-center">
                    <Tag className="inline w-4 h-4 mr-1" />
                    {todo.category}
                  </span>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              todo.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {todo.status.toUpperCase()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {/* Status Toggle - Anyone assigned can toggle */}
            {canEdit && (
              <button
                onClick={handleStatusToggle}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 rounded-xl font-semibold text-white transition ${
                  todo.status === 'pending' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                } disabled:opacity-50`}
              >
                {isLoading ? 'Updating...' : (
                  <>
                    {todo.status === 'pending' 
                      ? <Check className="w-4 h-4 mr-2" /> 
                      : <X className="w-4 h-4 mr-2" />
                    }
                    {todo.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                  </>
                )}
              </button>
            )}

            {/* Edit Button - Creator or assignee can edit */}
            {canEdit && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}

            {/* Delete Button - Only creator can delete */}
            {canDelete && (
                            <button 
                            onClick={() => onDelete(todo._id)} 
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            };
            
export default TodoItem;