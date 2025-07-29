import React, { useState, useEffect } from 'react';
import { todoAPI } from '../../services/api';
import TodoForm from './TodoForm';
import TodoItem from './TodoItem';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getTodos();
      setTodos(response.data.todos);
    } catch (error) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (todoData) => {
    try {
      const response = await todoAPI.createTodo(todoData);
      setTodos([response.data.todo, ...todos]);
      return { success: true };
    } catch (error) {
      setError('Failed to create todo');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const response = await todoAPI.updateTodo(id, todoData);
      setTodos(todos.map(todo => 
        todo._id === id ? response.data.todo : todo
      ));
      return { success: true };
    } catch (error) {
      setError('Failed to update todo');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (error) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', error);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'pending') return todo.status === 'pending';
    if (filter === 'completed') return todo.status === 'completed';
    return true;
  });

  const completedCount = todos.filter(todo => todo.status === 'completed').length;
  const pendingCount = todos.filter(todo => todo.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Todo List</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <TodoForm onSubmit={handleCreateTodo} />
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({todos.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTodos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              {filter === 'all' 
                ? 'No todos yet. Create your first todo above!'
                : `No ${filter} todos found.`
              }
            </p>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;