// 轻量 Markdown 渲染器（构建期使用）。
// 支持：标题、段落、列表、表格、引用、代码块、图片、链接、粗体/斜体/行内代码，
// 以及本站自定义块 :::note / :::risk / :::action / :::chart / :::quote。

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[，。、：；！？（）《》“”‘’·,.:;!?()[\]{}"'`~@#$%^&*+=|\\/]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function inline(text, ctx) {
  let out = escapeHtml(text);
  // 行内代码优先，避免内部内容被其它规则改写
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000CODE${codes.length - 1}\u0000`;
  });
  // 图片
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title) => {
    return `<img src="${ctx.asset(src)}" alt="${alt}" loading="lazy" decoding="async"${title ? ` title="${title}"` : ''}>`;
  });
  // 链接
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const external = /^https?:\/\//.test(href);
    const url = external ? href : ctx.asset(href);
    return `<a href="${url}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${label}</a>`;
  });
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/==([^=]+)==/g, '<mark>$1</mark>');
  out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
  return out;
}

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((c) => c.trim());
}

export function renderMarkdown(markdown, options = {}) {
  const ctx = {
    asset: options.asset || ((p) => p),
    renderChart: options.renderChart || (() => ''),
  };
  const lines = String(markdown).replace(/\r\n/g, '\n').split('\n');
  const html = [];
  const toc = [];
  const usedIds = new Map();

  const uniqueId = (raw) => {
    const base = slugify(raw) || 'section';
    const count = usedIds.get(base) || 0;
    usedIds.set(base, count + 1);
    return count === 0 ? base : `${base}-${count + 1}`;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // 空行
    if (!line.trim()) {
      i++;
      continue;
    }

    // 自定义块
    const custom = line.match(/^:::(note|risk|action|quote|chart)(?:\s+(.*))?$/);
    if (custom) {
      const kind = custom[1];
      const arg = (custom[2] || '').trim();
      const body = [];
      i++;
      while (i < lines.length && !/^:::\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // 跳过结束标记
      const content = body.join('\n');

      if (kind === 'chart') {
        let data = {};
        try {
          data = JSON.parse(content);
        } catch (error) {
          data = { error: '图表数据解析失败' };
        }
        html.push(`<figure class="chart-block">${ctx.renderChart(arg, data)}</figure>`);
      } else if (kind === 'quote') {
        html.push(
          `<blockquote class="pullquote">${inline(content.replace(/\n+/g, ' '), ctx)}${
            arg ? `<cite>${inline(arg, ctx)}</cite>` : ''
          }</blockquote>`,
        );
      } else {
        const titles = { note: '研究笔记', risk: '风险提示', action: '可以怎么做' };
        const icons = { note: '◈', risk: '⚠', action: '→' };
        html.push(
          `<aside class="callout callout-${kind}"><div class="callout-head"><span aria-hidden="true">${icons[kind]}</span>${
            arg || titles[kind]
          }</div><div class="callout-body">${inline(content.replace(/\n{2,}/g, '<br><br>').replace(/\n/g, ' '), ctx)}</div></aside>`,
        );
      }
      continue;
    }

    // 代码块
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++;
      html.push(
        `<pre class="code-block"><code${lang ? ` class="language-${escapeHtml(lang)}"` : ''}>${escapeHtml(
          body.join('\n'),
        )}</code></pre>`,
      );
      continue;
    }

    // 标题
    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = uniqueId(text);
      if (level <= 3) toc.push({ level, text, id });
      html.push(`<h${level} id="${id}">${inline(text, ctx)}</h${level}>`);
      i++;
      continue;
    }

    // 分隔线
    if (/^---+$/.test(line.trim())) {
      html.push('<hr>');
      i++;
      continue;
    }

    // 表格
    if (/^\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|?$/.test(lines[i + 1].trim())) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((c) =>
        c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left',
      );
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      const thead = head
        .map((c, idx) => `<th style="text-align:${aligns[idx] || 'left'}">${inline(c, ctx)}</th>`)
        .join('');
      const tbody = rows
        .map(
          (row) =>
            `<tr>${row
              .map((c, idx) => `<td style="text-align:${aligns[idx] || 'left'}">${inline(c, ctx)}</td>`)
              .join('')}</tr>`,
        )
        .join('');
      html.push(
        `<div class="table-wrap"><table><thead><tr>${thead}</tr></thead><tbody>${tbody}</tbody></table></div>`,
      );
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push(`<blockquote><p>${inline(body.join(' '), ctx)}</p></blockquote>`);
      continue;
    }

    // 列表
    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items = [];
      while (
        i < lines.length &&
        (/^[-*]\s+/.test(lines[i]) || /^\d+\.\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))
      ) {
        if (/^[-*]\s+/.test(lines[i]) || /^\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^([-*]|\d+\.)\s+/, '').trim());
        } else if (items.length) {
          items[items.length - 1] += ' ' + lines[i].trim();
        }
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      html.push(`<${tag}>${items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}</${tag}>`);
      continue;
    }

    // 段落：合并连续普通行
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4}\s|```|:::|>\s?|[-*]\s|\d+\.\s|\||---+$)/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) {
      let text = '';
      for (const part of para) {
        if (!text) text = part;
        else if (/[A-Za-z0-9]$/.test(text) && /^[A-Za-z0-9]/.test(part)) text += ' ' + part;
        else text += part;
      }
      html.push(`<p>${inline(text, ctx)}</p>`);
    } else {
      i++;
    }
  }

  // 两种纯文本视图：
  // text：只保留叙述性内容，用于搜索结果摘要，避免被压平的表头与 JSON 片段；
  // textFull：包含表格与列表的全部可见文字，用于字数统计与内容长度校验。
  const decode = (s) =>
    s
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  const stripInline = (s) =>
    s
      .replace(/<\/?(?:a|strong|em|code|mark|span)\b[^>]*>/g, '')
      .replace(/<[^>]+>/g, ' ');
  const content = html.join('\n').replace(/<figure class="chart-block">[\s\S]*?<\/figure>/g, ' ');
  const textFull = decode(stripInline(content));
  const text = decode(
    stripInline(
      content
        .replace(/<div class="table-wrap">[\s\S]*?<\/div>/g, ' ')
        .replace(/<pre>[\s\S]*?<\/pre>/g, ' '),
    ),
  );

  return { html: html.join('\n'), toc, text, textFull };
}