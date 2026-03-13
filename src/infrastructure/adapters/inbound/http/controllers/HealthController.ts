import { Request, Response } from 'express';
import { version } from '../../../../../../package.json';

export class HealthController {
  health = (_req: Request, res: Response) => res.json({ ok: true, version });
}
