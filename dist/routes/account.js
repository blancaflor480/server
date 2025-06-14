"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const account_controller_1 = require("../controllers/account.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, account_controller_1.getAccounts);
router.post('/', auth_1.authenticateToken, account_controller_1.createAccount);
router.put('/:id', auth_1.authenticateToken, account_controller_1.updateAccount);
router.delete('/:id', auth_1.authenticateToken, account_controller_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=account.js.map