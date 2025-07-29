import React, { useState, useEffect } from 'react';
import { todoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import TodoItem from './TodoItem';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  Clock, 
  TrendingUp,
  Filter,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('assigned-to-me');
  const [timelineExpanded, setTimelineExpanded] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchDashboardData();
    fetchAnalytics();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await todoAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await todoAPI.getAnalytics(30);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTodo = async (id, todoData) => {
    try {
      const response = await todoAPI.updateTodo(id, todoData);
      // Refresh dashboard data
      await fetchDashboardData();
      return { success: true };
    } catch (error) {
      setError('Failed to update todo');
      return { success: false, error: error.response?.data?.message };
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoAPI.deleteTodo(id);
      // Refresh dashboard data
      await fetchDashboardData();
    } catch (error) {
      setError('Failed to delete todo');
      console.error('Delete error:', error);
    }
  };

  const filterTodos = (todos) => {
    if (filter === 'pending') return todos.filter(todo => todo.status === 'pending');
    if (filter === 'completed') return todos.filter(todo => todo.status === 'completed');
    return todos;
  };

  const formatTimelineDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const assignedToMe = filterTodos(dashboardData?.assignedToMe || []);
  const assignedByMe = filterTodos(dashboardData?.assignedByMe || []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-blue-100">Here's your productivity overview</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned to Me</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAssigned || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Assigned by Me</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCreated || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingByMe || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics?.stats?.completionRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      {analytics?.timeline && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Recent Activity Timeline
            </h2>
            <button
              onClick={() => setTimelineExpanded(!timelineExpanded)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              {timelineExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
          
          {timelineExpanded && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(analytics.timeline)
                .sort(([a], [b]) => new Date(b) - new Date(a))
                .map(([date, todos]) => (
                  <div key={date} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      {formatTimelineDate(date)}
                    </h3>
                    <div className="space-y-2">
                      {todos.map(todo => (
                        <div key={todo._id} className="text-sm bg-gray-50 p-2 rounded">
                          <span className="font-medium">{todo.title}</span>
                          <span className="text-gray-500 ml-2">
                            - {todo.createdBy._id === user.id ? 'Created' : 'Assigned to you'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Filter:</span>
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'completed'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('assigned-to-me')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'assigned-to-me'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks Assigned to Me ({assignedToMe.length})
            </button>
            <button
              onClick={() => setActiveTab('assigned-by-me')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'assigned-by-me'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks I Assigned ({assignedByMe.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'assigned-to-me' && (
            <div className="space-y-4">
              {assignedToMe.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">No tasks assigned to you yet.</p>
                </div>
              ) : (
                assignedToMe.map(todo => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    showAssignmentInfo={true}
                  />
                ))
              )}
            </div>
          )}

          {activeTab === 'assigned-by-me' && (
            <div className="space-y-4">
              {assignedByMe.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-lg">You haven't assigned any tasks yet.</p>
                </div>
              ) : (
                assignedByMe.map(todo => (
                  <TodoItem
                    key={todo._id}
                    todo={todo}
                    onUpdate={handleUpdateTodo}
                    onDelete={handleDeleteTodo}
                    showAssignmentInfo={true}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;