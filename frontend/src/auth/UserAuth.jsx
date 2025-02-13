import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context.jsx";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);

  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setLoading(false);
    }

    if (!token) {
      navigate("/login");
    }

    if (!user) {
      navigate("/login");
    }
  }, []);

  if (loading) {
    return( <div className="w-screen min-h-screen bg-purple-950 flex flex-col justify-center items-center text-center">
        <h2 className="text-orange-500 text-5xl"><i className="ri-loader-2-line"></i></h2>
        <h1 className="text-white text-3xl">Loading...</h1>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserAuth;
