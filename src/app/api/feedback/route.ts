import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { feedbacks } from '../../../lib/db/schema';
import { eq, and } from 'drizzle-orm';

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

    // Verificar si ya existe un feedback para este mensaje y usuario
    const existingFeedback = await db.query.feedbacks.findFirst({
      where: (f) => and(eq(f.messageId, messageId), eq(f.userId, userId)),
    });

    if (existingFeedback) {
      // Si el feedback es el mismo, actualizamos solo el comentario y la fecha
      if (existingFeedback.feedback === feedback) {
        await db
          .update(feedbacks)
          .set({
            comment,
            createdAt: new Date().toISOString(),
          })
          .where(
            and(
              eq(feedbacks.messageId, messageId),
              eq(feedbacks.userId, userId),
            ),
          )
          .execute();
      } else {
        // Si el feedback es diferente, lo eliminamos y creamos uno nuevo
        await db
          .delete(feedbacks)
          .where(
            and(
              eq(feedbacks.messageId, messageId),
              eq(feedbacks.userId, userId),
            ),
          )
          .execute();

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

// API para obtener feedback de un mensaje
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const messageId = url.searchParams.get('messageId');
    const userId = 'unknown-user-id';

    if (!messageId) {
      return NextResponse.json(
        { error: 'messageId is required' },
        { status: 400 },
      );
    }

    const userFeedback = await db.query.feedbacks.findFirst({
      where: (f) => and(eq(f.messageId, messageId), eq(f.userId, userId)),
    });

    return NextResponse.json({ feedback: userFeedback || null });
  } catch (error) {
    console.error('Error getting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to get feedback' },
      { status: 500 },
    );
  }
}
