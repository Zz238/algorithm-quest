export const chapters = [
  {
    "title": "程序与算法",
    "world": 0,
    "subtitle": "先把一件小事说清楚",
    "lessons": [
      {
        "title": "算法：把事情做成的步骤",
        "story": "在一排储物格里找钥匙：从左边开始，一个一个打开，找到就停。你已经在执行一套办法。",
        "concept": "算法描述解决某类问题的明确步骤。输入是开始时拿到的信息；输出是最后交出的结果。程序则是把办法写成计算机能够执行的形式。",
        "steps": [
          "说清楚给了哪些数字",
          "明确最后要得到什么",
          "按能实际执行、最终会结束的步骤处理"
        ],
        "trap": "“随便找一下”不够明确；步骤要让别人照着也能做。",
        "codeKey": "linear",
        "viz": "flow",
        "complexity": "先保证步骤正确，再比较快慢。",
        "id": "1-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int find(int[] nums, int target) {",
            "        for (int i = 0; i < nums.length; i++) {",
            "            if (nums[i] == target) {",
            "                return i;",
            "            }",
            "        }",
            "        return -1;",
            "    }",
            "}"
          ],
          "notes": [
            "定义顺序查找示例。",
            "接收一组整数和目标数字，返回第一次找到的位置。",
            "从第一个有效编号开始，逐个查看数组。",
            "判断当前格子的数与目标是否相等。",
            "找到后返回位置编号，整个 find 方法在这里结束。",
            "结束第 4 行开始的代码块（if (nums[i] == target) {）。",
            "结束第 3 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
            "所有格子都查过仍未返回，就用 -1 表示找不到。",
            "结束第 2 行开始的代码块（public int find(int[] nums, int target) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "数据结构：东西怎样摆放",
        "story": "书排成一排，按编号取；通讯录按名字查；家庭成员之间还有长辈、晚辈的层次。不同关系适合不同组织方法。",
        "concept": "数据结构包括数据怎样组织、数据之间的关系和相应操作。数组像一排有编号的格子；链表靠引用连接；树表达层次；图表达任意连接。",
        "steps": [
          "先观察数据之间是什么关系",
          "再选择存放和访问的方式",
          "用算法对这份结构进行操作"
        ],
        "trap": "“逻辑关系”不等于“实际存放位置”：排队关系既可用数组实现，也可用链表实现。",
        "codeKey": "array",
        "viz": "structures",
        "complexity": "某项操作变快，可能需要更多空间；结构选择需要权衡。",
        "id": "1-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public int total(int[] nums) {",
            "        int sum = 0;",
            "        for (int x : nums) {",
            "            sum += x;",
            "        }",
            "        return sum;",
            "    }",
            "}"
          ],
          "notes": [
            "定义数组示例类。",
            "参数是整数数组，方法返回这些数字的总和。",
            "先准备一个整数变量来保存总和。",
            "增强 for 循环依次把数组中的值交给 x；这里拿到的是值，不是下标。",
            "与 sum = sum + x 含义相同，累计当前数字。",
            "结束第 4 行开始的代码块（for (int x : nums) {）。",
            "返回最终总和；空数组会返回 0。",
            "结束第 2 行开始的代码块（public int total(int[] nums) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "时间与空间：看增长，不背口诀",
        "story": "找 4 个格子最多看 4 次，找 100 个最多看 100 次。给结果准备一排新格子，也会随着输入变长。",
        "concept": "时间复杂度描述主要操作次数随输入规模 n 的增长趋势；空间复杂度通常关注额外使用的存储。O(1) 是规模增加时数量仍有固定上界，绝不等于只执行一次。",
        "steps": [
          "固定其它条件，逐渐增加 n",
          "数关键操作怎样增长",
          "区分输入、输出和额外工作空间"
        ],
        "trap": "不能把 O(n) 直接读成 n 秒，也不能只看一个小输入的用时。最好、最坏、平均情况要说明比较的是哪一种。",
        "codeKey": "running",
        "viz": "complexity",
        "complexity": "顺序查找最坏 O(n)、最好 O(1)；累计结果需 O(n) 输出空间。",
        "id": "1-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public int[] runningSum(int[] nums) {",
            "        int[] result = new int[nums.length];",
            "        int sum = 0;",
            "        for (int i = 0; i < nums.length; i++) {",
            "            sum = sum + nums[i];",
            "            result[i] = sum;",
            "        }",
            "        return result;",
            "    }",
            "}"
          ],
          "notes": [
            "练习平台会创建 Solution 类的对象，调用下面的方法；类把相关代码装在一起。",
            "接收名叫 nums 的整数数组，返回一个整数数组。",
            "准备同样长度的新数组，用来保存每一步的累计结果。",
            "用 sum 记住到目前为止的总和，最初还没加任何数字。",
            "从下标 0 开始，依次走过每个有效下标。",
            "旧的总和加上当前格子里的数，再存回 sum。",
            "把走到这个位置时的累计结果放进对应格子。",
            "结束第 5 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
            "把累计结果数组交给调用这个方法的地方。",
            "结束第 2 行开始的代码块（public int[] runningSum(int[] nums) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "第一次推演：从左到右累加",
        "story": "每天存一些零钱，账本上还想记录“截至今天总共存了多少”。每走一天，把当天金额加到旧总额上。",
        "concept": "维护一个 sum，记录已经处理过的数字之和。每次只接着旧结果往下算，这种“我处理到这里时一直保证某句话成立”的说法，叫循环不变式。",
        "steps": [
          "总额从 0 开始",
          "加上当前数字",
          "保存这一站的累计总额，再去下一站"
        ],
        "trap": "负数也能累加；不要每走到一格就把 sum 重新设成 0。数组与循环的语法会在后面继续拆开讲。",
        "codeKey": "running",
        "viz": "prefix",
        "complexity": "只走一遍是 O(n)；本解另外保存 n 个结果，空间 O(n)。",
        "id": "1-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public int[] runningSum(int[] nums) {",
            "        int[] result = new int[nums.length];",
            "        int sum = 0;",
            "        for (int i = 0; i < nums.length; i++) {",
            "            sum = sum + nums[i];",
            "            result[i] = sum;",
            "        }",
            "        return result;",
            "    }",
            "}"
          ],
          "notes": [
            "练习平台会创建 Solution 类的对象，调用下面的方法；类把相关代码装在一起。",
            "接收名叫 nums 的整数数组，返回一个整数数组。",
            "准备同样长度的新数组，用来保存每一步的累计结果。",
            "用 sum 记住到目前为止的总和，最初还没加任何数字。",
            "从下标 0 开始，依次走过每个有效下标。",
            "旧的总和加上当前格子里的数，再存回 sum。",
            "把走到这个位置时的累计结果放进对应格子。",
            "结束第 5 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
            "把累计结果数组交给调用这个方法的地方。",
            "结束第 2 行开始的代码块（public int[] runningSum(int[] nums) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 1,
    "boss": {
      "lc": 1480,
      "url": "https://leetcode.com/problems/running-sum-of-1d-array/",
      "title": "一维数组的动态和",
      "description": "给出一组整数。请为每个位置计算从第一个数到当前位置的总和，返回这些累计值组成的新数组。数组长度 1～1000，元素在 -10^6～10^6 之间。",
      "relation": [
        "把输入变成输出的一套明确步骤",
        "保留上一步的累计信息",
        "先看图推演；数组与循环语法会在后面详细学"
      ],
      "approach": [
        "总和先设为 0，结果数组与输入同长",
        "从左到右取一个数，把它加进 sum",
        "把 sum 放进相同位置的结果格子",
        "继续到最后一个数，再返回结果"
      ],
      "proof": "处理下标 i 之前，sum 是前 i 个数的和；加上 nums[i] 后就是 0 到 i 的和。逐个保存，所以每个位置都满足题目要求。",
      "complexity": "时间 O(n)。本解用 O(n) 新数组保存输出；除输出外的辅助空间 O(1)。",
      "pitfalls": [
        "别把每个位置都写成整组数字的最终总和",
        "sum 不要在循环里重新清零",
        "负数也需要照常累加"
      ],
      "codeKey": "running",
      "cases": [
        {
          "input": {
            "nums": [
              1,
              2,
              3,
              4
            ]
          },
          "output": [
            1,
            3,
            6,
            10
          ]
        },
        {
          "input": {
            "nums": [
              3,
              -2,
              4
            ]
          },
          "output": [
            3,
            1,
            5
          ]
        }
      ],
      "question": "走到第二个格子前，sum 应该记着什么？",
      "options": [
        "已经处理过的所有数字之和",
        "还没处理的数字之和",
        "数组长度"
      ],
      "correct": 0,
      "hints": [
        "先手算 [1,2,3] 的每一站总额",
        "用一个 sum 保留上一站结果",
        "每次先加当前数字，再把新 sum 保存到结果中"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int[] runningSum(int[] nums) {",
          "        int[] result = new int[nums.length];",
          "        int sum = 0;",
          "        for (int i = 0; i < nums.length; i++) {",
          "            sum = sum + nums[i];",
          "            result[i] = sum;",
          "        }",
          "        return result;",
          "    }",
          "}"
        ],
        "notes": [
          "练习平台会创建 Solution 类的对象，调用下面的方法；类把相关代码装在一起。",
          "接收名叫 nums 的整数数组，返回一个整数数组。",
          "准备同样长度的新数组，用来保存每一步的累计结果。",
          "用 sum 记住到目前为止的总和，最初还没加任何数字。",
          "从下标 0 开始，依次走过每个有效下标。",
          "旧的总和加上当前格子里的数，再存回 sum。",
          "把走到这个位置时的累计结果放进对应格子。",
          "结束第 5 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
          "把累计结果数组交给调用这个方法的地方。",
          "结束第 2 行开始的代码块（public int[] runningSum(int[] nums) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "Java 识字课",
    "world": 0,
    "subtitle": "把代码里的每个词拆开看",
    "lessons": [
      {
        "title": "完整程序从哪里开始",
        "story": "把程序想成一个小店：类是店面，方法是一项能做的工作，main 是这个传统示例约定的开门入口。",
        "concept": "采用传统写法时，public class Main 中放 public static void main(String[] args)。public 是访问修饰符，static 让入口无需先创建对象，void 表示不返回值，main 是约定的方法名。",
        "steps": [
          "文件保存为 Main.java",
          "从 main 中第一条语句开始",
          "按先后执行，最后离开方法"
        ],
        "trap": "main、Main、String 不是关键字，大小写也不能随意改。力扣负责调用 Solution 的方法，因此答案常常没有 main。",
        "codeKey": "entry",
        "viz": "flow",
        "complexity": "这里只有固定几条语句，随输入规模不增长。",
        "id": "2-1",
        "code": {
          "lines": [
            "public class Main {",
            "    public static void main(String[] args) {",
            "        int apples = 3;",
            "        apples = apples + 2;",
            "        System.out.println(apples);",
            "    }",
            "}"
          ],
          "notes": [
            "定义名叫 Main 的类；保存文件时使用 Main.java。",
            "传统 Java 程序从这里开始；args 接收启动时传入的文字，本例不用它。",
            "准备一个整数变量，取名 apples，先存入 3。",
            "先算出旧值 3 加 2，再把结果 5 存回 apples。",
            "把 apples 的值打印到屏幕上，并换行；打印和返回值不是一回事。",
            "结束第 2 行开始的代码块（public static void main(String[] args) {）。",
            "结束第 1 行开始的代码块（public class Main {）。"
          ]
        }
      },
      {
        "title": "变量与类型：给盒子贴标签",
        "story": "一个盒子叫 apples，里面先放 3，后来又放成 5。名字没有变，盒子记录的值变了。",
        "concept": "int 存整数，double 存小数，boolean 存真假，char 存单个字符，String 表示字符串。变量名由程序员命名；= 把右边计算出的值交给左边。",
        "steps": [
          "声明变量并给初始值",
          "先算等号右边",
          "把新结果写回变量"
        ],
        "trap": "int x = 3 / 2 的结果是 1，因为两个整数相除会截去小数部分。int 也有范围，超范围不会自动变成无限大的整数。",
        "codeKey": "entry",
        "viz": "variables",
        "complexity": "固定个数的基础变量通常占 O(1) 额外空间。",
        "id": "2-2",
        "code": {
          "lines": [
            "public class Main {",
            "    public static void main(String[] args) {",
            "        int apples = 3;",
            "        apples = apples + 2;",
            "        System.out.println(apples);",
            "    }",
            "}"
          ],
          "notes": [
            "定义名叫 Main 的类；保存文件时使用 Main.java。",
            "传统 Java 程序从这里开始；args 接收启动时传入的文字，本例不用它。",
            "准备一个整数变量，取名 apples，先存入 3。",
            "先算出旧值 3 加 2，再把结果 5 存回 apples。",
            "把 apples 的值打印到屏幕上，并换行；打印和返回值不是一回事。",
            "结束第 2 行开始的代码块（public static void main(String[] args) {）。",
            "结束第 1 行开始的代码块（public class Main {）。"
          ]
        }
      },
      {
        "title": "符号不是装饰：赋值与比较",
        "story": "“把 9 放进目标盒子”是一项动作；“这两个盒子的数字相等吗”是一项判断，它们不是一回事。",
        "concept": "= 用来赋值，== 在本课程的基础数值比较中判断相等；!= 表示不等；&& 表示两个条件都成立；|| 表示至少一个成立；! 表示取反。字符串内容通常用 equals 比较。",
        "steps": [
          "读出左边和右边是什么",
          "区分写入值还是作判断",
          "再看判断结果为 true 还是 false"
        ],
        "trap": "不能把比较整数的 == 套用成所有对象的内容比较。Java 中 String 用 == 比较的是引用身份。",
        "codeKey": "operators",
        "viz": "compare",
        "complexity": "基础数值比较在这里视为 O(1)。",
        "id": "2-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public boolean same(int a, int b) {",
            "        boolean equal = (a == b);",
            "        return equal;",
            "    }",
            "}"
          ],
          "notes": [
            "定义一个放示例方法的类。",
            "接收两个整数，返回 boolean 类型的判断结果。",
            "== 比较两边是否相等，结果是 true 或 false；= 把结果保存起来。",
            "把刚才得到的判断结果返回。",
            "结束第 2 行开始的代码块（public boolean same(int a, int b) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "方法、参数、返回值与引用",
        "story": "请人帮忙算两数之和：给他的两个数字是参数，他交回来的结果是返回值，打印只是把信息写到屏幕。",
        "concept": "方法签名说明名字、参数和返回类型。Java 始终按值传递参数：基本类型复制数值，引用类型复制引用。因此传入数组后可以通过引用改动原数组的元素。",
        "steps": [
          "调用时把实参交给形参",
          "在方法内执行语句",
          "用 return 交还结果并结束当前方法"
        ],
        "trap": "void 方法没有返回值；有返回类型的方法要保证相关执行路径能够返回。打印结果不等于 return。",
        "codeKey": "add",
        "viz": "function",
        "complexity": "整数加法示例时间 O(1)，额外空间 O(1)。",
        "id": "2-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public int sum(int num1, int num2) {",
            "        return num1 + num2;",
            "    }",
            "}"
          ],
          "notes": [
            "定义力扣用来承载答案的类，类名按平台约定写成 Solution。",
            "public 允许外部调用；int 表示返回整数；两个参数接收输入。",
            "先计算两个整数相加的结果，再把它返回给调用者。",
            "结束第 2 行开始的代码块（public int sum(int num1, int num2) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 2,
    "boss": {
      "lc": 2235,
      "url": "https://leetcode.com/problems/add-two-integers/",
      "title": "两数相加",
      "description": "接收两个整数 num1 和 num2，返回它们的和。两数都在 -100～100 之间。返回值是整数，不要求打印文字。",
      "relation": [
        "方法的参数与返回类型",
        "+ 运算符与 return",
        "关键字、名字和符号的区分"
      ],
      "approach": [
        "形参 num1 与 num2 分别接收输入",
        "用 + 得到一个整数结果",
        "用 return 把结果交还给调用者"
      ],
      "proof": "整数加法按定义得到两个输入的和，直接返回即可。原题范围内，结果一定能放进 Java int。",
      "complexity": "时间 O(1)，额外空间 O(1)。",
      "pitfalls": [
        "不要用打印替代返回",
        "负数输入也能直接相加",
        "LeetCode 调用 Solution.sum，不需要自己添加 main"
      ],
      "codeKey": "add",
      "cases": [
        {
          "input": {
            "num1": 12,
            "num2": 5
          },
          "output": 17
        },
        {
          "input": {
            "num1": -10,
            "num2": 4
          },
          "output": -6
        }
      ],
      "question": "这里 return 的作用是？",
      "options": [
        "把两个数放进数组",
        "把结果交给调用者并结束当前方法",
        "把答案打印到网页"
      ],
      "correct": 1,
      "hints": [
        "输入已经是整数，不需要自己解析字符串",
        "目标是交回结果，而不是输出一段文字",
        "直接返回 num1 + num2"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int sum(int num1, int num2) {",
          "        return num1 + num2;",
          "    }",
          "}"
        ],
        "notes": [
          "定义力扣用来承载答案的类，类名按平台约定写成 Solution。",
          "public 允许外部调用；int 表示返回整数；两个参数接收输入。",
          "先计算两个整数相加的结果，再把它返回给调用者。",
          "结束第 2 行开始的代码块（public int sum(int num1, int num2) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "变量、判断与循环",
    "world": 0,
    "subtitle": "让计算机按规则重复",
    "lessons": [
      {
        "title": "if 与 else：先做选择",
        "story": "天气下雨就带伞，否则戴帽子。一次只执行符合条件的分支，而不是两个分支都做。",
        "concept": "if 根据 boolean 条件决定是否进入代码块；else 处理条件为假的分支。else if 能继续检查其它条件；先命中的分支会先被选择。",
        "steps": [
          "算出当前条件",
          "为真就执行 if 的代码",
          "为假再走 else 的路径"
        ],
        "trap": "数值不是 Java 的布尔值；不能直接写 if (1)。大括号能让分支范围更清楚。",
        "codeKey": "reduce",
        "viz": "condition",
        "complexity": "一次判断通常是 O(1)，整个算法还要看重复次数。",
        "id": "3-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int numberOfSteps(int num) {",
            "        int steps = 0;",
            "        while (num > 0) {",
            "            if (num % 2 == 0) {",
            "                num = num / 2;",
            "            } else {",
            "                num = num - 1;",
            "            }",
            "            steps++;",
            "        }",
            "        return steps;",
            "    }",
            "}"
          ],
          "notes": [
            "定义答案所在的类。",
            "接收一个非负整数，返回把它变成 0 所需的操作次数。",
            "还没进行操作，计数从 0 开始。",
            "只要 num 仍大于 0，就继续处理。",
            "% 求余数；除以 2 余 0，说明当前数字是偶数。",
            "偶数除以 2，并把新值保存到 num。",
            "条件不成立时，也就是奇数，进入这一条分支。",
            "奇数先减去 1。",
            "结束第 7 行开始的代码块（} else {）。",
            "不论选哪个分支，刚刚都只做了一次操作，计数加 1。",
            "结束第 4 行开始的代码块（while (num > 0) {）。",
            "num 已经是 0，把累计操作次数返回；输入本来是 0 时返回 0。",
            "结束第 2 行开始的代码块（public int numberOfSteps(int num) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "for 循环：起点、条件、更新",
        "story": "检票员从第 0 个座位开始，检查一个座位后往右走，不能走到最后一个编号之外。",
        "concept": "for 的三个部分按“初始化一次 → 判断 → 循环体 → 更新 → 再判断”执行。i++ 在更新部分把编号增加 1；增强 for 适合按顺序取值。",
        "steps": [
          "只初始化一次 i",
          "每轮开始前检查范围",
          "执行后更新 i，再回到条件"
        ],
        "trap": "i < length 与 i <= length 差一个位置；访问下标 length 会越界。",
        "codeKey": "array",
        "viz": "linear",
        "complexity": "完整扫描长度 n 的数组需要 O(n)。",
        "id": "3-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public int total(int[] nums) {",
            "        int sum = 0;",
            "        for (int x : nums) {",
            "            sum += x;",
            "        }",
            "        return sum;",
            "    }",
            "}"
          ],
          "notes": [
            "定义数组示例类。",
            "参数是整数数组，方法返回这些数字的总和。",
            "先准备一个整数变量来保存总和。",
            "增强 for 循环依次把数组中的值交给 x；这里拿到的是值，不是下标。",
            "与 sum = sum + x 含义相同，累计当前数字。",
            "结束第 4 行开始的代码块（for (int x : nums) {）。",
            "返回最终总和；空数组会返回 0。",
            "结束第 2 行开始的代码块（public int total(int[] nums) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "while、break 与边界",
        "story": "把数字逐步变小，只要还不是 0 就继续；找到钥匙就提前停止找。这两种停止方式都需要明确规则。",
        "concept": "while 在每轮前检查条件。break 离开当前一层循环；return 离开整个当前方法。循环必须朝能够终止的状态推进，否则可能一直重复。",
        "steps": [
          "先确认条件会不会一开始就为假",
          "每轮改变状态",
          "条件为假或遇到 break 时离开"
        ],
        "trap": "输入已经是 0 时应执行 0 次；不要为了“至少做一次”而无条件先减一。",
        "codeKey": "reduce",
        "viz": "reduce",
        "complexity": "把数不断减半，操作数为 O(log n)；n=0 单独视为常数情况。",
        "id": "3-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public int numberOfSteps(int num) {",
            "        int steps = 0;",
            "        while (num > 0) {",
            "            if (num % 2 == 0) {",
            "                num = num / 2;",
            "            } else {",
            "                num = num - 1;",
            "            }",
            "            steps++;",
            "        }",
            "        return steps;",
            "    }",
            "}"
          ],
          "notes": [
            "定义答案所在的类。",
            "接收一个非负整数，返回把它变成 0 所需的操作次数。",
            "还没进行操作，计数从 0 开始。",
            "只要 num 仍大于 0，就继续处理。",
            "% 求余数；除以 2 余 0，说明当前数字是偶数。",
            "偶数除以 2，并把新值保存到 num。",
            "条件不成立时，也就是奇数，进入这一条分支。",
            "奇数先减去 1。",
            "结束第 7 行开始的代码块（} else {）。",
            "不论选哪个分支，刚刚都只做了一次操作，计数加 1。",
            "结束第 4 行开始的代码块（while (num > 0) {）。",
            "num 已经是 0，把累计操作次数返回；输入本来是 0 时返回 0。",
            "结束第 2 行开始的代码块（public int numberOfSteps(int num) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "自己当一次计算机",
        "story": "从 num = 14 开始写账：14→7→6→3→2→1→0，每画一条箭头就做了一次操作。",
        "concept": "跟踪表记录每轮开始的变量、选了哪个分支和更新后的值。测试时要覆盖 0、1、偶数和奇数，不能只试一组看起来顺眼的数据。",
        "steps": [
          "列出变量旧值",
          "只执行实际命中的那条分支",
          "更新计数，并检查是否应该停止"
        ],
        "trap": "先把 num 变了再判断原来是不是偶数，会把两轮混在一起。逐句推演能发现这类次序问题。",
        "codeKey": "reduce",
        "viz": "reduce",
        "complexity": "计数变量和当前数字固定，额外空间 O(1)。",
        "id": "3-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public int numberOfSteps(int num) {",
            "        int steps = 0;",
            "        while (num > 0) {",
            "            if (num % 2 == 0) {",
            "                num = num / 2;",
            "            } else {",
            "                num = num - 1;",
            "            }",
            "            steps++;",
            "        }",
            "        return steps;",
            "    }",
            "}"
          ],
          "notes": [
            "定义答案所在的类。",
            "接收一个非负整数，返回把它变成 0 所需的操作次数。",
            "还没进行操作，计数从 0 开始。",
            "只要 num 仍大于 0，就继续处理。",
            "% 求余数；除以 2 余 0，说明当前数字是偶数。",
            "偶数除以 2，并把新值保存到 num。",
            "条件不成立时，也就是奇数，进入这一条分支。",
            "奇数先减去 1。",
            "结束第 7 行开始的代码块（} else {）。",
            "不论选哪个分支，刚刚都只做了一次操作，计数加 1。",
            "结束第 4 行开始的代码块（while (num > 0) {）。",
            "num 已经是 0，把累计操作次数返回；输入本来是 0 时返回 0。",
            "结束第 2 行开始的代码块（public int numberOfSteps(int num) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 3,
    "boss": {
      "lc": 1342,
      "url": "https://leetcode.com/problems/number-of-steps-to-reduce-a-number-to-zero/",
      "title": "把数字变成零",
      "description": "给定非负整数 num，每次操作按当前值选择：偶数除以 2，奇数减去 1。求变成 0 需要的操作次数。num 在 0～10^6 之间。",
      "relation": [
        "if 与 else 只走一条分支",
        "while 的停止条件",
        "变量更新与操作计数"
      ],
      "approach": [
        "先令 steps 为 0",
        "num 大于 0 时继续",
        "用余数判断奇偶，只执行相应操作",
        "每轮完成一个操作，steps 增加 1",
        "num 为 0 时返回计数"
      ],
      "proof": "每轮严格执行题目规定的一次操作并准确计数；非负 num 会持续减小，最终到 0，因此计数就是所需次数。",
      "complexity": "num>0 时 O(log num) 时间，额外空间 O(1)；输入 0 为常数时间。",
      "pitfalls": [
        "0 一开始就不必操作",
        "一轮只能选择除法或减法之一",
        "计数应在两个分支外统一加 1"
      ],
      "codeKey": "reduce",
      "cases": [
        {
          "input": {
            "num": 14
          },
          "output": 6
        },
        {
          "input": {
            "num": 0
          },
          "output": 0
        }
      ],
      "question": "num % 2 == 0 表示什么？",
      "options": [
        "num 是奇数",
        "num 只能等于 2",
        "num 是偶数"
      ],
      "correct": 2,
      "hints": [
        "把 14 的路径写下来，每一条箭头计一次",
        "while 只在 num>0 时进入",
        "偶数除以 2，奇数减 1；每轮 steps++"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int numberOfSteps(int num) {",
          "        int steps = 0;",
          "        while (num > 0) {",
          "            if (num % 2 == 0) {",
          "                num = num / 2;",
          "            } else {",
          "                num = num - 1;",
          "            }",
          "            steps++;",
          "        }",
          "        return steps;",
          "    }",
          "}"
        ],
        "notes": [
          "定义答案所在的类。",
          "接收一个非负整数，返回把它变成 0 所需的操作次数。",
          "还没进行操作，计数从 0 开始。",
          "只要 num 仍大于 0，就继续处理。",
          "% 求余数；除以 2 余 0，说明当前数字是偶数。",
          "偶数除以 2，并把新值保存到 num。",
          "条件不成立时，也就是奇数，进入这一条分支。",
          "奇数先减去 1。",
          "结束第 7 行开始的代码块（} else {）。",
          "不论选哪个分支，刚刚都只做了一次操作，计数加 1。",
          "结束第 4 行开始的代码块（while (num > 0) {）。",
          "num 已经是 0，把累计操作次数返回；输入本来是 0 时返回 0。",
          "结束第 2 行开始的代码块（public int numberOfSteps(int num) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "数组、字符串与查找",
    "world": 1,
    "subtitle": "格子、编号，以及排除不可能",
    "lessons": [
      {
        "title": "数组的编号与增删代价",
        "story": "储物柜的第一格编号是 0。要在柜子中间空出一格，后面的东西通常得一起挪动。",
        "concept": "数组按编号访问，Java 数组创建后长度固定。连续存放是入门时理解数组的模型；ArrayList 是可调整容量的列表，容量扩张时会分配新空间并复制。",
        "steps": [
          "用 length 读取长度",
          "用 0 到 length-1 访问元素",
          "考虑插入删除要搬动哪些元素"
        ],
        "trap": "创建 int[4] 得到 4 个初始为 0 的格子。length 是总数，不是最后一个编号。",
        "codeKey": "array",
        "viz": "array",
        "complexity": "按下标访问 O(1)；数组中间增删一般需要 O(n) 移动。",
        "id": "4-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int total(int[] nums) {",
            "        int sum = 0;",
            "        for (int x : nums) {",
            "            sum += x;",
            "        }",
            "        return sum;",
            "    }",
            "}"
          ],
          "notes": [
            "定义数组示例类。",
            "参数是整数数组，方法返回这些数字的总和。",
            "先准备一个整数变量来保存总和。",
            "增强 for 循环依次把数组中的值交给 x；这里拿到的是值，不是下标。",
            "与 sum = sum + x 含义相同，累计当前数字。",
            "结束第 4 行开始的代码块（for (int x : nums) {）。",
            "返回最终总和；空数组会返回 0。",
            "结束第 2 行开始的代码块（public int total(int[] nums) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "字符串与双指针",
        "story": "检查一句话时，可以从左边读，也能同时从两端向中间看。两个编号就是两根指针，并不是必须出现真正的内存地址。",
        "concept": "String 是不可变对象，修改内容会产生新字符串。charAt(i) 读取 UTF-16 代码单元；本课程字符示例限定在基础英文字符。双指针让两个位置按规则配合移动。",
        "steps": [
          "先定义两个编号各代表什么",
          "比较当前位置",
          "移动一个或两个编号，并维持规则"
        ],
        "trap": "字符串的 length() 有括号，数组的 length 没有。中文或 emoji 的完整字符处理需要更细的 Unicode 知识，别把 char 当作所有语言的完整字符。",
        "codeKey": "palindrome",
        "viz": "twoPointers",
        "complexity": "字符串扫描 O(n)；两个下标本身只占 O(1)。",
        "id": "4-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public boolean palindrome(String s) {",
            "        int l = 0, r = s.length() - 1;",
            "        while (l < r) {",
            "            if (s.charAt(l) != s.charAt(r)) return false;",
            "            l++; r--;",
            "        }",
            "        return true;",
            "    }",
            "}"
          ],
          "notes": [
            "定义只处理基础英文字符的双指针示例。",
            "判断字符串从两边向中间读是否相同。",
            "两个下标分别从左右端出发。",
            "只需比较还没相遇的位置。",
            "任何一对不同，就不是回文。",
            "这一对相同，两端同时向内移动。",
            "结束第 4 行开始的代码块（while (l < r) {）。",
            "全部对应字符都相同，包括空串和单字符。",
            "结束第 2 行开始的代码块（public boolean palindrome(String s) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "顺序查找：逐个问一遍",
        "story": "在没有顺序的座位表里找同学，只能从头问到尾；一旦找到就返回那个位置。",
        "concept": "顺序查找不要求数组已经排好。返回第一次匹配的下标，所有位置都不匹配才返回 -1。数组中允许出现重复值。",
        "steps": [
          "从下标 0 出发",
          "比较当前值与目标",
          "命中就返回，扫完返回 -1"
        ],
        "trap": "要返回编号而不是数字本身；空数组也应有清晰结果，循环不执行就返回 -1。",
        "codeKey": "linear",
        "viz": "linear",
        "complexity": "最坏 O(n)，最好 O(1)，额外空间 O(1)。",
        "id": "4-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public int find(int[] nums, int target) {",
            "        for (int i = 0; i < nums.length; i++) {",
            "            if (nums[i] == target) {",
            "                return i;",
            "            }",
            "        }",
            "        return -1;",
            "    }",
            "}"
          ],
          "notes": [
            "定义顺序查找示例。",
            "接收一组整数和目标数字，返回第一次找到的位置。",
            "从第一个有效编号开始，逐个查看数组。",
            "判断当前格子的数与目标是否相等。",
            "找到后返回位置编号，整个 find 方法在这里结束。",
            "结束第 4 行开始的代码块（if (nums[i] == target) {）。",
            "结束第 3 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
            "所有格子都查过仍未返回，就用 -1 表示找不到。",
            "结束第 2 行开始的代码块（public int find(int[] nums, int target) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "二分查找：每次排除一半",
        "story": "在按学号排列的名单中找人，先翻中间：目标学号更大，就把较小的整半本放下。",
        "concept": "二分查找依赖有序性。本解使用左右都包含的 [left,right] 区间，比较中间值后，必须连 mid 一起排除，才能保证区间缩小。",
        "steps": [
          "检查输入是否有序",
          "比较中间值，排除确定不可能的半边",
          "直到命中或 left 大于 right"
        ],
        "trap": "不能在乱序数组上直接二分。采用闭区间就要配套 <=、mid+1、mid-1，别与其它区间写法混用。",
        "codeKey": "binary",
        "viz": "binary",
        "complexity": "最坏 O(log n)，额外空间 O(1)。",
        "id": "4-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public int search(int[] nums, int target) {",
            "        int left = 0;",
            "        int right = nums.length - 1;",
            "        while (left <= right) {",
            "            int mid = left + (right - left) / 2;",
            "            if (nums[mid] == target) return mid;",
            "            if (nums[mid] < target) {",
            "                left = mid + 1;",
            "            } else {",
            "                right = mid - 1;",
            "            }",
            "        }",
            "        return -1;",
            "    }",
            "}"
          ],
          "notes": [
            "定义二分查找的答案类。",
            "nums 必须按升序排列；返回目标下标，找不到返回 -1。",
            "左边界指向第一个格子。",
            "右边界指向最后一个格子，本解使用左右都包含的区间。",
            "区间至少还有一个格子时，继续查找。",
            "取中间编号；写成差值形式，避免直接把左右边界相加。",
            "中间正好是目标，直接返回下标。",
            "中间值太小，目标如果存在，只会在右边。",
            "排除中间格子和它左边的部分。",
            "中间值比目标大，目标如果存在，只会在左边。",
            "排除中间格子和它右边的部分。",
            "结束第 10 行开始的代码块（} else {）。",
            "结束第 5 行开始的代码块（while (left <= right) {）。",
            "区间已空，还没找到目标。",
            "结束第 2 行开始的代码块（public int search(int[] nums, int target) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 4,
    "boss": {
      "lc": 704,
      "url": "https://leetcode.com/problems/binary-search/",
      "title": "二分查找",
      "description": "给定一个已经升序排列、元素互不相同的整数数组 nums，以及目标 target。存在就返回下标，不存在返回 -1。长度 1～10^4，数值绝对值小于 10^4；要求 O(log n) 时间。",
      "relation": [
        "数组下标与合法范围",
        "有序性允许排除一半",
        "闭区间边界维护"
      ],
      "approach": [
        "left=0，right=最后下标",
        "只要 left<=right，就取中点 mid",
        "中间正好等于目标，返回 mid",
        "中间太小就 left=mid+1，否则 right=mid-1",
        "区间空时返回 -1"
      ],
      "proof": "每次比较只排除不可能包含目标的半边，中点也被排除或直接返回。候选区间严格缩小，所以不会漏解或死循环。",
      "complexity": "时间 O(log n)，额外空间 O(1)。",
      "pitfalls": [
        "输入必须已排序",
        "返回下标，不是目标值",
        "<= 和 mid±1 要配套，单元素区间也要检查"
      ],
      "codeKey": "binary",
      "cases": [
        {
          "input": {
            "nums": [
              -1,
              0,
              3,
              5,
              9,
              12
            ],
            "target": 9
          },
          "output": 4
        },
        {
          "input": {
            "nums": [
              2,
              4,
              6,
              8
            ],
            "target": 5
          },
          "output": -1
        }
      ],
      "question": "nums[mid] 比目标小时，应怎样更新？",
      "options": [
        "right = mid - 1",
        "left = mid + 1",
        "left = mid"
      ],
      "correct": 1,
      "hints": [
        "把已不可能的位置划掉，只保留候选区间",
        "有序条件下，中间太小就排除左半和中间",
        "闭区间为空的标志是 left>right"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int search(int[] nums, int target) {",
          "        int left = 0;",
          "        int right = nums.length - 1;",
          "        while (left <= right) {",
          "            int mid = left + (right - left) / 2;",
          "            if (nums[mid] == target) return mid;",
          "            if (nums[mid] < target) {",
          "                left = mid + 1;",
          "            } else {",
          "                right = mid - 1;",
          "            }",
          "        }",
          "        return -1;",
          "    }",
          "}"
        ],
        "notes": [
          "定义二分查找的答案类。",
          "nums 必须按升序排列；返回目标下标，找不到返回 -1。",
          "左边界指向第一个格子。",
          "右边界指向最后一个格子，本解使用左右都包含的区间。",
          "区间至少还有一个格子时，继续查找。",
          "取中间编号；写成差值形式，避免直接把左右边界相加。",
          "中间正好是目标，直接返回下标。",
          "中间值太小，目标如果存在，只会在右边。",
          "排除中间格子和它左边的部分。",
          "中间值比目标大，目标如果存在，只会在左边。",
          "排除中间格子和它右边的部分。",
          "结束第 10 行开始的代码块（} else {）。",
          "结束第 5 行开始的代码块（while (left <= right) {）。",
          "区间已空，还没找到目标。",
          "结束第 2 行开始的代码块（public int search(int[] nums, int target) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "把数字排好队",
    "world": 1,
    "subtitle": "交换、插入、拆分与合并",
    "lessons": [
      {
        "title": "冒泡与选择：先理解交换",
        "story": "排队时反复让相邻高矮不对的人交换，最高的人就会慢慢走到队尾。选择排序则每轮直接挑出最小的那个。",
        "concept": "冒泡排序比较相邻元素；选择排序每轮寻找未排序区的最小值再放到前面。它们都容易观察，适合理解循环与交换，但大输入下通常不是首选。",
        "steps": [
          "明确已排序区在哪里",
          "找出需要交换的两个位置",
          "用临时变量保存旧值，完成交换"
        ],
        "trap": "两次赋值直接互相覆盖会丢失一个旧值。这里的冒泡示例没有提前结束优化，最好情况也会做两层循环。",
        "codeKey": "bubble",
        "viz": "bubble",
        "complexity": "这两个基础版本时间 O(n²)，额外空间 O(1)。",
        "id": "5-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int[] bubble(int[] a) {",
            "        for (int end = a.length - 1; end > 0; end--) {",
            "            for (int i = 0; i < end; i++) {",
            "                if (a[i] > a[i + 1]) {",
            "                    int temp = a[i];",
            "                    a[i] = a[i + 1];",
            "                    a[i + 1] = temp;",
            "                }",
            "            }",
            "        }",
            "        return a;",
            "    }",
            "}"
          ],
          "notes": [
            "定义排序示例。",
            "接收数组，本例会直接修改这份数组。",
            "每一轮把当前未排序部分的最大值送到 end。",
            "相邻两格比较，确保 i + 1 不超过 end。",
            "左边比右边大，它们的次序需要交换。",
            "先把左边的旧值暂存，否则覆盖后会丢失。",
            "把右边的值搬到左边。",
            "把暂存的旧左值搬到右边。",
            "结束第 5 行开始的代码块（if (a[i] > a[i + 1]) {）。",
            "结束第 4 行开始的代码块（for (int i = 0; i < end; i++) {）。",
            "结束第 3 行开始的代码块（for (int end = a.length - 1; end > 0; end--) {）。",
            "返回已经从小到大排列的数组。",
            "结束第 2 行开始的代码块（public int[] bubble(int[] a) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "插入排序：把新牌插进手牌",
        "story": "手里的牌已经排好，每摸到一张新牌，就把比它大的牌往右挪，直到给新牌找到位置。",
        "concept": "插入排序维护左侧已排序部分。先保存当前值，向左寻找落点并搬动较大元素，最后把当前值写回空位。它在接近有序的数据上很实用。",
        "steps": [
          "先保存拿起的数",
          "让较大值依次右移",
          "在剩下的空位放回当前值"
        ],
        "trap": "必须先保存 value；如果直接移动数组，会把要插入的值覆盖掉。条件使用 > 能保持相等元素的相对顺序。",
        "codeKey": "insert",
        "viz": "insertion",
        "complexity": "最坏 O(n²)，已排序时 O(n)，额外空间 O(1)。",
        "id": "5-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public int[] insertion(int[] a) {",
            "        for (int i = 1; i < a.length; i++) {",
            "            int value = a[i];",
            "            int j = i - 1;",
            "            while (j >= 0 && a[j] > value) {",
            "                a[j + 1] = a[j];",
            "                j--;",
            "            }",
            "            a[j + 1] = value;",
            "        }",
            "        return a;",
            "    }",
            "}"
          ],
          "notes": [
            "定义插入排序示例。",
            "在原数组上操作，不另建同样大小的结果数组。",
            "把 a[0] 看作已排好，从第二个数开始往前插。",
            "先拿起当前要插入的值。",
            "从它左边的最后一个已排序位置开始比较。",
            "还没越过左端，而且左边的数比它大，就继续搬动。",
            "把大的值往右挪一个位置。",
            "接着查看更左边的数。",
            "结束第 6 行开始的代码块（while (j >= 0 && a[j] > value) {）。",
            "空出来的位置就是当前值的落脚点。",
            "结束第 3 行开始的代码块（for (int i = 1; i < a.length; i++) {）。",
            "返回排序结果。",
            "结束第 2 行开始的代码块（public int[] insertion(int[] a) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "归并排序：两队排好再合队",
        "story": "把一大叠牌分成两小叠，各自排好，再每次从两叠顶部较小的那张取走，就能合成一队。",
        "concept": "分治是把问题拆成较小的同类问题，再合并结果。归并排序把区间递归对半分，合并时使用双指针，从两边中取较小的值。",
        "steps": [
          "拆到每组最多一个元素",
          "递归排好左右两半",
          "用临时数组线性合并，并写回原区间"
        ],
        "trap": "合并时某半边可能先用完，另半边的剩余元素不能漏掉。选 <= 先放左边可保持稳定性。",
        "codeKey": "merge",
        "viz": "merge",
        "complexity": "时间 O(n log n)，临时数组 O(n)，另有 O(log n) 递归栈。",
        "id": "5-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public int[] sortArray(int[] nums) {",
            "        int[] temp = new int[nums.length];",
            "        sort(nums, temp, 0, nums.length - 1);",
            "        return nums;",
            "    }",
            "    private void sort(int[] a, int[] t, int l, int r) {",
            "        if (l >= r) return;",
            "        int m = l + (r - l) / 2;",
            "        sort(a, t, l, m);",
            "        sort(a, t, m + 1, r);",
            "        int i = l, j = m + 1, k = l;",
            "        while (i <= m && j <= r) {",
            "            if (a[i] <= a[j]) t[k++] = a[i++];",
            "            else t[k++] = a[j++];",
            "        }",
            "        while (i <= m) t[k++] = a[i++];",
            "        while (j <= r) t[k++] = a[j++];",
            "        for (int p = l; p <= r; p++) a[p] = t[p];",
            "    }",
            "}"
          ],
          "notes": [
            "定义归并排序答案类。",
            "接收数组并返回升序结果，本解直接修改 nums。",
            "整个排序共用一份临时空间，避免每层重复创建。",
            "对包含左右端点的整个区间排序。",
            "nums 已经被排好，交还结果。",
            "结束第 2 行开始的代码块（public int[] sortArray(int[] nums) {）。",
            "辅助方法处理编号 l 到 r；private 表示只在类内部调用。",
            "空区间或只有一个数已经有序，这也是递归停止的条件。",
            "把区间从中间分开。",
            "先把左半边排好。",
            "再把右半边排好。",
            "i 看左半边，j 看右半边，k 是临时数组要写入的位置。",
            "两半边都还有剩余时，比较队首的两个数。",
            "左边较小时先放左边；后缀 ++ 在本表达式取旧编号后再加 1。",
            "否则放右边当前的数，随后移动相应编号。",
            "结束第 13 行开始的代码块（while (i <= m && j <= r) {）。",
            "左边如果还有剩余，按顺序复制过去。",
            "右边如果还有剩余，也复制过去。",
            "把合并好的区间写回原数组。",
            "结束第 7 行开始的代码块（private void sort(int[] a, int[] t, int l, int r) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "快速排序：围绕基准分组",
        "story": "选一个身高作为分界，把较矮的人放一边，较高的人放另一边，再分别把两边整理好。",
        "concept": "快速排序利用分区缩小问题。本教学实现用左右指针与保存的基准值分组，再递归处理。它平均很快，但最坏仍可能退化，不应把平均表现当作保证。",
        "steps": [
          "保存基准值",
          "两端找放错组的位置并交换",
          "递归处理两边，保证指针持续推进"
        ],
        "trap": "重复值时如果交换后不移动两个指针，循环可能不结束。工程上常用随机基准等策略减小坏输入影响。",
        "codeKey": "quick",
        "viz": "quick",
        "complexity": "平均 O(n log n)，最坏 O(n²)；递归栈平均 O(log n)，最坏 O(n)。",
        "id": "5-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public void quick(int[] a, int l, int r) {",
            "        if (l >= r) return;",
            "        int i = l, j = r, pivot = a[l + (r - l) / 2];",
            "        while (i <= j) {",
            "            while (a[i] < pivot) i++;",
            "            while (a[j] > pivot) j--;",
            "            if (i <= j) {",
            "                int t = a[i]; a[i] = a[j]; a[j] = t;",
            "                i++; j--;",
            "            }",
            "        }",
            "        if (l < j) quick(a, l, j);",
            "        if (i < r) quick(a, i, r);",
            "    }",
            "}"
          ],
          "notes": [
            "快速排序教学示例，不用于本章 912 题的稳健复杂度答案。",
            "原地处理包含 l 和 r 的区间。",
            "区间最多一个元素时停止。",
            "保存基准值，两侧分别放一个指针。",
            "指针尚未交错，继续分组。",
            "左指针跳过已经应该在左边的值。",
            "右指针跳过已经应该在右边的值。",
            "找到一对需要处理的值，或者指针相遇。",
            "用临时变量交换这两个位置的值。",
            "交换后两侧都推进，重复值也不会让循环停住。",
            "结束第 8 行开始的代码块（if (i <= j) {）。",
            "结束第 5 行开始的代码块（while (i <= j) {）。",
            "继续处理左分组。",
            "继续处理右分组。",
            "结束第 2 行开始的代码块（public void quick(int[] a, int l, int r) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 5,
    "boss": {
      "lc": 912,
      "url": "https://leetcode.com/problems/sort-an-array/",
      "title": "排序数组",
      "description": "把整数数组 nums 按从小到大的顺序排列并返回。元素允许重复，长度 1～5×10^4，值在 -5×10^4～5×10^4 之间。原题要求不用内置排序并达到 O(n log n) 时间。",
      "relation": [
        "分治与递归停止条件",
        "合并两个有序区间",
        "时间与额外空间的取舍"
      ],
      "approach": [
        "分配一份共用临时数组",
        "把当前区间从中间拆开",
        "分别递归排好左半和右半",
        "双指针取较小值，合并进临时数组",
        "补齐剩余数字，再把该区间写回原数组"
      ],
      "proof": "规模为 1 的区间已经有序。假设左右半都已排好，每次取两半剩余的最小者就能得到整体有序区间；由小到大递归成立。",
      "complexity": "时间 O(n log n)，辅助数组 O(n)，递归栈 O(log n)。这不是原地排序。",
      "pitfalls": [
        "不要只合并到某一半用完就停止，剩余值也要复制",
        "临时区间写回原数组时要用正确边界",
        "本章用归并满足稳定的复杂度要求，不能把冒泡用于大规模要求"
      ],
      "codeKey": "merge",
      "cases": [
        {
          "input": {
            "nums": [
              5,
              2,
              3,
              1
            ]
          },
          "output": [
            1,
            2,
            3,
            5
          ]
        },
        {
          "input": {
            "nums": [
              5,
              1,
              1,
              2,
              0,
              0
            ]
          },
          "output": [
            0,
            0,
            1,
            1,
            2,
            5
          ]
        }
      ],
      "question": "合并时右半先用完了，左半剩余数字怎么办？",
      "options": [
        "丢掉",
        "复制到临时数组后面",
        "再把两半交换"
      ],
      "correct": 1,
      "hints": [
        "单个数字不需要排序",
        "先让每半自己有序，再比较两半的队首",
        "某半先用完，另一半按原来的顺序接在后面"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int[] sortArray(int[] nums) {",
          "        int[] temp = new int[nums.length];",
          "        sort(nums, temp, 0, nums.length - 1);",
          "        return nums;",
          "    }",
          "    private void sort(int[] a, int[] t, int l, int r) {",
          "        if (l >= r) return;",
          "        int m = l + (r - l) / 2;",
          "        sort(a, t, l, m);",
          "        sort(a, t, m + 1, r);",
          "        int i = l, j = m + 1, k = l;",
          "        while (i <= m && j <= r) {",
          "            if (a[i] <= a[j]) t[k++] = a[i++];",
          "            else t[k++] = a[j++];",
          "        }",
          "        while (i <= m) t[k++] = a[i++];",
          "        while (j <= r) t[k++] = a[j++];",
          "        for (int p = l; p <= r; p++) a[p] = t[p];",
          "    }",
          "}"
        ],
        "notes": [
          "定义归并排序答案类。",
          "接收数组并返回升序结果，本解直接修改 nums。",
          "整个排序共用一份临时空间，避免每层重复创建。",
          "对包含左右端点的整个区间排序。",
          "nums 已经被排好，交还结果。",
          "结束第 2 行开始的代码块（public int[] sortArray(int[] nums) {）。",
          "辅助方法处理编号 l 到 r；private 表示只在类内部调用。",
          "空区间或只有一个数已经有序，这也是递归停止的条件。",
          "把区间从中间分开。",
          "先把左半边排好。",
          "再把右半边排好。",
          "i 看左半边，j 看右半边，k 是临时数组要写入的位置。",
          "两半边都还有剩余时，比较队首的两个数。",
          "左边较小时先放左边；后缀 ++ 在本表达式取旧编号后再加 1。",
          "否则放右边当前的数，随后移动相应编号。",
          "结束第 13 行开始的代码块（while (i <= m && j <= r) {）。",
          "左边如果还有剩余，按顺序复制过去。",
          "右边如果还有剩余，也复制过去。",
          "把合并好的区间写回原数组。",
          "结束第 7 行开始的代码块（private void sort(int[] a, int[] t, int l, int r) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "链表、栈与队列",
    "world": 1,
    "subtitle": "连接关系和进出的先后",
    "lessons": [
      {
        "title": "链表结点与引用",
        "story": "寻宝纸条不必放在相邻抽屉，每张纸条告诉你下一张在哪里。你必须顺着连接逐步找。",
        "concept": "链表的结点包含数据和 next 引用。Java 的引用用于找到对象，初学时可以画成箭头；null 表示没有对象。按编号找到链表第 k 个结点一般需要从头走。",
        "steps": [
          "认识 value 和 next 两部分",
          "从头结点开始沿 next 前进",
          "null 表示到达末尾"
        ],
        "trap": "链表不保证按物理地址连续存放。变量保存的是引用，复制引用并不会自动复制整个结点。",
        "codeKey": "linked",
        "viz": "linked",
        "complexity": "访问第 k 个结点 O(k)；结点额外保存引用。",
        "id": "6-1",
        "code": {
          "lines": [
            "class Node {",
            "    int value;",
            "    Node next;",
            "    Node(int value) {",
            "        this.value = value;",
            "    }",
            "}",
            "class Solution {",
            "    public Node insertAfter(Node p, int value) {",
            "        Node n = new Node(value);",
            "        n.next = p.next;",
            "        p.next = n;",
            "        return n;",
            "    }",
            "}"
          ],
          "notes": [
            "自己定义一个链表结点，结点中同时放值和连接信息。",
            "value 保存这个结点携带的整数。",
            "next 保存下一个结点的引用；没有下一个时是 null。",
            "构造方法：创建结点时，把外部传入的值放进去。",
            "this.value 是当前对象的字段，右边 value 是参数。",
            "结束第 4 行开始的代码块（Node(int value) {）。",
            "结束第 1 行开始的代码块（class Node {）。",
            "把链表操作放到另一个类里。",
            "已经拿到结点 p，在它后面插入一个新结点。",
            "创建一个保存 value 的新结点。",
            "新结点先接住 p 原来的后继，避免把后半条链丢掉。",
            "再让 p 指向新结点，完成连接。",
            "返回新结点，方便调用者继续操作。",
            "结束第 9 行开始的代码块（public Node insertAfter(Node p, int value) {）。",
            "结束第 8 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "连接怎么改：先接后断",
        "story": "在 A 与 B 之间插入 N，先让 N 接住 B，再把 A 的箭头转向 N。否则后半段可能失去入口。",
        "concept": "拿到前驱结点后，单链表插入或删除通常只改少数引用。删除还需要处理空链表、头结点和找不到目标的情况，虚拟头结点能统一部分边界。",
        "steps": [
          "保存或接住原来的后继",
          "把新结点连到后继",
          "让前驱指向新结点"
        ],
        "trap": "O(1) 插入的前提是已经拿到合适结点；如果先要查找位置，查找耗时仍然要计入。",
        "codeKey": "linked",
        "viz": "linkedInsert",
        "complexity": "已知前驱时改连接 O(1)，从头查位置最坏 O(n)。",
        "id": "6-2",
        "code": {
          "lines": [
            "class Node {",
            "    int value;",
            "    Node next;",
            "    Node(int value) {",
            "        this.value = value;",
            "    }",
            "}",
            "class Solution {",
            "    public Node insertAfter(Node p, int value) {",
            "        Node n = new Node(value);",
            "        n.next = p.next;",
            "        p.next = n;",
            "        return n;",
            "    }",
            "}"
          ],
          "notes": [
            "自己定义一个链表结点，结点中同时放值和连接信息。",
            "value 保存这个结点携带的整数。",
            "next 保存下一个结点的引用；没有下一个时是 null。",
            "构造方法：创建结点时，把外部传入的值放进去。",
            "this.value 是当前对象的字段，右边 value 是参数。",
            "结束第 4 行开始的代码块（Node(int value) {）。",
            "结束第 1 行开始的代码块（class Node {）。",
            "把链表操作放到另一个类里。",
            "已经拿到结点 p，在它后面插入一个新结点。",
            "创建一个保存 value 的新结点。",
            "新结点先接住 p 原来的后继，避免把后半条链丢掉。",
            "再让 p 指向新结点，完成连接。",
            "返回新结点，方便调用者继续操作。",
            "结束第 9 行开始的代码块（public Node insertAfter(Node p, int value) {）。",
            "结束第 8 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "栈：最后放的先拿",
        "story": "叠盘子时，最新放上去的盘子最先拿走。检查嵌套括号时，最近打开的括号也必须最先关闭。",
        "concept": "栈是后进先出的规则。push 入栈，pop 出栈，peek 只看栈顶。用栈保存期待的右括号，遇到右括号就检查最近的期待是否相同。",
        "steps": [
          "左括号来了，记录期待的右括号",
          "右括号来了，检查栈顶并弹出",
          "结束时确认没有未匹配项"
        ],
        "trap": "弹出前必须判断空栈；只数左右括号数量无法识别 ([)] 这样的错误嵌套。",
        "codeKey": "stack",
        "viz": "stack",
        "complexity": "括号检查 O(n) 时间，最坏 O(n) 栈空间。",
        "id": "6-3",
        "code": {
          "lines": [
            "import java.util.ArrayDeque;",
            "import java.util.Deque;",
            "class Solution {",
            "    public boolean isValid(String s) {",
            "        Deque<Character> stack = new ArrayDeque<>();",
            "        for (char c : s.toCharArray()) {",
            "            if (c == '(') stack.push(')');",
            "            else if (c == '[') stack.push(']');",
            "            else if (c == '{') stack.push('}');",
            "            else if (stack.isEmpty() || stack.pop() != c) return false;",
            "        }",
            "        return stack.isEmpty();",
            "    }",
            "}"
          ],
          "notes": [
            "引入双端队列实现，可以把它当作栈来用。",
            "引入双端队列接口，描述两端可以进行的操作。",
            "定义括号检查答案。",
            "输入括号字符串，返回是否正确匹配。",
            "栈保存“将来等待匹配的右括号”；Character 是 char 的包装类型。",
            "把字符串逐个字符取出来，交给 c。",
            "遇到左小括号，记下将来应该遇到的右小括号。",
            "同理，记下右方括号。",
            "同理，记下右大括号。",
            "右括号出现时，栈不能空，而且必须与最近的期待相同。",
            "结束第 6 行开始的代码块（for (char c : s.toCharArray()) {）。",
            "扫完后还必须没有未匹配的左括号。",
            "结束第 4 行开始的代码块（public boolean isValid(String s) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "队列与双端队列",
        "story": "排队买票先来先走；门口也可以两端进出，那就是双端队列。关键是你如何使用它的两端。",
        "concept": "队列遵循先进先出，常用于层层扩散的 BFS。Deque 同时支持两端操作，可以实现栈或队列。接口描述能做什么，实现类负责具体怎样保存。",
        "steps": [
          "从队尾加入任务",
          "从队首取出最早的任务",
          "始终保持同一套进出规则"
        ],
        "trap": "用 ArrayDeque 时不能放 null。peek/poll 可能返回 null，要理解空队列的结果；本示例先放入元素才取出。",
        "codeKey": "queue",
        "viz": "queue",
        "complexity": "ArrayDeque 两端常用操作摊还 O(1)。",
        "id": "6-4",
        "code": {
          "lines": [
            "import java.util.ArrayDeque;",
            "import java.util.Deque;",
            "class Solution {",
            "    public int first() {",
            "        Deque<Integer> queue = new ArrayDeque<>();",
            "        queue.offerLast(7);",
            "        queue.offerLast(2);",
            "        return queue.pollFirst();",
            "    }",
            "}"
          ],
          "notes": [
            "引入可用作队列的实现。",
            "引入双端队列接口。",
            "定义先进先出示例。",
            "不接收参数，返回第一个排队的数字。",
            "创建一个存整数的空队列。",
            "把 7 加到队尾。",
            "再把 2 加到队尾，它排在 7 后面。",
            "从队首取出 7，体现先来先走。",
            "结束第 4 行开始的代码块（public int first() {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 6,
    "boss": {
      "lc": 20,
      "url": "https://leetcode.com/problems/valid-parentheses/",
      "title": "有效的括号",
      "description": "输入只含 ()[]{} 的字符串，判断它能否按正确种类和嵌套顺序全部匹配。每个左括号都要有对应的右括号，长度 1～10^4。",
      "relation": [
        "栈的后进先出",
        "嵌套必须优先关闭最近一次打开的括号",
        "空结构边界检查"
      ],
      "approach": [
        "创建空栈",
        "左括号出现时，把期待的右括号压栈",
        "右括号出现时，先检查空栈，再弹出期待值比较",
        "不同就立即返回 false",
        "扫描结束后，栈必须恰好为空"
      ],
      "proof": "栈顶一直代表最近一个尚未关闭的左括号所期待的结束符。逐个匹配保证类型和嵌套次序，结束为空保证没有遗漏。",
      "complexity": "时间 O(n)，最坏额外空间 O(n)。",
      "pitfalls": [
        "只有数量相等不够，([)] 数量也相等但不合法",
        "pop 前先判断空栈",
        "循环结束还要检查有没有剩余"
      ],
      "codeKey": "stack",
      "cases": [
        {
          "input": {
            "s": "([]){}"
          },
          "output": true
        },
        {
          "input": {
            "s": "([)]"
          },
          "output": false
        }
      ],
      "question": "为什么不能只统计左右括号数量？",
      "options": [
        "数量无法判断嵌套顺序与种类",
        "统计数量一定很慢",
        "字符串不能循环"
      ],
      "correct": 0,
      "hints": [
        "最后打开的括号应该最先关闭",
        "用栈顶保存最近的期待",
        "遇到右括号时与栈顶比较；最后栈为空才完全匹配"
      ],
      "code": {
        "lines": [
          "import java.util.ArrayDeque;",
          "import java.util.Deque;",
          "class Solution {",
          "    public boolean isValid(String s) {",
          "        Deque<Character> stack = new ArrayDeque<>();",
          "        for (char c : s.toCharArray()) {",
          "            if (c == '(') stack.push(')');",
          "            else if (c == '[') stack.push(']');",
          "            else if (c == '{') stack.push('}');",
          "            else if (stack.isEmpty() || stack.pop() != c) return false;",
          "        }",
          "        return stack.isEmpty();",
          "    }",
          "}"
        ],
        "notes": [
          "引入双端队列实现，可以把它当作栈来用。",
          "引入双端队列接口，描述两端可以进行的操作。",
          "定义括号检查答案。",
          "输入括号字符串，返回是否正确匹配。",
          "栈保存“将来等待匹配的右括号”；Character 是 char 的包装类型。",
          "把字符串逐个字符取出来，交给 c。",
          "遇到左小括号，记下将来应该遇到的右小括号。",
          "同理，记下右方括号。",
          "同理，记下右大括号。",
          "右括号出现时，栈不能空，而且必须与最近的期待相同。",
          "结束第 6 行开始的代码块（for (char c : s.toCharArray()) {）。",
          "扫完后还必须没有未匹配的左括号。",
          "结束第 4 行开始的代码块（public boolean isValid(String s) {）。",
          "结束第 3 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "哈希表与快速定位",
    "world": 2,
    "subtitle": "用一个键找到一个值",
    "lessons": [
      {
        "title": "键和值：一本可以按名字查的册子",
        "story": "通讯录里“张同学”对应一个电话号码。名字是键，号码是值，不必把所有号码逐个翻一遍。",
        "concept": "Map 表达键到值的映射。HashMap 借助哈希把键分配到桶中，再在桶内判断实际键是否相同。相同的键再次 put 会更新它的值。",
        "steps": [
          "选出要按什么信息查找",
          "把相关结果放到这个键下面",
          "通过键读取结果"
        ],
        "trap": "不能把“哈希值相同”误当成“两个键一定相同”。冲突时还要比较实际键。",
        "codeKey": "freq",
        "viz": "hash",
        "complexity": "常见条件下查找期望 O(1)，具体最坏表现受实现和输入影响。",
        "id": "7-1",
        "code": {
          "lines": [
            "import java.util.HashMap;",
            "import java.util.Map;",
            "class Solution {",
            "    public Map<Integer, Integer> count(int[] nums) {",
            "        Map<Integer, Integer> counts = new HashMap<>();",
            "        for (int x : nums) {",
            "            int old = counts.getOrDefault(x, 0);",
            "            counts.put(x, old + 1);",
            "        }",
            "        return counts;",
            "    }",
            "}"
          ],
          "notes": [
            "引入哈希表。",
            "引入键值映射接口。",
            "定义计数示例。",
            "返回每个数字出现了多少次。",
            "键是数字，值是它的次数。",
            "每次拿出一个数字，而不是下标。",
            "已有记录就取旧次数，还没有就从 0 开始。",
            "把次数加 1 后保存回表里。",
            "结束第 6 行开始的代码块（for (int x : nums) {）。",
            "返回整张计数表。",
            "结束第 4 行开始的代码块（public Map<Integer, Integer> count(int[] nums) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "计数与 Set：去重是另一项任务",
        "story": "统计一袋糖里每种颜色有多少颗，需要键和值；只想知道某个颜色来没来过，则只需要一个集合。",
        "concept": "Map 可以记录次数或下标；Set 表示不重复的元素集合。getOrDefault 在没有这个键时给出默认值，适合从零开始累计。",
        "steps": [
          "第一次遇到，默认次数为 0",
          "当前次数加 1 后写回",
          "按问题需要保留次数，或者只保留存在性"
        ],
        "trap": "containsKey 检查键，不是检查值。集合的“唯一”也不同于数组元素必须互异。",
        "codeKey": "freq",
        "viz": "frequency",
        "complexity": "统计 n 个元素期望 O(n)，最多存 O(n) 个不同键。",
        "id": "7-2",
        "code": {
          "lines": [
            "import java.util.HashMap;",
            "import java.util.Map;",
            "class Solution {",
            "    public Map<Integer, Integer> count(int[] nums) {",
            "        Map<Integer, Integer> counts = new HashMap<>();",
            "        for (int x : nums) {",
            "            int old = counts.getOrDefault(x, 0);",
            "            counts.put(x, old + 1);",
            "        }",
            "        return counts;",
            "    }",
            "}"
          ],
          "notes": [
            "引入哈希表。",
            "引入键值映射接口。",
            "定义计数示例。",
            "返回每个数字出现了多少次。",
            "键是数字，值是它的次数。",
            "每次拿出一个数字，而不是下标。",
            "已有记录就取旧次数，还没有就从 0 开始。",
            "把次数加 1 后保存回表里。",
            "结束第 6 行开始的代码块（for (int x : nums) {）。",
            "返回整张计数表。",
            "结束第 4 行开始的代码块（public Map<Integer, Integer> count(int[] nums) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "两数之和：问问搭档来过没有",
        "story": "目标是 9，当前拿着 7，就问之前见过的数里有没有 2。不必重新扫一遍所有旧数字。",
        "concept": "枚举当前下标 i，把配对问题变为查找 target-nums[i]。哈希表记录已处理过的值及其位置；表中的元素始终来自当前下标之前。",
        "steps": [
          "算出还差多少",
          "先查过去的表",
          "没找到再登记当前数字与下标"
        ],
        "trap": "先 put 再查可能把自己配给自己；[3,3] 需要两个不同下标，而不是一个 3 用两遍。",
        "codeKey": "hash",
        "viz": "twoSum",
        "complexity": "期望时间 O(n)，额外空间 O(n)；本题范围内 int 相减不会溢出。",
        "id": "7-3",
        "code": {
          "lines": [
            "import java.util.HashMap;",
            "import java.util.Map;",
            "class Solution {",
            "    public int[] twoSum(int[] nums, int target) {",
            "        Map<Integer, Integer> seen = new HashMap<>();",
            "        for (int i = 0; i < nums.length; i++) {",
            "            int need = target - nums[i];",
            "            if (seen.containsKey(need)) {",
            "                return new int[]{seen.get(need), i};",
            "            }",
            "            seen.put(nums[i], i);",
            "        }",
            "        return new int[0];",
            "    }",
            "}"
          ],
          "notes": [
            "引入哈希表实现，用于按键查值。",
            "引入映射接口，描述键与值之间的关系。",
            "定义两数之和答案类。",
            "输入数组和目标和，返回两个不同位置的下标。",
            "键保存见过的数字，值保存它的下标。",
            "按顺序查看每个数。",
            "当前数还差多少才能凑成目标？这个差值就是要找的搭档。",
            "先检查过去见过的数里有没有搭档。",
            "返回搭档的位置和当前位置，两个位置一定不同。",
            "结束第 8 行开始的代码块（if (seen.containsKey(need)) {）。",
            "查完再登记当前数，避免同一位置被用两次。",
            "结束第 6 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
            "原题保证有解；这行使无解输入也有明确返回结果。",
            "结束第 4 行开始的代码块（public int[] twoSum(int[] nums, int target) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "碰撞与空间换时间",
        "story": "把很多名字放进固定数量的抽屉，难免有人分到同一个抽屉。抽屉相同不代表两个人就是同一个人。",
        "concept": "哈希表把查找成本换成额外存储和维护。负载过高时实现可能扩容。算法分析中，写“期望 O(1)”需要说明合理的散列条件，不能把它当成任何情形下的硬保证。",
        "steps": [
          "哈希确定候选桶",
          "桶内核对实际的键",
          "根据数据量和查找频率权衡额外空间"
        ],
        "trap": "本课程不依赖 HashMap 的内部桶容量与扩容阈值；这些是具体实现细节，不能混成算法正确性的条件。",
        "codeKey": "hash",
        "viz": "collision",
        "complexity": "两数之和用 O(n) 空间，把常规双层枚举 O(n²) 降为期望 O(n)。",
        "id": "7-4",
        "code": {
          "lines": [
            "import java.util.HashMap;",
            "import java.util.Map;",
            "class Solution {",
            "    public int[] twoSum(int[] nums, int target) {",
            "        Map<Integer, Integer> seen = new HashMap<>();",
            "        for (int i = 0; i < nums.length; i++) {",
            "            int need = target - nums[i];",
            "            if (seen.containsKey(need)) {",
            "                return new int[]{seen.get(need), i};",
            "            }",
            "            seen.put(nums[i], i);",
            "        }",
            "        return new int[0];",
            "    }",
            "}"
          ],
          "notes": [
            "引入哈希表实现，用于按键查值。",
            "引入映射接口，描述键与值之间的关系。",
            "定义两数之和答案类。",
            "输入数组和目标和，返回两个不同位置的下标。",
            "键保存见过的数字，值保存它的下标。",
            "按顺序查看每个数。",
            "当前数还差多少才能凑成目标？这个差值就是要找的搭档。",
            "先检查过去见过的数里有没有搭档。",
            "返回搭档的位置和当前位置，两个位置一定不同。",
            "结束第 8 行开始的代码块（if (seen.containsKey(need)) {）。",
            "查完再登记当前数，避免同一位置被用两次。",
            "结束第 6 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
            "原题保证有解；这行使无解输入也有明确返回结果。",
            "结束第 4 行开始的代码块（public int[] twoSum(int[] nums, int target) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 7,
    "boss": {
      "lc": 1,
      "url": "https://leetcode.com/problems/two-sum/",
      "title": "两数之和",
      "description": "在整数数组 nums 中找两个不同位置，使对应值之和等于 target，返回两个下标，顺序不限。题目保证恰有一组答案。长度 2～10^4，元素与目标在 -10^9～10^9 之间。",
      "relation": [
        "哈希表保存值到下标",
        "枚举当前数字，寻找已见的搭档",
        "先查询再登记，保证位置不同"
      ],
      "approach": [
        "创建数字到下标的表",
        "对于当前数 x，算 need=target-x",
        "表里有 need，就返回其位置与当前位置",
        "否则登记当前数，再继续"
      ],
      "proof": "表只包含当前下标之前的元素，所以命中时两个位置不同。每一对合法答案在较后位置被处理时，一定能查到较早位置。",
      "complexity": "期望时间 O(n)，额外空间 O(n)，哈希表操作按合理散列下的期望成本分析。",
      "pitfalls": [
        "返回下标而不是数值",
        "重复值不等于重复位置，两个 3 可以配成 6",
        "先登记再查会错误地重复使用当前位置"
      ],
      "codeKey": "hash",
      "cases": [
        {
          "input": {
            "nums": [
              2,
              7,
              11,
              15
            ],
            "target": 9
          },
          "output": [
            0,
            1
          ]
        },
        {
          "input": {
            "nums": [
              3,
              3
            ],
            "target": 6
          },
          "output": [
            0,
            1
          ]
        }
      ],
      "question": "把当前数字登记到表里，应该放在哪一步？",
      "options": [
        "查找搭档之前",
        "找到答案以后再改数组",
        "没找到搭档以后"
      ],
      "correct": 2,
      "hints": [
        "如果当前数是 7，要凑 9，差多少？",
        "只在已经走过的位置里找差值",
        "没查到再登记当前数，避免自己配自己"
      ],
      "code": {
        "lines": [
          "import java.util.HashMap;",
          "import java.util.Map;",
          "class Solution {",
          "    public int[] twoSum(int[] nums, int target) {",
          "        Map<Integer, Integer> seen = new HashMap<>();",
          "        for (int i = 0; i < nums.length; i++) {",
          "            int need = target - nums[i];",
          "            if (seen.containsKey(need)) {",
          "                return new int[]{seen.get(need), i};",
          "            }",
          "            seen.put(nums[i], i);",
          "        }",
          "        return new int[0];",
          "    }",
          "}"
        ],
        "notes": [
          "引入哈希表实现，用于按键查值。",
          "引入映射接口，描述键与值之间的关系。",
          "定义两数之和答案类。",
          "输入数组和目标和，返回两个不同位置的下标。",
          "键保存见过的数字，值保存它的下标。",
          "按顺序查看每个数。",
          "当前数还差多少才能凑成目标？这个差值就是要找的搭档。",
          "先检查过去见过的数里有没有搭档。",
          "返回搭档的位置和当前位置，两个位置一定不同。",
          "结束第 8 行开始的代码块（if (seen.containsKey(need)) {）。",
          "查完再登记当前数，避免同一位置被用两次。",
          "结束第 6 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。",
          "原题保证有解；这行使无解输入也有明确返回结果。",
          "结束第 4 行开始的代码块（public int[] twoSum(int[] nums, int target) {）。",
          "结束第 3 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "递归、分治与回溯",
    "world": 2,
    "subtitle": "缩小问题，走下去，再回来",
    "lessons": [
      {
        "title": "递归：等小问题交回答案",
        "story": "sum(4) 把较小任务交给 sum(3)，自己等着；最小任务先完成，再一层层把答案交上来。",
        "concept": "递归方法调用自己。必须同时具备停止条件和向停止条件缩小的规模。每层有自己的局部变量与返回位置，这些调用信息会占用栈空间。",
        "steps": [
          "写出最小问题的直接答案",
          "把当前问题变成更小的问题",
          "等小问题返回，再组合当前答案"
        ],
        "trap": "递归不是只往下调用；返回阶段同样在做事。只有时间 O(n) 还不完整，还要计算调用栈 O(n)。",
        "codeKey": "recur",
        "viz": "recursion",
        "complexity": "本例 n 层调用，时间 O(n)，栈空间 O(n)；过深递归可能溢出。",
        "id": "8-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int sum(int n) {",
            "        if (n == 0) return 0;",
            "        return n + sum(n - 1);",
            "    }",
            "}"
          ],
          "notes": [
            "定义递归求和示例。",
            "本例约定输入是 0 到 1000 的整数。",
            "规模降到 0 时直接返回，不能继续调用自己。",
            "先等更小问题返回结果，再把当前 n 加上。",
            "结束第 2 行开始的代码块（public int sum(int n) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "分治：拆开，分别处理，再合并",
        "story": "搬一堆牌太吃力，就分成两份，分别排好，再把它们合成一份。这不是凭空减少工作，而是改变工作组织方式。",
        "concept": "分治常包含拆分、解决子问题、合并三个阶段。归并排序每层合并总共处理 n 个值，分层高度约为 log n，所以总时间 O(n log n)。",
        "steps": [
          "先判断规模是否已经足够小",
          "将问题分成较小的同类问题",
          "设计能把子答案组合成总答案的步骤"
        ],
        "trap": "只说“用了递归”不能证明快。两个相似递归可能重复计算大量相同问题，也可能合并成本很大。",
        "codeKey": "merge",
        "viz": "merge",
        "complexity": "归并排序每层 O(n)，约 log n 层，总时间 O(n log n)。",
        "id": "8-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public int[] sortArray(int[] nums) {",
            "        int[] temp = new int[nums.length];",
            "        sort(nums, temp, 0, nums.length - 1);",
            "        return nums;",
            "    }",
            "    private void sort(int[] a, int[] t, int l, int r) {",
            "        if (l >= r) return;",
            "        int m = l + (r - l) / 2;",
            "        sort(a, t, l, m);",
            "        sort(a, t, m + 1, r);",
            "        int i = l, j = m + 1, k = l;",
            "        while (i <= m && j <= r) {",
            "            if (a[i] <= a[j]) t[k++] = a[i++];",
            "            else t[k++] = a[j++];",
            "        }",
            "        while (i <= m) t[k++] = a[i++];",
            "        while (j <= r) t[k++] = a[j++];",
            "        for (int p = l; p <= r; p++) a[p] = t[p];",
            "    }",
            "}"
          ],
          "notes": [
            "定义归并排序答案类。",
            "接收数组并返回升序结果，本解直接修改 nums。",
            "整个排序共用一份临时空间，避免每层重复创建。",
            "对包含左右端点的整个区间排序。",
            "nums 已经被排好，交还结果。",
            "结束第 2 行开始的代码块（public int[] sortArray(int[] nums) {）。",
            "辅助方法处理编号 l 到 r；private 表示只在类内部调用。",
            "空区间或只有一个数已经有序，这也是递归停止的条件。",
            "把区间从中间分开。",
            "先把左半边排好。",
            "再把右半边排好。",
            "i 看左半边，j 看右半边，k 是临时数组要写入的位置。",
            "两半边都还有剩余时，比较队首的两个数。",
            "左边较小时先放左边；后缀 ++ 在本表达式取旧编号后再加 1。",
            "否则放右边当前的数，随后移动相应编号。",
            "结束第 13 行开始的代码块（while (i <= m && j <= r) {）。",
            "左边如果还有剩余，按顺序复制过去。",
            "右边如果还有剩余，也复制过去。",
            "把合并好的区间写回原数组。",
            "结束第 7 行开始的代码块（private void sort(int[] a, int[] t, int l, int r) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "回溯：选择、探索、撤销",
        "story": "试走一条迷宫路线，走不通时退回刚才的岔路。退回时要把刚才留下的临时状态恢复好。",
        "concept": "回溯把搜索组织成一棵选择树。path 保存当前选择；做选择后递归探索，回来再撤销，才能让下一个分支从正确状态开始。",
        "steps": [
          "把一个选择放进 path",
          "向更深一层探索",
          "移除刚才放入的内容，恢复现场"
        ],
        "trap": "保存答案时要复制 path。如果保存同一个可变列表的引用，之后的撤销会把旧答案一起改变。",
        "codeKey": "subsets",
        "viz": "backtrack",
        "complexity": "子集共有 2^n 个，输出本身就可能指数增长。",
        "id": "8-3",
        "code": {
          "lines": [
            "import java.util.ArrayList;",
            "import java.util.List;",
            "class Solution {",
            "    public List<List<Integer>> subsets(int[] nums) {",
            "        List<List<Integer>> result = new ArrayList<>();",
            "        dfs(nums, 0, new ArrayList<>(), result);",
            "        return result;",
            "    }",
            "    private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {",
            "        result.add(new ArrayList<>(path));",
            "        for (int i = start; i < nums.length; i++) {",
            "            path.add(nums[i]);",
            "            dfs(nums, i + 1, path, result);",
            "            path.remove(path.size() - 1);",
            "        }",
            "    }",
            "}"
          ],
          "notes": [
            "引入可增长的数组列表实现。",
            "引入列表接口。",
            "定义子集答案类。",
            "返回一组子集；每个子集本身也是一个整数列表。",
            "保存所有结果，不放在对象字段里以免多次调用串数据。",
            "从第一个下标开始，当前路径为空。",
            "等所有分支都走完，把结果交还。",
            "结束第 4 行开始的代码块（public List<List<Integer>> subsets(int[] nums) {）。",
            "start 表示后面允许选择的起始下标。",
            "复制当前路径作为一个子集，不能只保存会继续变化的同一个列表。",
            "只向后选，因此相同组合不会因次序不同而重复出现。",
            "做选择：把当前数字放进路径。",
            "向下一层探索，只考虑当前位置之后的数字。",
            "撤销刚才的选择，回到进入这个分支前的状态。",
            "结束第 11 行开始的代码块（for (int i = start; i < nums.length; i++) {）。",
            "结束第 9 行开始的代码块（private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "子集与剪枝：不要重复走同一条路",
        "story": "选零食时，[1,2] 和 [2,1] 在“选了哪些”这个问题中是同一组。因此选完一个位置后，只能向后继续选。",
        "concept": "start 限制下一步选择的最小下标，避免重复组合。剪枝则是在已有信息能证明某分支不可能有效时提前停止；必须说明为什么不会漏掉合法答案。",
        "steps": [
          "当前 path 本身就是一个子集",
          "只从 start 之后继续选",
          "递归传 i+1，回来撤销"
        ],
        "trap": "原题输入元素互异。本解不能直接用于有重复元素的“子集 II”，后者需要额外排序与去重规则。",
        "codeKey": "subsets",
        "viz": "backtrack",
        "complexity": "复制全部子集的时间和结果空间都是 O(n·2^n) 量级，递归辅助栈 O(n)。",
        "id": "8-4",
        "code": {
          "lines": [
            "import java.util.ArrayList;",
            "import java.util.List;",
            "class Solution {",
            "    public List<List<Integer>> subsets(int[] nums) {",
            "        List<List<Integer>> result = new ArrayList<>();",
            "        dfs(nums, 0, new ArrayList<>(), result);",
            "        return result;",
            "    }",
            "    private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {",
            "        result.add(new ArrayList<>(path));",
            "        for (int i = start; i < nums.length; i++) {",
            "            path.add(nums[i]);",
            "            dfs(nums, i + 1, path, result);",
            "            path.remove(path.size() - 1);",
            "        }",
            "    }",
            "}"
          ],
          "notes": [
            "引入可增长的数组列表实现。",
            "引入列表接口。",
            "定义子集答案类。",
            "返回一组子集；每个子集本身也是一个整数列表。",
            "保存所有结果，不放在对象字段里以免多次调用串数据。",
            "从第一个下标开始，当前路径为空。",
            "等所有分支都走完，把结果交还。",
            "结束第 4 行开始的代码块（public List<List<Integer>> subsets(int[] nums) {）。",
            "start 表示后面允许选择的起始下标。",
            "复制当前路径作为一个子集，不能只保存会继续变化的同一个列表。",
            "只向后选，因此相同组合不会因次序不同而重复出现。",
            "做选择：把当前数字放进路径。",
            "向下一层探索，只考虑当前位置之后的数字。",
            "撤销刚才的选择，回到进入这个分支前的状态。",
            "结束第 11 行开始的代码块（for (int i = start; i < nums.length; i++) {）。",
            "结束第 9 行开始的代码块（private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 8,
    "boss": {
      "lc": 78,
      "url": "https://leetcode.com/problems/subsets/",
      "title": "子集",
      "description": "给定元素互不相同的整数数组 nums，列出所有可能的子集，包括空集和全集；不能重复，输出顺序不限。长度 1～10，元素在 -10～10 之间。",
      "relation": [
        "回溯的选择、探索、撤销",
        "路径快照与引用",
        "起始下标避免排列式重复"
      ],
      "approach": [
        "先把当前路径复制到结果，空路径也是答案",
        "从 start 起选择一个下标",
        "把对应值加入 path",
        "递归只看它后面的下标",
        "回来后移除刚加入的值，继续其它选择"
      ],
      "proof": "每个子集都有唯一的升序下标序列。搜索只按下标递增选择，能产生每个子集而不重复；复制快照让已保存答案不受后续修改影响。",
      "complexity": "输出时间与结果空间 O(n·2^n) 量级，另有 O(n) 路径和递归栈。",
      "pitfalls": [
        "空集也是子集",
        "result.add(path) 不会自动复制可变列表",
        "本题元素互异，有重复值时需增加去重规则"
      ],
      "codeKey": "subsets",
      "cases": [
        {
          "input": {
            "nums": [
              1,
              2
            ]
          },
          "output": [
            [],
            [
              1
            ],
            [
              1,
              2
            ],
            [
              2
            ]
          ]
        },
        {
          "input": {
            "nums": [
              0
            ]
          },
          "output": [
            [],
            [
              0
            ]
          ]
        }
      ],
      "question": "保存 path 为答案时，为什么要 new ArrayList<>(path)？",
      "options": [
        "为了改变原数组",
        "保存当时的快照，避免后续撤销改掉旧答案",
        "因为列表不能保存整数"
      ],
      "correct": 1,
      "hints": [
        "每到一个状态，当前选法本身就是一个子集",
        "接下来只从后面选，不回头选旧下标",
        "每次递归回来都撤销，并且保存答案时复制路径"
      ],
      "code": {
        "lines": [
          "import java.util.ArrayList;",
          "import java.util.List;",
          "class Solution {",
          "    public List<List<Integer>> subsets(int[] nums) {",
          "        List<List<Integer>> result = new ArrayList<>();",
          "        dfs(nums, 0, new ArrayList<>(), result);",
          "        return result;",
          "    }",
          "    private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {",
          "        result.add(new ArrayList<>(path));",
          "        for (int i = start; i < nums.length; i++) {",
          "            path.add(nums[i]);",
          "            dfs(nums, i + 1, path, result);",
          "            path.remove(path.size() - 1);",
          "        }",
          "    }",
          "}"
        ],
        "notes": [
          "引入可增长的数组列表实现。",
          "引入列表接口。",
          "定义子集答案类。",
          "返回一组子集；每个子集本身也是一个整数列表。",
          "保存所有结果，不放在对象字段里以免多次调用串数据。",
          "从第一个下标开始，当前路径为空。",
          "等所有分支都走完，把结果交还。",
          "结束第 4 行开始的代码块（public List<List<Integer>> subsets(int[] nums) {）。",
          "start 表示后面允许选择的起始下标。",
          "复制当前路径作为一个子集，不能只保存会继续变化的同一个列表。",
          "只向后选，因此相同组合不会因次序不同而重复出现。",
          "做选择：把当前数字放进路径。",
          "向下一层探索，只考虑当前位置之后的数字。",
          "撤销刚才的选择，回到进入这个分支前的状态。",
          "结束第 11 行开始的代码块（for (int i = start; i < nums.length; i++) {）。",
          "结束第 9 行开始的代码块（private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {）。",
          "结束第 3 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "树、二叉搜索树与堆",
    "world": 2,
    "subtitle": "层次关系，以及优先处理谁",
    "lessons": [
      {
        "title": "树的根、孩子与高度",
        "story": "文件夹包含子文件夹，组织里有上下级。这类“从一个入口向下分层”的关系适合画成树。",
        "concept": "二叉树每个结点最多有左、右两个孩子。root 是根，叶子没有孩子。本课程按结点数定义深度：空树 0，单个根结点 1；其它教材也可能按边数计。",
        "steps": [
          "找出根结点",
          "沿一条根到叶子的路径数结点",
          "所有路径中最长的就是最大深度"
        ],
        "trap": "必须先约定深度是数结点还是数边。null 表示没有结点，不是一个值为 0 的结点。",
        "codeKey": "tree",
        "viz": "tree",
        "complexity": "遍历整树 O(n)，递归栈 O(h)，h 是树高。",
        "id": "9-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int maxDepth(TreeNode root) {",
            "        if (root == null) return 0;",
            "        int left = maxDepth(root.left);",
            "        int right = maxDepth(root.right);",
            "        return 1 + Math.max(left, right);",
            "    }",
            "}"
          ],
          "notes": [
            "TreeNode 类型由力扣提供；本地验证文件会补上这个类型。",
            "接收根结点，返回从根到最深叶子的结点数量。",
            "空树没有结点，所以深度是 0。",
            "求左子树的最大深度。",
            "求右子树的最大深度。",
            "左右选更深的一边，再加上当前根结点这一层。",
            "结束第 2 行开始的代码块（public int maxDepth(TreeNode root) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "前中后序与层序：访问顺序不同",
        "story": "检查家族谱时，可以先看长辈再看孩子，也能先把所有同一辈看完，再进入下一辈。",
        "concept": "前序是根左右，中序是左根右，后序是左右根；层序用队列逐层处理。最大深度的递归先拿到左右子树答案，再处理当前结点，体现后序思路。",
        "steps": [
          "写清楚“访问当前结点”在何时发生",
          "对左右子树使用相同规则",
          "层序则用队列维持层次"
        ],
        "trap": "数组式输入中的 null 只是缺失孩子的位置标记；构树时不能把它创建成真正的结点。",
        "codeKey": "traversal",
        "viz": "traversal",
        "complexity": "遍历 O(n)；DFS 辅助空间与高度有关，BFS 与最大层宽有关。",
        "id": "9-2",
        "code": {
          "lines": [
            "import java.util.ArrayList;",
            "import java.util.List;",
            "class Solution {",
            "    public List<Integer> preorder(TreeNode root) {",
            "        List<Integer> result = new ArrayList<>();",
            "        visit(root, result);",
            "        return result;",
            "    }",
            "    private void visit(TreeNode node, List<Integer> result) {",
            "        if (node == null) return;",
            "        result.add(node.val);",
            "        visit(node.left, result);",
            "        visit(node.right, result);",
            "    }",
            "}"
          ],
          "notes": [
            "引入可增长列表的实现。",
            "引入列表接口。",
            "演示二叉树前序遍历，TreeNode 由练习环境提供。",
            "输入根结点，返回访问到的值。",
            "每次调用创建新的结果列表。",
            "从根开始递归访问。",
            "返回根、左、右顺序的结果。",
            "结束第 4 行开始的代码块（public List<Integer> preorder(TreeNode root) {）。",
            "处理一个当前子树。",
            "空子树无需访问。",
            "先记录根，就是前序的“根”这一步。",
            "再访问整个左子树。",
            "最后访问整个右子树；移动记录语句即可得到中序或后序。",
            "结束第 9 行开始的代码块（private void visit(TreeNode node, List<Integer> result) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "二叉搜索树：左小右大",
        "story": "有序目录里，中间比目标大就往左找；树把这种比较关系组织成分支，走一条路就能排除另一侧。",
        "concept": "本例无重复键，任一结点的整个左子树都比它小，整个右子树都比它大。不是仅仅两个直接孩子满足大小关系就够了。",
        "steps": [
          "比较当前值与目标",
          "小的往左，大的往右",
          "命中返回，走到 null 表示不存在"
        ],
        "trap": "普通二叉树不能按这条规则查找。退化成链的搜索树也不会自动维持 O(log n)。",
        "codeKey": "bst",
        "viz": "bst",
        "complexity": "查找 O(h)；平衡时 O(log n)，最坏退化到 O(n)。",
        "id": "9-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public boolean contains(TreeNode root, int target) {",
            "        while (root != null) {",
            "            if (root.val == target) return true;",
            "            if (target < root.val) root = root.left;",
            "            else root = root.right;",
            "        }",
            "        return false;",
            "    }",
            "}"
          ],
          "notes": [
            "假设输入是没有重复值的二叉搜索树。",
            "查看树里有没有目标值。",
            "还存在可以查看的结点，就继续沿一条路走。",
            "当前结点正好是目标。",
            "目标较小，只可能在左子树。",
            "目标较大，只可能在右子树。",
            "结束第 3 行开始的代码块（while (root != null) {）。",
            "走到空位置仍未命中，说明不存在。",
            "结束第 2 行开始的代码块（public boolean contains(TreeNode root, int target) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "堆与优先队列：先拿最小的",
        "story": "任务优先级不同，排队的先后不一定等于到达时间。优先队列让最重要的任务先出来。",
        "concept": "小顶堆保证每个父结点不大于孩子，根是最小值。堆只维持局部次序，并不保证整个数组有序。完全二叉树形状让它能用数组紧凑表示。",
        "steps": [
          "插入后向上调整",
          "取出根后用末尾补位",
          "再向下调整，恢复堆的规则"
        ],
        "trap": "PriorityQueue 默认按小值优先，不是普通先进先出队列；遍历堆内部顺序也不等于排序输出。",
        "codeKey": "heap",
        "viz": "heap",
        "complexity": "单次插入与取最小值 O(log n)，查看堆顶 O(1)。",
        "id": "9-4",
        "code": {
          "lines": [
            "import java.util.PriorityQueue;",
            "class Solution {",
            "    public int smallest(int[] nums) {",
            "        PriorityQueue<Integer> heap = new PriorityQueue<>();",
            "        for (int x : nums) heap.offer(x);",
            "        return heap.poll();",
            "    }",
            "}"
          ],
          "notes": [
            "引入优先队列；Java 默认把最小值放在最容易取出的位置。",
            "定义最小堆使用示例。",
            "本例约定数组非空。",
            "创建空的小顶堆。",
            "把数字依次放入堆中，每次插入自动维护堆的规则。",
            "取出最小值；堆不保证其余所有位置也完全有序。",
            "结束第 3 行开始的代码块（public int smallest(int[] nums) {）。",
            "结束第 2 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 9,
    "boss": {
      "lc": 104,
      "url": "https://leetcode.com/problems/maximum-depth-of-binary-tree/",
      "title": "二叉树的最大深度",
      "description": "给定根结点 root，求根到最远叶子的路径中一共有多少个结点。空树深度为 0。结点数 0～10^4；输入示例用按层数组表示，null 表示没有孩子。",
      "relation": [
        "树的根与子树",
        "递归停止条件",
        "先拿子树结果，再组合当前层"
      ],
      "approach": [
        "空根直接返回 0",
        "根结点入队，depth 从 0 开始",
        "每轮先记住当前层的结点数 size",
        "只取出这 size 个结点，并把其非空孩子排到队尾",
        "本层处理完 depth 加 1，队列空时返回"
      ],
      "proof": "每轮开始时队列恰好保存当前层。固定 size 后只处理这一层，所有加入的孩子属于下一层。每轮准确增加一层，队列为空时层数就是最大深度。",
      "complexity": "时间 O(n)，额外队列空间 O(w)，w 为最大层宽，最坏 O(n)。本答案用迭代避免深树递归栈溢出；课内递归版另作思路对照。",
      "pitfalls": [
        "按结点数计算，单根为 1",
        "空树不是单个值为 0 的结点",
        "力扣提供 TreeNode，本地独立运行需要补类型定义"
      ],
      "codeKey": "treeBfs",
      "cases": [
        {
          "input": {
            "root": [
              3,
              9,
              20,
              null,
              null,
              15,
              7
            ]
          },
          "output": 3
        },
        {
          "input": {
            "root": []
          },
          "output": 0
        }
      ],
      "question": "左右子树深度分别为 2 和 4，当前树深度是多少？",
      "options": [
        "4",
        "6",
        "5"
      ],
      "correct": 2,
      "hints": [
        "空树深度是 0；非空根至少有一层",
        "把同一层一起处理完，再增加层数",
        "每轮先固定队列 size，避免把新加入的下一层也混进当前层"
      ],
      "code": {
        "lines": [
          "import java.util.ArrayDeque;",
          "import java.util.Queue;",
          "class Solution {",
          "    public int maxDepth(TreeNode root) {",
          "        if (root == null) return 0;",
          "        Queue<TreeNode> q = new ArrayDeque<>();",
          "        q.offer(root);",
          "        int depth = 0;",
          "        while (!q.isEmpty()) {",
          "            int size = q.size();",
          "            for (int i = 0; i < size; i++) {",
          "                TreeNode node = q.poll();",
          "                if (node.left != null) q.offer(node.left);",
          "                if (node.right != null) q.offer(node.right);",
          "            }",
          "            depth++;",
          "        }",
          "        return depth;",
          "    }",
          "}"
        ],
        "notes": [
          "引入队列实现，避免深树导致递归调用栈过深。",
          "引入先进先出接口。",
          "TreeNode 由力扣提供，本地验证文件会补类型定义。",
          "返回按结点层数计算的最大深度。",
          "空树没有任何一层，深度为 0。",
          "队列记录等候处理的结点。",
          "根是第一层唯一的起点。",
          "目前还没完成任何一层。",
          "还有结点，说明下一层确实存在。",
          "固定记下本层结点数，不能让循环受新加入孩子的影响。",
          "恰好处理本层的 size 个结点。",
          "取本层队首结点。",
          "左孩子若存在，排入下一层。",
          "右孩子若存在，也排入下一层。",
          "结束第 11 行开始的代码块（for (int i = 0; i < size; i++) {）。",
          "这一整层处理完，层数增加 1。",
          "结束第 9 行开始的代码块（while (!q.isEmpty()) {）。",
          "队列已经空，所有层都处理过。",
          "结束第 4 行开始的代码块（public int maxDepth(TreeNode root) {）。",
          "结束第 3 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "图、搜索与路径",
    "world": 3,
    "subtitle": "从一个点走向相连的世界",
    "lessons": [
      {
        "title": "顶点与边：连接不一定分层",
        "story": "地铁站可以换乘，朋友之间会互相关联。这些关系不一定从一个根向下分层，还可能绕回起点。",
        "concept": "图由顶点和边组成，可以有向或无向，也可以给边附上权重。邻接表按结点保存邻居；邻接矩阵用一张二维表表示连接。",
        "steps": [
          "确定点与连接的含义",
          "分清有向、无向与边权",
          "按稀疏程度和操作选择表示方式"
        ],
        "trap": "无向边 A—B 通常要在两边的邻接表都记录一次。图可以有环，遍历时必须避免重复处理。",
        "codeKey": "bfs",
        "viz": "graph",
        "complexity": "邻接表空间 O(V+E)，邻接矩阵空间 O(V²)。",
        "id": "10-1",
        "code": {
          "lines": [
            "import java.util.ArrayDeque;",
            "import java.util.Queue;",
            "class Solution {",
            "    public int count(int[][] graph, int start) {",
            "        boolean[] seen = new boolean[graph.length];",
            "        Queue<Integer> q = new ArrayDeque<>();",
            "        q.offer(start); seen[start] = true;",
            "        int count = 0;",
            "        while (!q.isEmpty()) {",
            "            int v = q.poll(); count++;",
            "            for (int next : graph[v]) {",
            "                if (!seen[next]) {",
            "                    seen[next] = true; q.offer(next);",
            "                }",
            "            }",
            "        }",
            "        return count;",
            "    }",
            "}"
          ],
          "notes": [
            "引入先进先出的队列实现。",
            "引入队列接口。",
            "定义图的广度优先遍历示例。",
            "graph[v] 存放 v 的邻居；返回能走到的结点数量。",
            "默认都是 false，表示尚未发现。",
            "队列保存已经发现但还未处理的结点。",
            "起点入队时就标记，避免被重复加入。",
            "记录处理过多少个不同结点。",
            "队列还有等待处理的结点，就继续。",
            "取最早发现的结点，并计数。",
            "查看它的每个邻居。",
            "邻居还未被发现，才入队。",
            "先标记，再加入队尾。",
            "结束第 12 行开始的代码块（if (!seen[next]) {）。",
            "结束第 11 行开始的代码块（for (int next : graph[v]) {）。",
            "结束第 9 行开始的代码块（while (!q.isEmpty()) {）。",
            "返回从起点可达的结点数。",
            "结束第 4 行开始的代码块（public int count(int[][] graph, int start) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "BFS：像水波一样一层层扩散",
        "story": "从家门出发，先看一步能到的地方，再看两步能到的地方。先发现的地方先处理，正好符合队列。",
        "concept": "BFS 用队列保存待处理顶点。发现就标记并入队，处理时扩展邻居。无权图中，首次到达的层数就是最少边数距离。",
        "steps": [
          "起点入队并标记",
          "取队首，检查每个邻居",
          "未发现的邻居标记后入队尾"
        ],
        "trap": "不能等出队才首次标记，否则同一结点可能被多个邻居重复加入。带不同权重时，普通 BFS 不保证最短总权重。",
        "codeKey": "bfs",
        "viz": "bfs",
        "complexity": "邻接表 BFS 时间 O(V+E)，额外空间 O(V)。",
        "id": "10-2",
        "code": {
          "lines": [
            "import java.util.ArrayDeque;",
            "import java.util.Queue;",
            "class Solution {",
            "    public int count(int[][] graph, int start) {",
            "        boolean[] seen = new boolean[graph.length];",
            "        Queue<Integer> q = new ArrayDeque<>();",
            "        q.offer(start); seen[start] = true;",
            "        int count = 0;",
            "        while (!q.isEmpty()) {",
            "            int v = q.poll(); count++;",
            "            for (int next : graph[v]) {",
            "                if (!seen[next]) {",
            "                    seen[next] = true; q.offer(next);",
            "                }",
            "            }",
            "        }",
            "        return count;",
            "    }",
            "}"
          ],
          "notes": [
            "引入先进先出的队列实现。",
            "引入队列接口。",
            "定义图的广度优先遍历示例。",
            "graph[v] 存放 v 的邻居；返回能走到的结点数量。",
            "默认都是 false，表示尚未发现。",
            "队列保存已经发现但还未处理的结点。",
            "起点入队时就标记，避免被重复加入。",
            "记录处理过多少个不同结点。",
            "队列还有等待处理的结点，就继续。",
            "取最早发现的结点，并计数。",
            "查看它的每个邻居。",
            "邻居还未被发现，才入队。",
            "先标记，再加入队尾。",
            "结束第 12 行开始的代码块（if (!seen[next]) {）。",
            "结束第 11 行开始的代码块（for (int next : graph[v]) {）。",
            "结束第 9 行开始的代码块（while (!q.isEmpty()) {）。",
            "返回从起点可达的结点数。",
            "结束第 4 行开始的代码块（public int count(int[][] graph, int start) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "DFS 与网格染色：走到底再回来",
        "story": "画图软件点一下油漆桶，与起点同色且上下左右连通的区域一起变色；斜着碰到的格子不自动相连。",
        "concept": "DFS 可用递归或显式栈向深处走；BFS 用队列向四周扩散。网格也能当作图，格子是点，上下左右关系是边。染色本身可以兼作访问标记。",
        "steps": [
          "记住起点旧颜色",
          "只扩散到边界内、同旧色的邻居",
          "发现即改色，新旧颜色相同直接返回"
        ],
        "trap": "要先检查 r、c 的边界，再读取 image[r][c]。Java 的 && 会从左到右短路求值。",
        "codeKey": "flood",
        "viz": "flood",
        "complexity": "最多访问每格一次，时间 O(行×列)，队列最坏 O(行×列)。",
        "id": "10-3",
        "code": {
          "lines": [
            "import java.util.ArrayDeque;",
            "import java.util.Queue;",
            "class Solution {",
            "    public int[][] floodFill(int[][] image, int sr, int sc, int color) {",
            "        int old = image[sr][sc];",
            "        if (old == color) return image;",
            "        int rows = image.length, cols = image[0].length;",
            "        Queue<int[]> q = new ArrayDeque<>();",
            "        q.offer(new int[]{sr, sc});",
            "        image[sr][sc] = color;",
            "        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};",
            "        while (!q.isEmpty()) {",
            "            int[] p = q.poll();",
            "            for (int[] d : dirs) {",
            "                int r = p[0] + d[0], c = p[1] + d[1];",
            "                if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {",
            "                    image[r][c] = color;",
            "                    q.offer(new int[]{r, c});",
            "                }",
            "            }",
            "        }",
            "        return image;",
            "    }",
            "}"
          ],
          "notes": [
            "引入队列实现。",
            "引入先进先出接口。",
            "定义网格染色答案。",
            "输入图片、起点坐标和新颜色，返回修改后的图片。",
            "先记住起点原来的颜色，只能沿这种颜色扩散。",
            "新旧颜色相同，直接返回，否则无法依靠颜色判断是否已经访问。",
            "rows 是行数，cols 是列数。",
            "队列里每个元素是一对行列坐标。",
            "从指定起点开始。",
            "入队时就染色，表示这个格子已经被发现。",
            "只考虑上下左右，斜角不算相邻。",
            "队列里还有待扩散的格子，就继续。",
            "拿出最早等待处理的坐标。",
            "分别查看四个方向。",
            "算出相邻格子的行列编号。",
            "必须先在边界内，再确认颜色与起点原色相同。",
            "先染色作为访问标记。",
            "加入队尾，之后再从它扩散。",
            "结束第 16 行开始的代码块（if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {）。",
            "结束第 14 行开始的代码块（for (int[] d : dirs) {）。",
            "结束第 12 行开始的代码块（while (!q.isEmpty()) {）。",
            "把染好的整张网格交还。",
            "结束第 4 行开始的代码块（public int[][] floodFill(int[][] image, int sr, int sc, int color) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "最短路：先看边有没有权重",
        "story": "最少经过站点与最短通勤时间可能不是同一条路线。每段路耗时不同，就不能只按“走了几段”比较。",
        "concept": "无权图用 BFS 求最少边数；边权非负时可用 Dijkstra，反复确定当前最短的未确定距离并松弛邻边。负权边需要其它算法，如 Bellman–Ford。",
        "steps": [
          "先明确距离度量是什么",
          "选满足前提的算法",
          "尝试通过当前点改善邻居距离，这叫松弛"
        ],
        "trap": "Dijkstra 要求非负边权；Java 示例限定简单图且所有路径总长小于十亿，使用十亿作为不可达标记。带负权时不能照搬。",
        "codeKey": "dijkstra",
        "viz": "dijkstra",
        "complexity": "优先队列版 Dijkstra 常写 O((V+E) log V)，具体实现会影响表达。",
        "id": "10-4",
        "code": {
          "lines": [
            "import java.util.Arrays;",
            "import java.util.PriorityQueue;",
            "class Solution {",
            "    public int[] distances(int[][][] graph, int start) {",
            "        int[] dist = new int[graph.length];",
            "        Arrays.fill(dist, 1000000000);",
            "        dist[start] = 0;",
            "        PriorityQueue<int[]> q = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));",
            "        q.offer(new int[]{0, start});",
            "        while (!q.isEmpty()) {",
            "            int[] item = q.poll(); int d = item[0], v = item[1];",
            "            if (d != dist[v]) continue;",
            "            for (int[] edge : graph[v]) {",
            "                int next = edge[0], weight = edge[1];",
            "                if (d + weight < dist[next]) {",
            "                    dist[next] = d + weight;",
            "                    q.offer(new int[]{dist[next], next});",
            "                }",
            "            }",
            "        }",
            "        return dist;",
            "    }",
            "}"
          ],
          "notes": [
            "引入数组填充工具。",
            "引入按当前距离选最小项的优先队列。",
            "本例限定简单有向图、非负边权、路径总长小于十亿。",
            "graph[v] 的每一行是一个 {邻居,边权} 二元组。",
            "dist[v] 记录目前找到的起点到 v 的最短距离。",
            "用十亿表示在本例限制下尚不可达。",
            "起点到自身的距离是 0。",
            "每项为 {距离,顶点}，比较距离，不用相减避免溢出。",
            "把起点的已知距离放入队列。",
            "还有候选项时继续。",
            "取当前距离最小的候选项。",
            "这是已经被更好路径替代的旧记录，跳过它。",
            "查看从 v 出发的每条边。",
            "拆开目标顶点与边权。",
            "经过 v 能否让邻居的已知距离更短？这一步叫松弛。",
            "保存改善后的距离。",
            "加入新的候选项，旧候选出队时会被跳过。",
            "结束第 15 行开始的代码块（if (d + weight < dist[next]) {）。",
            "结束第 13 行开始的代码块（for (int[] edge : graph[v]) {）。",
            "结束第 10 行开始的代码块（while (!q.isEmpty()) {）。",
            "返回所有距离；十亿仍表示不可达。",
            "结束第 4 行开始的代码块（public int[] distances(int[][][] graph, int start) {）。",
            "结束第 3 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 10,
    "boss": {
      "lc": 733,
      "url": "https://leetcode.com/problems/flood-fill/",
      "title": "图像渲染",
      "description": "给出整数颜色网格 image，从 (sr,sc) 开始，把与起点旧颜色相同、且可以通过上下左右连通到达的格子染成 color。返回染色结果。网格行列均为 1～50，颜色为非负整数。",
      "relation": [
        "把网格视为图",
        "BFS 队列与访问标记",
        "边界和新旧颜色相同的情况"
      ],
      "approach": [
        "记住旧颜色，新旧相同直接返回",
        "起点先染色，再入队",
        "每次出队一个格子，查看四个邻居",
        "边界内且仍为旧色的邻居先染色再入队",
        "队列空时结束"
      ],
      "proof": "只沿起点旧色的合法邻边扩散，所以不会染到不连通部分；所有连通旧色格子都会被逐层发现。入队前改色让每格最多入队一次。",
      "complexity": "时间 O(mn)，额外队列空间最坏 O(mn)，修改原网格。",
      "pitfalls": [
        "斜角相接不算连通",
        "先判断边界再访问数组",
        "新旧颜色相同时直接返回，避免重复访问"
      ],
      "codeKey": "flood",
      "cases": [
        {
          "input": {
            "image": [
              [
                1,
                1,
                1
              ],
              [
                1,
                1,
                0
              ],
              [
                1,
                0,
                1
              ]
            ],
            "sr": 1,
            "sc": 1,
            "color": 2
          },
          "output": [
            [
              2,
              2,
              2
            ],
            [
              2,
              2,
              0
            ],
            [
              2,
              0,
              1
            ]
          ]
        },
        {
          "input": {
            "image": [
              [
                0,
                0
              ],
              [
                0,
                0
              ]
            ],
            "sr": 0,
            "sc": 0,
            "color": 0
          },
          "output": [
            [
              0,
              0
            ],
            [
              0,
              0
            ]
          ]
        }
      ],
      "question": "起点旧颜色与新颜色相同时，应如何处理？",
      "options": [
        "一直重新入队",
        "直接返回原图",
        "把相邻异色格子也改掉"
      ],
      "correct": 1,
      "hints": [
        "只走上下左右且颜色与起点旧色相同的格子",
        "可以用改色作为已经发现的标记",
        "标记必须在入队时完成，新旧同色要先返回"
      ],
      "code": {
        "lines": [
          "import java.util.ArrayDeque;",
          "import java.util.Queue;",
          "class Solution {",
          "    public int[][] floodFill(int[][] image, int sr, int sc, int color) {",
          "        int old = image[sr][sc];",
          "        if (old == color) return image;",
          "        int rows = image.length, cols = image[0].length;",
          "        Queue<int[]> q = new ArrayDeque<>();",
          "        q.offer(new int[]{sr, sc});",
          "        image[sr][sc] = color;",
          "        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};",
          "        while (!q.isEmpty()) {",
          "            int[] p = q.poll();",
          "            for (int[] d : dirs) {",
          "                int r = p[0] + d[0], c = p[1] + d[1];",
          "                if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {",
          "                    image[r][c] = color;",
          "                    q.offer(new int[]{r, c});",
          "                }",
          "            }",
          "        }",
          "        return image;",
          "    }",
          "}"
        ],
        "notes": [
          "引入队列实现。",
          "引入先进先出接口。",
          "定义网格染色答案。",
          "输入图片、起点坐标和新颜色，返回修改后的图片。",
          "先记住起点原来的颜色，只能沿这种颜色扩散。",
          "新旧颜色相同，直接返回，否则无法依靠颜色判断是否已经访问。",
          "rows 是行数，cols 是列数。",
          "队列里每个元素是一对行列坐标。",
          "从指定起点开始。",
          "入队时就染色，表示这个格子已经被发现。",
          "只考虑上下左右，斜角不算相邻。",
          "队列里还有待扩散的格子，就继续。",
          "拿出最早等待处理的坐标。",
          "分别查看四个方向。",
          "算出相邻格子的行列编号。",
          "必须先在边界内，再确认颜色与起点原色相同。",
          "先染色作为访问标记。",
          "加入队尾，之后再从它扩散。",
          "结束第 16 行开始的代码块（if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {）。",
          "结束第 14 行开始的代码块（for (int[] d : dirs) {）。",
          "结束第 12 行开始的代码块（while (!q.isEmpty()) {）。",
          "把染好的整张网格交还。",
          "结束第 4 行开始的代码块（public int[][] floodFill(int[][] image, int sr, int sc, int color) {）。",
          "结束第 3 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "贪心与动态规划",
    "world": 3,
    "subtitle": "当前怎么选，已经算过什么",
    "lessons": [
      {
        "title": "贪心：当前最好未必全局最好",
        "story": "用面额 1、5、10 找零，先拿大的很自然；但面额变成 1、3、4，给 6 找零，先拿 4 得到 3 枚，3+3 只需 2 枚。",
        "concept": "贪心每次作一个局部选择，并希望得到全局最优。它需要能证明这个选择不会破坏最优解，不能只凭几个例子就认定通用。",
        "steps": [
          "明确“当前最好”具体指什么",
          "尝试反例验证直觉",
          "用交换论证等方式证明选择安全"
        ],
        "trap": "贪心失败不等于问题无解；常常意味着需要保留更多状态，或者采用动态规划。",
        "codeKey": "greedy",
        "viz": "greedy",
        "complexity": "固定 3 种面额的示例循环次数固定，时间 O(1)。",
        "id": "11-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int coins(int amount) {",
            "        int count = 0;",
            "        for (int coin : new int[]{10, 5, 1}) {",
            "            count += amount / coin;",
            "            amount %= coin;",
            "        }",
            "        return count;",
            "    }",
            "}"
          ],
          "notes": [
            "定义仅对指定硬币体系成立的贪心示例。",
            "硬币面额固定为 1、5、10，数量无限，amount 是非负整数。",
            "记录用了多少枚硬币。",
            "从最大面额开始尝试。",
            "尽量使用当前面额，整数除法给出可用的枚数。",
            "剩余金额交给更小面额。",
            "结束第 4 行开始的代码块（for (int coin : new int[]{10, 5, 1}) {）。",
            "这个面额体系可以这样做，换成 1、3、4 则不能照搬。",
            "结束第 2 行开始的代码块（public int coins(int amount) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "动态规划：给小问题的答案留位置",
        "story": "走到第 5 级台阶，最后一步不是从第 4 级跨 1 级，就是从第 3 级跨 2 级。前面的答案已经算过，不必重算。",
        "concept": "动态规划先定义状态的准确含义，再找状态之间的转移，最后给初始值与计算顺序。爬楼梯的 dp[i] 是“恰好到第 i 级的不同走法数”。",
        "steps": [
          "定义状态：这个格子究竟记录什么",
          "列出互不遗漏的最后一步来源",
          "确定起点，并按依赖顺序算"
        ],
        "trap": "不要只背 dp[i]=dp[i-1]+dp[i-2]；先说明为什么两类来源互不重叠，为什么没有第三类。",
        "codeKey": "stairs",
        "viz": "dp",
        "complexity": "时间 O(n)；用两个旧值滚动保存，额外空间 O(1)。",
        "id": "11-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public int climbStairs(int n) {",
            "        if (n <= 2) return n;",
            "        int a = 1, b = 2;",
            "        for (int i = 3; i <= n; i++) {",
            "            int next = a + b;",
            "            a = b;",
            "            b = next;",
            "        }",
            "        return b;",
            "    }",
            "}"
          ],
          "notes": [
            "定义爬楼梯答案类。",
            "原题约定 n 在 1 到 45 之间。",
            "1 级有 1 种，2 级有 2 种，这是递推起点。",
            "a 记前两级的答案，b 记前一级的答案。",
            "从第 3 级开始，逐步算到第 n 级。",
            "最后一步来自 i-1 或 i-2，两类互不重叠，把方案数相加。",
            "旧的前一级，成为下一轮的前两级。",
            "刚算出的结果，成为下一轮的前一级。",
            "结束第 5 行开始的代码块（for (int i = 3; i <= n; i++) {）。",
            "n 不超过 45，答案可以放入 Java int。",
            "结束第 2 行开始的代码块（public int climbStairs(int n) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "记忆化与表格：两个计算方向",
        "story": "递归会问“我需要哪些小答案”；填表会问“这些小答案已经有了，接下来能算谁”。把答案缓存下来，两者能避免重复劳动。",
        "concept": "记忆化搜索从目标向下拆，算过的状态直接读取缓存；自底向上从基础状态往前推。它们可以描述同一组状态依赖，但调用栈和计算顺序不同。",
        "steps": [
          "用未计算标记区分真正答案",
          "缓存状态的结果",
          "只在第一次遇到这个状态时递归计算"
        ],
        "trap": "未计算标记不能与合法答案冲突。状态如果还依赖额外参数，缓存键也必须包含这些参数。",
        "codeKey": "memo",
        "viz": "memo",
        "complexity": "本例只有 n 个状态，时间 O(n)，缓存与递归栈 O(n)。",
        "id": "11-3",
        "code": {
          "lines": [
            "import java.util.Arrays;",
            "class Solution {",
            "    public int climb(int n) {",
            "        int[] memo = new int[n + 1];",
            "        Arrays.fill(memo, -1);",
            "        return solve(n, memo);",
            "    }",
            "    private int solve(int n, int[] memo) {",
            "        if (n <= 2) return n;",
            "        if (memo[n] != -1) return memo[n];",
            "        memo[n] = solve(n - 1, memo) + solve(n - 2, memo);",
            "        return memo[n];",
            "    }",
            "}"
          ],
          "notes": [
            "引入数组工具，用来给缓存填初始标记。",
            "定义带记忆的递归求楼梯方案数。",
            "本例约定 n 在 1 到 45 之间。",
            "每个下标存对应台阶数的答案。",
            "-1 表示这个问题还没有算过。",
            "把缓存一路传下去，共享已算结果。",
            "结束第 3 行开始的代码块（public int climb(int n) {）。",
            "处理一个规模为 n 的小问题。",
            "先处理最小规模，不继续拆分。",
            "算过就直接取缓存，避免重复递归。",
            "第一次遇到才计算，并保存。",
            "返回当前规模的结果。",
            "结束第 8 行开始的代码块（private int solve(int n, int[] memo) {）。",
            "结束第 2 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "滚动变量与背包的更新方向",
        "story": "下一站只依赖前两站，就把旧答案放在两个变量中滚动交接；如果物品每件只能拿一次，就要避免本轮再次使用刚更新的值。",
        "concept": "空间优化必须保持依赖来自正确的上一阶段。0/1 背包压成一维时，容量通常倒序遍历，避免同一件物品重复使用；完全背包可重复使用，更新顺序不同。",
        "steps": [
          "先画出状态依赖",
          "确认哪些旧值未来还会用",
          "按不会覆盖必要旧值的顺序更新"
        ],
        "trap": "爬楼梯更新 a、b 前先算 next；直接先 a=b 再 b=a+b 会把需要的旧 a 覆盖。本节 Java 演示滚动变量。",
        "codeKey": "knapsack",
        "viz": "rolling",
        "complexity": "爬楼梯从 O(n) 表格空间降为 O(1)；背包优化也要重新验证顺序。",
        "id": "11-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public int best(int[] weights, int[] values, int capacity) {",
            "        int[] dp = new int[capacity + 1];",
            "        for (int i = 0; i < weights.length; i++) {",
            "            for (int c = capacity; c >= weights[i]; c--) {",
            "                dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);",
            "            }",
            "        }",
            "        return dp[capacity];",
            "    }",
            "}"
          ],
          "notes": [
            "定义每件物品最多用一次的 0/1 背包示例。",
            "正整数重量、非负价值，两个数组一一对应。",
            "dp[c] 是容量不超过 c 时可取得的最大价值，初始为 0。",
            "逐件考虑物品。",
            "容量倒序，保证右侧读取的状态还没用过当前物品。",
            "在不拿与拿当前物品两种选择里取更高价值。",
            "结束第 5 行开始的代码块（for (int c = capacity; c >= weights[i]; c--) {）。",
            "结束第 4 行开始的代码块（for (int i = 0; i < weights.length; i++) {）。",
            "返回允许容量下的最佳价值，不要求恰好装满。",
            "结束第 2 行开始的代码块（public int best(int[] weights, int[] values, int capacity) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 11,
    "boss": {
      "lc": 70,
      "url": "https://leetcode.com/problems/climbing-stairs/",
      "title": "爬楼梯",
      "description": "共有 n 级台阶，每次能跨 1 级或 2 级，问恰好到顶有多少种走法。走法按每一步的先后区分，n 在 1～45 之间。",
      "relation": [
        "定义 dp 状态",
        "从最后一步推导转移",
        "滚动变量保存前两项"
      ],
      "approach": [
        "先处理 n=1 和 n=2",
        "用 a=1、b=2 保存两种起点",
        "第 i 级的答案等于前一级加前两级",
        "先计算 next，再把 a、b 向前移动",
        "算到 n 时返回 b"
      ],
      "proof": "最后一步只可能从 n-1 跨一级，或从 n-2 跨两级。两类互斥且覆盖全部，因此方案数相加；基础值正确就能递推全部答案。",
      "complexity": "时间 O(n)，额外空间 O(1)；n≤45 时结果不超过 Java int 上限。",
      "pitfalls": [
        "1+2 和 2+1 是不同走法",
        "先计算 next，再更新旧值",
        "这里求的是方案数，不是最少步数"
      ],
      "codeKey": "stairs",
      "cases": [
        {
          "input": {
            "n": 3
          },
          "output": 3
        },
        {
          "input": {
            "n": 5
          },
          "output": 8
        }
      ],
      "question": "计算出 next=a+b 后，下一轮应怎样更新？",
      "options": [
        "先 a=b，再 b=next",
        "a=next，b=next",
        "直接 b=a+b，再 a=b"
      ],
      "correct": 0,
      "hints": [
        "从到顶前的最后一步倒着想",
        "最后一步来自前一级或前两级，两个来源不重叠",
        "只需要保存这两个旧答案，更新前先算出 next"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int climbStairs(int n) {",
          "        if (n <= 2) return n;",
          "        int a = 1, b = 2;",
          "        for (int i = 3; i <= n; i++) {",
          "            int next = a + b;",
          "            a = b;",
          "            b = next;",
          "        }",
          "        return b;",
          "    }",
          "}"
        ],
        "notes": [
          "定义爬楼梯答案类。",
          "原题约定 n 在 1 到 45 之间。",
          "1 级有 1 种，2 级有 2 种，这是递推起点。",
          "a 记前两级的答案，b 记前一级的答案。",
          "从第 3 级开始，逐步算到第 n 级。",
          "最后一步来自 i-1 或 i-2，两类互不重叠，把方案数相加。",
          "旧的前一级，成为下一轮的前两级。",
          "刚算出的结果，成为下一轮的前一级。",
          "结束第 5 行开始的代码块（for (int i = 3; i <= n; i++) {）。",
          "n 不超过 45，答案可以放入 Java int。",
          "结束第 2 行开始的代码块（public int climbStairs(int n) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  },
  {
    "title": "综合挑战与独立解题",
    "world": 3,
    "subtitle": "读题、选方法、验证答案",
    "lessons": [
      {
        "title": "从约束猜方法，再证明它",
        "story": "十个元素与十万个元素，对方法的要求很不一样。小输入可以枚举，大输入可能需要减少重复检查。",
        "concept": "先把题目改写为输入、输出、合法范围与边界，再用规模估计可接受的增长量级。估计帮助筛选方法，但正确性仍需单独解释。",
        "steps": [
          "手算最小例子",
          "尝试最直观的暴力方法",
          "找出重复工作，考虑能否保留中间信息"
        ],
        "trap": "n=100000 时，O(n²) 常常很吃力，但不能只用一个固定“每秒操作次数”机械判断所有环境。",
        "codeKey": "stock",
        "viz": "stock",
        "complexity": "本章用一遍扫描替代枚举所有买卖日的 O(n²)。",
        "id": "12-1",
        "code": {
          "lines": [
            "class Solution {",
            "    public int maxProfit(int[] prices) {",
            "        int min = prices[0];",
            "        int best = 0;",
            "        for (int i = 1; i < prices.length; i++) {",
            "            best = Math.max(best, prices[i] - min);",
            "            min = Math.min(min, prices[i]);",
            "        }",
            "        return best;",
            "    }",
            "}"
          ],
          "notes": [
            "定义只允许一次买入与一次卖出的答案。",
            "prices[i] 是第 i 天的价格；买入必须早于卖出。",
            "最初只见过第一天，把它当作历史最低价。",
            "允许不交易，所以最少收益是 0。",
            "从第二天开始，假设今天卖出。",
            "用今天价格减去此前最低价，更新最好收益。",
            "再把今天价格纳入历史最低价，供未来天使用。",
            "结束第 5 行开始的代码块（for (int i = 1; i < prices.length; i++) {）。",
            "如果价格一直下降，best 始终保持 0。",
            "结束第 2 行开始的代码块（public int maxProfit(int[] prices) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "不变式：每天都记住什么",
        "story": "假设今天卖出，理想买入价应该来自今天之前。每天只要记住“之前最低价”和“目前最大收益”，就够继续判断。",
        "concept": "循环不变式能说明状态变量为什么足够。股票题中，处理当天前 min 是此前最低价；best 是已处理区间内合法的一次交易最大收益。",
        "steps": [
          "先用历史最低价估计今天卖出",
          "更新最好收益",
          "再把今天价格纳入最低价，交给未来天使用"
        ],
        "trap": "把整段价格的全局最小与全局最大直接相减可能违反时间先后。不能先在未来买，再回到过去卖。",
        "codeKey": "stock",
        "viz": "stock",
        "complexity": "时间 O(n)，额外空间 O(1)。",
        "id": "12-2",
        "code": {
          "lines": [
            "class Solution {",
            "    public int maxProfit(int[] prices) {",
            "        int min = prices[0];",
            "        int best = 0;",
            "        for (int i = 1; i < prices.length; i++) {",
            "            best = Math.max(best, prices[i] - min);",
            "            min = Math.min(min, prices[i]);",
            "        }",
            "        return best;",
            "    }",
            "}"
          ],
          "notes": [
            "定义只允许一次买入与一次卖出的答案。",
            "prices[i] 是第 i 天的价格；买入必须早于卖出。",
            "最初只见过第一天，把它当作历史最低价。",
            "允许不交易，所以最少收益是 0。",
            "从第二天开始，假设今天卖出。",
            "用今天价格减去此前最低价，更新最好收益。",
            "再把今天价格纳入历史最低价，供未来天使用。",
            "结束第 5 行开始的代码块（for (int i = 1; i < prices.length; i++) {）。",
            "如果价格一直下降，best 始终保持 0。",
            "结束第 2 行开始的代码块（public int maxProfit(int[] prices) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "测试不是随便试两组",
        "story": "一本只有一页的书、一直跌的价格、完全相同的数字，都比一组漂亮样例更容易暴露边界问题。",
        "concept": "测试应覆盖最小输入、典型输入、无解或零结果、重复值、极端值。可用简单但慢的暴力实现当作小规模对照，核对优化方法。",
        "steps": [
          "先写下你认为正确的输出",
          "运行思路并解释每一步",
          "失败时缩小到最小反例，再定位错误"
        ],
        "trap": "测试通过不是对所有输入的数学证明。它与不变式、边界分析一起使用，才能更有把握。",
        "codeKey": "stock",
        "viz": "testing",
        "complexity": "小规模暴力可 O(n²)，主算法仍要求 O(n)。",
        "id": "12-3",
        "code": {
          "lines": [
            "class Solution {",
            "    public int maxProfit(int[] prices) {",
            "        int min = prices[0];",
            "        int best = 0;",
            "        for (int i = 1; i < prices.length; i++) {",
            "            best = Math.max(best, prices[i] - min);",
            "            min = Math.min(min, prices[i]);",
            "        }",
            "        return best;",
            "    }",
            "}"
          ],
          "notes": [
            "定义只允许一次买入与一次卖出的答案。",
            "prices[i] 是第 i 天的价格；买入必须早于卖出。",
            "最初只见过第一天，把它当作历史最低价。",
            "允许不交易，所以最少收益是 0。",
            "从第二天开始，假设今天卖出。",
            "用今天价格减去此前最低价，更新最好收益。",
            "再把今天价格纳入历史最低价，供未来天使用。",
            "结束第 5 行开始的代码块（for (int i = 1; i < prices.length; i++) {）。",
            "如果价格一直下降，best 始终保持 0。",
            "结束第 2 行开始的代码块（public int maxProfit(int[] prices) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      },
      {
        "title": "把答案讲给别人听",
        "story": "先用一两句话讲清楚“我保留什么、每次怎样更新”，再写代码。能说清楚原因，比记住一段答案更容易迁移。",
        "concept": "完整题解应包含思路、关键状态、为什么正确、复杂度、边界与可执行代码。学习时先尝试，再逐层看提示，最后关闭题解重新完成一次。",
        "steps": [
          "用自己的话复述问题",
          "说明状态与更新顺序",
          "核对复杂度和特殊输入，再提交答案"
        ],
        "trap": "看懂别人的代码与能独立解决是不同阶段。章末的输出预测与思路检查记录学习掌握情况；Java 可复制到力扣实际提交。",
        "codeKey": "stock",
        "viz": "stock",
        "complexity": "12 章学习结束后，仍可以按章节回访练习，积分只首次获得。",
        "id": "12-4",
        "code": {
          "lines": [
            "class Solution {",
            "    public int maxProfit(int[] prices) {",
            "        int min = prices[0];",
            "        int best = 0;",
            "        for (int i = 1; i < prices.length; i++) {",
            "            best = Math.max(best, prices[i] - min);",
            "            min = Math.min(min, prices[i]);",
            "        }",
            "        return best;",
            "    }",
            "}"
          ],
          "notes": [
            "定义只允许一次买入与一次卖出的答案。",
            "prices[i] 是第 i 天的价格；买入必须早于卖出。",
            "最初只见过第一天，把它当作历史最低价。",
            "允许不交易，所以最少收益是 0。",
            "从第二天开始，假设今天卖出。",
            "用今天价格减去此前最低价，更新最好收益。",
            "再把今天价格纳入历史最低价，供未来天使用。",
            "结束第 5 行开始的代码块（for (int i = 1; i < prices.length; i++) {）。",
            "如果价格一直下降，best 始终保持 0。",
            "结束第 2 行开始的代码块（public int maxProfit(int[] prices) {）。",
            "结束第 1 行开始的代码块（class Solution {）。"
          ]
        }
      }
    ],
    "id": 12,
    "boss": {
      "lc": 121,
      "url": "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/",
      "title": "买卖股票的最佳时机",
      "description": "每天给一个价格 prices[i]，最多先买入一次、在未来某天卖出一次，求最大利润。也可以不交易，此时利润为 0。长度 1～10^5，价格 0～10^4。",
      "relation": [
        "一次扫描维护历史信息",
        "买卖日期的先后约束",
        "不变式、边界与复杂度的综合应用"
      ],
      "approach": [
        "历史最低价先设为第一天",
        "最好收益从 0 开始",
        "每天假设今天卖出，用当前价减此前最低价",
        "更新最大收益后，再更新历史最低价",
        "返回最好收益"
      ],
      "proof": "处理每一天时，最低价来自此前日期，能得到以当天卖出为结尾的最大合法收益。遍历所有卖出日并保留最大值，所以覆盖全部合法交易。",
      "complexity": "时间 O(n)，额外空间 O(1)。",
      "pitfalls": [
        "必须先买后卖，不能直接拿全局最大减全局最小",
        "单元素没有可赚收益",
        "价格一直降时返回 0，而不是负数"
      ],
      "codeKey": "stock",
      "cases": [
        {
          "input": {
            "prices": [
              7,
              1,
              5,
              3,
              6,
              4
            ]
          },
          "output": 5
        },
        {
          "input": {
            "prices": [
              7,
              6,
              4,
              3,
              1
            ]
          },
          "output": 0
        }
      ],
      "question": "为什么不能直接取整段价格的最大值减最小值？",
      "options": [
        "这样一定比扫描快",
        "最低价可能出现在最高价之后，违反先买后卖",
        "价格不能作减法"
      ],
      "correct": 1,
      "hints": [
        "先枚举“今天卖出”，买入信息应该来自哪里？",
        "只需记住此前最低价，无需枚举每一天买入",
        "保留历史最低价与最大收益，按日期向前更新"
      ],
      "code": {
        "lines": [
          "class Solution {",
          "    public int maxProfit(int[] prices) {",
          "        int min = prices[0];",
          "        int best = 0;",
          "        for (int i = 1; i < prices.length; i++) {",
          "            best = Math.max(best, prices[i] - min);",
          "            min = Math.min(min, prices[i]);",
          "        }",
          "        return best;",
          "    }",
          "}"
        ],
        "notes": [
          "定义只允许一次买入与一次卖出的答案。",
          "prices[i] 是第 i 天的价格；买入必须早于卖出。",
          "最初只见过第一天，把它当作历史最低价。",
          "允许不交易，所以最少收益是 0。",
          "从第二天开始，假设今天卖出。",
          "用今天价格减去此前最低价，更新最好收益。",
          "再把今天价格纳入历史最低价，供未来天使用。",
          "结束第 5 行开始的代码块（for (int i = 1; i < prices.length; i++) {）。",
          "如果价格一直下降，best 始终保持 0。",
          "结束第 2 行开始的代码块（public int maxProfit(int[] prices) {）。",
          "结束第 1 行开始的代码块（class Solution {）。"
        ]
      }
    }
  }
];
export const codes = {"running": {"lines": ["class Solution {", "    public int[] runningSum(int[] nums) {", "        int[] result = new int[nums.length];", "        int sum = 0;", "        for (int i = 0; i < nums.length; i++) {", "            sum = sum + nums[i];", "            result[i] = sum;", "        }", "        return result;", "    }", "}"], "notes": ["练习平台会创建 Solution 类的对象，调用下面的方法；类把相关代码装在一起。", "接收名叫 nums 的整数数组，返回一个整数数组。", "准备同样长度的新数组，用来保存每一步的累计结果。", "用 sum 记住到目前为止的总和，最初还没加任何数字。", "从下标 0 开始，依次走过每个有效下标。", "旧的总和加上当前格子里的数，再存回 sum。", "把走到这个位置时的累计结果放进对应格子。", "结束第 5 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。", "把累计结果数组交给调用这个方法的地方。", "结束第 2 行开始的代码块（public int[] runningSum(int[] nums) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "add": {"lines": ["class Solution {", "    public int sum(int num1, int num2) {", "        return num1 + num2;", "    }", "}"], "notes": ["定义力扣用来承载答案的类，类名按平台约定写成 Solution。", "public 允许外部调用；int 表示返回整数；两个参数接收输入。", "先计算两个整数相加的结果，再把它返回给调用者。", "结束第 2 行开始的代码块（public int sum(int num1, int num2) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "entry": {"lines": ["public class Main {", "    public static void main(String[] args) {", "        int apples = 3;", "        apples = apples + 2;", "        System.out.println(apples);", "    }", "}"], "notes": ["定义名叫 Main 的类；保存文件时使用 Main.java。", "传统 Java 程序从这里开始；args 接收启动时传入的文字，本例不用它。", "准备一个整数变量，取名 apples，先存入 3。", "先算出旧值 3 加 2，再把结果 5 存回 apples。", "把 apples 的值打印到屏幕上，并换行；打印和返回值不是一回事。", "结束第 2 行开始的代码块（public static void main(String[] args) {）。", "结束第 1 行开始的代码块（public class Main {）。"]}, "operators": {"lines": ["class Solution {", "    public boolean same(int a, int b) {", "        boolean equal = (a == b);", "        return equal;", "    }", "}"], "notes": ["定义一个放示例方法的类。", "接收两个整数，返回 boolean 类型的判断结果。", "== 比较两边是否相等，结果是 true 或 false；= 把结果保存起来。", "把刚才得到的判断结果返回。", "结束第 2 行开始的代码块（public boolean same(int a, int b) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "reduce": {"lines": ["class Solution {", "    public int numberOfSteps(int num) {", "        int steps = 0;", "        while (num > 0) {", "            if (num % 2 == 0) {", "                num = num / 2;", "            } else {", "                num = num - 1;", "            }", "            steps++;", "        }", "        return steps;", "    }", "}"], "notes": ["定义答案所在的类。", "接收一个非负整数，返回把它变成 0 所需的操作次数。", "还没进行操作，计数从 0 开始。", "只要 num 仍大于 0，就继续处理。", "% 求余数；除以 2 余 0，说明当前数字是偶数。", "偶数除以 2，并把新值保存到 num。", "条件不成立时，也就是奇数，进入这一条分支。", "奇数先减去 1。", "结束第 7 行开始的代码块（} else {）。", "不论选哪个分支，刚刚都只做了一次操作，计数加 1。", "结束第 4 行开始的代码块（while (num > 0) {）。", "num 已经是 0，把累计操作次数返回；输入本来是 0 时返回 0。", "结束第 2 行开始的代码块（public int numberOfSteps(int num) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "linear": {"lines": ["class Solution {", "    public int find(int[] nums, int target) {", "        for (int i = 0; i < nums.length; i++) {", "            if (nums[i] == target) {", "                return i;", "            }", "        }", "        return -1;", "    }", "}"], "notes": ["定义顺序查找示例。", "接收一组整数和目标数字，返回第一次找到的位置。", "从第一个有效编号开始，逐个查看数组。", "判断当前格子的数与目标是否相等。", "找到后返回位置编号，整个 find 方法在这里结束。", "结束第 4 行开始的代码块（if (nums[i] == target) {）。", "结束第 3 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。", "所有格子都查过仍未返回，就用 -1 表示找不到。", "结束第 2 行开始的代码块（public int find(int[] nums, int target) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "binary": {"lines": ["class Solution {", "    public int search(int[] nums, int target) {", "        int left = 0;", "        int right = nums.length - 1;", "        while (left <= right) {", "            int mid = left + (right - left) / 2;", "            if (nums[mid] == target) return mid;", "            if (nums[mid] < target) {", "                left = mid + 1;", "            } else {", "                right = mid - 1;", "            }", "        }", "        return -1;", "    }", "}"], "notes": ["定义二分查找的答案类。", "nums 必须按升序排列；返回目标下标，找不到返回 -1。", "左边界指向第一个格子。", "右边界指向最后一个格子，本解使用左右都包含的区间。", "区间至少还有一个格子时，继续查找。", "取中间编号；写成差值形式，避免直接把左右边界相加。", "中间正好是目标，直接返回下标。", "中间值太小，目标如果存在，只会在右边。", "排除中间格子和它左边的部分。", "中间值比目标大，目标如果存在，只会在左边。", "排除中间格子和它右边的部分。", "结束第 10 行开始的代码块（} else {）。", "结束第 5 行开始的代码块（while (left <= right) {）。", "区间已空，还没找到目标。", "结束第 2 行开始的代码块（public int search(int[] nums, int target) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "array": {"lines": ["class Solution {", "    public int total(int[] nums) {", "        int sum = 0;", "        for (int x : nums) {", "            sum += x;", "        }", "        return sum;", "    }", "}"], "notes": ["定义数组示例类。", "参数是整数数组，方法返回这些数字的总和。", "先准备一个整数变量来保存总和。", "增强 for 循环依次把数组中的值交给 x；这里拿到的是值，不是下标。", "与 sum = sum + x 含义相同，累计当前数字。", "结束第 4 行开始的代码块（for (int x : nums) {）。", "返回最终总和；空数组会返回 0。", "结束第 2 行开始的代码块（public int total(int[] nums) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "string": {"lines": ["class Solution {", "    public int countA(String s) {", "        int count = 0;", "        for (int i = 0; i < s.length(); i++) {", "            if (s.charAt(i) == 'a') count++;", "        }", "        return count;", "    }", "}"], "notes": ["定义字符串示例。", "接收字符串，返回小写字母 a 的出现次数。", "从 0 次开始计数。", "字符串长度用 length() 方法，注意括号；数组则是 length 属性。", "charAt 读取指定位置的字符，单引号表示一个 char 字符。", "结束第 4 行开始的代码块（for (int i = 0; i < s.length(); i++) {）。", "返回计数，而不是打印它。", "结束第 2 行开始的代码块（public int countA(String s) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "bubble": {"lines": ["class Solution {", "    public int[] bubble(int[] a) {", "        for (int end = a.length - 1; end > 0; end--) {", "            for (int i = 0; i < end; i++) {", "                if (a[i] > a[i + 1]) {", "                    int temp = a[i];", "                    a[i] = a[i + 1];", "                    a[i + 1] = temp;", "                }", "            }", "        }", "        return a;", "    }", "}"], "notes": ["定义排序示例。", "接收数组，本例会直接修改这份数组。", "每一轮把当前未排序部分的最大值送到 end。", "相邻两格比较，确保 i + 1 不超过 end。", "左边比右边大，它们的次序需要交换。", "先把左边的旧值暂存，否则覆盖后会丢失。", "把右边的值搬到左边。", "把暂存的旧左值搬到右边。", "结束第 5 行开始的代码块（if (a[i] > a[i + 1]) {）。", "结束第 4 行开始的代码块（for (int i = 0; i < end; i++) {）。", "结束第 3 行开始的代码块（for (int end = a.length - 1; end > 0; end--) {）。", "返回已经从小到大排列的数组。", "结束第 2 行开始的代码块（public int[] bubble(int[] a) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "insert": {"lines": ["class Solution {", "    public int[] insertion(int[] a) {", "        for (int i = 1; i < a.length; i++) {", "            int value = a[i];", "            int j = i - 1;", "            while (j >= 0 && a[j] > value) {", "                a[j + 1] = a[j];", "                j--;", "            }", "            a[j + 1] = value;", "        }", "        return a;", "    }", "}"], "notes": ["定义插入排序示例。", "在原数组上操作，不另建同样大小的结果数组。", "把 a[0] 看作已排好，从第二个数开始往前插。", "先拿起当前要插入的值。", "从它左边的最后一个已排序位置开始比较。", "还没越过左端，而且左边的数比它大，就继续搬动。", "把大的值往右挪一个位置。", "接着查看更左边的数。", "结束第 6 行开始的代码块（while (j >= 0 && a[j] > value) {）。", "空出来的位置就是当前值的落脚点。", "结束第 3 行开始的代码块（for (int i = 1; i < a.length; i++) {）。", "返回排序结果。", "结束第 2 行开始的代码块（public int[] insertion(int[] a) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "merge": {"lines": ["class Solution {", "    public int[] sortArray(int[] nums) {", "        int[] temp = new int[nums.length];", "        sort(nums, temp, 0, nums.length - 1);", "        return nums;", "    }", "    private void sort(int[] a, int[] t, int l, int r) {", "        if (l >= r) return;", "        int m = l + (r - l) / 2;", "        sort(a, t, l, m);", "        sort(a, t, m + 1, r);", "        int i = l, j = m + 1, k = l;", "        while (i <= m && j <= r) {", "            if (a[i] <= a[j]) t[k++] = a[i++];", "            else t[k++] = a[j++];", "        }", "        while (i <= m) t[k++] = a[i++];", "        while (j <= r) t[k++] = a[j++];", "        for (int p = l; p <= r; p++) a[p] = t[p];", "    }", "}"], "notes": ["定义归并排序答案类。", "接收数组并返回升序结果，本解直接修改 nums。", "整个排序共用一份临时空间，避免每层重复创建。", "对包含左右端点的整个区间排序。", "nums 已经被排好，交还结果。", "结束第 2 行开始的代码块（public int[] sortArray(int[] nums) {）。", "辅助方法处理编号 l 到 r；private 表示只在类内部调用。", "空区间或只有一个数已经有序，这也是递归停止的条件。", "把区间从中间分开。", "先把左半边排好。", "再把右半边排好。", "i 看左半边，j 看右半边，k 是临时数组要写入的位置。", "两半边都还有剩余时，比较队首的两个数。", "左边较小时先放左边；后缀 ++ 在本表达式取旧编号后再加 1。", "否则放右边当前的数，随后移动相应编号。", "结束第 13 行开始的代码块（while (i <= m && j <= r) {）。", "左边如果还有剩余，按顺序复制过去。", "右边如果还有剩余，也复制过去。", "把合并好的区间写回原数组。", "结束第 7 行开始的代码块（private void sort(int[] a, int[] t, int l, int r) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "quick": {"lines": ["class Solution {", "    public void quick(int[] a, int l, int r) {", "        if (l >= r) return;", "        int i = l, j = r, pivot = a[l + (r - l) / 2];", "        while (i <= j) {", "            while (a[i] < pivot) i++;", "            while (a[j] > pivot) j--;", "            if (i <= j) {", "                int t = a[i]; a[i] = a[j]; a[j] = t;", "                i++; j--;", "            }", "        }", "        if (l < j) quick(a, l, j);", "        if (i < r) quick(a, i, r);", "    }", "}"], "notes": ["快速排序教学示例，不用于本章 912 题的稳健复杂度答案。", "原地处理包含 l 和 r 的区间。", "区间最多一个元素时停止。", "保存基准值，两侧分别放一个指针。", "指针尚未交错，继续分组。", "左指针跳过已经应该在左边的值。", "右指针跳过已经应该在右边的值。", "找到一对需要处理的值，或者指针相遇。", "用临时变量交换这两个位置的值。", "交换后两侧都推进，重复值也不会让循环停住。", "结束第 8 行开始的代码块（if (i <= j) {）。", "结束第 5 行开始的代码块（while (i <= j) {）。", "继续处理左分组。", "继续处理右分组。", "结束第 2 行开始的代码块（public void quick(int[] a, int l, int r) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "linked": {"lines": ["class Node {", "    int value;", "    Node next;", "    Node(int value) {", "        this.value = value;", "    }", "}", "class Solution {", "    public Node insertAfter(Node p, int value) {", "        Node n = new Node(value);", "        n.next = p.next;", "        p.next = n;", "        return n;", "    }", "}"], "notes": ["自己定义一个链表结点，结点中同时放值和连接信息。", "value 保存这个结点携带的整数。", "next 保存下一个结点的引用；没有下一个时是 null。", "构造方法：创建结点时，把外部传入的值放进去。", "this.value 是当前对象的字段，右边 value 是参数。", "结束第 4 行开始的代码块（Node(int value) {）。", "结束第 1 行开始的代码块（class Node {）。", "把链表操作放到另一个类里。", "已经拿到结点 p，在它后面插入一个新结点。", "创建一个保存 value 的新结点。", "新结点先接住 p 原来的后继，避免把后半条链丢掉。", "再让 p 指向新结点，完成连接。", "返回新结点，方便调用者继续操作。", "结束第 9 行开始的代码块（public Node insertAfter(Node p, int value) {）。", "结束第 8 行开始的代码块（class Solution {）。"]}, "stack": {"lines": ["import java.util.ArrayDeque;", "import java.util.Deque;", "class Solution {", "    public boolean isValid(String s) {", "        Deque<Character> stack = new ArrayDeque<>();", "        for (char c : s.toCharArray()) {", "            if (c == '(') stack.push(')');", "            else if (c == '[') stack.push(']');", "            else if (c == '{') stack.push('}');", "            else if (stack.isEmpty() || stack.pop() != c) return false;", "        }", "        return stack.isEmpty();", "    }", "}"], "notes": ["引入双端队列实现，可以把它当作栈来用。", "引入双端队列接口，描述两端可以进行的操作。", "定义括号检查答案。", "输入括号字符串，返回是否正确匹配。", "栈保存“将来等待匹配的右括号”；Character 是 char 的包装类型。", "把字符串逐个字符取出来，交给 c。", "遇到左小括号，记下将来应该遇到的右小括号。", "同理，记下右方括号。", "同理，记下右大括号。", "右括号出现时，栈不能空，而且必须与最近的期待相同。", "结束第 6 行开始的代码块（for (char c : s.toCharArray()) {）。", "扫完后还必须没有未匹配的左括号。", "结束第 4 行开始的代码块（public boolean isValid(String s) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "queue": {"lines": ["import java.util.ArrayDeque;", "import java.util.Deque;", "class Solution {", "    public int first() {", "        Deque<Integer> queue = new ArrayDeque<>();", "        queue.offerLast(7);", "        queue.offerLast(2);", "        return queue.pollFirst();", "    }", "}"], "notes": ["引入可用作队列的实现。", "引入双端队列接口。", "定义先进先出示例。", "不接收参数，返回第一个排队的数字。", "创建一个存整数的空队列。", "把 7 加到队尾。", "再把 2 加到队尾，它排在 7 后面。", "从队首取出 7，体现先来先走。", "结束第 4 行开始的代码块（public int first() {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "hash": {"lines": ["import java.util.HashMap;", "import java.util.Map;", "class Solution {", "    public int[] twoSum(int[] nums, int target) {", "        Map<Integer, Integer> seen = new HashMap<>();", "        for (int i = 0; i < nums.length; i++) {", "            int need = target - nums[i];", "            if (seen.containsKey(need)) {", "                return new int[]{seen.get(need), i};", "            }", "            seen.put(nums[i], i);", "        }", "        return new int[0];", "    }", "}"], "notes": ["引入哈希表实现，用于按键查值。", "引入映射接口，描述键与值之间的关系。", "定义两数之和答案类。", "输入数组和目标和，返回两个不同位置的下标。", "键保存见过的数字，值保存它的下标。", "按顺序查看每个数。", "当前数还差多少才能凑成目标？这个差值就是要找的搭档。", "先检查过去见过的数里有没有搭档。", "返回搭档的位置和当前位置，两个位置一定不同。", "结束第 8 行开始的代码块（if (seen.containsKey(need)) {）。", "查完再登记当前数，避免同一位置被用两次。", "结束第 6 行开始的代码块（for (int i = 0; i < nums.length; i++) {）。", "原题保证有解；这行使无解输入也有明确返回结果。", "结束第 4 行开始的代码块（public int[] twoSum(int[] nums, int target) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "freq": {"lines": ["import java.util.HashMap;", "import java.util.Map;", "class Solution {", "    public Map<Integer, Integer> count(int[] nums) {", "        Map<Integer, Integer> counts = new HashMap<>();", "        for (int x : nums) {", "            int old = counts.getOrDefault(x, 0);", "            counts.put(x, old + 1);", "        }", "        return counts;", "    }", "}"], "notes": ["引入哈希表。", "引入键值映射接口。", "定义计数示例。", "返回每个数字出现了多少次。", "键是数字，值是它的次数。", "每次拿出一个数字，而不是下标。", "已有记录就取旧次数，还没有就从 0 开始。", "把次数加 1 后保存回表里。", "结束第 6 行开始的代码块（for (int x : nums) {）。", "返回整张计数表。", "结束第 4 行开始的代码块（public Map<Integer, Integer> count(int[] nums) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "recur": {"lines": ["class Solution {", "    public int sum(int n) {", "        if (n == 0) return 0;", "        return n + sum(n - 1);", "    }", "}"], "notes": ["定义递归求和示例。", "本例约定输入是 0 到 1000 的整数。", "规模降到 0 时直接返回，不能继续调用自己。", "先等更小问题返回结果，再把当前 n 加上。", "结束第 2 行开始的代码块（public int sum(int n) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "subsets": {"lines": ["import java.util.ArrayList;", "import java.util.List;", "class Solution {", "    public List<List<Integer>> subsets(int[] nums) {", "        List<List<Integer>> result = new ArrayList<>();", "        dfs(nums, 0, new ArrayList<>(), result);", "        return result;", "    }", "    private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {", "        result.add(new ArrayList<>(path));", "        for (int i = start; i < nums.length; i++) {", "            path.add(nums[i]);", "            dfs(nums, i + 1, path, result);", "            path.remove(path.size() - 1);", "        }", "    }", "}"], "notes": ["引入可增长的数组列表实现。", "引入列表接口。", "定义子集答案类。", "返回一组子集；每个子集本身也是一个整数列表。", "保存所有结果，不放在对象字段里以免多次调用串数据。", "从第一个下标开始，当前路径为空。", "等所有分支都走完，把结果交还。", "结束第 4 行开始的代码块（public List<List<Integer>> subsets(int[] nums) {）。", "start 表示后面允许选择的起始下标。", "复制当前路径作为一个子集，不能只保存会继续变化的同一个列表。", "只向后选，因此相同组合不会因次序不同而重复出现。", "做选择：把当前数字放进路径。", "向下一层探索，只考虑当前位置之后的数字。", "撤销刚才的选择，回到进入这个分支前的状态。", "结束第 11 行开始的代码块（for (int i = start; i < nums.length; i++) {）。", "结束第 9 行开始的代码块（private void dfs(int[] nums, int start, List<Integer> path, List<List<Integer>> result) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "tree": {"lines": ["class Solution {", "    public int maxDepth(TreeNode root) {", "        if (root == null) return 0;", "        int left = maxDepth(root.left);", "        int right = maxDepth(root.right);", "        return 1 + Math.max(left, right);", "    }", "}"], "notes": ["TreeNode 类型由力扣提供；本地验证文件会补上这个类型。", "接收根结点，返回从根到最深叶子的结点数量。", "空树没有结点，所以深度是 0。", "求左子树的最大深度。", "求右子树的最大深度。", "左右选更深的一边，再加上当前根结点这一层。", "结束第 2 行开始的代码块（public int maxDepth(TreeNode root) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "bst": {"lines": ["class Solution {", "    public boolean contains(TreeNode root, int target) {", "        while (root != null) {", "            if (root.val == target) return true;", "            if (target < root.val) root = root.left;", "            else root = root.right;", "        }", "        return false;", "    }", "}"], "notes": ["假设输入是没有重复值的二叉搜索树。", "查看树里有没有目标值。", "还存在可以查看的结点，就继续沿一条路走。", "当前结点正好是目标。", "目标较小，只可能在左子树。", "目标较大，只可能在右子树。", "结束第 3 行开始的代码块（while (root != null) {）。", "走到空位置仍未命中，说明不存在。", "结束第 2 行开始的代码块（public boolean contains(TreeNode root, int target) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "heap": {"lines": ["import java.util.PriorityQueue;", "class Solution {", "    public int smallest(int[] nums) {", "        PriorityQueue<Integer> heap = new PriorityQueue<>();", "        for (int x : nums) heap.offer(x);", "        return heap.poll();", "    }", "}"], "notes": ["引入优先队列；Java 默认把最小值放在最容易取出的位置。", "定义最小堆使用示例。", "本例约定数组非空。", "创建空的小顶堆。", "把数字依次放入堆中，每次插入自动维护堆的规则。", "取出最小值；堆不保证其余所有位置也完全有序。", "结束第 3 行开始的代码块（public int smallest(int[] nums) {）。", "结束第 2 行开始的代码块（class Solution {）。"]}, "bfs": {"lines": ["import java.util.ArrayDeque;", "import java.util.Queue;", "class Solution {", "    public int count(int[][] graph, int start) {", "        boolean[] seen = new boolean[graph.length];", "        Queue<Integer> q = new ArrayDeque<>();", "        q.offer(start); seen[start] = true;", "        int count = 0;", "        while (!q.isEmpty()) {", "            int v = q.poll(); count++;", "            for (int next : graph[v]) {", "                if (!seen[next]) {", "                    seen[next] = true; q.offer(next);", "                }", "            }", "        }", "        return count;", "    }", "}"], "notes": ["引入先进先出的队列实现。", "引入队列接口。", "定义图的广度优先遍历示例。", "graph[v] 存放 v 的邻居；返回能走到的结点数量。", "默认都是 false，表示尚未发现。", "队列保存已经发现但还未处理的结点。", "起点入队时就标记，避免被重复加入。", "记录处理过多少个不同结点。", "队列还有等待处理的结点，就继续。", "取最早发现的结点，并计数。", "查看它的每个邻居。", "邻居还未被发现，才入队。", "先标记，再加入队尾。", "结束第 12 行开始的代码块（if (!seen[next]) {）。", "结束第 11 行开始的代码块（for (int next : graph[v]) {）。", "结束第 9 行开始的代码块（while (!q.isEmpty()) {）。", "返回从起点可达的结点数。", "结束第 4 行开始的代码块（public int count(int[][] graph, int start) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "flood": {"lines": ["import java.util.ArrayDeque;", "import java.util.Queue;", "class Solution {", "    public int[][] floodFill(int[][] image, int sr, int sc, int color) {", "        int old = image[sr][sc];", "        if (old == color) return image;", "        int rows = image.length, cols = image[0].length;", "        Queue<int[]> q = new ArrayDeque<>();", "        q.offer(new int[]{sr, sc});", "        image[sr][sc] = color;", "        int[][] dirs = {{1,0},{-1,0},{0,1},{0,-1}};", "        while (!q.isEmpty()) {", "            int[] p = q.poll();", "            for (int[] d : dirs) {", "                int r = p[0] + d[0], c = p[1] + d[1];", "                if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {", "                    image[r][c] = color;", "                    q.offer(new int[]{r, c});", "                }", "            }", "        }", "        return image;", "    }", "}"], "notes": ["引入队列实现。", "引入先进先出接口。", "定义网格染色答案。", "输入图片、起点坐标和新颜色，返回修改后的图片。", "先记住起点原来的颜色，只能沿这种颜色扩散。", "新旧颜色相同，直接返回，否则无法依靠颜色判断是否已经访问。", "rows 是行数，cols 是列数。", "队列里每个元素是一对行列坐标。", "从指定起点开始。", "入队时就染色，表示这个格子已经被发现。", "只考虑上下左右，斜角不算相邻。", "队列里还有待扩散的格子，就继续。", "拿出最早等待处理的坐标。", "分别查看四个方向。", "算出相邻格子的行列编号。", "必须先在边界内，再确认颜色与起点原色相同。", "先染色作为访问标记。", "加入队尾，之后再从它扩散。", "结束第 16 行开始的代码块（if (r >= 0 && r < rows && c >= 0 && c < cols && image[r][c] == old) {）。", "结束第 14 行开始的代码块（for (int[] d : dirs) {）。", "结束第 12 行开始的代码块（while (!q.isEmpty()) {）。", "把染好的整张网格交还。", "结束第 4 行开始的代码块（public int[][] floodFill(int[][] image, int sr, int sc, int color) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "stairs": {"lines": ["class Solution {", "    public int climbStairs(int n) {", "        if (n <= 2) return n;", "        int a = 1, b = 2;", "        for (int i = 3; i <= n; i++) {", "            int next = a + b;", "            a = b;", "            b = next;", "        }", "        return b;", "    }", "}"], "notes": ["定义爬楼梯答案类。", "原题约定 n 在 1 到 45 之间。", "1 级有 1 种，2 级有 2 种，这是递推起点。", "a 记前两级的答案，b 记前一级的答案。", "从第 3 级开始，逐步算到第 n 级。", "最后一步来自 i-1 或 i-2，两类互不重叠，把方案数相加。", "旧的前一级，成为下一轮的前两级。", "刚算出的结果，成为下一轮的前一级。", "结束第 5 行开始的代码块（for (int i = 3; i <= n; i++) {）。", "n 不超过 45，答案可以放入 Java int。", "结束第 2 行开始的代码块（public int climbStairs(int n) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "memo": {"lines": ["import java.util.Arrays;", "class Solution {", "    public int climb(int n) {", "        int[] memo = new int[n + 1];", "        Arrays.fill(memo, -1);", "        return solve(n, memo);", "    }", "    private int solve(int n, int[] memo) {", "        if (n <= 2) return n;", "        if (memo[n] != -1) return memo[n];", "        memo[n] = solve(n - 1, memo) + solve(n - 2, memo);", "        return memo[n];", "    }", "}"], "notes": ["引入数组工具，用来给缓存填初始标记。", "定义带记忆的递归求楼梯方案数。", "本例约定 n 在 1 到 45 之间。", "每个下标存对应台阶数的答案。", "-1 表示这个问题还没有算过。", "把缓存一路传下去，共享已算结果。", "结束第 3 行开始的代码块（public int climb(int n) {）。", "处理一个规模为 n 的小问题。", "先处理最小规模，不继续拆分。", "算过就直接取缓存，避免重复递归。", "第一次遇到才计算，并保存。", "返回当前规模的结果。", "结束第 8 行开始的代码块（private int solve(int n, int[] memo) {）。", "结束第 2 行开始的代码块（class Solution {）。"]}, "greedy": {"lines": ["class Solution {", "    public int coins(int amount) {", "        int count = 0;", "        for (int coin : new int[]{10, 5, 1}) {", "            count += amount / coin;", "            amount %= coin;", "        }", "        return count;", "    }", "}"], "notes": ["定义仅对指定硬币体系成立的贪心示例。", "硬币面额固定为 1、5、10，数量无限，amount 是非负整数。", "记录用了多少枚硬币。", "从最大面额开始尝试。", "尽量使用当前面额，整数除法给出可用的枚数。", "剩余金额交给更小面额。", "结束第 4 行开始的代码块（for (int coin : new int[]{10, 5, 1}) {）。", "这个面额体系可以这样做，换成 1、3、4 则不能照搬。", "结束第 2 行开始的代码块（public int coins(int amount) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "stock": {"lines": ["class Solution {", "    public int maxProfit(int[] prices) {", "        int min = prices[0];", "        int best = 0;", "        for (int i = 1; i < prices.length; i++) {", "            best = Math.max(best, prices[i] - min);", "            min = Math.min(min, prices[i]);", "        }", "        return best;", "    }", "}"], "notes": ["定义只允许一次买入与一次卖出的答案。", "prices[i] 是第 i 天的价格；买入必须早于卖出。", "最初只见过第一天，把它当作历史最低价。", "允许不交易，所以最少收益是 0。", "从第二天开始，假设今天卖出。", "用今天价格减去此前最低价，更新最好收益。", "再把今天价格纳入历史最低价，供未来天使用。", "结束第 5 行开始的代码块（for (int i = 1; i < prices.length; i++) {）。", "如果价格一直下降，best 始终保持 0。", "结束第 2 行开始的代码块（public int maxProfit(int[] prices) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "palindrome": {"lines": ["class Solution {", "    public boolean palindrome(String s) {", "        int l = 0, r = s.length() - 1;", "        while (l < r) {", "            if (s.charAt(l) != s.charAt(r)) return false;", "            l++; r--;", "        }", "        return true;", "    }", "}"], "notes": ["定义只处理基础英文字符的双指针示例。", "判断字符串从两边向中间读是否相同。", "两个下标分别从左右端出发。", "只需比较还没相遇的位置。", "任何一对不同，就不是回文。", "这一对相同，两端同时向内移动。", "结束第 4 行开始的代码块（while (l < r) {）。", "全部对应字符都相同，包括空串和单字符。", "结束第 2 行开始的代码块（public boolean palindrome(String s) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "traversal": {"lines": ["import java.util.ArrayList;", "import java.util.List;", "class Solution {", "    public List<Integer> preorder(TreeNode root) {", "        List<Integer> result = new ArrayList<>();", "        visit(root, result);", "        return result;", "    }", "    private void visit(TreeNode node, List<Integer> result) {", "        if (node == null) return;", "        result.add(node.val);", "        visit(node.left, result);", "        visit(node.right, result);", "    }", "}"], "notes": ["引入可增长列表的实现。", "引入列表接口。", "演示二叉树前序遍历，TreeNode 由练习环境提供。", "输入根结点，返回访问到的值。", "每次调用创建新的结果列表。", "从根开始递归访问。", "返回根、左、右顺序的结果。", "结束第 4 行开始的代码块（public List<Integer> preorder(TreeNode root) {）。", "处理一个当前子树。", "空子树无需访问。", "先记录根，就是前序的“根”这一步。", "再访问整个左子树。", "最后访问整个右子树；移动记录语句即可得到中序或后序。", "结束第 9 行开始的代码块（private void visit(TreeNode node, List<Integer> result) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "dijkstra": {"lines": ["import java.util.Arrays;", "import java.util.PriorityQueue;", "class Solution {", "    public int[] distances(int[][][] graph, int start) {", "        int[] dist = new int[graph.length];", "        Arrays.fill(dist, 1000000000);", "        dist[start] = 0;", "        PriorityQueue<int[]> q = new PriorityQueue<>((a, b) -> Integer.compare(a[0], b[0]));", "        q.offer(new int[]{0, start});", "        while (!q.isEmpty()) {", "            int[] item = q.poll(); int d = item[0], v = item[1];", "            if (d != dist[v]) continue;", "            for (int[] edge : graph[v]) {", "                int next = edge[0], weight = edge[1];", "                if (d + weight < dist[next]) {", "                    dist[next] = d + weight;", "                    q.offer(new int[]{dist[next], next});", "                }", "            }", "        }", "        return dist;", "    }", "}"], "notes": ["引入数组填充工具。", "引入按当前距离选最小项的优先队列。", "本例限定简单有向图、非负边权、路径总长小于十亿。", "graph[v] 的每一行是一个 {邻居,边权} 二元组。", "dist[v] 记录目前找到的起点到 v 的最短距离。", "用十亿表示在本例限制下尚不可达。", "起点到自身的距离是 0。", "每项为 {距离,顶点}，比较距离，不用相减避免溢出。", "把起点的已知距离放入队列。", "还有候选项时继续。", "取当前距离最小的候选项。", "这是已经被更好路径替代的旧记录，跳过它。", "查看从 v 出发的每条边。", "拆开目标顶点与边权。", "经过 v 能否让邻居的已知距离更短？这一步叫松弛。", "保存改善后的距离。", "加入新的候选项，旧候选出队时会被跳过。", "结束第 15 行开始的代码块（if (d + weight < dist[next]) {）。", "结束第 13 行开始的代码块（for (int[] edge : graph[v]) {）。", "结束第 10 行开始的代码块（while (!q.isEmpty()) {）。", "返回所有距离；十亿仍表示不可达。", "结束第 4 行开始的代码块（public int[] distances(int[][][] graph, int start) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}, "knapsack": {"lines": ["class Solution {", "    public int best(int[] weights, int[] values, int capacity) {", "        int[] dp = new int[capacity + 1];", "        for (int i = 0; i < weights.length; i++) {", "            for (int c = capacity; c >= weights[i]; c--) {", "                dp[c] = Math.max(dp[c], dp[c - weights[i]] + values[i]);", "            }", "        }", "        return dp[capacity];", "    }", "}"], "notes": ["定义每件物品最多用一次的 0/1 背包示例。", "正整数重量、非负价值，两个数组一一对应。", "dp[c] 是容量不超过 c 时可取得的最大价值，初始为 0。", "逐件考虑物品。", "容量倒序，保证右侧读取的状态还没用过当前物品。", "在不拿与拿当前物品两种选择里取更高价值。", "结束第 5 行开始的代码块（for (int c = capacity; c >= weights[i]; c--) {）。", "结束第 4 行开始的代码块（for (int i = 0; i < weights.length; i++) {）。", "返回允许容量下的最佳价值，不要求恰好装满。", "结束第 2 行开始的代码块（public int best(int[] weights, int[] values, int capacity) {）。", "结束第 1 行开始的代码块（class Solution {）。"]}, "treeBfs": {"lines": ["import java.util.ArrayDeque;", "import java.util.Queue;", "class Solution {", "    public int maxDepth(TreeNode root) {", "        if (root == null) return 0;", "        Queue<TreeNode> q = new ArrayDeque<>();", "        q.offer(root);", "        int depth = 0;", "        while (!q.isEmpty()) {", "            int size = q.size();", "            for (int i = 0; i < size; i++) {", "                TreeNode node = q.poll();", "                if (node.left != null) q.offer(node.left);", "                if (node.right != null) q.offer(node.right);", "            }", "            depth++;", "        }", "        return depth;", "    }", "}"], "notes": ["引入队列实现，避免深树导致递归调用栈过深。", "引入先进先出接口。", "TreeNode 由力扣提供，本地验证文件会补类型定义。", "返回按结点层数计算的最大深度。", "空树没有任何一层，深度为 0。", "队列记录等候处理的结点。", "根是第一层唯一的起点。", "目前还没完成任何一层。", "还有结点，说明下一层确实存在。", "固定记下本层结点数，不能让循环受新加入孩子的影响。", "恰好处理本层的 size 个结点。", "取本层队首结点。", "左孩子若存在，排入下一层。", "右孩子若存在，也排入下一层。", "结束第 11 行开始的代码块（for (int i = 0; i < size; i++) {）。", "这一整层处理完，层数增加 1。", "结束第 9 行开始的代码块（while (!q.isEmpty()) {）。", "队列已经空，所有层都处理过。", "结束第 4 行开始的代码块（public int maxDepth(TreeNode root) {）。", "结束第 3 行开始的代码块（class Solution {）。"]}};
