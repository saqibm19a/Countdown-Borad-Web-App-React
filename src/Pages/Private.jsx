import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import './Private.css'; 
import { Draggable, Droppable, DragDropContext } from 'react-beautiful-dnd';

function Private() {
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    complete: []
  });
  const [newTask, setNewTask] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("todo");

  const handleSignout = () => {
    signOut(auth)
      .then(() => alert("Signed out Successfully!"))
      .catch(error => {
        console.log(error);
        alert(error.message);
      });
  };

  const handleAddTask = () => {
    if (newTask.trim() !== "") {
      setTasks(prevTasks => ({
        ...prevTasks,
        [selectedStatus]: [...prevTasks[selectedStatus], { id: Date.now().toString(), content: newTask }]
      }));
      setNewTask(""); 
    }
  };

  const handleDeleteTask = (columnId, taskId) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [columnId]: prevTasks[columnId].filter(task => task.id !== taskId)
    }));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;

    if (sourceColumn === destColumn) {
      const updatedTasks = Array.from(tasks[sourceColumn]);
      const [movedTask] = updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, movedTask);

      setTasks(prevTasks => ({
        ...prevTasks,
        [sourceColumn]: updatedTasks
      }));
    } else {
      const sourceTasks = Array.from(tasks[sourceColumn]);
      const [movedTask] = sourceTasks.splice(source.index, 1);

      const destTasks = Array.from(tasks[destColumn]);
      destTasks.splice(destination.index, 0, movedTask);

      setTasks(prevTasks => ({
        ...prevTasks,
        [sourceColumn]: sourceTasks,
        [destColumn]: destTasks
      }));
    }
  };

  return (
    <div className="private-container">
      {/* Navbar */}
      <div className="navbar">
        <h2>Project Board</h2>
        <div className="navbar-links">
          <div className="add-task">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add new task"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="complete">Complete</option>
            </select>
            <button onClick={handleAddTask}>Add Task</button>
          </div>
          <button className="signout-button" onClick={handleSignout}>Signout</button>
        </div>
      </div>

      {/* Columns Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="columns-container">
          {Object.keys(tasks).map((columnId) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="column"
                >
                  <h3>{columnId.replace(/([A-Z])/g, ' $1').trim()}</h3>
                  <div className="task-list">
                    {tasks[columnId].map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-item"
                          >
                            <span>{task.content}</span>
                            <button
                              className="delete-button"
                              onClick={() => handleDeleteTask(columnId, task.id)}
                            >
                              &times;
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Private;
