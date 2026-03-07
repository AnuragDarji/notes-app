import dbConnect from "@/lib/db";
import Note from "@/models/Note";
import { NextRequest, NextResponse } from "next/server";

interface NoteBody {
  title: string;
  content: string;
}

export async function GET() {
  try {
    await dbConnect();
    const notes = await Note.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: notes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body: NoteBody = await request.json();
    const note = await Note.create(body);

    return NextResponse.json({ success: true, data: note }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
