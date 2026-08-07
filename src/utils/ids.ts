/** Turn Mongo ids (string | ObjectId-like | {_id}) into a plain string for comparisons. */
export function normalizeId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const obj = value as { _id?: unknown; $oid?: string; toString?: () => string };
    if (obj.$oid) return obj.$oid;
    if (obj._id != null) return normalizeId(obj._id);
    if (typeof obj.toString === "function") {
      const s = obj.toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return String(value);
}
