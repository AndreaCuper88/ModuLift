//Hook custom di react
//Mi permette di accedere facilmente al contesto di autenticazione da qualsiasi componente

import {useContext} from "react";
import {AuthContext} from "../context/AuthContext";

//Hook custom per usare facilmente il contesto
const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;