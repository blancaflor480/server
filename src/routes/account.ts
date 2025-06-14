import { Router } from 'express';
import { 
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount
} from '../controllers/account.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getAccounts);
router.post('/', authenticateToken, createAccount);
router.put('/:id', authenticateToken, updateAccount);
router.delete('/:id', authenticateToken, deleteAccount);

export default router;