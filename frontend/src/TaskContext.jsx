import React, { createContext, useState, useContext } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [executors, setExecutors] = useState([]);
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [refreshParticipants, setRefreshParticipants] = useState(false);
  const [refreshProjects, setRefreshProjects] = useState(false);
  const [refreshAvatar, setRefreshAvatar] = useState(false);
  const [taskAction, setTaskAction] = useState({ type: null, taskId: null, assignedTo: null }); // Для отслеживания действий

  return (
    <TaskContext.Provider
      value={{
        tasks,
        setTasks,
        executors,
        setExecutors,
        refreshTasks,
        setRefreshTasks,
        refreshParticipants,
        setRefreshParticipants,
        refreshProjects,
        setRefreshProjects,
        refreshAvatar,
        setRefreshAvatar,
        taskAction,
        setTaskAction,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};