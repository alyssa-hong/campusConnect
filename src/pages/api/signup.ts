import { NextApiRequest, NextApiResponse } from 'next';
import connectMongoDB from '../../libs/mongodb';
import User from '../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Parse the request body
      const { firstName, lastName, userName, email, password } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !userName || !email || !password) {
        return res
          .status(400)
          .json({ error: 'All fields (firstName, lastName, userName, email, password) are required.' });
      }

      // Connect to MongoDB
      await connectMongoDB();

      // Check if a user with the provided email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(409)
          .json({ error: 'User already exists. Please use a different email.' });
      }

      // Create and save a new user
      const newUser = new User({ firstName, lastName, userName, email, password });
      await newUser.save();

      return res
        .status(201)
        .json({ message: 'User created successfully.', user: { firstName, lastName, userName, email } });
    } catch (error: any) {
      console.error('Error during user signup:', error);
      return res
        .status(500)
        .json({ error: 'Internal server error.', details: error.message });
    }
  } else {
    // Handle unsupported methods
    return res
      .status(405)
      .json({ error: 'Method not allowed. This endpoint only supports POST requests.' });
  }
}
