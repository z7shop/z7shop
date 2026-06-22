import { v4 as uuidv4 } from 'uuid';
import { dbRun } from './db';

export async function createNotification(
  userId: string,
  type: string,
  titleFa: string,
  titleEn: string,
  msgFa: string,
  msgEn: string,
  link: string = ''
) {
  const id = uuidv4();
  await dbRun(
    'INSERT INTO notifications (id, user_id, type, title_fa, title_en, message_fa, message_en, link) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    id, userId, type, titleFa, titleEn, msgFa, msgEn, link
  );
}
