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

  // ── 3. 移除阴影 ──
  clone.querySelectorAll('[class*="shadow"]').forEach((el) => {
    (el as HTMLElement).style.boxShadow = 'none';
  });

  // ── 4. 固定 a4-page ──
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

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    onclone: (_, clone) => fixCloneForPdf(clone),
  });

  if (previewContainer) previewContainer.scrollTop = originalScrollTop;

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;

  const ratio = pdfWidth / imgWidth;
  const scaledHeight = imgHeight * ratio;

  let heightLeft = scaledHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - scaledHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
    heightLeft -= pdfHeight;
  }

  pdf.save(filename);
}
