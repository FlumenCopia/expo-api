import { Response } from 'express';
import { KPIModel } from '../models/KPI.model';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getAllKPIs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = await KPIModel.find();
    return res.json({ success: true, data: kpis });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateKPI = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { current } = req.body;

    const kpi = await KPIModel.findOneAndUpdate(
      { $or: [{ _id: id }, { kpiId: id }] },
      { current, updatedBy: req.user?.id },
      { new: true }
    );

    if (!kpi) {
      return res.status(404).json({ success: false, message: 'KPI not found' });
    }

    return res.json({ success: true, data: kpi });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
