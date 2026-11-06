// Deterministic SVG geometry. Text and captions stay outside the drawing model.
const clamp = (number, low, high) => Math.max(low, Math.min(high, number));
export function displayValue(value) {
  if (value === '') return '空字符串';
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function cell(value, x, y, width, height, label = '', kind = '') {
  return { value: displayValue(value), x, y, width, height, label, kind };
}
const connect = (from, to, label = '', arrow = false, tone = '') => ({ from, to, label, arrow, tone });

export function pictureFor(frame, mode = '') {
  const { values = [], active = [], vars = {} } = frame;
  let width = 520,
    height = 210,
    cells = [],
    edges = [],
    description = '';
  if (frame.kind === 'tree' || frame.kind === 'graph') {
    const tree = frame.kind === 'tree';
    const points =
      frame.positions ||
      (tree
        ? [
            [260, 32],
            [142, 104],
            [378, 104],
            [320, 176],
            [438, 176],
          ]
        : [
            [70, 105],
            [230, 38],
            [230, 172],
            [420, 105],
          ]);
    const links =
      frame.edges ||
      (tree
        ? [
            [0, 1],
            [0, 2],
            [2, 3],
            [2, 4],
          ]
        : [
            [0, 1],
            [0, 2],
            [1, 3],
            [2, 3],
          ]);
    if (values.length) {
      const minX = Math.min(...points.slice(0, values.length).map((p) => p[0])) - 37;
      const maxX = Math.max(...points.slice(0, values.length).map((p) => p[0])) + 37;
      const minY = Math.min(...points.slice(0, values.length).map((p) => p[1])) - 32;
      const maxY = Math.max(...points.slice(0, values.length).map((p) => p[1])) + 33;
      width = maxX - minX;
      height = maxY - minY;
      cells = values.map((value, i) =>
        cell(value, points[i][0] - minX, points[i][1] - minY, 44, 42, '', frame.kind),
      );
      edges = links.map(([from, to, value]) =>
        connect(from, to, frame.weighted ? String(value) : '', !!frame.weighted),
      );
      description =
        '节点：' +
        values.join('、') +
        '。连接：' +
        links
          .map(
            ([a, b, n]) =>
              values[a] +
              (frame.weighted ? ' → ' : ' — ') +
              values[b] +
              (frame.weighted ? '（权重 ' + n + '）' : ''),
          )
          .join('；') +
        '。';
    }
  } else if (frame.kind === 'linked') {
    const slots = values.length + 1;
    width = slots * 84 + 14;
    height = frame.detached ? 154 : 82;
    cells = [...values, 'null'].map((value, i) =>
      cell(
        value,
        48 + 84 * i,
        30,
        58,
        34,
        i === values.length ? '链尾' : frame.labels?.[i] || '节点',
        'linked',
      ),
    );
    edges = values.map((_, i) => connect(i, i + 1, 'next', true));
    if (frame.detached) {
      const next = frame.detached.next ?? values.length;
      const offset = next === values.length ? 36 : -36;
      cells.push(
        cell(
          frame.detached.value,
          clamp(cells[next].x + offset, 42, width - 42),
          111,
          58,
          34,
          frame.detached.name,
          'detached',
        ),
      );
      edges.push(connect(cells.length - 1, next, 'next', true, 'detached'));
    }
    description =
      '主链：' +
      [...values, 'null'].join(' → ') +
      '。' +
      (frame.detached
        ? frame.detached.name +
          '（值 ' +
          frame.detached.value +
          '）还未接入主链，next 指向 ' +
          (values[frame.detached.next] ?? 'null') +
          '。'
        : '');
  } else if (mode === 'reference') {
    width = 290;
    height = Object.hasOwn(vars, 'b') ? 135 : 76;
    cells = [cell('a', 42, 30, 50, 36, '变量'), cell(values, 205, 30, 140, 38, '数组 A', 'reference')];
    edges = [connect(0, 1, '引用', true)];
    if (Object.hasOwn(vars, 'b')) {
      cells.push(cell('b', 42, 93, 50, 36, '变量'));
      if (vars.b === null) cells.push(cell('null', 205, 93, 90, 36, '没有引用', 'reference'));
      edges.push(connect(2, vars.b === null ? 3 : 1, vars.b === null ? '' : '引用', true));
    }
    description =
      'a 引用数组 ' +
      displayValue(values) +
      '。' +
      (vars.b === null ? 'b 不引用任何对象。' : vars.b ? 'b 引用同一个数组。' : '');
  } else if (frame.kind === 'grid') {
    const columns = frame.columns,
      rows = Math.ceil(values.length / columns);
    width = columns * 64 + 16;
    height = rows * 62 + 8;
    cells = values.map((value, i) =>
      cell(
        value,
        40 + (i % columns) * 64,
        26 + Math.floor(i / columns) * 62,
        52,
        34,
        frame.labels?.[i] || '',
        value === vars.color ? 'painted' : 'grid',
      ),
    );
    description =
      '网格各行：' +
      Array.from({ length: rows }, (_, r) =>
        values.slice(r * columns, (r + 1) * columns).join('、'),
      ).join('；') +
      '。';
  } else if (frame.kind === 'stack' && values.length) {
    width = 228;
    height = values.length * 36 + 30;
    cells = values.map((value, i) =>
      cell(value, 102, 23 + (values.length - 1 - i) * 36, 160, 31, '', 'stack'),
    );
    cells.at(-1).side = '栈顶';
    if (cells.length > 1) cells[0].side = '栈底';
    description = '从栈底到栈顶：' + values.join('、') + '。';
  } else {
    const main = values.length ? values : Object.values(vars);
    const variableOnly = !values.length && main.length;
    const labels = variableOnly
      ? Object.keys(vars)
      : frame.labels ||
        values.map((_, i) =>
          frame.kind === 'queue'
            ? i === 0
              ? '队首'
              : i === values.length - 1
                ? '队尾'
                : '等待中'
            : ['dp', 'memo'].includes(mode)
              ? '第 ' + (i + 1) + ' 级'
              : '下标 ' + i,
        );
    const items = main.length ? main : frame.output !== undefined ? [frame.output] : [];
    const secondRow =
      ['prefix', 'merge', 'frequency', 'twoSum', 'set', 'arrayClone', 'heightCheck'].includes(mode) &&
      frame.secondary?.length;
    const columns = Math.min(6, Math.max(items.length, secondRow || 0)) || 1,
      rows = Math.ceil(items.length / columns) || 1;
    const size = items.length <= 3 ? 104 : 76;
    width = columns * size + 8;
    height = rows * 70 + 4;
    cells = items.map((value, i) => {
      const item = cell(
        value,
        4 + size * ((i % columns) + 0.5),
        25 + Math.floor(i / columns) * 70,
        size - 9,
        38,
        labels[i] || (!main.length ? '结果' : ''),
        variableOnly ? 'variable' : '',
      );
      item.group = frame.groups?.findIndex(([l, r]) => i >= l && i <= r);
      item.outside = frame.range && (i < frame.range[0] || i > frame.range[1]);
      return item;
    });
    description =
      items.map((v, i) => (labels[i] ? labels[i] + '：' : '') + displayValue(v)).join('；') + '。';
    if (secondRow) {
      const secondLabel =
        mode === 'frequency'
          ? '次数表'
          : mode === 'twoSum'
            ? '已登记下标'
            : mode === 'set'
              ? 'Set'
              : mode === 'heightCheck'
                ? '目标'
                : mode === 'arrayClone'
                  ? '副本'
                  : mode === 'merge'
                    ? 'temp'
                    : '累计';
      const indexed = ['merge', 'arrayClone', 'heightCheck', 'prefix'].includes(mode);
      cells.push(
        ...frame.secondary.map((value, i) =>
          cell(
            value,
            4 + size * (i + 0.5),
            25 + rows * 70,
            size - 9,
            38,
            indexed ? secondLabel + ' ' + i : i === 0 ? secondLabel : '',
            'secondary',
          ),
        ),
      );
      height += 70;
      description += ' ' + secondLabel + '：' + frame.secondary.map(displayValue).join('、') + '。';
    }
  }
  if (!cells.length)
    return {
      width: 174,
      height: 62,
      cells: [
        cell(
          '空',
          87,
          26,
          152,
          34,
          frame.kind === 'stack' ? '栈' : frame.kind === 'queue' ? '队列' : '当前状态',
          'empty',
        ),
      ],
      edges: [],
      description: '当前没有元素。',
    };
  if (active.length)
    description += '当前关注：' + active.map((i) => displayValue(values[i])).join('、') + '。';
  return {
    width,
    height,
    cells: cells.map((c, i) => ({ ...c, active: active.includes(i) })),
    edges,
    description,
  };
}

export function edgeGeometry(edge, cells) {
  const from = cells[edge.from],
    to = cells[edge.to];
  const dx = to.x - from.x,
    dy = to.y - from.y;
  const start = Math.min(from.width / 2 / Math.abs(dx), from.height / 2 / Math.abs(dy));
  const end = Math.min(to.width / 2 / Math.abs(dx), to.height / 2 / Math.abs(dy));
  return {
    x1: from.x + dx * start,
    y1: from.y + dy * start,
    x2: to.x - dx * end,
    y2: to.y - dy * end,
    labelX: (from.x + to.x) / 2,
    labelY: (from.y + to.y) / 2 - (Math.abs(dy) < 20 ? 11 : 6),
  };
}

export const pictureTextSize = (value, width, base = 23) => {
  const units = [...value].reduce((sum, c) => sum + (c.charCodeAt(0) > 255 ? 1 : 0.58), 0);
  return clamp((width - 8) / Math.max(1, units), 9, base);
};
