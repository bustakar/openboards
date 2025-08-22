import { projects } from '@/db/schema';
import { getDatabase } from '@/server/db';
import {
  createProject,
  deleteProject,
  getCurrentProjectFromHeaders,
  getProjectBySubdomain,
  listProjectsByUser,
  updateProject,
} from '../projects';

// Mock the database module
jest.mock('@/server/db');
const mockGetDatabase = getDatabase as jest.MockedFunction<typeof getDatabase>;

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  extractSubdomain: jest.fn(),
}));

describe('Projects Repository', () => {
  let mockDb: Record<string, jest.Mock>;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock functions for the database chain
    const mockSelect = jest.fn();
    const mockFrom = jest.fn();
    const mockWhere = jest.fn();
    mockOrderBy = jest.fn();
    mockLimit = jest.fn();
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
      orderBy: mockOrderBy,
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
      orderBy: mockOrderBy,
    });

    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
      limit: mockLimit,
    });

    // For getProjectBySubdomain, we need to mock the limit call
    mockLimit.mockResolvedValue([]);

    mockOrderBy.mockReturnValue([]);

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
      where: jest.fn().mockReturnValue({
        returning: mockReturning,
      }),
    });

    // Set up the delete chain
    mockDelete.mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: mockReturning,
      }),
    });

    mockGetDatabase.mockReturnValue({
      db: mockDb as unknown as ReturnType<typeof getDatabase>['db'],
      sql: {} as unknown as ReturnType<typeof getDatabase>['sql'],
    });
  });

  describe('listProjectsByUser', () => {
    it('should list projects for a specific user', async () => {
      const userId = 'user-123';
      const mockProjects = [
        {
          id: 'project-1',
          name: 'My First Project',
          subdomain: 'my-first-project',
          description: 'A test project',
          userId: 'user-123',
          createdAt: new Date('2023-01-01'),
          updatedAt: new Date('2023-01-01'),
        },
        {
          id: 'project-2',
          name: 'My Second Project',
          subdomain: 'my-second-project',
          description: 'Another test project',
          userId: 'user-123',
          createdAt: new Date('2023-01-02'),
          updatedAt: new Date('2023-01-02'),
        },
      ];

      mockOrderBy.mockResolvedValue(mockProjects);

      const result = await listProjectsByUser(userId);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(projects);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalledWith(projects.createdAt);
      expect(result).toEqual(mockProjects);
    });

    it('should return empty array when user has no projects', async () => {
      const userId = 'user-with-no-projects';

      mockOrderBy.mockResolvedValue([]);

      const result = await listProjectsByUser(userId);

      expect(result).toEqual([]);
    });
  });

  describe('getProjectBySubdomain', () => {
    it('should get project by subdomain', async () => {
      const subdomain = 'demo-project';
      const mockProject = {
        id: 'project-1',
        name: 'Demo Project',
        subdomain: 'demo-project',
        description: 'A demo project',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValue([mockProject]);

      const result = await getProjectBySubdomain(subdomain);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalledWith(projects);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProject);
    });

    it('should return null when project is not found', async () => {
      const subdomain = 'non-existent-project';

      mockLimit.mockResolvedValue([]);

      const result = await getProjectBySubdomain(subdomain);

      expect(result).toBeNull();
    });
  });

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      const data = {
        name: 'New Project',
        subdomain: 'new-project',
        description: 'A new test project',
        userId: 'user-123',
      };

      const mockCreatedProject = {
        id: 'project-1',
        name: 'New Project',
        subdomain: 'new-project',
        description: 'A new test project',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock subdomain uniqueness check
      mockLimit.mockResolvedValueOnce([]);

      // Mock project creation
      const mockValues = mockDb.insert().values;
      const mockReturning = mockValues().returning;
      mockReturning.mockResolvedValue([mockCreatedProject]);

      const result = await createProject(data);

      expect(mockDb.select).toHaveBeenCalledTimes(1); // Subdomain check
      expect(mockDb.insert).toHaveBeenCalledWith(projects);
      expect(mockValues).toHaveBeenCalledWith({
        name: data.name,
        subdomain: data.subdomain,
        description: data.description,
        userId: data.userId,
      });
      expect(result).toEqual(mockCreatedProject);
    });

    it('should create a project without description', async () => {
      const data = {
        name: 'Project Without Description',
        subdomain: 'project-no-desc',
        userId: 'user-123',
      };

      const mockCreatedProject = {
        id: 'project-1',
        name: 'Project Without Description',
        subdomain: 'project-no-desc',
        description: null,
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      mockLimit.mockResolvedValueOnce([]);
      const mockValues = mockDb.insert().values;
      const mockReturning = mockValues().returning;
      mockReturning.mockResolvedValue([mockCreatedProject]);

      const result = await createProject(data);

      expect(mockValues).toHaveBeenCalledWith({
        name: data.name,
        subdomain: data.subdomain,
        description: undefined,
        userId: data.userId,
      });
      expect(result).toEqual(mockCreatedProject);
    });

    it('should throw error for invalid subdomain format', async () => {
      const data = {
        name: 'Invalid Project',
        subdomain: 'INVALID_SUBDOMAIN',
        userId: 'user-123',
      };

      await expect(createProject(data)).rejects.toThrow(
        'Subdomain must contain only lowercase letters, numbers, and hyphens'
      );

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should throw error for subdomain with uppercase letters', async () => {
      const data = {
        name: 'Invalid Project',
        subdomain: 'Invalid-Subdomain',
        userId: 'user-123',
      };

      await expect(createProject(data)).rejects.toThrow(
        'Subdomain must contain only lowercase letters, numbers, and hyphens'
      );

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should throw error for subdomain with special characters', async () => {
      const data = {
        name: 'Invalid Project',
        subdomain: 'invalid@subdomain',
        userId: 'user-123',
      };

      await expect(createProject(data)).rejects.toThrow(
        'Subdomain must contain only lowercase letters, numbers, and hyphens'
      );

      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should throw error when subdomain already exists', async () => {
      const data = {
        name: 'Duplicate Project',
        subdomain: 'existing-subdomain',
        userId: 'user-123',
      };

      // Mock existing project found
      mockLimit.mockResolvedValueOnce([{ id: 'existing-project' }]);

      await expect(createProject(data)).rejects.toThrow(
        'Subdomain already exists'
      );

      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe('updateProject', () => {
    it('should update a project successfully', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated description',
      };

      const mockUpdatedProject = {
        id: 'project-123',
        name: 'Updated Project Name',
        subdomain: 'existing-subdomain',
        description: 'Updated description',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      // Mock ownership check
      mockLimit.mockResolvedValueOnce([
        { id: 'project-123', subdomain: 'existing-subdomain' },
      ]);

      // Mock project update
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValue([mockUpdatedProject]);

      const result = await updateProject(projectId, userId, updateData);

      expect(mockDb.select).toHaveBeenCalledTimes(1); // Ownership check
      expect(mockDb.update).toHaveBeenCalledWith(projects);
      expect(mockSet).toHaveBeenCalledWith({
        ...updateData,
        updatedAt: expect.any(Date),
      });
      expect(result).toEqual(mockUpdatedProject);
    });

    it('should update subdomain with validation', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const updateData = {
        subdomain: 'new-subdomain',
      };

      const mockUpdatedProject = {
        id: 'project-123',
        name: 'Test Project',
        subdomain: 'new-subdomain',
        description: 'Test description',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      // Mock ownership check
      mockLimit.mockResolvedValueOnce([
        { id: 'project-123', subdomain: 'old-subdomain' },
      ]);

      // Mock subdomain uniqueness check
      mockLimit.mockResolvedValueOnce([]);

      // Mock project update
      const mockSet = mockDb.update().set;
      const mockReturning = mockSet().where().returning;
      mockReturning.mockResolvedValue([mockUpdatedProject]);

      const result = await updateProject(projectId, userId, updateData);

      expect(mockDb.select).toHaveBeenCalledTimes(2); // Ownership + uniqueness check
      expect(mockDb.update).toHaveBeenCalledWith(projects);
      expect(result).toEqual(mockUpdatedProject);
    });

    it('should throw error when project not found or access denied', async () => {
      const projectId = 'non-existent-project';
      const userId = 'user-123';
      const updateData = {
        name: 'Updated Name',
      };

      // Mock no project found
      mockLimit.mockResolvedValueOnce([]);

      await expect(
        updateProject(projectId, userId, updateData)
      ).rejects.toThrow('Project not found or access denied');

      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should throw error for invalid subdomain format during update', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const updateData = {
        subdomain: 'INVALID_SUBDOMAIN',
      };

      // Mock ownership check
      mockLimit.mockResolvedValueOnce([
        { id: 'project-123', subdomain: 'old-subdomain' },
      ]);

      await expect(
        updateProject(projectId, userId, updateData)
      ).rejects.toThrow(
        'Subdomain must contain only lowercase letters, numbers, and hyphens'
      );

      expect(mockDb.update).not.toHaveBeenCalled();
    });

    it('should throw error when new subdomain already exists', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';
      const updateData = {
        subdomain: 'existing-subdomain',
      };

      // Mock ownership check
      mockLimit.mockResolvedValueOnce([
        { id: 'project-123', subdomain: 'old-subdomain' },
      ]);

      // Mock existing subdomain found
      mockLimit.mockResolvedValueOnce([{ id: 'other-project' }]);

      await expect(
        updateProject(projectId, userId, updateData)
      ).rejects.toThrow('Subdomain already exists');

      expect(mockDb.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteProject', () => {
    it('should delete a project successfully', async () => {
      const projectId = 'project-123';
      const userId = 'user-123';

      const mockDeletedProject = {
        id: 'project-123',
        name: 'Deleted Project',
        subdomain: 'deleted-project',
        description: 'A project to be deleted',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock ownership check
      mockLimit.mockResolvedValueOnce([{ id: 'project-123' }]);

      // Mock project deletion
      const mockReturning = mockDb.delete().where().returning;
      mockReturning.mockResolvedValue([mockDeletedProject]);

      const result = await deleteProject(projectId, userId);

      expect(mockDb.select).toHaveBeenCalledTimes(1); // Ownership check
      expect(mockDb.delete).toHaveBeenCalledWith(projects);
      expect(result).toEqual(mockDeletedProject);
    });

    it('should throw error when project not found or access denied', async () => {
      const projectId = 'non-existent-project';
      const userId = 'user-123';

      // Mock no project found
      mockLimit.mockResolvedValueOnce([]);

      await expect(deleteProject(projectId, userId)).rejects.toThrow(
        'Project not found or access denied'
      );

      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  describe('getCurrentProjectFromHeaders', () => {
    it('should get project from headers with valid host', async () => {
      const mockHeaders = {
        get: jest.fn().mockReturnValue('demo.openboards.co'),
      } as unknown as Headers;

      const mockProject = {
        id: 'project-1',
        name: 'Demo Project',
        subdomain: 'demo',
        description: 'A demo project',
        userId: 'user-123',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      };

      // Mock extractSubdomain to return 'demo'
      const { extractSubdomain } = jest.requireMock('@/lib/utils');
      extractSubdomain.mockReturnValue('demo');

      // Mock getProjectBySubdomain
      mockLimit.mockResolvedValueOnce([mockProject]);

      const result = await getCurrentProjectFromHeaders(mockHeaders);

      expect(extractSubdomain).toHaveBeenCalledWith('demo.openboards.co');
      expect(result).toEqual(mockProject);
    });

    it('should return null when host header is missing', async () => {
      const mockHeaders = {
        get: jest.fn().mockReturnValue(null),
      } as unknown as Headers;

      const result = await getCurrentProjectFromHeaders(mockHeaders);

      expect(result).toBeNull();
    });

    it('should return null when no subdomain is extracted', async () => {
      const mockHeaders = {
        get: jest.fn().mockReturnValue('openboards.co'),
      } as unknown as Headers;

      // Mock extractSubdomain to return null
      const { extractSubdomain } = jest.requireMock('@/lib/utils');
      extractSubdomain.mockReturnValue(null);

      const result = await getCurrentProjectFromHeaders(mockHeaders);

      expect(result).toBeNull();
    });

    it('should return null when project is not found', async () => {
      const mockHeaders = {
        get: jest.fn().mockReturnValue('nonexistent.openboards.co'),
      } as unknown as Headers;

      // Mock extractSubdomain to return 'nonexistent'
      const { extractSubdomain } = jest.requireMock('@/lib/utils');
      extractSubdomain.mockReturnValue('nonexistent');

      // Mock getProjectBySubdomain to return null
      mockLimit.mockResolvedValueOnce([]);

      const result = await getCurrentProjectFromHeaders(mockHeaders);

      expect(result).toBeNull();
    });
  });
});
