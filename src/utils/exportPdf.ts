import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * 图标垂直偏移补偿（像素）。
 * html2canvas 渲染 inline SVG/img 时基线计算偏高，需要手动向下补偿。
 * 如果导出后图标仍偏高，调大这个值（如 3 或 4）；
 * 如果图标偏低，调小或改为负数。
 */
const ICON_OFFSET_Y = 4;

function fixCloneForPdf(clone: HTMLElement) {
  // ── 1. 防止条目被分页切断 ──
  clone.querySelectorAll('.a4-page > div, .a4-page div[class*="mb-"]').forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.breakInside = 'avoid-page';
    htmlEl.style.pageBreakInside = 'avoid';
  });

  // ── 2. 处理 SVG 图标错位（核心修复） ──
  // 策略：把 SVG 手动转成 base64 <img>，然后把 img 和文字都改为
  // display: inline-block + vertical-align: text-bottom + 手动 margin 补偿。
  // 用 text-bottom 是因为 html2canvas 对 middle 实现有 bug，
  // 但对 text-bottom/baseline 的计算相对准确。
  const svgs = Array.from(clone.querySelectorAll('svg'));
  svgs.forEach((svg) => {
    const width = svg.getAttribute('width') || '14';
    const height = svg.getAttribute('height') || '14';

    // 序列化 SVG → base64 <img>
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svg);
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const base64 = btoa(unescape(encodeURIComponent(svgString)));

    const img = document.createElement('img');
    img.src = `data:image/svg+xml;base64,${base64}`;
    img.style.width = `${width}px`;
    img.style.height = `${height}px`;
    img.style.display = 'inline-block';
    // 关键：用 text-bottom 代替 middle，html2canvas 对这个值的支持更可靠
    img.style.verticalAlign = 'text-bottom';
    // 再往下压 ICON_OFFSET_Y 像素，补偿剩余偏差
    img.style.marginBottom = `-${ICON_OFFSET_Y}px`;

    const parent = svg.parentElement;
    if (parent) {
      const computed = window.getComputedStyle(parent);

      // 如果父元素是 flex，改成 inline-block 避免 flex 基线计算差异
      if (computed.display.includes('flex')) {
        // 切到 inline-block 后 CSS gap 不再生效，先把原 column-gap 读出来，
        // 后面用 marginRight 还原图标和文字之间的间距，避免两者贴在一起。
        const parsedGap = parseFloat(computed.columnGap || computed.gap || '');
        const iconGapPx = parsedGap > 0 ? parsedGap : 6;

        parent.style.display = 'inline-block';
        parent.style.verticalAlign = 'middle';
        parent.style.gap = '0';

        img.style.marginRight = `${iconGapPx}px`;

        // 把后续文本节点也改为 inline-block + text-bottom，和图标对齐
        let sibling = img.nextSibling || svg.nextSibling;
        while (sibling) {
          const next = sibling.nextSibling;
          if (sibling.nodeType === Node.TEXT_NODE) {
            const text = sibling.textContent || '';
            const trimmed = text.trim();
            if (trimmed) {
              const span = document.createElement('span');
              span.textContent = trimmed;
              span.style.display = 'inline-block';
              span.style.verticalAlign = 'text-bottom';
              parent.replaceChild(span, sibling);
            } else {
              // 移除空白文本节点，避免它和 marginRight 叠加成多余间距
              parent.removeChild(sibling);
            }
          } else if (sibling.nodeType === Node.ELEMENT_NODE) {
            const el = sibling as HTMLElement;
            if (el.tagName !== 'svg') {
              el.style.display = 'inline-block';
              el.style.verticalAlign = 'text-bottom';
            }
          }
          sibling = next;
        }
      }
    }

    svg.parentNode?.replaceChild(img, svg);
  });

  // ── 3. 修复 Markdown 列表的项目符号位置 ──
  // html2canvas 渲染原生 list-marker（disc / decimal）时位置整体偏上，
  // 改成 absolute 定位的 <span> 手绘符号，对齐到 li 第一行文字基线。
  clone.querySelectorAll('.markdown-content ul').forEach((ul) => {
    const ulEl = ul as HTMLElement;
    ulEl.style.listStyleType = 'none';
    ulEl.style.paddingLeft = '0';
    Array.from(ulEl.children).forEach((child) => {
      if (child.tagName !== 'LI') return;
      const li = child as HTMLElement;
      li.style.paddingLeft = '1.2em';
      li.style.position = 'relative';
      const bullet = document.createElement('span');
      bullet.textContent = '•';
      bullet.style.position = 'absolute';
      bullet.style.left = '0.3em';
      bullet.style.top = '0';
      bullet.style.lineHeight = 'inherit';
      li.insertBefore(bullet, li.firstChild);
    });
  });

  clone.querySelectorAll('.markdown-content ol').forEach((ol) => {
    const olEl = ol as HTMLElement;
    olEl.style.listStyleType = 'none';
    olEl.style.paddingLeft = '0';
    let i = 1;
    Array.from(olEl.children).forEach((child) => {
      if (child.tagName !== 'LI') return;
      const li = child as HTMLElement;
      li.style.paddingLeft = '1.6em';
      li.style.position = 'relative';
      const bullet = document.createElement('span');
      bullet.textContent = `${i++}.`;
      bullet.style.position = 'absolute';
      bullet.style.left = '0';
      bullet.style.top = '0';
      bullet.style.lineHeight = 'inherit';
      li.insertBefore(bullet, li.firstChild);
    });
  });

  // ── 4. 修复 inline 带背景色的小徽章基线 ──
  // 现代风格里 edu.ranking 用 <span class="bg-amber-100 text-xs ...">，
  // 默认是 inline + baseline，在 html2canvas 里会整体上移；
  // 改成 inline-block + vertical-align: middle，让徽章在行中垂直居中。
  clone.querySelectorAll('span').forEach((el) => {
    const span = el as HTMLElement;
    const computed = window.getComputedStyle(span);
    const bg = computed.backgroundColor;
    const hasBg = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent';
    if (hasBg && computed.display === 'inline') {
      span.style.display = 'inline-block';
      span.style.verticalAlign = 'middle';
      // 收紧 line-height 与 padding-top，让高亮框顶部下降 ~3px，
      // 文字基线保持与同行其他内容一致，不再整体偏高。
      span.style.lineHeight = '1';
      span.style.paddingTop = '5';
      span.style.paddingBottom = '10px';
      span.style.transform = 'translateY(1px)';
    }
  });

  // ── 5. 移除阴影 ──
  clone.querySelectorAll('[class*="shadow"]').forEach((el) => {
    (el as HTMLElement).style.boxShadow = 'none';
  });

  // ── 6. 固定 a4-page ──
  const a4Page = clone.querySelector('.a4-page') as HTMLElement | null;
  if (a4Page) {
    a4Page.style.width = '210mm';
    a4Page.style.minHeight = '297mm';
    a4Page.style.margin = '0';
    a4Page.style.boxShadow = 'none';
    a4Page.style.transform = 'none';
  }
}

export async function exportToPdf(elementId: string, filename: string = '简历.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const previewContainer = document.getElementById('resume-preview-container');
  const originalScrollTop = previewContainer?.scrollTop || 0;
  if (previewContainer) previewContainer.scrollTop = 0;

  // ── 收集模块边界（用于按模块分页） ──
  // 切点用「下一个模块的顶部」而不是「当前模块的底部」：
  // 模块底部刚好贴着最后一行文字下沿，硬切会切穿字母 descender；
  // 而模块之间天然有 mb-* 的 margin 空隙（16-24px），切在那里有缓冲。
  const a4Page = element.querySelector('.a4-page') as HTMLElement | null;
  const breakYsCssPx: number[] = [];
  if (a4Page) {
    const pageTop = a4Page.getBoundingClientRect().top;
    const children = Array.from(a4Page.children);
    // 跳过第 0 个：切在头部顶部 = 空页，没意义
    for (let i = 1; i < children.length; i++) {
      const rect = (children[i] as HTMLElement).getBoundingClientRect();
      breakYsCssPx.push(rect.top - pageTop);
    }
    // 最后一个切点 = 全页底部（含 padding-bottom）
    breakYsCssPx.push(a4Page.scrollHeight);
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    onclone: (_, clone) => fixCloneForPdf(clone),
  });

  if (previewContainer) previewContainer.scrollTop = originalScrollTop;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidthMm = pdf.internal.pageSize.getWidth();
  const pdfHeightMm = pdf.internal.pageSize.getHeight();

  // 把 CSS px 断点换算为 canvas px（html2canvas scale=2，但保险起见用实测比例）
  const cssToCanvas = a4Page ? canvas.height / a4Page.scrollHeight : 2;
  const breakCanvasYs = breakYsCssPx
    .map((y) => Math.round(y * cssToCanvas))
    .filter((y) => y > 0 && y <= canvas.height)
    .sort((a, b) => a - b);

  // 一页 PDF 对应的 canvas 像素高度（保持等比缩放，canvas 宽对应 pdfWidthMm）
  const pageHeightInCanvasPx = canvas.width * (pdfHeightMm / pdfWidthMm);

  let cursor = 0;
  let isFirst = true;
  // 兜底防死循环：理论上不会触发
  let safety = 0;
  while (cursor < canvas.height - 1 && safety++ < 50) {
    const maxBottom = Math.min(cursor + pageHeightInCanvasPx, canvas.height);

    // 找 (cursor, maxBottom] 区间内最大的模块边界。
    // 优先模块对齐，不再用最小填充阈值兜底硬切——
    // 任何「内容不被切」的页面都比「内容被横切」更好，即使页面不太满。
    let nextBreak = -1;
    for (const bp of breakCanvasYs) {
      if (bp > cursor && bp <= maxBottom && bp > nextBreak) {
        nextBreak = bp;
      }
    }
    // 仅当区间内完全没有模块边界（单个模块比一页还高）时才硬切
    if (nextBreak === -1) {
      nextBreak = maxBottom;
    }

    const sliceHeight = Math.ceil(nextBreak - cursor);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const ctx = sliceCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      ctx.drawImage(canvas, 0, -cursor);
    }

    const sliceData = sliceCanvas.toDataURL('image/png');
    if (!isFirst) pdf.addPage();
    const sliceHeightMm = sliceHeight * (pdfWidthMm / canvas.width);
    pdf.addImage(sliceData, 'PNG', 0, 0, pdfWidthMm, sliceHeightMm);
    isFirst = false;
    cursor = nextBreak;
  }

  pdf.save(filename);
}
