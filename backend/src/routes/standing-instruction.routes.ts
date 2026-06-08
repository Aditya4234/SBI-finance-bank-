import { Router } from 'express';
import { standingInstructionController } from '../controllers/standing-instruction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', standingInstructionController.getInstructions.bind(standingInstructionController));
router.post('/', standingInstructionController.createInstruction.bind(standingInstructionController));
router.get('/:id', standingInstructionController.getInstruction.bind(standingInstructionController));
router.put('/:id', standingInstructionController.updateInstruction.bind(standingInstructionController));
router.post('/:id/cancel', standingInstructionController.cancelInstruction.bind(standingInstructionController));
router.post('/:id/pause', standingInstructionController.pauseInstruction.bind(standingInstructionController));
router.post('/:id/resume', standingInstructionController.resumeInstruction.bind(standingInstructionController));

export default router;
