const groups = [
  [
    'adjacency-matrix enumeration simulation selection-sort counting-sort bucket-sort radix-sort heap-sort',
    () => import('./topics/foundations.js'),
  ],
  [
    'prefix-sum sliding-window prim bellman-ford floyd-warshall spfa topological-sort',
    () => import('./topics/techniques.js'),
  ],
  [
    'big-integer doubly-linked forward-star monotonic-stack monotonic-queue disjoint-set',
    () => import('./topics/structures.js'),
  ],
  [
    'coordinate-compression fenwick-tree trie segment-tree balanced-bst bit-operations',
    () => import('./topics/structures-more.js'),
  ],
  [
    'linear-dp complete-knapsack bounded-knapsack group-knapsack dependency-knapsack tree-dp digit-dp bitmask-dp interval-dp',
    () => import('./topics/dynamic-programming.js'),
  ],
  [
    'string-hashing manacher lca bipartite-matching strongly-connected',
    () => import('./topics/advanced-algorithms.js'),
  ],
];
const loaders = Object.fromEntries(
  groups.flatMap(([ids, loader]) => ids.split(' ').map((id) => [id, loader])),
);
export async function loadAlgorithmTopic(id) {
  if (!loaders[id]) throw Error('没有找到专题。');
  const module = await loaders[id]();
  const topic = Object.values(module)
    .flat()
    .find((t) => t.id === id);
  if (!topic) throw Error('专题数据与目录不一致。');
  return topic;
}
