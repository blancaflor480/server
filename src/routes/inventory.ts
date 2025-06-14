import { Router } from 'express';
import { 
  getInventoryItems, 
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  validateModelNo,
  validateSerialNo
} from '../controllers/inventory.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getInventoryItems);
router.post('/', authenticateToken, createInventoryItem);
router.put('/:id', authenticateToken, updateInventoryItem);
router.delete('/:id', authenticateToken, deleteInventoryItem);
router.get('/validate/model-no/:modelNo', authenticateToken, validateModelNo);
router.get('/validate/serial-no/:serialNo', authenticateToken, validateSerialNo);

export default router;