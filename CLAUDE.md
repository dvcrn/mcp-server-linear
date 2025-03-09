# Adding a New Tool to Linear MCP

This guide outlines the steps required to add a new tool to the Linear Model Context Protocol (MCP) implementation. We'll use the addition of the `linear_search_issues_by_identifier` tool as a concrete example.

The lienar api documentation is available at https://studio.apollographql.com/public/Linear-API/variant/current/schema/reference/inputs

## 1. Add Types (src/features/*/types/*.types.ts)

First, define any new types needed for your tool's input and output in the relevant feature's types file. For our example, in `src/features/issues/types/issue.types.ts`:

```typescript
export interface SearchIssuesByIdentifierInput {
  identifiers: string[];  // Required parameter for searching issues
}
```

## 2. Update Handler Interface (src/core/interfaces/tool-handler.interface.ts)

Add your new tool's method to the `ToolHandler` interface:

```typescript
export interface ToolHandler {
  // ... existing methods ...
  handleSearchIssuesByIdentifier(args: any): Promise<BaseToolResponse>;
}
```

## 3. Add Handler Implementation (src/features/*/handlers/*.handler.ts)

Implement the handler method in the relevant feature handler. For our example, in `src/features/issues/handlers/issue.handler.ts`:

```typescript
async handleSearchIssuesByIdentifier(
  args: SearchIssuesByIdentifierInput
): Promise<BaseToolResponse> {
  try {
    const client = this.verifyAuth();
    this.validateRequiredParams(args, ["identifiers"]);

    if (!Array.isArray(args.identifiers)) {
      throw new Error("Identifiers parameter must be an array");
    }

    const result = await client.searchIssues(
      { identifier: { in: args.identifiers } },
      100,
      undefined,
      "updatedAt"
    );

    // Format the response...
    return this.createResponse(formattedResponse);
  } catch (error) {
    this.handleError(error, "search issues by identifier");
  }
}
```

## 4. Add GraphQL Query/Mutation (src/graphql/queries.ts or mutations.ts)

If your tool requires a new GraphQL operation, add it to the appropriate file:

```typescript
export const GET_ISSUES_BY_IDENTIFIER = gql`
  query GetIssuesByIdentifier($numbers: [Float!]!) {
    issues(
      filter: { number: { in: $numbers } }
      first: 100
      orderBy: updatedAt
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        identifier
        title
        description
        url
        state {
          id
          name
          type
          color
        }
        // ... other fields ...
      }
    }
  }
`;
```

## 5. Update GraphQL Client (src/graphql/client.ts)

If your tool needs special handling in the GraphQL client, add the necessary methods or modify existing ones:

```typescript
async searchIssues(
  filter: SearchIssuesInput["filter"],
  first: number = 50,
  after?: string,
  orderBy: string = "updatedAt"
): Promise<SearchIssuesResponse> {
  // Special handling for identifier searches
  if (filter?.identifier?.in) {
    const { GET_ISSUES_BY_IDENTIFIER } = await import("./queries.js");
    // Extract numbers from identifiers (e.g., "78" from "MIC-78") and convert to Float
    const numbers = filter.identifier.in.map((id) =>
      parseFloat(id.split("-")[1])
    );
    return this.execute<SearchIssuesResponse>(GET_ISSUES_BY_IDENTIFIER, {
      numbers,
    });
  }
  
  // Regular search handling...
}
```

## 6. Register the Tool (src/core/types/tool.types.ts)

Add your tool's schema definition:

```typescript
export const toolSchemas = {
  // ... existing tools ...
  
  linear_search_issues_by_identifier: {
    name: "linear_search_issues_by_identifier",
    description: 'Search for issues by their identifiers (e.g., ["MIC-78", "MIC-79"])',
    inputSchema: {
      type: "object",
      properties: {
        identifiers: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Array of issue identifiers to search for",
        },
      },
      required: ["identifiers"],
    },
  },
};
```

## 7. Add Tool to Handler Factory (src/core/handlers/handler.factory.ts)

Register your tool in the handler map:

```typescript
const handlerMap: Record<string, { handler: any; method: string }> = {
  // ... existing mappings ...
  linear_search_issues_by_identifier: {
    handler: this.issueHandler,
    method: "handleSearchIssuesByIdentifier",
  },
};
```

## 8. Build and Test

1. Build the project:
```bash
npm run build
```

2. Test your tool using the MCP:
```typescript
<use_mcp_tool>
<server_name>linear</server_name>
<tool_name>your_new_tool_name</tool_name>
<arguments>
{
  // your tool's arguments
}
</arguments>
</use_mcp_tool>
```

## Important Considerations

1. **API Schema**: Always consult the API's schema (e.g., Linear's GraphQL schema) to ensure you're using the correct field names and types. For example, we learned that Linear uses `number` as a Float type for filtering issues, not string-based identifiers.

2. **Type Safety**: Maintain proper TypeScript types throughout the implementation to catch potential issues at compile time.

3. **Error Handling**: Implement proper error handling in your handler methods using the provided `handleError` utility.

4. **Input Validation**: Use `validateRequiredParams` to ensure all required parameters are provided.

5. **Response Formatting**: Format your responses consistently using either `createResponse` or `createJsonResponse`.

6. **Query Variables**: Pay attention to GraphQL variable types and ensure they match the API's requirements (e.g., using Float instead of String for issue numbers).

7. **Testing**: Always test your tool with various inputs to ensure it handles different scenarios correctly.

## Tool Schema Documentation (src/core/types/tool.types.ts)

Whenever modifying the API, adding/editing handlers, or making any changes to tool functionality, it's critical to maintain comprehensive documentation in `tool.types.ts`. This file serves as the primary interface documentation for all MCP tools.

## Documentation Guidelines

1. **Description Completeness**: Each tool's description should clearly explain:
   - What the tool does
   - When to use it
   - Any important side effects or considerations
   - Links to relevant API documentation when applicable

2. **Input Schema Documentation**: For each parameter in the inputSchema:
   - Provide clear, specific descriptions
   - Document all possible values and their meanings
   - Include format requirements (e.g., UUID format, number ranges)
   - Note relationships between fields when they exist
   - Mark optional fields appropriately

3. **Examples**: When possible, include example usage in the schema to demonstrate:
   - Common use cases
   - Parameter combinations
   - Expected formats

4. **Response Documentation**: While not part of the schema, the handler implementations should maintain consistent response formats as documented in the handler files.

## Example of Good Schema Documentation:
```typescript
[getToolName("tool_name")]: {
  name: getToolName("tool_name"),
  description: getToolDescription("Clear description of purpose and usage"),
  inputSchema: {
    type: "object",
    properties: {
      parameter: {
        type: "string",
        description: "Detailed explanation including format, constraints, and usage context",
      }
    }
  }
}
```

# Common Pitfalls

1. Using incorrect field names in GraphQL queries (e.g., using `identifier` when the API expects `number`)
2. Not converting types properly (e.g., forgetting to convert string IDs to numbers when required)
3. Missing required parameters in the input schema
4. Forgetting to register the tool in the handler factory
5. Not handling error cases properly
6. Not updating all necessary files when adding a new tool
7. Insufficient or unclear parameter descriptions in tool.types.ts
8. Missing format requirements or constraints in parameter documentation
9. Lack of examples for complex tool usage

Remember to always check the API documentation and schema when implementing new tools to ensure compatibility with the external service. Most importantly, maintain clear and comprehensive documentation in tool.types.ts as it serves as the primary interface documentation for users of the MCP tools.
