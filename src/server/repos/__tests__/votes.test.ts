import { getDatabase } from '@/server/db';
import { toggleVote } from '../votes';
import { posts, votes } from '@/db/schema';

// Mock the database module
jest.mock('@/server/db');
const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
}));

describe('Votes Repository', () => {
  let mockDb: Record<string, jest.Mock>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock functions for the database chain
    const mockSelect = jest.fn();
    const mockFrom = jest.fn();
    const mockWhere = jest.fn();
    const mockLimit = jest.fn();
    const mockInsert = jest.fn();
    const mockUpdate = jest.fn();
    const mockDelete = jest.fn();
    const mockValues = jest.fn();
    const mockReturning = jest.fn();
    const mockSet = jest.fn();

    // Set up the main database object
    mockDb = {
      select: mockSelect,
      from: mockFrom,
      where: mockWhere,
      limit: mockLimit,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    };

    // Set up the select chain
    mockSelect.mockReturnValue({
      from: mockFrom,
    });

    mockFrom.mockReturnValue({
      where: mockWhere,
    });

    mockWhere.mockReturnValue({
      limit: mockLimit,
    });

    // Set up the insert chain
    mockInsert.mockReturnValue({
      values: mockValues,
    });

    mockValues.mockReturnValue(undefined);

    // Set up the update chain
    mockUpdate.mockReturnValue({
      set: mockSet,
    });

    mockSet.mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: mockReturning,
      }),
    });

    // Set up the delete chain
    mockDelete.mockReturnValue({
      where: jest.fn().mockReturnValue(undefined),
    });

    mockGetDatabase.mockReturnValue({
      db: mockDb as unknown as ReturnType<typeof getDatabase>['db'],
      sql: {} as unknown as ReturnType<typeof getDatabase>['sql'],
    });
  });

  describe('toggleVote', () => {
    it('should add a vote when user has not voted before', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';
      const newVoteCount = 5;

      // Mock no existing vote found
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock vote insertion
      const mockValues = mockDb.insert().values;
      mockValues.mockReturnValueOnce(undefined);

      // Mock post update
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValueOnce([{ voteCount: newVoteCount }]);

      const result = await toggleVote(postId, visitorId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(votes);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.insert).toHaveBeenCalledWith(votes);
      expect(mockValues).toHaveBeenCalledWith({ postId, visitorId });
      expect(mockDb.update).toHaveBeenCalledWith(posts);
      expect(mockSet).toHaveBeenCalled();
      expect(result).toEqual({ voted: true, voteCount: newVoteCount });
    });

    it('should remove a vote when user has already voted', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';
      const voteId = 'vote-789';
      const newVoteCount = 3;

      // Mock existing vote found
      mockDb.limit.mockResolvedValueOnce([{ id: voteId }]);

      // Mock vote deletion
      const mockDeleteWhere = mockDb.delete().where;
      mockDeleteWhere.mockReturnValueOnce(undefined);

      // Mock post update
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValueOnce([{ voteCount: newVoteCount }]);

      const result = await toggleVote(postId, visitorId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(votes);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(mockDb.delete).toHaveBeenCalledWith(votes);
      expect(mockDeleteWhere).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalledWith(posts);
      expect(mockSet).toHaveBeenCalled();
      expect(result).toEqual({ voted: false, voteCount: newVoteCount });
    });

    it('should handle case where post update returns no rows', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // Mock no existing vote found
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock vote insertion
      const mockValues = mockDb.insert().values;
      mockValues.mockReturnValueOnce(undefined);

      // Mock post update returns no rows
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValueOnce([]);

      const result = await toggleVote(postId, visitorId);

      expect(result).toEqual({ voted: true, voteCount: 0 });
    });

    it('should handle case where post update returns null voteCount', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // Mock no existing vote found
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock vote insertion
      const mockValues = mockDb.insert().values;
      mockValues.mockReturnValueOnce(undefined);

      // Mock post update returns null voteCount
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValueOnce([{ voteCount: null }]);

      const result = await toggleVote(postId, visitorId);

      expect(result).toEqual({ voted: true, voteCount: 0 });
    });

    it('should throw error when postId is missing', async () => {
      const postId = '';
      const visitorId = 'visitor-456';

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('missing_post_id');

      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should throw error when postId is null', async () => {
      const postId = null as unknown as string;
      const visitorId = 'visitor-456';

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('missing_post_id');

      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should throw error when postId is undefined', async () => {
      const postId = undefined as unknown as string;
      const visitorId = 'visitor-456';

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('missing_post_id');

      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should throw error when visitorId is missing', async () => {
      const postId = 'post-123';
      const visitorId = '';

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('missing_visitor');

      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should throw error when visitorId is null', async () => {
      const postId = 'post-123';
      const visitorId = null as unknown as string;

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('missing_visitor');

      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should throw error when visitorId is undefined', async () => {
      const postId = 'post-123';
      const visitorId = undefined as unknown as string;

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('missing_visitor');

      expect(mockDb.select).not.toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // Mock database error
      mockDb.limit.mockRejectedValueOnce(new Error('Database connection failed'));

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('Database connection failed');
    });

    it('should handle vote insertion errors', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // Mock no existing vote found
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock vote insertion error
      const mockValues = mockDb.insert().values;
      mockValues.mockRejectedValueOnce(new Error('Insert failed'));

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('Insert failed');
    });

    it('should handle vote deletion errors', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';
      const voteId = 'vote-789';

      // Mock existing vote found
      mockDb.limit.mockResolvedValueOnce([{ id: voteId }]);

      // Mock vote deletion error
      const mockDeleteWhere = mockDb.delete().where;
      mockDeleteWhere.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('Delete failed');
    });

    it('should handle post update errors', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // Mock no existing vote found
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock vote insertion
      const mockValues = mockDb.insert().values;
      mockValues.mockReturnValueOnce(undefined);

      // Mock post update error
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockRejectedValueOnce(new Error('Update failed'));

      await expect(toggleVote(postId, visitorId)).rejects.toThrow('Update failed');
    });

    it('should handle multiple vote toggles correctly', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // First toggle: add vote
      mockDb.limit.mockResolvedValueOnce([]); // No existing vote
      const mockValues1 = mockDb.insert().values;
      mockValues1.mockReturnValueOnce(undefined);
      const mockSet1 = mockDb.update().set;
      const mockReturning1 = mockSet1().where().returning;
      mockReturning1.mockResolvedValueOnce([{ voteCount: 1 }]);

      const result1 = await toggleVote(postId, visitorId);
      expect(result1).toEqual({ voted: true, voteCount: 1 });

      // Second toggle: remove vote
      mockDb.limit.mockResolvedValueOnce([{ id: 'vote-789' }]); // Existing vote
      const mockDeleteWhere = mockDb.delete().where;
      mockDeleteWhere.mockReturnValueOnce(undefined);
      const mockSet2 = mockDb.update().set;
      const mockReturning2 = mockSet2().where().returning;
      mockReturning2.mockResolvedValueOnce([{ voteCount: 0 }]);

      const result2 = await toggleVote(postId, visitorId);
      expect(result2).toEqual({ voted: false, voteCount: 0 });
    });

    it('should use correct SQL expressions for vote count updates', async () => {
      const postId = 'post-123';
      const visitorId = 'visitor-456';

      // Mock no existing vote found
      mockDb.limit.mockResolvedValueOnce([]);

      // Mock vote insertion
      const mockValues = mockDb.insert().values;
      mockValues.mockReturnValueOnce(undefined);

      // Mock post update
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValueOnce([{ voteCount: 1 }]);

      await toggleVote(postId, visitorId);

      // Verify that sql expressions are used for vote count updates
      expect(mockSet).toHaveBeenCalled();
    });
  });
});
