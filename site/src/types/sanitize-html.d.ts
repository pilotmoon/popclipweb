declare module "sanitize-html" {
  interface TransformTagResult {
    tagName: string;
    text?: string;
    attribs?: Record<string, string>;
  }

  type TransformTag = (
    tagName: string,
    attribs: Record<string, string>,
  ) => TransformTagResult;

  interface IOptions {
    allowedTags?: string[];
    transformTags?: Record<string, TransformTag>;
  }

  interface SanitizeHtml {
    (dirty: string, options?: IOptions): string;
    defaults: {
      allowedTags: string[];
    };
  }

  const sanitizeHtml: SanitizeHtml;
  export default sanitizeHtml;
}
