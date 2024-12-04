import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import connectToDatabase from '../../../dbConnect';
import User from '../../../models/User'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  if (req.method === 'POST') {
    const { fullName, age, gender, location, phone, idNumber, email, password } = req.body;

    try {
      // בדיקה אם המשתמש כבר קיים
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // הצפנת הסיסמה
      const hashedPassword = await bcrypt.hash(password, 10);

      // יצירת משתמש חדש
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

      res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      res.status(500).json({ message: 'Error creating user', error });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
