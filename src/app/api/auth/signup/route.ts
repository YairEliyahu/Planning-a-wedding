import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../../../dbConnect';
import User from '../../../../../models/User';

export async function POST(req: Request) {
  await connectToDatabase();

  const { fullName, age, gender, location, phone, idNumber, email, password } = await req.json();

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      age,
      gender,
      location,
      phone,
      idNumber,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error creating user', error }, { status: 500 });
  }
}
