import { getDatabase } from '@/server/db';
import { createComment, listComments } from '../comments';
import { boards, comments, posts } from '@/db/schema';

// Mock the database module
jest.mock('@/server/db');
const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  asc: jest.fn(),
  sql: jest.fn(),
}));

describe('Comments Repository', () => {
  let mockDb: Record<string, jest.Mock>;
  let mockSelect: jest.Mock;
  let mockFrom: jest.Mock;
  let mockLeftJoin: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockInsert: jest.Mock;
  let mockValues: jest.Mock;
  let mockReturning: jest.Mock;
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock database chain
    mockSelect = jest.fn().mockReturnThis();
    mockFrom = jest.fn().mockReturnThis();
    mockLeftJoin = jest.fn().mockReturnThis();
    mockWhere = jest.fn().mockReturnThis();
    mockOrderBy = jest.fn().mockReturnThis();
    mockLimit = jest.fn().mockReturnThis();
    mockInsert = jest.fn().mockReturnThis();
    mockValues = jest.fn().mockReturnThis();
    mockReturning = jest.fn().mockReturnThis();
    mockUpdate = jest.fn().mockReturnThis();

    // Create a proper chainable mock object
    mockDb = {
      select: mockSelect,
      from: mockFrom,
      leftJoin: mockLeftJoin,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      insert: mockInsert,
      update: mockUpdate,
    };

    // Set up the insert chain
    mockInsert.mockReturnValue({
      values: mockValues,
    });

    // Set up the values chain
    mockValues.mockReturnValue({
      returning: mockReturning,
    });

    // Set up the update chain
    mockUpdate.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
      }),
    });

    // Make sure where returns this for chaining
    mockWhere.mockReturnThis();

    mockGetDatabase.mockReturnValue({
      db: mockDb as unknown as ReturnType<typeof getDatabase>['db'],
      sql: {} as unknown as ReturnType<typeof getDatabase>['sql'],
    });
  });

  describe('listComments', () => {
    it('should list comments for a specific post', async () => {
      const postId = 'post-123';
      const mockComments = [
        {
          id: 'comment-1',
          body: 'Great idea!',
          authorName: 'John Doe',
          createdAt: new Date('2023-01-01'),
        },
        {
          id: 'comment-2',
          body: 'I agree with this',
          authorName: 'Jane Smith',
          createdAt: new Date('2023-01-02'),
        },
      ];

      mockOrderBy.mockResolvedValue(mockComments);

      const result = await listComments(postId);

      expect(mockSelect).toHaveBeenCalledWith({
        id: comments.id,
        body: comments.body,
        authorName: comments.authorName,
        createdAt: comments.createdAt,
      });
      expect(mockFrom).toHaveBeenCalledWith(comments);
      expect(mockWhere).toHaveBeenCalled();
      expect(mockOrderBy).toHaveBeenCalled();
      expect(result).toEqual(mockComments);
    });

    it('should return empty array when post has no comments', async () => {
      const postId = 'post-with-no-comments';

      mockOrderBy.mockResolvedValue([]);

      const result = await listComments(postId);

      expect(result).toEqual([]);
    });

    it('should filter out archived comments', async () => {
      const postId = 'post-123';
      const mockComments = [
        {
          id: 'comment-1',
          body: 'Active comment',
          authorName: 'John Doe',
          createdAt: new Date('2023-01-01'),
        },
      ];

      mockOrderBy.mockResolvedValue(mockComments);

      await listComments(postId);

      expect(mockWhere).toHaveBeenCalled();
      // Should filter by both postId and isArchived = false
    });

    it('should order comments by creation date ascending', async () => {
      const postId = 'post-123';

      mockOrderBy.mockResolvedValue([]);

      await listComments(postId);

      expect(mockOrderBy).toHaveBeenCalled();
      // Should order by createdAt ascending
    });
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const params = {
        postId: 'post-123',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: 'This is a great comment!',
      };

      const mockProjectId = 'project-789';
      const mockCreatedComment = {
        id: 'comment-1',
        postId: 'post-123',
        projectId: 'project-789',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: 'This is a great comment!',
        isArchived: false,
        createdAt: new Date('2023-01-01'),
      };

      // Mock the project lookup
      mockLimit.mockResolvedValue([{ projectId: mockProjectId }]);

      // Mock the comment creation
      mockReturning.mockResolvedValue([mockCreatedComment]);

      const result = await createComment(params);

      // Should look up the project ID first
      expect(mockSelect).toHaveBeenCalledWith({ projectId: boards.projectId });
      expect(mockFrom).toHaveBeenCalledWith(posts);
      expect(mockLeftJoin).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);

      // Should create the comment
      expect(mockInsert).toHaveBeenCalledWith(comments);
      expect(mockValues).toHaveBeenCalledWith({
        postId: params.postId,
        projectId: mockProjectId,
        visitorId: params.visitorId,
        authorName: params.authorName,
        body: params.body,
      });
      expect(mockReturning).toHaveBeenCalled();

      // Should update the post's comment count
      expect(mockUpdate).toHaveBeenCalledWith(posts);

      expect(result).toEqual(mockCreatedComment);
    });

    it('should create a comment without author name', async () => {
      const params = {
        postId: 'post-123',
        visitorId: 'visitor-456',
        authorName: null,
        body: 'Anonymous comment',
      };

      const mockProjectId = 'project-789';
      const mockCreatedComment = {
        id: 'comment-1',
        postId: 'post-123',
        projectId: 'project-789',
        visitorId: 'visitor-456',
        authorName: null,
        body: 'Anonymous comment',
        isArchived: false,
        createdAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([{ projectId: mockProjectId }]);
      mockReturning.mockResolvedValue([mockCreatedComment]);

      const result = await createComment(params);

      expect(mockValues).toHaveBeenCalledWith({
        postId: params.postId,
        projectId: mockProjectId,
        visitorId: params.visitorId,
        authorName: null,
        body: params.body,
      });

      expect(result).toEqual(mockCreatedComment);
    });

    it('should create a comment with undefined author name', async () => {
      const params = {
        postId: 'post-123',
        visitorId: 'visitor-456',
        authorName: undefined,
        body: 'Comment without author',
      };

      const mockProjectId = 'project-789';
      const mockCreatedComment = {
        id: 'comment-1',
        postId: 'post-123',
        projectId: 'project-789',
        visitorId: 'visitor-456',
        authorName: null,
        body: 'Comment without author',
        isArchived: false,
        createdAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([{ projectId: mockProjectId }]);
      mockReturning.mockResolvedValue([mockCreatedComment]);

      const result = await createComment(params);

      expect(mockValues).toHaveBeenCalledWith({
        postId: params.postId,
        projectId: mockProjectId,
        visitorId: params.visitorId,
        authorName: null,
        body: params.body,
      });

      expect(result).toEqual(mockCreatedComment);
    });

    it('should throw error when post is not found', async () => {
      const params = {
        postId: 'non-existent-post',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: 'This comment should fail',
      };

      // Mock no project found
      mockLimit.mockResolvedValue([]);

      await expect(createComment(params)).rejects.toThrow('post_not_found');

      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw error when post has no project ID', async () => {
      const params = {
        postId: 'post-without-project',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: 'This comment should fail',
      };

      // Mock project ID is null
      mockLimit.mockResolvedValue([{ projectId: null }]);

      await expect(createComment(params)).rejects.toThrow('post_not_found');

      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should increment post comment count when comment is created', async () => {
      const params = {
        postId: 'post-123',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: 'Test comment',
      };

      const mockProjectId = 'project-789';
      const mockCreatedComment = {
        id: 'comment-1',
        postId: 'post-123',
        projectId: 'project-789',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: 'Test comment',
        isArchived: false,
        createdAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([{ projectId: mockProjectId }]);
      mockReturning.mockResolvedValue([mockCreatedComment]);

      await createComment(params);

      // Should update the post's comment count and last activity
      expect(mockUpdate).toHaveBeenCalledWith(posts);
    });

    it('should handle empty body comment', async () => {
      const params = {
        postId: 'post-123',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: '',
      };

      const mockProjectId = 'project-789';
      const mockCreatedComment = {
        id: 'comment-1',
        postId: 'post-123',
        projectId: 'project-789',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: '',
        isArchived: false,
        createdAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([{ projectId: mockProjectId }]);
      mockReturning.mockResolvedValue([mockCreatedComment]);

      const result = await createComment(params);

      expect(result).toEqual(mockCreatedComment);
    });

    it('should handle very long comment body', async () => {
      const longBody = 'A'.repeat(10000); // Very long comment
      const params = {
        postId: 'post-123',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: longBody,
      };

      const mockProjectId = 'project-789';
      const mockCreatedComment = {
        id: 'comment-1',
        postId: 'post-123',
        projectId: 'project-789',
        visitorId: 'visitor-456',
        authorName: 'John Doe',
        body: longBody,
        isArchived: false,
        createdAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([{ projectId: mockProjectId }]);
      mockReturning.mockResolvedValue([mockCreatedComment]);

      const result = await createComment(params);

      expect(result).toEqual(mockCreatedComment);
    });
  });
});
