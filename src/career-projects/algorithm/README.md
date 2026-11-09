# 算法工程师实践包

合成数据，Python 3.10+，只使用标准库，不需要GPU或外部服务。本站当前只在线执行Java；Python文件在自己的环境或Notebook中运行。

1. 从starter开始，按路线逐个实现exercises.py中的方法。`python -m unittest -v`会指出尚未完成的任务。
2. Python阶段：累计、词频。数学阶段：点积、均值、均方误差。
3. 数据阶段：先划分数据。训练集均值只能从训练部分计算。
4. 模型阶段：完成一元线性回归的拟合和预测，和训练均值基线比较。
5. 评估阶段：准确率、召回率；分母为0按本项目约定处理。
6. 推荐项目：Jaccard相似度、排除已学课程、过滤前置未满足课程、稳定排序。
7. 每一步先手算具体样例，再写代码，最后打开reference对照。

`practice.ipynb`是可独立打开的起步Notebook。项目文件可在本机Jupyter中使用；使用第三方Notebook服务时，由你自行上传这些合成练习文件。

## 实验报告

记录问题、数据与划分、基线、模型、参数、指标、失败样例、复现命令与局限。演示数据太小，结果仅证明程序处理了这些测试场景，不能证明真实推荐效果。

## 下一阶段

完成推荐方法后，执行 `python serve.py`，打开 `http://127.0.0.1:8891/recommend?completed=arrays`。它会返回版本号和推荐课程。`python -m unittest -v`同时检查计算与HTTP接口（正常请求、非法课程、无效路径）。服务只监听本机，没有认证和限流，不应直接暴露到公网。

NumPy/pandas、scikit-learn、PyTorch与推荐排序专题需要在本项目后继续学习。当前包用最小实现帮助理解数据、拟合和评估，没有声称已经完成大型深度学习系统。

参考：Python官方教程、Google ML Crash Course、scikit-learn common pitfalls。
