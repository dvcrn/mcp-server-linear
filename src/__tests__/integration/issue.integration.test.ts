/**
 * Issue Integration Tests
 * 
 * Tests issue operations against the actual Linear API.
 * Creates and cleans up test data.
 */

import { LinearMCP } from '../../index.js';
import { IssueService } from '../../features/issues/services/issue.service.js';
import { TeamService } from '../../features/teams/services/team.service.js';
import { Issue } from '../../core/types/linear.types.js';
import { ConfigService } from '../../utils/config.service.js';
import { Logger } from '../../utils/logger.js';

describe('Issue Integration Tests', () => {
  let linear: LinearMCP;
  let issueService: IssueService;
  let teamService: TeamService;
  let teamId: string;
  let canceledStateId: string;
  let createdIssueIds: string[] = [];

  beforeAll(async () => {
    const config = new ConfigService();
    const logger = new Logger();

    // Initialize Linear client with credentials
    linear = new LinearMCP({
      auth: {
        type: 'pat',
        token: process.env.LINEAR_ACCESS_TOKEN || '',
      },
    });

    await linear.initialize();
    issueService = await linear.getIssues();
    teamService = await linear.getTeams();

    // Get a team to use for testing
    const teams = await teamService.getTeams();
    teamId = teams.nodes[0].id;

    // Get the team's workflow states
    const team = await teamService.getTeam(teamId);
    const canceledState = team.states?.nodes.find(state => state.type === 'canceled');
    if (!canceledState) {
      throw new Error('Could not find canceled state');
    }
    canceledStateId = canceledState.id;
  });

  afterAll(async () => {
    // Clean up all created test issues
    for (const issueId of createdIssueIds) {
      try {
        await issueService.updateIssue(issueId, {
          stateId: canceledStateId,
        });
      } catch (error) {
        console.error(`Failed to clean up issue ${issueId}:`, error);
      }
    }
  });

  describe('Issue CRUD Operations', () => {
    it('should create, read, update, and delete an issue', async () => {
      // Create
      const createResponse = await issueService.createIssue({
        title: '[TEST] Integration Test Issue',
        description: 'This is a test issue created by integration tests',
        teamId,
      });

      expect(createResponse).toBeDefined();
      expect(createResponse.id).toBeDefined();
      createdIssueIds.push(createResponse.id);

      // Read
      const readResponse = await issueService.getIssue(createResponse.id);
      expect(readResponse).toBeDefined();
      expect(readResponse.id).toBe(createResponse.id);
      expect(readResponse.title).toBe('[TEST] Integration Test Issue');

      // Update
      const updateResponse = await issueService.updateIssue(createResponse.id, {
        title: '[TEST] Updated Integration Test Issue',
      });
      expect(updateResponse).toBeDefined();
      expect(updateResponse.title).toBe('[TEST] Updated Integration Test Issue');

      // Cancel (soft delete)
      const deleteResponse = await issueService.updateIssue(createResponse.id, {
        stateId: canceledStateId,
      });
      expect(deleteResponse).toBeDefined();
      expect(deleteResponse.state.type).toBe('canceled');
    });
  });

  describe('Issue Relationships', () => {
    it('should create parent and child issues', async () => {
      // Create parent
      const parentResponse = await issueService.createIssue({
        title: '[TEST] Parent Issue',
        description: 'This is a parent test issue',
        teamId,
      });
      expect(parentResponse).toBeDefined();
      createdIssueIds.push(parentResponse.id);

      // Create child
      const childResponse = await issueService.createChildIssue(
        parentResponse.id,
        {
          title: '[TEST] Child Issue',
          description: 'This is a child test issue',
        }
      );
      expect(childResponse).toBeDefined();
      createdIssueIds.push(childResponse.id);

      // Verify relationship
      const parent = await issueService.getIssue(parentResponse.id);
      expect(parent.children?.nodes).toHaveLength(1);
      expect(parent.children?.nodes[0].id).toBe(childResponse.id);

      const child = await issueService.getIssue(childResponse.id);
      expect(child.parent?.id).toBe(parentResponse.id);
    });
  });

  describe('Bulk Operations', () => {
    it('should create and update multiple issues', async () => {
      // Bulk create
      const createInputs = [
        {
          title: '[TEST] Bulk Issue 1',
          description: 'Bulk test issue 1',
          teamId,
        },
        {
          title: '[TEST] Bulk Issue 2',
          description: 'Bulk test issue 2',
          teamId,
        },
      ];

      const createdIssues = await issueService.bulkCreateIssues(createInputs);
      expect(createdIssues).toHaveLength(2);
      createdIssueIds.push(...createdIssues.map((issue: Issue) => issue.id));

      // Bulk update
      const updates = createdIssues.map((issue: Issue) => ({
        id: issue.id,
        input: {
          title: `[TEST] Updated ${issue.title}`,
        },
      }));

      const updatedIssues = await issueService.bulkUpdateIssues(updates);
      expect(updatedIssues).toHaveLength(2);
      updatedIssues.forEach((issue: Issue) => {
        expect(issue.title).toContain('Updated');
      });
    });
  });

  describe('Issue Pagination', () => {
    it('should handle pagination correctly', async () => {
      // Create multiple issues for pagination testing
      const createPromises = Array.from({ length: 5 }, (_, i) =>
        issueService.createIssue({
          title: `[TEST] Pagination Issue ${i + 1}`,
          description: `Pagination test issue ${i + 1}`,
          teamId,
        })
      );

      const createdIssues = await Promise.all(createPromises);
      createdIssueIds.push(...createdIssues.map((issue: Issue) => issue.id));

      // Test pagination
      const firstPage = await issueService.getIssues({ first: 2 });
      expect(firstPage.nodes).toHaveLength(2);
      expect(firstPage.pageInfo.hasNextPage).toBe(true);

      const secondPage = await issueService.getIssues({
        first: 2,
        after: firstPage.pageInfo.endCursor,
      });
      expect(secondPage.nodes).toHaveLength(2);
      expect(secondPage.nodes[0].id).not.toBe(firstPage.nodes[0].id);
    });
  });
});
