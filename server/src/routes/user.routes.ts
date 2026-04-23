import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { isAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', userController.getUsers);
router.post('/', isAdmin, userController.createUser);
router.put('/:id', isAdmin, userController.updateUser);
router.delete('/:id', isAdmin, userController.deleteUser);

export default router;
