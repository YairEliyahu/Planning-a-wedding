import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/server/repositories/UserRepository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const query = searchParams.get('query');
    const id = searchParams.get('id');

    // Parse filters from query params
    const filters: any = {};
    if (searchParams.get('role')) filters.role = searchParams.get('role');
    if (searchParams.get('isActive')) filters.isActive = searchParams.get('isActive') === 'true';
    if (searchParams.get('emailVerified')) filters.emailVerified = searchParams.get('emailVerified') === 'true';
    if (searchParams.get('authProvider')) filters.authProvider = searchParams.get('authProvider');
    if (searchParams.get('isProfileComplete')) filters.isProfileComplete = searchParams.get('isProfileComplete') === 'true';

    const userRepo = UserRepository.getInstance();

    switch (action) {
      case 'search': {
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required for search' }, { status: 400 });
        }
        const searchResults = await userRepo.searchUsers(query);
        return NextResponse.json(searchResults);
      }

      case 'filter': {
        const filteredUsers = await userRepo.getUsersByFilter(filters);
        return NextResponse.json(filteredUsers);
      }

      case 'get-by-id': {
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        const user = await userRepo.getUserById(id);
        return NextResponse.json(user);
      }

      case 'count': {
        const count = await userRepo.getUserCount();
        return NextResponse.json({ count });
      }

      case 'active-count': {
        const activeCount = await userRepo.getActiveUserCount();
        return NextResponse.json({ activeCount });
      }

      default: {
        // Default: get all users or filtered users
        const hasFilters = Object.keys(filters).length > 0;
        const users = hasFilters 
          ? await userRepo.getUsersByFilter(filters) 
          : await userRepo.getAllUsers();
        return NextResponse.json(users);
      }
    }
  } catch (error) {
    console.error('Users Advanced API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const body = await request.json();

    const userRepo = UserRepository.getInstance();

    switch (action) {
      case 'update-status': {
        const { userId, isActive } = body;
        if (!userId || isActive === undefined) {
          return NextResponse.json({ error: 'userId and isActive required' }, { status: 400 });
        }
        const success = await userRepo.updateUserStatus(userId, isActive);
        return NextResponse.json({ success });
      }

      case 'bulk-delete': {
        const { userIds } = body;
        if (!userIds || !Array.isArray(userIds)) {
          return NextResponse.json({ error: 'userIds array required' }, { status: 400 });
        }
        const deletedCount = await userRepo.bulkDeleteUsers(userIds);
        return NextResponse.json({ deletedCount });
      }

      default: {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
      }
    }
  } catch (error) {
    console.error('Users Advanced API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const userRepo = UserRepository.getInstance();
    const success = await userRepo.deleteUser(id);
    
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Delete User API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 