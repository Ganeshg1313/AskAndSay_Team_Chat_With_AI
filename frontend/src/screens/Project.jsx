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
  const [isRemoveUsersModalOpen, setRemoveUsersModalOpen] = useState(false);
  const [isHandleUsersModalOpen, setHandleUsersModalOpen] = useState(false);
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
  const [containerState, setContainerState] = useState(null);

  const [iFrameUrl, setIFrameUrl] = useState(null);

  const [logs, setLogs] = useState([]);

  const [screen, setScreen] = useState("code");

  const [notes, setNotes] = useState("");

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
        if (res.data?.fileTree) {
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

  function fetchNotes(){
    axios.post("notes/get-note/",{
      projectId: projectId
    })
    .then((res) => {
      setNotes(res.data.content);
    })
    .catch((error)=>{
      createNotes();
      console.log(error);
    })
  }

 function createNotes(){
   axios.post("notes/create-note",{
      projectId: projectId,
      content: notes,
   })
   .then((res) => {
      console.log(res);
   })
   .catch((error) => {
    console.log(error);
   })
 }

 function updateNotes(text){
  axios.put("notes/update-note",{
    projectId: projectId,
    content: text,
  })
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  })
 } 

 function deleteNotes(){
  axios.post("notes/delete-note",{
    projectId: projectId
  })
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  })
 }

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
        setLogs((prevLogs) => [...prevLogs, "Web container started"]);
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

    getProjectUsers();
    getFiles();
    fetchNotes();
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
  function handleRemoveUser() {
    const usersToRemove = currentlyAddedUsers.map((user) => user._id);

    axios
      .put("/projects/remove-user", {
        projectId: projectId,
        users: usersToRemove,
      })
      .then((res) => {
        getProjectUsers();
        getAllUsers();
        setCurrentlyAddedUsers([]);
        setAddUsersModalOpen(false);
      })
      .catch((error) => {
        console.error("Error adding users:", error);
      });
  }

  function handleCloseModal() {
    setCurrentlyAddedUsers([]);
    setHandleUsersModalOpen(false);
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

        //setRunningProcess(runProcess);

        setContainerState("installed");
      } else if (containerState === "installed") {
        console.log("Running....");

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
        
        setRunningProcess(runProcess);
        webContainer.on("server-ready", (port, url) => {
          console.log("Server started at: ", url);
          console.log(port, url);
          setIFrameUrl(url);
          setLogs((prevLogs) => [...prevLogs, "Server started at: " + url]);
        });
        setContainerState("running");
      }
    } catch (error) {
      console.error("Error: ", error.message);
      setLogs((prevLogs) => [...prevLogs, error.message]);
    }
  };

  const stopContainer = () => {
    if (runningProcess) {
      console.log(runningProcess)
      runningProcess.kill();
      setRunningProcess(null);
      setContainerState(null);
      setIFrameUrl(null);
      setLogs((prevLogs) => [...prevLogs, "Server stopped running!"]);
    }
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const saveNotes = (text) => {
    updateNotes(text);
  }

  return (
    <main className="h-screen w-screen flex relative">
      <section className="left relative flex flex-col h-full min-w-96 bg-slate-900">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-600 text-white">
          <button
            onClick={() => {
              getAllUsers();
              setHandleUsersModalOpen(!isHandleUsersModalOpen);
            }}
            className="flex gap-2"
          >
            <i className="ri-settings-3-fill"></i>
          </button>
          <h1 className="font-semibold text-lg">{user.email}</h1>
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
                className={`message max-w-80 flex flex-col p-2 bg-slate-200 w-fit rounded-md ${
                  message.sender._id === user._id ? "ml-auto" : ""
                } ${
                  message.sender._id === "ai" ? "bg-slate-600 text-white" : ""
                }`}
              >
                <h1
                  className={`${
                    message.sender.email === "AI"
                      ? "text-md"
                      : "opacity-65 text-xs"
                  }`}
                >
                  {message.sender.email === "AI" ? (
                    <i className="ri-robot-2-fill"></i>
                  ) : (
                    message.sender.email
                  )}
                </h1>
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
              className="px-5 bg-orange-600 text-white"
            >
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-700 absolute top-0 transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <header className="flex justify-end p-4 px-5 bg-slate-400">
            <button
              className="font-bold"
              onClick={() => setSidePanelOpen(!isSidePanelOpen)}
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>

          <div className="users flex flex-col gap-2">
            <h1 className="font-semibold text-xl mx-2 text-white">
              Project Users :{" "}
            </h1>
            {projectUsers?.map((user) => (
              <div
                key={user._id}
                className="user p-2 flex gap-2 item-center cursor-pointer hover:bg-slate-900"
              >
                <div className="w-fit h-fit aspect-square rounded-full flex items-center justify-center p-5 text-white bg-slate-600">
                  <i className="ri-user-fill absolute"></i>
                </div>
                <h1 className="font-semibold flex items-center text-lg text-white">
                  {user.email}
                </h1>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="right flex flex-grow overflow-x-hidden h-full">
        <div className="explorer h-full max-w-60 min-w-40 bg-slate-100">
          <header className="p-2 px-4 bg-purple-600 text-white">
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
                  currentFile === file ? "bg-slate-400" : "hover:bg-slate-300"
                }`}
              >
                <h1 className="font-semibold">{file}</h1>
              </button>
            ))}
          </div>
        </div>

        {/* Code and Preview Section */}
        <div className="codeAndPreview flex flex-grow flex-col">
          <div className="right-top bg-slate-800 w-full max-h-max flex justify-between">
            <div className="selectScreen mx-1 flex">
              <button
                className={`max-w-max text-white px-2 m-2 font-semibold rounded-lg ${
                  screen === "code"
                    ? "bg-slate-400"
                    : "border-2 border-slate-500 hover:bg-slate-600"
                }`}
                onClick={() => setScreen("code")}
              >
                Code
              </button>
              <button
                className={`w-max text-white px-2 m-2 font-semibold rounded-lg ${
                  screen === "preview"
                    ? "bg-slate-400"
                    : "border-2 border-slate-500 hover:bg-slate-600"
                }`}
                onClick={() => setScreen("preview")}
              >
                Preview
              </button>
            </div>
            <div className="notes flex justify-center items-center h-full">
            <button
                className={`max-w-max max-h-max text-white py-1 px-2 m-2 font-semibold rounded-lg ${
                  screen === "notes"
                    ? "bg-slate-400"
                    : "border-2 border-slate-500 hover:bg-slate-600"
                }`}
                onClick={() => {
                  setScreen("notes")
                  fetchNotes();
                }}
              >
                <i className="ri-sticky-note-add-fill"></i> Notes
              </button>
            </div>
            <div className="operating-buttons flex justify-end mr-3">
              <button
                onClick={handleContainer}
                className={`max-w-max border-2 border-slate-400 rounded-lg m-2 text-white p-1 px-3 font-semibold hover:bg-slate-600 ${
                  containerState === "running"
                    ? "cursor-not-allowed disabled"
                    : ""
                }`}
              >
                {containerState === "installed" ? "RUN" : "START"}
              </button>
              <button
                onClick={stopContainer}
                className={`max-w-max border-2 border-slate-400 rounded-lg m-2 text-white p-1 px-3 font-semibold hover:bg-slate-600 ${
                  containerState !== "running"
                    ? "cursor-not-allowed disabled"
                    : ""
                }`}
              >
                STOP
              </button>
            </div>
          </div>
          {
            screen === "notes" &&
              <div className="flex flex-col flex-grow overflow-scroll bg-slate-400">
                <div className="header w-full flex justify-center gap-4 p-1 max-h-max bg-slate-600">
                  <button
                  onClick={() => saveNotes(notes)}
                  className="save-note max-w-max text-2xl text-slate-300 hover:text-purple-500"
                  >
                    <i className="ri-save-fill"></i>
                  </button>
                  <button
                  onClick={() => setNotes("")}
                  className="delete-note max-w-max text-2xl text-slate-300 hover:text-red-400"
                  >
                    <i className="ri-delete-bin-6-line"></i>
                  </button>
                </div>
                <textarea 
                className="w-full h-full bg-slate-300 p-1 outline-none"
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value)
                }}
                name="note" id="note"></textarea>
              </div>
          }
          {screen === "code" &&
            <div className="codeEditor flex flex-col flex-grow overflow-hidden">
              <div className="top flex w-full bg-slate-500">
                {openFiles.map((file) => (
                  <div
                    key={file}
                    onClick={() => setCurrentFile(file)}
                    className={`codeEditorHeader bg-slate-300 flex items-center p-1 px-2 cursor-pointer hover:bg-slate-300 ${
                      currentFile === file ? "bg-slate-50" : ""
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
              <div className="main flex flex-grow overflow-auto bg-[#1e1e1e]">
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
              <div
                className="bottom w-full flex h-44 flex-col gap-1 bg-slate-950 border-t-2 border-slate-400 relative"
                
              >
                <div className="bottom-top p-1 px-2 w-full flex justify-between bg-slate-700">
                  <h2 className="text-white">Console</h2>
                  <button
                    onClick={handleClearLogs}
                    className="clear-logs max-w-max text-white shadow-lg"
                  >
                    <i className="ri-delete-bin-6-line"></i>
                  </button>
                </div>
                <div className="w-full h-full overflow-y-scroll">
                  {logs.map((log, index) => (
                    <li
                      key={index}
                      className="flex px-2 items-center gap-2 list-none"
                    >
                      <p className="text-white">{`${user.email}> ${log}`}</p>
                    </li>
                  ))}
                </div>
              </div>
            </div>
          }
          {
            screen === "preview" &&
              <div className="flex flex-col h-full border-2 border-slate-300">
              <div className="address-bar">
                <input
                  type="text"
                  value={iFrameUrl}
                  onChange={(e) => setIFrameUrl(e.target.value)}
                  className="w-full p-2 border border-slate-500 bg-slate-300 rounded-md"
                />
              </div>
              <iframe
                src={iFrameUrl}
                allow="cross-origin-isolated"
                title="Web Container"
                className="w-full h-full bg-slate-100"
              ></iframe>
            </div>
          }
        </div>
      </section>

      {isHandleUsersModalOpen && (
        <div className="w-1/2 max-h-20 absolute flex items-center rounded-lg justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full flex flex-col gap-2 bg-slate-200 rounded-lg p-4 shadow-slate-800 shadow-xl">
            <header className="w-full flex justify-between">
              <h2 className="text-black font-semibold text-lg">SELECT</h2>
              <i
                onClick={handleCloseModal}
                className="ri-close-fill font-semibold cursor-pointer"
              ></i>
            </header>
            <div className="select-add-or-remove mb-3 w-full flex justify-center gap-7">
              <button
                onClick={() => {
                  setRemoveUsersModalOpen(false);
                  setAddUsersModalOpen(!isAddUsersModalOpen);
                  setCurrentlyAddedUsers([]);
                }}
                className={`${
                  isAddUsersModalOpen ? "bg-slate-600" : "bg-slate-400"
                } min-w-32 flex flex-col items-center text-white text-lg font-semibold p-2 rounded-sm hover:bg-slate-700`}
              >
                <i className ="ri-user-add-fill"></i>
                <p>Add Users</p>
              </button>
              <button
                onClick={() => {
                  setAddUsersModalOpen(false);
                  setRemoveUsersModalOpen(!isRemoveUsersModalOpen);
                  setCurrentlyAddedUsers([]);
                }}
                className={`${
                  isRemoveUsersModalOpen ? "bg-slate-600" : "bg-slate-400"
                } min-w-32  flex flex-col items-center text-white text-lg font-semibold p-2 rounded-sm hover:bg-slate-700`}
              >
                <i className="ri-user-minus-fill"></i>
                <p>Remove Users</p>
              </button>
            </div>
            {isAddUsersModalOpen && (
              <div className="w-full flex flex-col gap-2">
                {allUsers.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleCurrentlyAddedUsers(user)}
                    className={` rounded-xl ${
                      currentlyAddedUsers.includes(user)
                        ? "bg-green-400"
                        : "bg-slate-300"
                    } p-2 list-none text-lg rounded-sm cursor-pointer hover:font-semibold`}
                  >
                    {user.email}
                  </li>
                ))}
                <button
                  onClick={handleAddUsers}
                  className="bg-blue-600 text-white text-lg font-semibold p-2 rounded-sm hover:bg-blue-800 mt-2"
                >
                  Add Users
                </button>
              </div>
            )}
            {isRemoveUsersModalOpen && (
              <div className="w-full flex flex-col gap-2">
                {projectUsers.map((user) => (
                  <li
                    key={user._id}
                    onClick={() => handleCurrentlyAddedUsers(user)}
                    className={` rounded-xl ${
                      currentlyAddedUsers.includes(user)
                        ? "bg-red-400"
                        : "bg-slate-300"
                    } p-2 list-none text-lg rounded-sm cursor-pointer hover:font-semibold`}
                  >
                    {user.email}
                  </li>
                ))}
                <button
                  onClick={handleRemoveUser}
                  className="bg-blue-600 text-white text-lg font-semibold p-2 rounded-sm hover:bg-blue-800 mt-2"
                >
                  Remove Users
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;
