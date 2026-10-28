export type TemplateParams = Record<string, string | number>;

/** Fills `{name}` placeholders. Unknown placeholders are left as they are. */
export function t(template: string, params: TemplateParams = {}): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : whole,
  );
}
