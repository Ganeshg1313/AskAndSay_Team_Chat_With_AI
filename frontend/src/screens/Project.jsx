import React, { useEffect, useState, useContext, useRef } from "react";
import Markdown from "markdown-to-jsx";
import { useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
} from "../config/socket";
import { UserContext } from "../context/user.context.jsx";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { getWebContainer } from "../config/webContainer.js";

// Separate component for code blocks
function CodeBlock({ className, children }) {
  const language = className ? className.replace("lang-", "") : "javascript";
  return (
    <SyntaxHighlighter language={language} style={dracula}>
      {children}
    </SyntaxHighlighter>
  );
}

// Separate component for paragraphs containing code
function CustomParagraph({ children, ...props }) {
  // If the paragraph contains only a CodeBlock, render just the CodeBlock
  if (
    React.Children.count(children) === 1 &&
    React.isValidElement(children) &&
    children.type === CodeBlock
  ) {
    return children;
  }
  return <p {...props}>{children}</p>;
}

const Project = () => {
  const location = useLocation();

  const [isSidePanelOpen, setSidePanelOpen] = useState(false);
  const [projectUsers, setProjectUsers] = useState([]);
  const [isAddUsersModalOpen, setAddUsersModalOpen] = useState(false);
  const [currentlyAddedUsers, setCurrentlyAddedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projectId, setProjectId] = useState(location.state.project._id);
  const [message, setMessage] = useState("");
  const messageBoxRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [runningProcess, setRunningProcess] = useState(null);
  const [dependenciesInstalled, setDependenciesInstalled] = useState(false);
  const [containerState, setContainerState] = useState(null);

  const [iFrameUrl, setIFrameUrl] = useState(null);

  const [logs, setLogs] = useState([]);

  const [screen, setScreen] = useState("code");

  const { user } = useContext(UserContext);

  function getProjectUsers() {
    axios
      .get(`/projects/get-project/${projectId}`)
      .then((res) => {
        setProjectUsers(res.data.project.users);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getAllUsers() {
    axios
      .get("/users/all")
      .then((res) => {
        const allFetchedUsers = res.data.users;
        const nonProjectUsers = allFetchedUsers.filter(
          (user) =>
            !projectUsers.some((projectUser) => projectUser._id === user._id)
        );
        setAllUsers(nonProjectUsers);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getFiles() {
    axios
      .post("/files/get-file", {
        projectId: projectId,
      })
      .then((res) => {
        if (res.data.fileTree) {
          setFileTree(res.data.fileTree);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function createFiles(ft) {
    axios
      .post("/files/create-file", {
        projectId: projectId,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function updateFiles(ft) {
    axios
      .put("/files/update-file", {
        projectId: projectId,
        fileTree: ft,
      })
      .then((res) => {
        console.log("Files updated");
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const deleteFiles = async () => {
    try {
      const res = await axios.post("/files/delete-files", {
        projectId: projectId,
      });
      console.log("Previous files deleted");
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const handleSendMessage = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    });
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]);
    setMessage("");
  };

  function writeAIMessage(message) {
    try {
      const parsedMessageObject = JSON.parse(message);

      let response = parsedMessageObject?.text || "No response text provided.";

      if (parsedMessageObject.buildCommand) {
        response += `\nBuild Command: ${
          parsedMessageObject.buildCommand.mainItem
        } ${parsedMessageObject.buildCommand.commands.join(" ")}\n`;
      }

      if (parsedMessageObject.startCommand) {
        response += `\nStart Command: ${
          parsedMessageObject.startCommand.mainItem
        } ${parsedMessageObject.startCommand.commands.join(" ")}\n`;
      }

      return (
        <Markdown
          options={{
            overrides: {
              code: CodeBlock,
              p: CustomParagraph,
            },
          }}
          className="break-words whitespace-pre-wrap"
        >
          {response}
        </Markdown>
      );
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return (
        <div className="text-red-500">
          Error rendering AI response. Please check the console for details.
        </div>
      );
    }
  }

  useEffect(() => {
    initializeSocket(projectId);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container);
        console.log("Container started");
        setLogs((prevLogs) => [...prevLogs, "Container started"]);
      });
    }

    receiveMessage("project-message", (data) => {
      if (data.sender._id === "ai") {
        const message = JSON.parse(data.message);
        webContainer?.mount(message.fileTree);
        if (message.fileTree) {
          setFileTree(message.fileTree);
          if (deleteFiles()) {
            createFiles(message.fileTree);
          } else {
            console.log("Error deleting files");
          }
        }
      }
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    getAllUsers();
    getProjectUsers();
    getFiles();
  }, []);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  function handleCurrentlyAddedUsers(user) {
    if (currentlyAddedUsers.includes(user)) {
      let users = currentlyAddedUsers.filter((u) => u._id !== user._id);
      setCurrentlyAddedUsers(users);
    } else {
      setCurrentlyAddedUsers((prevUser) => [...prevUser, user]);
    }
  }

  function handleAddUsers() {
    const usersToAdd = currentlyAddedUsers.map((user) => user._id);

    axios
      .put("/projects/add-user", {
        projectId: projectId,
        users: usersToAdd,
      })
      .then((res) => {
        getProjectUsers();
        setCurrentlyAddedUsers([]);
        setAddUsersModalOpen(false);
      })
      .catch((error) => {
        console.error("Error adding users:", error);
      });
  }

  function handleCloseModal() {
    setCurrentlyAddedUsers([]);
    setAddUsersModalOpen(false);
  }

  const handleCodeChange = (value, viewUpdate) => {
    const updatedTree = {
      ...fileTree,
      [currentFile]: {
        file: {
          contents: value,
        },
      },
    };
    setFileTree(updatedTree);
    updateFiles(updatedTree);
  };

  const handleContainer = async () => {
    try {
      if (containerState === null) {
        // Mount the file tree in the container
        console.log("Mounting file tree in WebContainer...");
        await webContainer.mount(fileTree);
        setLogs((prevLogs) => [
          ...prevLogs,
          "Mounted file tree in WebContainer",
        ]);

        // Verify files in the container
        console.log("Verifying files in WebContainer...");
        const verifyProcess = await webContainer.spawn("ls");
        verifyProcess.output.pipeTo(
          new WritableStream({
            write(chunk) {
              console.log(chunk);
            },
          })
        );

        // Run npm install
        console.log("Running npm install...");
        setLogs((prevLogs) => [...prevLogs, "running npm install"]);
        const installProcess = await webContainer.spawn("npm", ["install"]);
        await installProcess.exit;
        setLogs((prevLogs) => [...prevLogs, "npm install complete"]);

        
        // setRunningProcess(runProcess);

        setContainerState("running");
      }
      else if(containerState === "running") {
        
        console.log("Running....")

       //Run npm start
       console.log("Running npm start...");
       setLogs((prevLogs) => [...prevLogs, "running npm start"]);
       const runProcess = await webContainer.spawn("npm", ["start"]);
       runProcess.output.pipeTo(
         new WritableStream({
           write(chunk) {
             console.log(chunk);
           },
         })
       );
       setLogs((prevLogs) => [...prevLogs, "npm start complete"]);

        webContainer.on('server-ready', (port, url) => {
          console.log("Server started at: ", url);
          console.log(port, url)
          setIFrameUrl(url)
          setLogs((prevLogs) => [...prevLogs, "Server started at: " + url]);
      })
      }
      else if(containerState === "stopped") {
        if(runningProcess){
          runningProcess.kill();
          setRunningProcess(null);
        }
      }
      
    } catch (error) {
      console.error("Error: ", error.message);
      setLogs((prevLogs) => [...prevLogs, error.message]);
    }
  };


  useEffect(() => {
    console.log("current: ", currentFile);
    console.log("open: ", openFiles);
  }, [openFiles, currentFile]);

  return (
    <main className="h-screen w-screen flex relative">
      <section className="left relative flex flex-col h-full min-w-96 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100">
          <button
            onClick={() => setAddUsersModalOpen(!isAddUsersModalOpen)}
            className="flex gap-2"
          >
            <i className="ri-user-add-fill"></i>
            Add Collaborater
          </button>
          <button
            onClick={() => setSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area flex flex-col h-full overflow-hidden">
          <div
            ref={messageBoxRef}
            className="message-box p-2 flex-grow flex flex-col gap-2 overflow-y-auto"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message max-w-80 flex flex-col p-2 bg-slate-50 w-fit rounded-md ${
                  message.sender._id === user._id ? "ml-auto" : ""
                } ${
                  message.sender._id === "ai" ? "bg-slate-800 text-white" : ""
                }`}
              >
                <small className="opacity-65 text-xs">
                  {message.sender.email}
                </small>
                {message.sender._id === "ai" ? (
                  writeAIMessage(message.message)
                ) : (
                  <p className="break-words whitespace-pre-wrap text-sm">
                    {message.message}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="inputField w-full flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message"
              className="flex-grow p-2 px-4 border-none outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="px-5 bg-slate-900 text-white"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute top-0 transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="flex justify-end p-4 px-5 bg-slate-200">
            <button
              className="font-bold"
              onClick={() => setSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            {projectUsers?.map((user) => (
              <div
                key={user._id}
                className="user p-2 flex gap-2 item-center cursor-pointer hover:bg-slate-200"
              >
                <div className="w-fit h-fit aspect-square rounded-full flex items-center justify-center p-5 text-white bg-slate-600">
                  <i className="ri-user-fill absolute"></i>
                </div>
                <h1 className="font-semibold text-lg text-black">
                  {user.email}
                </h1>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="right flex flex-grow">
        <div className="explorer h-full max-w-60 min-w-40 bg-slate-100">
          <button
            onClick={handleContainer}
            className="w-full bg-slate-900 text-white p-2 font-semibold"
          >
            Run
          </button>
          <header className="p-2 px-4 bg-slate-600 text-white">
            <h1 className="font-semibold">Explorer</h1>
          </header>
          <div className="fileTree flex flex-col">
            {Object.keys(fileTree).map((file) => (
              <button
                key={file}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className={`file p-2 bg-slate-200 cursor-pointer ${
                  currentFile == file ? "bg-slate-400" : "hover:bg-slate-300"
                }`}
              >
                <h1 className="font-semibold">{file}</h1>
              </button>
            ))}
          </div>
        </div>
        {/* openFiles.length > 0 && */}
          <div className="codeAndPreview flex flex-grow flex-col">
            <div className="selectScreen flex">
              <button
              className="w-max bg-slate-600 text-white p-2 m-1 font-semibold border-r-2 border-slate-300 rounded-3xl"
              onClick={() => setScreen("code")} 
              >
                <h2>Code</h2>
              </button>
              <button
              className="w-max bg-slate-600 text-white p-2 m-1 font-semibold border-r-2 border-slate-300 rounded-3xl"
              onClick={() => setScreen("preview")}
              >
                <h2>Preview</h2>
              </button>
            </div>
            {
              screen === "code" ? (
                <div className="codeEditor flex flex-col flex-grow h-full shrink">
            <div className="top flex w-full">
              {openFiles.map((file) => (
                <div
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className={`codeEditorHeader bg-slate-100 flex items-center p-1 px-2 cursor-pointer hover:bg-slate-300 ${
                    currentFile === file ? "bg-slate-400" : ""
                  }`}
                >
                  <h1 className="font-semibold">{file}</h1>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (openFiles.length === 1) {
                        setCurrentFile(null);
                        setOpenFiles([]);
                        return;
                      }
                      if (setOpenFiles(openFiles.filter((f) => f !== file))) {
                        setCurrentFile(openFiles[0]);
                      }
                    }}
                    className="p-2"
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="main flex flex-grow max-w-full shrink overflow-auto bg-[#1e1e1e]">
              {currentFile && fileTree[currentFile] && (
                <CodeMirror
                  value={fileTree[currentFile].file.contents}
                  height="100%"
                  width="100%"
                  theme={vscodeDark}
                  extensions={[javascript()]}
                  onChange={handleCodeChange}
                  className="h-full w-full"
                />
              )}
            </div>
            <div className="bottom w-full min-h-32 max-h-32 flex flex-col overflow-auto gap-2 p-2 bg-slate-500 border-t-2 border-slate-200">
              {logs.map((log, index) => (
                <li key={index} className="flex items-center gap-2 list-none">
                  <i className="ri-arrow-right-s-line"></i>
                  <p className="text-white">{log}</p>
                </li>
              ))}
            </div>
          </div>
              ) : (
                  <div className="flex flex-col h-full">
                    <div className="address-bar">
                      <input
                        type="text"
                        value={iFrameUrl}
                        onChange={(e) => setIFrameUrl(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <iframe
                      src={iFrameUrl}
                      title="Web Container"
                      className="w-full h-full bg-slate-400"
                    ></iframe>
                  </div>
                )}
              
          </div>
          

        
      </section>
      {isAddUsersModalOpen && (
        <div className="w-1/2 max-h-20 absolute flex items-center rounded-lg justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 shadow-lg">
          <div className="w-full h-full flex flex-col gap-2 bg-slate-50 rounded-lg p-4">
            <header className="w-full flex justify-between">
              <h2 className="text-black font-semibold text-lg">Select Users</h2>
              <i
                onClick={handleCloseModal}
                className="ri-close-fill font-semibold cursor-pointer"
              ></i>
            </header>
            <div className="w-full flex flex-col gap-2">
              {allUsers.map((user) => (
                <li
                  key={user._id}
                  onClick={() => handleCurrentlyAddedUsers(user)}
                  className={`${
                    currentlyAddedUsers.includes(user)
                      ? "bg-green-400"
                      : "bg-slate-200"
                  } p-2 list-none text-lg rounded-sm cursor-pointer hover:font-semibold`}
                >
                  {user.email}
                </li>
              ))}
            </div>
            <button
              onClick={handleAddUsers}
              className="bg-blue-600 text-white text-lg font-semibold p-2 rounded-sm hover:bg-blue-800"
            >
              Add Users
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
