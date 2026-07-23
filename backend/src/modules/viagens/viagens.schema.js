import { z } from 'zod';
import { uuidParam } from '../../shared/schemas.js';

export const viagemIdParamsSchema = z.object({
    viagemId: uuidParam,
});
