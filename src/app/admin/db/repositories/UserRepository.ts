import User from '@/models/User';
import { AdminUser } from '../../types/admin';
import { IUserRepository, UserFilters } from '../interfaces/IUserRepository';
import connectToDatabase from '@/utils/dbConnect';

export class UserRepository implements IUserRepository {
  private static instance: UserRepository;

  // Singleton pattern - יעיל לביצועים
  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async getAllUsers(): Promise<AdminUser[]> {
    await connectToDatabase();
    
    // אופטימיזציה: lean() מחזיר plain objects במקום Mongoose documents
    const users = await User.find({})
      .lean()
      .sort({ createdAt: -1 })
      .select({
        _id: 1,
        fullName: 1,
        email: 1,
        role: 1,
        emailVerified: 1,
        isActive: 1,
        authProvider: 1,
        phone: 1,
        isProfileComplete: 1,
        lastLogin: 1,
        createdAt: 1,
        updatedAt: 1,
        age: 1,
        gender: 1,
        location: 1,
        partnerName: 1,
        partnerEmail: 1,
        weddingDate: 1
      });
    
    return users.map(this.transformToAdminUser);
  }

  async getUserById(id: string): Promise<AdminUser | null> {
    await connectToDatabase();
    
    const user = await User.findById(id)
      .lean()
      .select({
        _id: 1,
        fullName: 1,
        email: 1,
        role: 1,
        emailVerified: 1,
        isActive: 1,
        authProvider: 1,
        phone: 1,
        isProfileComplete: 1,
        lastLogin: 1,
        createdAt: 1,
        updatedAt: 1,
        age: 1,
        gender: 1,
        location: 1,
        partnerName: 1,
        partnerEmail: 1,
        weddingDate: 1
      });
    
    return user ? this.transformToAdminUser(user) : null;
  }

  async getUsersByFilter(filters: UserFilters): Promise<AdminUser[]> {
    await connectToDatabase();
    
    const query: any = {};
    
    // בניית query דינמית מהפילטרים
    if (filters.role) query.role = filters.role;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.emailVerified !== undefined) query.emailVerified = filters.emailVerified;
    if (filters.authProvider) query.authProvider = filters.authProvider;
    if (filters.isProfileComplete !== undefined) query.isProfileComplete = filters.isProfileComplete;
    
    if (filters.createdAfter || filters.createdBefore) {
      query.createdAt = {};
      if (filters.createdAfter) query.createdAt.$gte = filters.createdAfter;
      if (filters.createdBefore) query.createdAt.$lte = filters.createdBefore;
    }
    
    const users = await User.find(query)
      .lean()
      .sort({ createdAt: -1 })
      .select({
        _id: 1,
        fullName: 1,
        email: 1,
        role: 1,
        emailVerified: 1,
        isActive: 1,
        authProvider: 1,
        phone: 1,
        isProfileComplete: 1,
        lastLogin: 1,
        createdAt: 1,
        updatedAt: 1,
        age: 1,
        gender: 1,
        location: 1,
        partnerName: 1,
        partnerEmail: 1,
        weddingDate: 1
      });
    
    return users.map(this.transformToAdminUser);
  }

  async searchUsers(query: string): Promise<AdminUser[]> {
    await connectToDatabase();
    
    const searchRegex = new RegExp(query, 'i');
    
    const users = await User.find({
      $or: [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { partnerName: searchRegex },
        { partnerEmail: searchRegex }
      ]
    })
    .lean()
    .sort({ createdAt: -1 })
    .limit(50) // הגבלת תוצאות לביצועים
    .select({
      _id: 1,
      fullName: 1,
      email: 1,
      role: 1,
      emailVerified: 1,
      isActive: 1,
      authProvider: 1,
      phone: 1,
      isProfileComplete: 1,
      lastLogin: 1,
      createdAt: 1,
      updatedAt: 1,
      age: 1,
      gender: 1,
      location: 1,
      partnerName: 1,
      partnerEmail: 1,
      weddingDate: 1
    });
    
    return users.map(this.transformToAdminUser);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<boolean> {
    await connectToDatabase();
    
    const result = await User.findByIdAndUpdate(
      id,
      { isActive, updatedAt: new Date() },
      { new: true }
    );
    
    return !!result;
  }

  async deleteUser(id: string): Promise<boolean> {
    await connectToDatabase();
    
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async bulkDeleteUsers(ids: string[]): Promise<number> {
    await connectToDatabase();
    
    const result = await User.deleteMany({
      _id: { $in: ids }
    });
    
    return result.deletedCount || 0;
  }

  async getUserCount(): Promise<number> {
    await connectToDatabase();
    return await User.countDocuments({});
  }

  async getActiveUserCount(): Promise<number> {
    await connectToDatabase();
    return await User.countDocuments({ isActive: true });
  }

  // Helper method לטרנספורמציה
  private transformToAdminUser(user: any): AdminUser {
    return {
      _id: user._id.toString(),
      fullName: user.fullName || '',
      email: user.email || '',
      role: user.role || 'user',
      emailVerified: user.emailVerified || false,
      isActive: user.isActive !== false,
      authProvider: user.authProvider || 'email',
      phone: user.phone || undefined,
      isProfileComplete: user.isProfileComplete || false,
      lastLogin: user.lastLogin || new Date(),
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      age: user.age || undefined,
      gender: user.gender || undefined,
      location: user.location || undefined,
      partnerName: user.partnerName || undefined,
      partnerEmail: user.partnerEmail || undefined,
      weddingDate: user.weddingDate || undefined
    };
  }
}
