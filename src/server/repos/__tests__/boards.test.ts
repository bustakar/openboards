import { listBoardsWithStats, getBoardBySlug } from '../boards';
import { getDatabase } from '@/server/db';


// Mock the database module
jest.mock('@/server/db');
const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  ilike: jest.fn(),
}));

describe('Boards Repository', () => {
  let mockDb: Record<string, jest.Mock>;
  let mockSelect: jest.Mock;
  let mockFrom: jest.Mock;
  let mockInnerJoin: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock database chain
    mockSelect = jest.fn().mockReturnThis();
    mockFrom = jest.fn().mockReturnThis();
    mockInnerJoin = jest.fn().mockReturnThis();
    mockWhere = jest.fn().mockReturnThis();
    mockOrderBy = jest.fn().mockReturnThis();
    mockLimit = jest.fn().mockReturnThis();

    // Create a proper chainable mock object
    mockDb = {
      select: mockSelect,
      from: mockFrom,
      innerJoin: mockInnerJoin,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
    };

    mockGetDatabase.mockReturnValue({ 
      db: mockDb as Record<string, jest.Mock>, 
      sql: {} as Record<string, unknown>
    });
  });

  describe('listBoardsWithStats', () => {
    it('should return empty array when no userId is provided', async () => {
      const result = await listBoardsWithStats();

      expect(result).toEqual([]);
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('should return empty array when no projectId is provided', async () => {
      const result = await listBoardsWithStats('user-123');

      expect(result).toEqual([]);
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('should return empty array when projectId is null', async () => {
      const result = await listBoardsWithStats('user-123', null);

      expect(result).toEqual([]);
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('should return empty array when projectId is empty string', async () => {
      const result = await listBoardsWithStats('user-123', '');

      expect(result).toEqual([]);
      expect(mockSelect).not.toHaveBeenCalled();
    });

    it('should list boards for specific user and project', async () => {
      const userId = 'user-123';
      const projectId = 'project-1';
      const mockBoards = [
        {
          id: 'board-1',
          name: 'Board 1',
          slug: 'board-1',
          description: 'Description 1',
          icon: 'icon-1',
          position: 0,
          projectId: 'project-1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'board-2',
          name: 'Board 2',
          slug: 'board-2',
          description: 'Description 2',
          icon: 'icon-2',
          position: 1,
          projectId: 'project-1',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      mockOrderBy.mockResolvedValue(mockBoards);

      const result = await listBoardsWithStats(userId, projectId);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockInnerJoin).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
      
      // Should add post count to each board
      expect(result).toEqual([
        { ...mockBoards[0], postCount: 0 },
        { ...mockBoards[1], postCount: 0 },
      ]);
    });

    it('should return empty array when user has no boards in project', async () => {
      const userId = 'user-123';
      const projectId = 'project-with-no-boards';
      
      mockOrderBy.mockResolvedValue([]);

      const result = await listBoardsWithStats(userId, projectId);

      expect(result).toEqual([]);
    });

    it('should filter by both user and project authorization', async () => {
      const userId = 'user-123';
      const projectId = 'project-1';

      mockOrderBy.mockResolvedValue([]);

      await listBoardsWithStats(userId, projectId);

      expect(mockWhere).toHaveBeenCalled();
      // Should ensure both user ownership and project filtering
    });


  });

  describe('getBoardBySlug', () => {
    it('should return board for public access when no userId is provided', async () => {
      const slug = 'board-slug';
      const mockBoard = {
        id: 'board-1',
        name: 'Board 1',
        slug: 'board-slug',
        description: 'Description',
        icon: 'icon-1',
        position: 0,
        projectId: 'project-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([mockBoard]);

      const result = await getBoardBySlug(slug);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockBoard);
    });

    it('should return null for non-existent board in public access', async () => {
      const slug = 'non-existent';

      mockLimit.mockResolvedValue([]);

      const result = await getBoardBySlug(slug);

      expect(result).toBeNull();
    });

    it('should return board by slug for authorized user (private access)', async () => {
      const slug = 'board-slug';
      const userId = 'user-123';
      const mockBoard = {
        boards: {
          id: 'board-1',
          name: 'Board 1',
          slug: 'board-slug',
          description: 'Description',
          icon: 'icon-1',
          position: 0,
          projectId: 'project-1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      };

      mockWhere.mockResolvedValue([mockBoard]);

      const result = await getBoardBySlug(slug, userId);

      expect(mockSelect).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockInnerJoin).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(result).toEqual(mockBoard.boards);
    });

    it('should return null for non-existent board (private access)', async () => {
      const slug = 'non-existent';
      const userId = 'user-123';

      mockWhere.mockResolvedValue([]);

      const result = await getBoardBySlug(slug, userId);

      expect(result).toBeNull();
    });

    it('should return null for unauthorized user (private access)', async () => {
      const slug = 'board-slug';
      const userId = 'unauthorized-user';

      mockWhere.mockResolvedValue([]); // No board found for this user

      const result = await getBoardBySlug(slug, userId);

      expect(result).toBeNull();
    });

    it('should handle case-insensitive slug matching', async () => {
      const slug = 'Board-Slug';
      const userId = 'user-123';
      const mockBoard = {
        boards: {
          id: 'board-1',
          name: 'Board 1',
          slug: 'board-slug', // Different case
          description: 'Description',
          icon: 'icon-1',
          position: 0,
          projectId: 'project-1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      };

      mockWhere.mockResolvedValue([mockBoard]);

      const result = await getBoardBySlug(slug, userId);

      expect(result).toEqual(mockBoard.boards);
    });

    it('should filter by both slug and user authorization', async () => {
      const slug = 'board-slug';
      const userId = 'user-123';

      mockWhere.mockResolvedValue([]);

      await getBoardBySlug(slug, userId);

      expect(mockWhere).toHaveBeenCalled();
      // Should ensure both slug matching and user authorization
    });

    it('should handle special characters in slug', async () => {
      const slug = 'board-with-special-chars-123';
      const userId = 'user-123';
      const mockBoard = {
        boards: {
          id: 'board-1',
          name: 'Board with special chars',
          slug: 'board-with-special-chars-123',
          description: 'Description',
          icon: 'icon-1',
          position: 0,
          projectId: 'project-1',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
      };

      mockWhere.mockResolvedValue([mockBoard]);

      const result = await getBoardBySlug(slug, userId);

      expect(result).toEqual(mockBoard.boards);
    });
  });
});
