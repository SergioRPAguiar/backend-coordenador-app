import { UserDocument } from '../schemas/user.schema';

export type User = Omit<UserDocument, 'deleteOne'> & {
  _id: string;
};