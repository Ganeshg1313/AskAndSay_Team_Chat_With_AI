{/* <textarea
                className="theme w-full h-full p-2 outline-none"
                value={fileTree[currentFile].file.contents}
                onChange={(e) =>
                  setFileTree({
                    ...fileTree,
                    [currentFile]: {
                      ...fileTree[currentFile],
                      file: {
                        ...fileTree[currentFile].file,
                        contents: e.target.value,
                      },
                    },
                  })
                }
              /> */}

```
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
import hljs from "highlight.js";

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);

      // hljs won't reprocess the element unless this attribute is removed
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
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

        // Filter out users already in the project
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

  const handleSendMessage = () => {
    sendMessage("project-message", {
      message,
      sender: user,
    });
    // appendOutgoingMessage(message);
    setMessages((prevMessages) => [...prevMessages, { sender: user, message }]);
    setMessage("");
  };

  function writeAIMessage(message) {
    console.log(message);
    const parsedMessageObject = JSON.parse(message);
    console.log(parsedMessageObject);

    return (
      <Markdown
        options={MarkdownOptions}
        className="break-words whitespace-pre-wrap"
      >
        {parsedMessageObject.text}
      </Markdown>
    );
  }

  useEffect(() => {
    console.log(user);
    initializeSocket(projectId);

    receiveMessage("project-message", (data) => {
      console.log(data.message);
      const message = JSON.parse(data.message);
      if (message.fileTree) {
        console.log(fileTree);
        setFileTree(message.fileTree);
      }
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    getAllUsers();
    getProjectUsers();
  }, []);

  useEffect(() => {
    if (messageBoxRef.current) {
      messageBoxRef.current.scrollTop = messageBoxRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Apply syntax highlighting after the component renders
    hljs.highlightAll();
  }, [fileTree, currentFile]);

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
        console.log(res);
        getProjectUsers();
        setCurrentlyAddedUsers([]);
        setAddUsersModalOpen(false);
      })
      .catch((error) => {
        console.error("Error adding users:", error);
      });
  }

  const MarkdownOptions = {
    overrides: {
      code: {
        component: ({ className, children }) => {
          const language = className?.replace("lang-", "") || "javascript";
          return (
            <SyntaxHighlighter language={language} style={dracula}>
              {children}
            </SyntaxHighlighter>
          );
        },
      },
    },
  };

  function handleCloseModal() {
    setCurrentlyAddedUsers([]);
    setAddUsersModalOpen(false);
  }

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
      <section className="right bg-red-300 flex flex-grow">
        <div className="explorer h-full max-w-60 min-w-40 bg-slate-100">
          <div className="fileTree flex flex-col">
            {Object.keys(fileTree).map((file) => (
              <button
                key={file}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="file p-2 bg-slate-200 cursor-pointer hover:bg-slate-300"
              >
                <h1 className="font-semibold">{file}</h1>
              </button>
            ))}
          </div>
        </div>

        {openFiles.length > 0 && (
          <div className="codeEditor flex flex-col flex-grow h-full shrink">
            <div className="top flex w-full">
              {openFiles.map((file) => (
                <div
                  key={file}
                  onClick={() => setCurrentFile(file)}
                  className="codeEditorHeader bg-slate-100 flex items-center p-1 px-2 cursor-pointer hover:bg-slate-200"
                >
                  <h1 className="font-semibold">{file}</h1>
                  <button
                    onClick={() => {
                      if (openFiles.length === 1) {
                        setCurrentFile(null);
                        setOpenFiles([]);
                        return;
                      }
                      setCurrentFile(openFiles[0]);
                      setOpenFiles(openFiles.filter((f) => f !== file));
                    }}
                    className="p-2"
                  >
                    <i className="ri-close-fill"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="main flex flex-grow max-w-full shrink overflow-auto">
              <pre className="hljs h-full w-full">
                <code
                  className="hljs h-full outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const updatedContent = e.target.innerText;
                    const updatedTree = {
                      ...fileTree,
                      [currentFile]: {
                        file: {
                          contents: updatedContent,
                        },
                      },
                    };
                    setFileTree(updatedTree);
                  }}
                  dangerouslySetInnerHTML={{ __html: hljs.highlight('javascript', fileTree[ currentFile ].file.contents).value }}
                  style={{
                    whiteSpace: "pre-wrap",
                    padding: "1rem",
                    lineHeight: "1.5",
                    overflow: "auto",
                  }}
                />
              </pre>
            </div>
          </div>
        )}
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

```