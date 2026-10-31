import { Difficulty, Topic } from './constants';

export interface CuratedProblem {
  id: number;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  url: string;
}

export const CURATED_PROBLEMS: CuratedProblem[] = [
  // Arrays
  { id: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays', url: 'https://leetcode.com/problems/two-sum/' },
  { id: 26, title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', topic: 'Arrays', url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/' },
  { id: 53, title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/maximum-subarray/' },
  { id: 11, title: 'Container With Most Water', difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/container-with-most-water/' },
  { id: 238, title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
  { id: 41, title: 'First Missing Positive', difficulty: 'Hard', topic: 'Arrays', url: 'https://leetcode.com/problems/first-missing-positive/' },

  // Strings
  { id: 125, title: 'Valid Palindrome', difficulty: 'Easy', topic: 'Strings', url: 'https://leetcode.com/problems/valid-palindrome/' },
  { id: 242, title: 'Valid Anagram', difficulty: 'Easy', topic: 'Strings', url: 'https://leetcode.com/problems/valid-anagram/' },
  { id: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Strings', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
  { id: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium', topic: 'Strings', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
  { id: 49, title: 'Group Anagrams', difficulty: 'Medium', topic: 'Strings', url: 'https://leetcode.com/problems/group-anagrams/' },
  { id: 76, title: 'Minimum Window Substring', difficulty: 'Hard', topic: 'Strings', url: 'https://leetcode.com/problems/minimum-window-substring/' },

  // Linked Lists
  { id: 206, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked Lists', url: 'https://leetcode.com/problems/reverse-linked-list/' },
  { id: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { id: 141, title: 'Linked List Cycle', difficulty: 'Easy', topic: 'Linked Lists', url: 'https://leetcode.com/problems/linked-list-cycle/' },
  { id: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium', topic: 'Linked Lists', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
  { id: 143, title: 'Reorder List', difficulty: 'Medium', topic: 'Linked Lists', url: 'https://leetcode.com/problems/reorder-list/' },
  { id: 23, title: 'Merge k Sorted Lists', difficulty: 'Hard', topic: 'Linked Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },

  // Stacks
  { id: 20, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stacks', url: 'https://leetcode.com/problems/valid-parentheses/' },
  { id: 155, title: 'Min Stack', difficulty: 'Medium', topic: 'Stacks', url: 'https://leetcode.com/problems/min-stack/' },
  { id: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', topic: 'Stacks', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
  { id: 739, title: 'Daily Temperatures', difficulty: 'Medium', topic: 'Stacks', url: 'https://leetcode.com/problems/daily-temperatures/' },
  { id: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topic: 'Stacks', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },

  // Queues
  { id: 225, title: 'Implement Stack using Queues', difficulty: 'Easy', topic: 'Queues', url: 'https://leetcode.com/problems/implement-stack-using-queues/' },
  { id: 232, title: 'Implement Queue using Stacks', difficulty: 'Easy', topic: 'Queues', url: 'https://leetcode.com/problems/implement-queue-using-stacks/' },
  { id: 622, title: 'Design Circular Queue', difficulty: 'Medium', topic: 'Queues', url: 'https://leetcode.com/problems/design-circular-queue/' },
  { id: 933, title: 'Number of Recent Calls', difficulty: 'Easy', topic: 'Queues', url: 'https://leetcode.com/problems/number-of-recent-calls/' },
  { id: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Queues', url: 'https://leetcode.com/problems/sliding-window-maximum/' },

  // Trees
  { id: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
  { id: 226, title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees', url: 'https://leetcode.com/problems/invert-binary-tree/' },
  { id: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Trees', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
  { id: 235, title: 'Lowest Common Ancestor of a Binary Search Tree', difficulty: 'Medium', topic: 'Trees', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
  { id: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', topic: 'Trees', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },

  // Graphs
  { id: 200, title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', url: 'https://leetcode.com/problems/number-of-islands/' },
  { id: 133, title: 'Clone Graph', difficulty: 'Medium', topic: 'Graphs', url: 'https://leetcode.com/problems/clone-graph/' },
  { id: 207, title: 'Course Schedule', difficulty: 'Medium', topic: 'Graphs', url: 'https://leetcode.com/problems/course-schedule/' },
  { id: 417, title: 'Pacific Atlantic Water Flow', difficulty: 'Medium', topic: 'Graphs', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
  { id: 269, title: 'Alien Dictionary', difficulty: 'Hard', topic: 'Graphs', url: 'https://leetcode.com/problems/alien-dictionary/' },

  // Binary Search
  { id: 704, title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
  { id: 74, title: 'Search a 2D Matrix', difficulty: 'Medium', topic: 'Binary Search', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
  { id: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
  { id: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
  { id: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', topic: 'Binary Search', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },

  // Recursion
  { id: 509, title: 'Fibonacci Number', difficulty: 'Easy', topic: 'Recursion', url: 'https://leetcode.com/problems/fibonacci-number/' },
  { id: 21, title: 'Merge Two Sorted Lists (Recursive)', difficulty: 'Easy', topic: 'Recursion', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
  { id: 50, title: 'Pow(x, n)', difficulty: 'Medium', topic: 'Recursion', url: 'https://leetcode.com/problems/powx-n/' },
  { id: 779, title: 'K-th Symbol in Grammar', difficulty: 'Medium', topic: 'Recursion', url: 'https://leetcode.com/problems/k-th-symbol-in-grammar/' },

  // Backtracking
  { id: 78, title: 'Subsets', difficulty: 'Medium', topic: 'Backtracking', url: 'https://leetcode.com/problems/subsets/' },
  { id: 39, title: 'Combination Sum', difficulty: 'Medium', topic: 'Backtracking', url: 'https://leetcode.com/problems/combination-sum/' },
  { id: 46, title: 'Permutations', difficulty: 'Medium', topic: 'Backtracking', url: 'https://leetcode.com/problems/permutations/' },
  { id: 79, title: 'Word Search', difficulty: 'Medium', topic: 'Backtracking', url: 'https://leetcode.com/problems/word-search/' },
  { id: 51, title: 'N-Queens', difficulty: 'Hard', topic: 'Backtracking', url: 'https://leetcode.com/problems/n-queens/' },

  // Greedy
  { id: 55, title: 'Jump Game', difficulty: 'Medium', topic: 'Greedy', url: 'https://leetcode.com/problems/jump-game/' },
  { id: 45, title: 'Jump Game II', difficulty: 'Medium', topic: 'Greedy', url: 'https://leetcode.com/problems/jump-game-ii/' },
  { id: 134, title: 'Gas Station', difficulty: 'Medium', topic: 'Greedy', url: 'https://leetcode.com/problems/gas-station/' },
  { id: 763, title: 'Partition Labels', difficulty: 'Medium', topic: 'Greedy', url: 'https://leetcode.com/problems/partition-labels/' },
  { id: 135, title: 'Candy', difficulty: 'Hard', topic: 'Greedy', url: 'https://leetcode.com/problems/candy/' },

  // DP
  { id: 70, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'DP', url: 'https://leetcode.com/problems/climbing-stairs/' },
  { id: 198, title: 'House Robber', difficulty: 'Medium', topic: 'DP', url: 'https://leetcode.com/problems/house-robber/' },
  { id: 322, title: 'Coin Change', difficulty: 'Medium', topic: 'DP', url: 'https://leetcode.com/problems/coin-change/' },
  { id: 300, title: 'Longest Increasing Subsequence', difficulty: 'Medium', topic: 'DP', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  { id: 1143, title: 'Longest Common Subsequence', difficulty: 'Medium', topic: 'DP', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
  { id: 72, title: 'Edit Distance', difficulty: 'Hard', topic: 'DP', url: 'https://leetcode.com/problems/edit-distance/' },
];
