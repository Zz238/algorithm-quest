export const CAREER_ROUTES = [
  {
    id: 'backend',
    title: 'Java 后端',
    summary: '从写清楚一个方法，到开发、测试和部署一个接口服务。',
    prerequisites: ['Java 起步课', '数组、集合与方法', '能独立运行和修正一个程序'],
    stages: [
      ['java-core', '对象、类型与异常'],
      ['collections', '集合选择与数据处理'],
      ['testing', '调试、测试与 Git'],
      ['http', 'HTTP 与 Spring Boot 接口'],
      ['data', 'SQL、索引与事务'],
      ['project', '作品：学习记录服务'],
      ['production', '并发、缓存与上线复盘'],
    ],
  },
  {
    id: 'algorithm',
    title: '算法工程师',
    summary: '先补 Python 与数学，再做数据、模型和评估。这里以机器学习与推荐搜索入门为主。',
    prerequisites: ['编程基础与数据结构', '能解释时间和空间复杂度', '愿意补学数学和 Python'],
    stages: [
      ['python', '从 Java 过渡到 Python'],
      ['math', '向量、函数与误差'],
      ['data', '数据清洗与训练集划分'],
      ['models', '基线、拟合与预测'],
      ['evaluation', '指标、泛化与实验记录'],
      ['project', '作品：学习资源推荐实验'],
      ['specialization', '推荐搜索与深度学习进阶'],
    ],
  },
];
export const CAREER_BY_ID = Object.fromEntries(CAREER_ROUTES.map((r) => [r.id, r]));
export const CAREER_STAGE_IDS = CAREER_ROUTES.flatMap((r) => r.stages.map(([id]) => r.id + '-' + id));
export const careerStageRoute = (route, stage) => '/careers/' + route + '/' + stage;
