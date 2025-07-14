import { Meeting } from './schemas/meeting.schema';

export interface MeetingWithDateObject extends Meeting {
  dateObject?: Date;
}