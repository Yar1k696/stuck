import React, { createContext, useState, useContext } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [refreshParticipants, setRefreshParticipants] = useState(false);
  const [refreshProjects, setRefreshProjects] = useState(false);

  return (
    <TaskContext.Provider
      value={{
        refreshTasks,
        setRefreshTasks,
        refreshParticipants,
        setRefreshParticipants,
        refreshProjects,
        setRefreshProjects,
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