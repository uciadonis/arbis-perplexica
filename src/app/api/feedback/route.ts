import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { feedbacks } from '../../../lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { messageId, feedback, comment } = await req.json();
    const userId = 'unknown-user-id';

    if (!messageId || !feedback) {
      return NextResponse.json(
        { error: 'messageId and feedback are required' },
        { status: 400 },
      );
    }

    // Verificar si ya existe un feedback para este mensaje
    const existingFeedback = await db.query.feedbacks.findFirst({
      where: (f) => eq(f.messageId, messageId),
    });

    if (existingFeedback) {
      // Actualizar el feedback existente
      await db
        .update(feedbacks)
        .set({
          feedback,
          comment,
          createdAt: new Date().toISOString(),
        })
        .where(eq(feedbacks.messageId, messageId))
        .execute();
    } else {
      // Crear un nuevo feedback
      await db
        .insert(feedbacks)
        .values({
          messageId,
          userId,
          feedback,
          comment: comment || null,
          createdAt: new Date().toISOString(),
        })
        .execute();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json(
      { error: 'Failed to save feedback' },
      { status: 500 },
    );
  }
}
