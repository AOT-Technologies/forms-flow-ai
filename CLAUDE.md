# Claude AI Code Review Configuration

This file provides guidelines and context for Claude AI to understand the formsflow.ai project structure, coding standards, and review expectations.

## Project Overview

**formsflow.ai** is a Free, Open-Source, Low Code Development Platform for rapidly building powerful business applications. It combines leading Open-Source applications including:

- **form.io** - Form builder and renderer
- **Camunda** - Workflow and process engine (BPM)
- **Keycloak** - Identity and access management
- **Redash** - Data analytics and visualization
- **React** - Frontend framework
- **Python/Flask** - Backend API services
- **Java/Spring Boot** - BPM services

## Architecture Components

### Frontend Applications
- **forms-flow-web** - Main React application (JavaScript/React)
- **forms-flow-web-root-config** - Micro-frontend root configuration

### Backend Services
- **forms-flow-api** - Python/Flask REST API
- **forms-flow-bpm** - Java/Spring Boot Camunda BPM service
- **forms-flow-data-analysis-api** - Python ML/AI data analysis service
- **forms-flow-documents** - Document generation service
- **forms-flow-data-layer** - Data access layer service

### Infrastructure
- **forms-flow-forms** - Form.io configuration
- **forms-flow-idm** - Keycloak identity management
- **forms-flow-analytics** - Redash analytics configuration

## Code Review Priorities

### 1. Security
- **Authentication & Authorization**: Ensure proper JWT token validation, role-based access control
- **Input Validation**: Check for SQL injection, XSS, CSRF vulnerabilities
- **API Security**: Verify proper CORS configuration, rate limiting, API key protection
- **Secrets Management**: No hardcoded credentials, proper environment variable usage
- **Dependency Security**: Flag outdated or vulnerable dependencies

### 2. Code Quality
- **Type Safety**: Proper type annotations in Python, PropTypes or TypeScript usage in React
- **Error Handling**: Comprehensive try-catch blocks, proper error messages, logging
- **Code Duplication**: Identify and suggest refactoring opportunities
- **Naming Conventions**: Clear, descriptive variable and function names
- **Comments**: Code should be self-documenting; comments for complex logic only

### 3. Performance
- **Database Queries**: Check for N+1 queries, missing indexes, inefficient queries
- **API Calls**: Identify unnecessary API calls, suggest batching or caching
- **React Performance**: Check for unnecessary re-renders, missing memoization
- **Memory Leaks**: Identify unclosed connections, event listeners, subscriptions

### 4. Testing
- **Test Coverage**: Suggest tests for new functionality
- **Test Quality**: Check for meaningful assertions, proper mocking
- **Edge Cases**: Identify missing edge case handling

### 5. Documentation
- **API Documentation**: OpenAPI/Swagger specs should be updated
- **Code Comments**: Complex algorithms should have explanatory comments
- **README Updates**: New features should update relevant documentation

## Coding Standards

### JavaScript/React (forms-flow-web)
```javascript
// Preferred patterns:
// - Functional components with hooks
// - Destructuring props
// - Early returns for guards
// - Proper error boundaries
// - Consistent formatting (Prettier)

// Example:
const MyComponent = ({ data, onUpdate }) => {
  if (!data) return null;
  
  const handleClick = useCallback(() => {
    onUpdate(data.id);
  }, [data.id, onUpdate]);
  
  return <Button onClick={handleClick}>{data.label}</Button>;
};
```

### Python (forms-flow-api, forms-flow-data-analysis-api)
```python
# Preferred patterns:
# - Type hints for function signatures
# - Docstrings for public functions
# - List comprehensions over loops where readable
# - Context managers for resource management
# - PEP 8 compliance

# Example:
def process_submission(submission_id: int) -> Dict[str, Any]:
    """
    Process a form submission and return results.
    
    Args:
        submission_id: The unique identifier for the submission
        
    Returns:
        Dictionary containing processing results
        
    Raises:
        SubmissionNotFoundException: If submission not found
    """
    with get_db_connection() as conn:
        submission = fetch_submission(conn, submission_id)
        return validate_and_process(submission)
```

### Java (forms-flow-bpm)
```java
// Preferred patterns:
// - Dependency injection via Spring
// - Builder pattern for complex objects
// - Proper exception handling
// - Logging at appropriate levels
// - Clean architecture principles

// Example:
@Service
public class ProcessService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ProcessService.class);
    
    private final RuntimeService runtimeService;
    
    @Autowired
    public ProcessService(RuntimeService runtimeService) {
        this.runtimeService = runtimeService;
    }
    
    public ProcessInstance startProcess(String processKey, Map<String, Object> variables) {
        try {
            return runtimeService.startProcessInstanceByKey(processKey, variables);
        } catch (ProcessEngineException e) {
            LOGGER.error("Failed to start process: {}", processKey, e);
            throw new BusinessException("Process start failed", e);
        }
    }
}
```

## Common Anti-Patterns to Flag

### Frontend
- Direct DOM manipulation instead of React state
- Missing key props in lists
- Inline styles instead of CSS modules/SCSS
- Uncontrolled components where controlled ones are appropriate
- Missing PropTypes or type definitions
- Console.log statements in production code
- Hardcoded URLs or configuration values

### Backend
- SQL queries built with string concatenation
- Missing database transaction boundaries
- Synchronous operations blocking async code
- Missing pagination on list endpoints
- Returning full objects instead of DTOs
- Missing API versioning
- Unclosed database connections or file handles

### General
- TODO/FIXME comments without issue references
- Commented-out code blocks
- Large functions (>50 lines) that should be decomposed
- Deep nesting (>3 levels) indicating missing abstractions
- Magic numbers without constants

## Review Process Guidelines

### For Pull Requests
1. **Understand the Context**: Review linked issues, feature requirements
2. **Check the Scope**: Ensure changes align with PR description
3. **Security First**: Always prioritize security concerns
4. **Suggest, Don't Demand**: Provide constructive feedback
5. **Acknowledge Good Patterns**: Positive reinforcement for good code
6. **Provide Examples**: Show better alternatives with code samples
7. **Consider Backward Compatibility**: Flag breaking changes

### Review Effort Estimation
- **Small (< 15 min)**: Bug fixes, typo corrections, config changes
- **Medium (15-30 min)**: New features, refactoring, multiple files
- **Large (30-60 min)**: Architecture changes, major features, complex logic
- **Extra Large (> 60 min)**: Consider breaking into smaller PRs

## File-Specific Guidelines

### API Endpoints
- RESTful naming conventions
- Proper HTTP status codes
- Consistent error response format
- Input validation using schemas
- Rate limiting for public endpoints
- Proper CORS headers

### Database Migrations
- Reversible migrations (up and down)
- No data loss in production
- Performance consideration for large tables
- Proper indexing strategy

### Configuration Files
- No sensitive data in source control
- Environment-specific configurations
- Clear documentation for new variables
- Validation for required configurations

### Tests
- Descriptive test names
- AAA pattern (Arrange, Act, Assert)
- Proper test isolation
- Mock external dependencies
- Test both success and failure paths

## Integration Points to Monitor

### Service Communication
- API contract compatibility between services
- Proper error handling for service failures
- Circuit breaker patterns for resilience
- Timeout configurations

### External Dependencies
- Formio form schema compatibility
- Camunda process definition changes
- Keycloak realm configuration updates
- Database schema migrations

## Release Branches

When reviewing changes for release branches:
- **develop**: Active development, more lenient reviews
- **master**: Production-ready, stricter reviews required
- **release/**: Feature freeze, only bug fixes and critical changes

## Performance Benchmarks

Flag potential performance issues:
- API response time > 2 seconds
- Database queries returning > 1000 records without pagination
- Frontend bundle size increase > 100KB
- Memory usage increase > 50MB

## Accessibility Standards

For frontend changes, check:
- ARIA labels for interactive elements
- Keyboard navigation support
- Color contrast ratios (WCAG AA minimum)
- Screen reader compatibility
- Focus management

## Licensing and Attribution

- All code must be Apache 2.0 compatible
- Third-party code must include proper attribution
- No GPL-licensed dependencies in production code

## Questions to Guide Review

1. Does this change introduce security vulnerabilities?
2. Is the code maintainable and readable?
3. Are there sufficient tests for the changes?
4. Is the performance impact acceptable?
5. Are there backward compatibility concerns?
6. Is the documentation updated appropriately?
7. Does it follow the project's coding standards?
8. Are error cases properly handled?
9. Could this code be simplified or refactored?
10. Are there edge cases that haven't been considered?

## Review Tone and Communication

- Be respectful and constructive
- Assume positive intent
- Ask questions rather than making accusations
- Provide specific, actionable feedback
- Acknowledge when you're unsure
- Balance criticism with recognition of good work

## Additional Context

- This is an active open-source project with multiple contributors
- Changes should consider both technical excellence and accessibility
- Community contributions should be encouraged and supported
- Breaking changes require discussion and documentation
- Performance and security are critical given the enterprise use cases

