// import express from "express";
// import { loginUser, registerUser } from "../../controller/user/userController.js";

// const userRouter = express.Router();

// userRouter.post("/register", registerUser);
// userRouter.post("/login", loginUser);

// export default userRouter;
import express from "express";
import { loginUser, registerUser , getMe, getAllUser} from "../../controller/user/userController.js";
import { authMiddleware } from "../../middleware/auth.js";
const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/me", authMiddleware, getMe);
userRouter.get("/getAllUser", getAllUser);
export default userRouter;
