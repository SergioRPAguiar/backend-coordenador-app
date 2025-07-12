import { User } from '../../../user/types/user.types';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        username: string;
        professor: boolean;
      };
    }
  }
}