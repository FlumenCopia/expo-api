import { Response } from 'express';
import { DeliverableModel } from '../models/Deliverable.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getAllDeliverables = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deliverables = await DeliverableModel.find();
    return res.json({ success: true, data: deliverables });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
