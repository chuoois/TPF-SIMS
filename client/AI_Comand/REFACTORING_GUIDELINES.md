# Refactoring Guidelines: SWR & Loading States

## 1. SWR Caching Mechanism (useCachedFetch)
When refactoring components to use the `useCachedFetch` hook, follow these strict steps:

### Import & Setup
- Import `useCachedFetch` from `@/hooks/useCachedFetch`.
- Use `useCallback` for the fetch function (`fetchFn`) from React.

### Fetch Function (`fetchFn`)
- Wrap API calls in `useCallback`.
- Return a structured object (e.g., `{ items, total }`) so the hook can cache the final mapped data.
- **Dependencies**: All variables affecting the query (page, filters, search term, dates) MUST be in the `useCallback` dependency array.

### Hook Usage
- Use a **dynamic cache key** that includes all state variables affecting the result.
- Pattern: `` `prefix_${filter1}_${filter2}_${currentPage}` ``
- Default TTL: 5 minutes (`1000 * 60 * 5`).
- Example:
```javascript
const { data: cachedData, isLoading, isRefreshing, refresh } = useCachedFetch(
  `key_prefix_${filter}_${currentPage}`, 
  fetchFn,
  { ttl: 1000 * 60 * 5 }
);
const items = cachedData?.items || [];
```

### Cleanup
- Remove legacy `useState` for `data`, `loading`, `total`, etc.
- Remove `useEffect` manual fetchers and `fetchIdRef` (hook handles race conditions).

## 2. Global Loading Pattern ("The Purple Bar")
Always implement the global top loading indicator to match the system's "premium" design language:

- **Visibility**: Show when **either** `isLoading` (initial/router load) or `isRefreshing` (background sync) is true.
- **Positioning**: `fixed` at the absolute top of the viewport (`top-0 left-0 right-0`).
- **Style**:
    - **Height**: `h-[2px]`
    - **Color**: `bg-indigo-500` (The "purple thing")
    - **Animation**: `animate-[loading_1.5s_infinite]`
    - **Origin**: `origin-left`
    - **Z-Index**: `z-[9999]` (Must stay above all headers/modals).

```jsx
{(isLoading || isRefreshing) && (
  <div className="fixed top-0 left-0 right-0 z-[9999]">
    <div className="h-[2px] bg-indigo-500 animate-[loading_1.5s_infinite] origin-left"></div>
  </div>
)}
```

---
*Reference this standard whenever the prompt "REFACTOR COMPONENT SANG CƠ CHẾ CACHING SWR" is used.*
