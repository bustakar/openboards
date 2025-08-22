import { posts } from '@/db/schema';
import { getDatabase } from '@/server/db';
import {
  archivePost,
  createPost,
  getPostBySlug,
  listPosts,
  pinPost,
} from '../posts';

// Mock the database module
jest.mock('@/server/db');
const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  desc: jest.fn(),
  sql: jest.fn(),
}));

describe('Posts Repository', () => {
  let mockDb: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock functions for the database chain
    const mockSelect = jest.fn();
    const mockFrom = jest.fn();
    const mockInnerJoin = jest.fn();
    const mockWhere = jest.fn();
    const mockOrderBy = jest.fn();
    const mockLimit = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockValues = jest.fn();
    const mockReturning = jest.fn();
    const mockSet = jest.fn();

    // Set up the main database object
    mockDb = {
      select: mockSelect,
      from: mockFrom,
      innerJoin: mockInnerJoin,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      insert: mockInsert,
      update: mockUpdate,
    };

    // Set up the select chain for different query patterns
    mockSelect.mockReturnValue({
      from: mockFrom,
    });

    mockFrom.mockReturnValue({
      innerJoin: mockInnerJoin,
      where: mockWhere,
    });

    mockInnerJoin.mockReturnValue({
      innerJoin: mockInnerJoin, // Allow chaining multiple innerJoins
      where: mockWhere,
    });

    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
      limit: mockLimit,
    });

    mockOrderBy.mockReturnValue({
      limit: mockLimit,
    });

    // Set up the insert chain
    mockInsert.mockReturnValue({
      values: mockValues,
    });

    mockValues.mockReturnValue({
      returning: mockReturning,
    });

    // Set up the update chain
    mockUpdate.mockReturnValue({
      set: mockSet,
    });

    mockSet.mockReturnValue({
      where: jest.fn().mockReturnThis(),
    });

    mockGetDatabase.mockReturnValue({
      db: mockDb as unknown as ReturnType<typeof getDatabase>['db'],
      sql: {} as unknown as ReturnType<typeof getDatabase>['sql'],
    });
  });

  describe('listPosts', () => {
    it('should list posts for a specific project', async () => {
      const projectId = 'project-123';
      const mockPosts = [
        {
          id: 'post-1',
          title: 'First Post',
          slug: 'first-post',
          status: 'backlog',
          voteCount: 5,
          commentCount: 2,
          createdAt: new Date('2023-01-01'),
          board: {
            id: 'board-1',
            name: 'Features',
            slug: 'features',
          },
        },
      ];

      mockDb.limit.mockResolvedValue(mockPosts);

      const result = await listPosts({ projectId });

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(posts);
      expect(mockDb.innerJoin).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(51); // limit + 1
      expect(result).toEqual({
        items: mockPosts,
        total: 1,
        hasMore: false,
      });
    });

    it('should filter posts by board when boardId is provided', async () => {
      const projectId = 'project-123';
      const boardId = 'board-456';
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Board Specific Post',
          slug: 'board-specific-post',
          status: 'backlog',
          voteCount: 5,
          commentCount: 2,
          createdAt: new Date('2023-01-01'),
          board: {
            id: 'board-456',
            name: 'Specific Board',
            slug: 'specific-board',
          },
        },
      ];

      mockDb.limit.mockResolvedValue(mockPosts);

      const result = await listPosts({ projectId, boardId });

      expect(mockDb.where).toHaveBeenCalled();
      expect(result.items).toEqual(mockPosts);
    });

    it('should filter posts by status when status is provided', async () => {
      const projectId = 'project-123';
      const status = 'completed';
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Completed Post',
          slug: 'completed-post',
          status: 'completed',
          voteCount: 10,
          commentCount: 5,
          createdAt: new Date('2023-01-01'),
          board: {
            id: 'board-1',
            name: 'Features',
            slug: 'features',
          },
        },
      ];

      mockDb.limit.mockResolvedValue(mockPosts);

      const result = await listPosts({ projectId, status });

      expect(mockDb.where).toHaveBeenCalled();
      expect(result.items).toEqual(mockPosts);
    });

    it('should return empty array when project has no posts', async () => {
      const projectId = 'project-with-no-posts';

      mockDb.limit.mockResolvedValue([]);

      const result = await listPosts({ projectId });

      expect(result).toEqual({
        items: [],
        total: 0,
        hasMore: false,
      });
    });

    it('should handle pagination with hasMore flag', async () => {
      const projectId = 'project-123';
      const limit = 2;
      const mockPosts = [
        {
          id: 'post-1',
          title: 'Post 1',
          slug: 'post-1',
          status: 'backlog',
          voteCount: 1,
          commentCount: 0,
          createdAt: new Date('2023-01-01'),
          board: { id: 'board-1', name: 'Board 1', slug: 'board-1' },
        },
        {
          id: 'post-2',
          title: 'Post 2',
          slug: 'post-2',
          status: 'backlog',
          voteCount: 2,
          commentCount: 0,
          createdAt: new Date('2023-01-02'),
          board: { id: 'board-1', name: 'Board 1', slug: 'board-1' },
        },
        {
          id: 'post-3',
          title: 'Post 3',
          slug: 'post-3',
          status: 'backlog',
          voteCount: 3,
          commentCount: 0,
          createdAt: new Date('2023-01-03'),
          board: { id: 'board-1', name: 'Board 1', slug: 'board-1' },
        },
      ];

      mockDb.limit.mockResolvedValue(mockPosts);

      const result = await listPosts({ projectId, limit });

      expect(mockDb.limit).toHaveBeenCalledWith(3); // limit + 1
      expect(result).toEqual({
        items: mockPosts.slice(0, 2), // Only first 2 items
        total: 2,
        hasMore: true,
      });
    });
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const data = {
        boardId: 'board-123',
        title: 'New Feature Request',
        body: 'This is a great feature idea',
        slug: 'new-feature-request',
      };

      const mockBoard = { projectId: 'project-456' };
      const mockCreatedPost = {
        id: 'post-1',
        boardId: 'board-123',
        projectId: 'project-456',
        title: 'New Feature Request',
        body: 'This is a great feature idea',
        slug: 'new-feature-request',
        status: 'backlog',
        isArchived: false,
        pinned: false,
        voteCount: 0,
        commentCount: 0,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        lastActivityAt: new Date('2023-01-01'),
      };

      // Mock board lookup - first call to where() returns board data
      mockDb.where.mockResolvedValueOnce([mockBoard]);

      // Mock slug uniqueness check - second call to limit() returns empty array
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock post creation
      const mockValues = mockDb.insert().values;
      const mockReturning = mockValues().returning;
      mockReturning.mockResolvedValue([mockCreatedPost]);

      const result = await createPost(data);

      expect(mockDb.select).toHaveBeenCalledTimes(2); // Board lookup + slug check
      expect(mockDb.from).toHaveBeenCalledTimes(2);
      expect(mockDb.where).toHaveBeenCalledTimes(2);
      expect(mockDb.limit).toHaveBeenCalledTimes(1); // Only slug check uses limit
      expect(mockDb.insert).toHaveBeenCalledWith(posts);
      expect(mockValues).toHaveBeenCalledWith({
        boardId: data.boardId,
        projectId: mockBoard.projectId,
        title: data.title,
        body: data.body,
        slug: data.slug,
      });
      expect(result).toEqual(mockCreatedPost);
    });

    it('should create a post without body', async () => {
      const data = {
        boardId: 'board-123',
        title: 'Post without body',
        slug: 'post-without-body',
      };

      const mockBoard = { projectId: 'project-456' };
      const mockCreatedPost = {
        id: 'post-1',
        boardId: 'board-123',
        projectId: 'project-456',
        title: 'Post without body',
        body: null,
        slug: 'post-without-body',
        status: 'backlog',
        isArchived: false,
        pinned: false,
        voteCount: 0,
        commentCount: 0,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        lastActivityAt: new Date('2023-01-01'),
      };

      // Mock board lookup
      mockDb.where.mockResolvedValueOnce([mockBoard]);
      
      // Mock slug uniqueness check
      mockDb.limit.mockResolvedValueOnce([]);
      
      // Mock post creation
      const mockValues = mockDb.insert().values;
      const mockReturning = mockValues().returning;
      mockReturning.mockResolvedValue([mockCreatedPost]);

      const result = await createPost(data);

      expect(mockValues).toHaveBeenCalledWith({
        boardId: data.boardId,
        projectId: mockBoard.projectId,
        title: data.title,
        body: undefined, // body is undefined when not provided
        slug: data.slug,
      });
      expect(result).toEqual(mockCreatedPost);
    });

    it('should throw error when board is not found', async () => {
      const data = {
        boardId: 'non-existent-board',
        title: 'This should fail',
        slug: 'this-should-fail',
      };

      // Mock no board found - first where() call returns empty array
      mockDb.where.mockResolvedValueOnce([]);

      await expect(createPost(data)).rejects.toThrow('Board not found');

      expect(mockDb.select).toHaveBeenCalledTimes(1); // Only board lookup, no slug check
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should throw error when slug already exists in board', async () => {
      const data = {
        boardId: 'board-123',
        title: 'Duplicate Slug Post',
        slug: 'existing-slug',
      };

      const mockBoard = { projectId: 'project-456' };

      // Mock board found - first where() call returns board data
      mockDb.where.mockResolvedValueOnce([mockBoard]);

      // Mock existing post with same slug - limit() call returns existing post
      mockDb.limit.mockResolvedValueOnce([{ id: 'existing-post' }]);

      await expect(createPost(data)).rejects.toThrow(
        'Post with this slug already exists in this board'
      );

      expect(mockDb.select).toHaveBeenCalledTimes(2); // Board lookup + slug check
      expect(mockDb.where).toHaveBeenCalledTimes(2);
      expect(mockDb.limit).toHaveBeenCalledTimes(1);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('getPostBySlug', () => {
    it('should get post by slug and board ID', async () => {
      const boardId = 'board-123';
      const postSlug = 'feature-request';
      const mockPost = {
        id: 'post-1',
        boardId: 'board-123',
        projectId: 'project-456',
        title: 'Feature Request',
        body: 'This is a feature request',
        slug: 'feature-request',
        status: 'backlog',
        isArchived: false,
        pinned: false,
        voteCount: 5,
        commentCount: 2,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        lastActivityAt: new Date('2023-01-01'),
      };

      mockDb.limit.mockResolvedValueOnce([mockPost]);

      const result = await getPostBySlug(boardId, postSlug);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(posts);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPost);
    });

    it('should return null when post is not found', async () => {
      const boardId = 'board-123';
      const postSlug = 'non-existent-post';

      mockDb.limit.mockResolvedValueOnce([]);

      const result = await getPostBySlug(boardId, postSlug);

      expect(result).toBeNull();
    });
  });

  describe('archivePost', () => {
    it('should archive a post', async () => {
      const postId = 'post-123';

      await archivePost(postId);

      expect(mockDb.update).toHaveBeenCalledWith(posts);
      const mockSet = mockDb.update().set;
      expect(mockSet).toHaveBeenCalledWith({ isArchived: true });
    });
  });

  describe('pinPost', () => {
    it('should pin a post', async () => {
      const postId = 'post-123';
      const pinnedValue = true;

      await pinPost(postId, pinnedValue);

      expect(mockDb.update).toHaveBeenCalledWith(posts);
      const mockSet = mockDb.update().set;
      expect(mockSet).toHaveBeenCalledWith({ pinned: pinnedValue });
    });

    it('should unpin a post', async () => {
      const postId = 'post-123';
      const pinnedValue = false;

      await pinPost(postId, pinnedValue);

      expect(mockDb.update).toHaveBeenCalledWith(posts);
      const mockSet = mockDb.update().set;
      expect(mockSet).toHaveBeenCalledWith({ pinned: pinnedValue });
    });
  });
});
