declare module 'dom-to-image-more' {
  const domToImage: {
    toPng(node: Node, options?: Record<string, unknown>): Promise<string>;
    toJpeg(node: Node, options?: Record<string, unknown>): Promise<string>;
    toSvg(node: Node, options?: Record<string, unknown>): Promise<string>;
    toBlob(node: Node, options?: Record<string, unknown>): Promise<Blob>;
    toPixelData(node: Node, options?: Record<string, unknown>): Promise<Uint8ClampedArray>;
  };
  export default domToImage;
}
