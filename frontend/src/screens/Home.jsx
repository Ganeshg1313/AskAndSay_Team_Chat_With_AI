import React, { useEffect, useState } from "react";
import axios from "../config/axios.js";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const [isModalOpan, setIsModelOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);

  function createProject(e) {
    e.preventDefault();
    console.log({ projectName });

    axios
      .post("/projects/create", {
        name: projectName,
      })
      .then((res) => {
        console.log(res);
        setIsModelOpen(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  useEffect(() => {
    axios
      .get("/projects/all")
      .then((res) => {
        setProjects(res.data.projects);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [projects]);

  return (
    <main className="p-4">
      <div className="projects flex flex-wrap gap-3">
        <button
          className="project p-4 border border-slate-300 rounded-md"
          onClick={() => setIsModelOpen(true)}
        >
          New Project
          <i className="ri-link ml-2"></i>
        </button>

        {projects.map((project) => (
          <div
            key={project._id}
            onClick={() =>
              navigate(`/project/`, {
                state: { project },
              })
            }
            className="project min-w-36 flex flex-col gap-2 p-4 border rounded-md border-slate-300 cursor-pointer hover:bg-slate-200"
          >
            <h2 className="font-semibold">{project.name}</h2>

            <div className="flex gap-2">
              <i className="ri-user-line"></i>
              <p className="text-sm">Collaboraters: </p>
              <p className="text-sm font-bold">{project.users.length}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpan && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3">
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
                ></input>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
                  onClick={() => setIsModelOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
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
