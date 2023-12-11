import { useState } from "react";
import { Router } from "components/Router";
import { Layout } from "components/Layout";

import { getAuth } from "firebase/auth";
import { app } from "firebaseApp";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const auth = getAuth(app);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!auth?.currentUser
  );

  return (
    <Layout>
      <ToastContainer
        theme="dark"
        autoClose={1000}
        hideProgressBar
        newestOnTop
      />
      <Router />
    </Layout>
  );
}

export default App;
