# 学习记录服务 · 实践项目

使用 Java 17+、Maven 3.6.3+。Spring Boot 版本固定为 4.0.9，参考 Spring 官方 REST 示例的依赖布局。

1. 先进入 starter 文件夹，执行 `mvn test`。尚未实现的方法应当让测试失败。
2. 补全 `LearningService.read` 和 `save`，核对参数、查询与写入三件事。
3. 测试通过后执行 `mvn spring-boot:run`，默认端口 8080。
4. 运行以下请求，核对状态码和 JSON。最后才打开 reference 对照。

```sh
curl -i 'http://localhost:8080/api/progress?lesson=arrays'
curl -i 'http://localhost:8080/api/progress?lesson='
curl -i 'http://localhost:8080/api/progress?lesson=unknown'
curl -i -X POST 'http://localhost:8080/api/progress' -H 'Content-Type: application/json' -d '{"lesson":"hash","completed":true}'
```

基线功能：GET 查询已有记录（200）；参数错误（400）；记录不存在（404）；POST 创建或覆盖记录（200）。这里是单个学习者的本机教学服务，没有登录、授权和限流，存储是进程内 Map，重启会丢失数据。它不是可直接暴露公网的完整业务系统。

## 数据库扩展

先在独立的本机 PostgreSQL 测试库执行 SQL 工作单，理解约束和事务，再把 Map 抽象为 Repository、替换为参数化数据库查询。不得连接本站生产 Supabase 项目做练习。

## 交付清单

- README 含启动、测试、示例请求、版本与当前限制。
- 至少验证普通请求、空参数、找不到资源、写入后读取。
- 添加一组失败测试，再修复并解释问题。
- 用 Git 保存有说明的提交；运行 `mvn package` 后可用 `java -jar target/learning-records-0.1.0.jar` 启动。
- 数据库、身份验证、并发与缓存是后续扩展，完成前不要在简历里声称已经实现。

参考：https://spring.io/guides/gs/rest-service 、https://dev.java/learn/
