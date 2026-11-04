<template>
 <section class="node-anatomy" aria-labelledby="node-anatomy-title">
  <span class="eyebrow">概念到代码 · 只定义一张卡片</span><h2 id="node-anatomy-title">现在才把节点写成 Java</h2>
  <p>刚才一张卡片有两个栏位。下面这份定义只说明这两个栏位怎么放，还没有插入、删除或遍历。请把每个名字与图中的一部分对应起来。</p>
  <div class="node-card-diagram" role="img" aria-label="节点 A 的 value 为 1，next 指向节点 B；B 的 value 为 3，next 为空"><div class="diagram-node"><span><small>节点 A</small>value: 1</span><span><small>通向 B</small>next →</span></div><span aria-hidden="true">→</span><div class="diagram-node"><span><small>节点 B</small>value: 3</span><span><small>没有下一项</small>next: null</span></div></div>
  <pre><code>class Node {
    int value;
    Node next;

    Node(int initialValue) {
        this.value = initialValue;
    }
}</code></pre>
  <dl><div><dt>class Node：给这种卡片规定一个类型</dt><dd>class 是 Java 的关键字；Node 是我们选的名字。它像空白表格的样式，规定每份节点有什么数据。类型定义本身不会凭空创建一串节点。</dd></div>
  <div><dt>int value 与 Node next：两种不同的栏位</dt><dd>value 放整数；next 放同类型节点的引用。没有下一节点时，next 为 null。每个新节点都有自己的这两个字段，不会和别的节点共用同一份 value。</dd></div>
  <div><dt>Node(int initialValue)：创建时怎样填写</dt><dd>这叫构造方法，名字必须和类名一样，没有返回类型。执行 new Node(3) 时，传入的 3 暂时由参数 initialValue 接收。</dd></div>
  <div><dt>this.value = initialValue：填入当前这张卡片</dt><dd>this 表示正在初始化的这一份对象。左侧 this.value 是对象里的数据栏，右侧 initialValue 是本次传进来的数，所以把 3 存进新节点。next 没有显式赋值时，这种对象字段默认是 null；局部变量则不能据此推断也可未赋值就读取。</dd></div>
  <div><dt>Node p = new Node(3)：创建对象，再记住它</dt><dd>new Node(3) 创建并初始化一份新节点，得到它的引用；变量 p 保存这个引用。p.value 是 3，p.next 是 null。下方实验只练创建、连接和读取，下一节才学习中间插入。</dd></div></dl>
 </section>
</template>
