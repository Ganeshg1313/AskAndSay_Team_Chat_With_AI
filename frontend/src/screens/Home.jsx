import React, { useEffect, useState } from "react";
import axios from "../config/axios.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  const getAllProjects = () => {
    axios
      .get("/projects/all")
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
      });
  };

  const createProject = (e) => {
    e.preventDefault();

    axios
      .post("/projects/create", { name: projectName })
      .then((res) => {
        setProjectName("");
        setIsModalOpen(false);
        getAllProjects();
      })
      .catch((error) => {
        console.error("Error creating project:", error);
      });
  };

  const handleDeleteProject = async (event, id) => {
    event.stopPropagation();

    try {
      await axios.put("/projects/delete-project", { projectId: id });
      await axios.post("/files/delete-files", { projectId: id });
      await axios.post("/notes/delete-note", { projectId: id });
      getAllProjects();
    } catch (error) {
      if (error?.response?.status === 404) {
        console.log("Note not available");
      } else {
        console.error("Error deleting project and files:", error);
      }
    }
  };

  useEffect(() => {
    getAllProjects();
  }, []);

  return (
    <main className="w-full h-screen min-h-min bg-slate-900">
      <div className="header flex py-2 px-6 justify-between items-center">
        <div className="company-info flex items-center max-h-max p-2">
          <img src="/logo.png" alt="logo" className="w-11" />
        </div>
        <div className="tab">
          <span
            onClick={() => navigate("/about")}
            className="text-white font-semibold hover:underline cursor-pointer"
          >
            About
          </span>
        </div>
        <div className="logout">
          <button
            className="text-white bg-purple-600 p-2 px-4 rounded-md font-bold hover:bg-purple-800"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="projects flex flex-col items-center flex-wrap gap-3 pb-6">
        <div className="create-project w-1/2">
          <button
            className="project p-4 bg-orange-600 text-white font-semibold rounded-md hover:shadow-sm hover:shadow-zinc-200"
            onClick={() => setIsModalOpen(true)}
          >
            New Project
            <i className="ri-link ml-2"></i>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="text-white mt-6">No projects found.</div>
        ) : (
          projects.map((project) => (
            <div
              key={project._id}
              onClick={() =>
                navigate(`/project/`, {
                  state: { project },
                })
              }
              className="project w-1/2 bg-slate-200 flex justify-between p-4 px-6 mx-4 border rounded-md border-slate-300 cursor-pointer hover:bg-purple-400"
            >
              <h2 className="font-semibold text-lg">{project.name}</h2>

              <div className="flex gap-2 items-center">
                <i className="ri-user-line"></i>
                <p className="text-md font-semibold">Collaborators:</p>
                <p className="text-sm font-bold">{project.users.length}</p>
              </div>

              <button onClick={(e) => handleDeleteProject(e, project._id)}>
                <i className="ri-delete-bin-6-fill"></i>
              </button>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-slate-50 p-6 rounded-md shadow-md w-1/3">
            <h2 className="text-xl mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Project Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-900"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
