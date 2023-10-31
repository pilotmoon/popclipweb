interface IconDescriptor {
  specifier: string;
  color?: string;
  height?: number;  
}

// Turn descriptor into a query string.
// The keys are arranged in a consistent order.
// This can be used both as a cache key and as a URL query string.
export function querifyDescriptor(descriptor: IconDescriptor, cacheKey = "") {
  const query: string[] = [];
  const params = new Map<string, string | number | boolean>(Object.entries(descriptor));
  if (params.get('color') === "#000000") {
    params.delete('color');
  }
  if (params.get('height') === 256) {
    params.delete('height');
  }
  if (cacheKey) {
    params.set("cache", cacheKey);
  }
  console.log(params);
  for (const key of [...params.keys()].sort()) {
    const value = params.get(key);
    if (typeof value === "boolean") {
      query.push(`${key}=${value ? "1" : "0"}`);
    } else if (typeof value === "string") {
      query.push(`${key}=${encodeURIComponent(value)}`);
    } else if (typeof value === "number") {
      query.push(`${key}=${value.toFixed(0)}`);
    }
  }
  return query.join("&");
}
