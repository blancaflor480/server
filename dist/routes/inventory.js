"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, inventory_controller_1.getInventoryItems);
router.post('/', auth_1.authenticateToken, inventory_controller_1.createInventoryItem);
router.put('/:id', auth_1.authenticateToken, inventory_controller_1.updateInventoryItem);
router.delete('/:id', auth_1.authenticateToken, inventory_controller_1.deleteInventoryItem);
router.get('/validate/model-no/:modelNo', auth_1.authenticateToken, inventory_controller_1.validateModelNo);
router.get('/validate/serial-no/:serialNo', auth_1.authenticateToken, inventory_controller_1.validateSerialNo);
exports.default = router;
//# sourceMappingURL=inventory.js.map