/** Keep headings with their next row and reserve signatures on the final page. */
export function paginateEquipmentRows(
  rows: Array<{ height: number; heading: boolean }>,
  capacity: number,
  approvalHeight: number,
): number[][] {
  const groups: Array<{ indices: number[]; height: number }> = [];
  let group = { indices: [] as number[], height: 0 };
  rows.forEach((row, index) => {
    group.indices.push(index);
    group.height += row.height;
    if (!row.heading || index === rows.length - 1) {
      groups.push(group);
      group = { indices: [], height: 0 };
    }
  });
  const pages: number[][] = [];
  let page: number[] = [];
  let height = 0;
  groups.forEach((item, index) => {
    const required =
      item.height + (index === groups.length - 1 ? approvalHeight : 0);
    if (page.length && height + required > capacity) {
      pages.push(page);
      page = [];
      height = 0;
    }
    page.push(...item.indices);
    height += item.height;
  });
  if (page.length) pages.push(page);
  return pages;
}
